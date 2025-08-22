# Image Migration Script

This script migrates all `/library` images from data-final.json to Cloudinary and generates SQL to update your Supabase database.

## Setup

1. Install dependencies:
```bash
npm install node-fetch cloudinary
```

2. Set environment variables:
```bash
export CLOUDINARY_CLOUD_NAME="your-cloud-name"
export CLOUDINARY_API_KEY="your-api-key"  
export CLOUDINARY_API_SECRET="your-api-secret"
```

## Usage

```bash
node scripts/migrate-images.js
```

## Output Files

- `scripts/image-migration.log` - Detailed migration log
- `scripts/migration-results.json` - JSON summary of results
- `scripts/update-images.sql` - SQL to update Supabase database

## Process

1. Finds all `/library` image paths in `lib/data-final.json`
2. Downloads each image from `https://www.trudoor.com{path}`
3. Uploads to Cloudinary in `quote-builder/` folder
4. Generates SQL UPDATE statements for Supabase
5. Creates summary files

## After Migration

Run the generated SQL in your Supabase SQL editor:
```sql
-- Copy contents of scripts/update-images.sql
```