#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Configuration
const TRUDOOR_BASE_URL = 'https://www.trudoor.com'
const DATA_FILE = './lib/data-final.json'
const LOG_FILE = './scripts/image-migration.log'
const UPDATE_SQL_FILE = './scripts/update-images.sql'

// Cloudinary configuration (set these environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

class ImageMigrator {
  constructor() {
    this.processed = []
    this.errors = []
    this.sqlUpdates = []
  }

  async log(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`
    console.log(message)
    await fs.appendFile(LOG_FILE, logEntry)
  }

  async findLibraryImages() {
    await this.log('Reading data-final.json...')
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'))
    
    const images = new Set()
    
    function extractImages(obj, path = '') {
      if (typeof obj === 'string' && obj.startsWith('/library')) {
        images.add(obj)
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          extractImages(value, path ? `${path}.${key}` : key)
        }
      }
    }
    
    extractImages(data)
    
    await this.log(`Found ${images.size} unique /library images`)
    return Array.from(images)
  }

  async downloadImage(imagePath) {
    const fullUrl = `${TRUDOOR_BASE_URL}${imagePath}`
    
    try {
      const response = await fetch(fullUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const buffer = Buffer.from(await response.arrayBuffer())
      return buffer
    } catch (error) {
      throw new Error(`Failed to download ${fullUrl}: ${error.message}`)
    }
  }

  async uploadToCloudinary(buffer, originalPath) {
    return new Promise((resolve, reject) => {
      // Extract filename for public_id
      const filename = path.basename(originalPath, path.extname(originalPath))
      const folder = 'quote-builder'
      
      cloudinary.uploader.upload_stream(
        {
          public_id: `${folder}/${filename}`,
          resource_type: 'image',
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })
  }

  generateUpdateSQL(originalPath, newUrl) {
    // Generate SQL to update the primary_image column in Supabase
    const escapedOriginal = originalPath.replace(/'/g, "''")
    const escapedNew = newUrl.replace(/'/g, "''")
    
    return `-- Update ${originalPath}
UPDATE options 
SET primary_image = '${escapedNew}'
WHERE primary_image = '${escapedOriginal}';`
  }

  async migrateImage(imagePath) {
    try {
      await this.log(`Processing: ${imagePath}`)
      
      // Download from Trudoor
      const buffer = await this.downloadImage(imagePath)
      await this.log(`  ✓ Downloaded (${buffer.length} bytes)`)
      
      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(buffer, imagePath)
      await this.log(`  ✓ Uploaded to Cloudinary: ${result.secure_url}`)
      
      // Generate SQL update
      const sql = this.generateUpdateSQL(imagePath, result.secure_url)
      this.sqlUpdates.push(sql)
      
      this.processed.push({
        original: imagePath,
        cloudinary: result.secure_url,
        public_id: result.public_id
      })
      
      return result.secure_url
      
    } catch (error) {
      const errorMsg = `Failed to migrate ${imagePath}: ${error.message}`
      await this.log(`  ✗ ${errorMsg}`)
      this.errors.push({ path: imagePath, error: errorMsg })
      throw error
    }
  }

  async saveSQLUpdates() {
    const sqlContent = [
      '-- Generated SQL to update image URLs in Supabase',
      '-- Run this in your Supabase SQL editor',
      '',
      ...this.sqlUpdates,
      '',
      `-- Migration completed: ${this.processed.length} images processed`
    ].join('\n')
    
    await fs.writeFile(UPDATE_SQL_FILE, sqlContent)
    await this.log(`SQL updates saved to: ${UPDATE_SQL_FILE}`)
  }

  async saveResults() {
    const results = {
      timestamp: new Date().toISOString(),
      processed: this.processed,
      errors: this.errors,
      summary: {
        total: this.processed.length + this.errors.length,
        successful: this.processed.length,
        failed: this.errors.length
      }
    }
    
    await fs.writeFile('./scripts/migration-results.json', JSON.stringify(results, null, 2))
    await this.log('Results saved to: ./scripts/migration-results.json')
  }

  async run() {
    try {
      // Check Cloudinary config
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Missing Cloudinary environment variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET')
      }

      await this.log('Starting image migration...')
      
      // Find all library images
      const images = await this.findLibraryImages()
      
      if (images.length === 0) {
        await this.log('No /library images found')
        return
      }
      
      // Process images with rate limiting
      for (let i = 0; i < images.length; i++) {
        const imagePath = images[i]
        
        try {
          await this.migrateImage(imagePath)
          
          // Rate limiting - wait 100ms between requests
          if (i < images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
        } catch (error) {
          // Continue with next image on error
          continue
        }
      }
      
      // Save results
      await this.saveSQLUpdates()
      await this.saveResults()
      
      await this.log('Migration completed!')
      await this.log(`Success: ${this.processed.length}/${images.length} images`)
      
      if (this.errors.length > 0) {
        await this.log('Errors occurred:')
        for (const error of this.errors) {
          await this.log(`  - ${error.path}: ${error.error}`)
        }
      }
      
    } catch (error) {
      await this.log(`Fatal error: ${error.message}`)
      process.exit(1)
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new ImageMigrator()
  migrator.run()
}

export default ImageMigrator