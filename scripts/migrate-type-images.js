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
const LOG_FILE = './scripts/type-image-migration.log'
const UPDATE_SQL_FILE = './scripts/update-type-images.sql'

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

class TypeImageMigrator {
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

  async findTypeImages() {
    await this.log('Reading data-final.json for _type_images...')
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'))
    
    const images = []
    
    if (data._type_images) {
      for (const [typeId, imagePath] of Object.entries(data._type_images)) {
        images.push({ typeId, imagePath })
      }
    }
    
    await this.log(`Found ${images.length} type images`)
    return images
  }

  getImageUrl(imagePath) {
    // Handle different image path formats
    if (imagePath.startsWith('/images/')) {
      return `${TRUDOOR_BASE_URL}${imagePath}`
    } else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    } else {
      throw new Error(`Unknown image path format: ${imagePath}`)
    }
  }

  async downloadImage(imagePath) {
    const fullUrl = this.getImageUrl(imagePath)
    
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

  async uploadToCloudinary(buffer, originalPath, typeId) {
    return new Promise((resolve, reject) => {
      // Create a meaningful public_id
      const filename = path.basename(originalPath, path.extname(originalPath))
      const folder = 'quote-builder-types'
      
      cloudinary.uploader.upload_stream(
        {
          public_id: `${folder}/type-${typeId}-${filename}`,
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

  generateUpdateSQL(typeId, originalPath, newUrl) {
    // Generate SQL to update the product_types table
    const escapedNew = newUrl.replace(/'/g, "''")
    
    return `-- Update type ${typeId}: ${originalPath}
UPDATE product_types 
SET image_url = '${escapedNew}'
WHERE id = ${typeId};`
  }

  async migrateTypeImage({ typeId, imagePath }) {
    try {
      await this.log(`Processing type ${typeId}: ${imagePath}`)
      
      // Download image
      const buffer = await this.downloadImage(imagePath)
      await this.log(`  ✓ Downloaded (${buffer.length} bytes)`)
      
      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(buffer, imagePath, typeId)
      await this.log(`  ✓ Uploaded to Cloudinary: ${result.secure_url}`)
      
      // Generate SQL update
      const sql = this.generateUpdateSQL(typeId, imagePath, result.secure_url)
      this.sqlUpdates.push(sql)
      
      this.processed.push({
        typeId,
        original: imagePath,
        cloudinary: result.secure_url,
        public_id: result.public_id
      })
      
      return result.secure_url
      
    } catch (error) {
      const errorMsg = `Failed to migrate type ${typeId} (${imagePath}): ${error.message}`
      await this.log(`  ✗ ${errorMsg}`)
      this.errors.push({ typeId, path: imagePath, error: errorMsg })
      throw error
    }
  }

  async saveSQLUpdates() {
    const sqlContent = [
      '-- Generated SQL to update type image URLs in Supabase',
      '-- Run this in your Supabase SQL editor',
      '',
      ...this.sqlUpdates,
      '',
      `-- Migration completed: ${this.processed.length} type images processed`
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
    
    await fs.writeFile('./scripts/type-migration-results.json', JSON.stringify(results, null, 2))
    await this.log('Results saved to: ./scripts/type-migration-results.json')
  }

  async run() {
    try {
      // Check Cloudinary config
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Missing Cloudinary environment variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET')
      }

      await this.log('Starting type image migration...')
      
      // Find all type images
      const images = await this.findTypeImages()
      
      if (images.length === 0) {
        await this.log('No type images found')
        return
      }
      
      // Process images with rate limiting
      for (let i = 0; i < images.length; i++) {
        const imageInfo = images[i]
        
        try {
          await this.migrateTypeImage(imageInfo)
          
          // Rate limiting - wait 200ms between requests
          if (i < images.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
          
        } catch (error) {
          // Continue with next image on error
          continue
        }
      }
      
      // Save results
      await this.saveSQLUpdates()
      await this.saveResults()
      
      await this.log('Type image migration completed!')
      await this.log(`Success: ${this.processed.length}/${images.length} images`)
      
      if (this.errors.length > 0) {
        await this.log('Errors occurred:')
        for (const error of this.errors) {
          await this.log(`  - Type ${error.typeId} (${error.path}): ${error.error}`)
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
  const migrator = new TypeImageMigrator()
  migrator.run()
}

export default TypeImageMigrator