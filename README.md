file:///Users/kevinnorth/Downloads/Takeout/YouTube%20and%20YouTube%20Music/history/watch-history.html

# Codex - Personal Knowledge Base

## Quick Start

1. One-line setup (copy/paste this first):

brew install mise postgresql@16 watchman && brew install --cask pgadmin4 && brew services start postgresql@16

2. Project setup (run these in order):

# Clone and enter project
git clone <your-repo-url> codex
cd codex

# Install Node.js and tools via mise
mise install

# Install dependencies
pnpm install

# Setup database
createdb codex_dev
pnpm db:push

# Verify everything works
pnpm setup:validate

3. Verify Installation
- PostgreSQL should be running: brew services list
- Database should exist: psql -l | grep codex_dev
- Project should build: pnpm build

## Common Commands

# Start development
pnpm dev

# Open database UI
pnpm db:studio

# Update database schema
pnpm db:push

## Troubleshooting

If you encounter issues:

1. Database Connection Issues:
# Restart PostgreSQL
brew services restart postgresql@16

# Verify connection
psql -d codex_dev -c "SELECT 1"

2. Node/TypeScript Issues:
# Clear and reinstall dependencies
rm -rf node_modules
pnpm install

3. Prisma Issues:
# Regenerate Prisma client
pnpm prisma generate

## Next Task

Tomorrow's first task will be:
1. Set up the basic Express server in src/index.ts
2. Create the first podcast route
3. Test importing YouTube history

## Project Status

✓ Initial setup
✓ Database configuration
□ Basic API server
□ YouTube import script
□ Podcast routes
□ Data analysis features

## Python Scripts Setup
```bash
mise run scripts:setup
mise run scripts:parse

```