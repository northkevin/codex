# Database Migration History

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

## Useful Commands We Actually Use
- Reset everything (drops all data): `npx prisma migrate reset`
- Create new migration: `npx prisma migrate dev --name <migration_name>`
- Check database status: `npx prisma migrate status`
- Generate Prisma client after schema changes: `npx prisma generate`

## Common Issues & Solutions
- When import fails, we just reset and try again: `npx prisma migrate reset`
- If schema changes don't apply, we usually run reset instead of trying to fix migrations