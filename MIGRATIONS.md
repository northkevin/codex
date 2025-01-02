# Database Migration History

## Useful Commands We Actually Use
- Reset everything (drops all data): `npx prisma migrate reset`
- Create new migration: `npx prisma migrate dev --name <migration_name>`
- Check database status: `npx prisma migrate status`
- Generate Prisma client after schema changes: `npx prisma generate`

## Common Issues & Solutions
- When import fails, we just reset and try again: `npx prisma migrate reset`
- If schema changes don't apply, we usually run reset instead of trying to fix migrations

## Initial Setup (Jan 2024)
1. Created Postgres database:
```bash
createdb youtube_history
```
2. Initialized Prisma:
```bash
npm install prisma --save-dev
npx prisma init
```
3. Added DATABASE_URL to .env:
```
DATABASE_URL="postgresql://kevinnorth@localhost:5432/youtube_history"
```

## First Migration: Basic Video Table
1. Created initial schema with Video model
2. Generated first migration:
```bash
npx prisma migrate dev --name add_videos_table
```

## Separate Videos and Watch History (Jan 2024)
1. Updated schema.prisma to split into Video and WatchHistory models
2. Created new migration:
```bash
npx prisma migrate dev --name separate_videos_and_watches
```
3. Imported data using scripts/import_videos.js:
```bash
node scripts/import_videos.js
```

# Database Migration History

## Add Extended Video Fields for YouTube API Data (Feb 2024)
1. Added new fields to Video model to support YouTube Data API metadata:
   - Content details (duration, license, etc.)
   - Statistics (view/like/comment counts)
   - Status details (privacy, embeddable)
   - Topic and recording details
   - Live streaming information

2. Created migration:
```bash
pnpm prisma migrate dev --name add_video_extended_fields
```
3. Note: Initially failed because channelId/channelTitle were not marked as nullable
   - Fixed by adding `?` to make fields optional
   - Re-ran migration successfully

4. Purpose: Support metadata enrichment from YouTube Data API
   - Fields match YouTube API video resource schema
   - Enables Python scripts to fetch and store video metadata
   - Preserves existing watch history functionality