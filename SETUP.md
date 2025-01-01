odex Setup Instructions
Project Structure
codex/
├── prisma/
│ └── schema.prisma
├── src/
│ ├── scripts/
│ ├── routes/
│ ├── services/
│ └── index.ts
├── scripts/
│ └── youtube_parser.py
├── tests/
│ └── setup.test.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── mise.toml
Setup Steps
Install Prerequisites:
Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

Install pnpm:
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Close and reopen your terminal, or run:
source ~/.zshrc

Install mise and PostgreSQL:
brew install mise postgresql@16 watchman
brew install --cask pgadmin4

Configure mise and PostgreSQL:
# Add PostgreSQL binaries to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc  # or restart your terminal

# Initialize mise
mise install

# Start PostgreSQL service
brew services start postgresql@16

# Verify PostgreSQL installation
psql -c "SELECT version();"

Install Project Dependencies:
Initialize Node.js project
pnpm init
Install core dependencies
pnpm add -D typescript @types/node ts-node prisma
pnpm add @prisma/client express @types/express
Create Database:
createdb codex_dev
Push Schema to Database:
pnpm db:push
Validate Setup:
pnpm setup:validate
Development Commands
Start development server:
pnpm dev
Open Prisma Studio:
pnpm db:studio
Build for production:
pnpm build
Environment Variables
Make sure your .env file contains:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codex_dev"
NODE_ENV="development"
Project Description
Codex is a digital library for podcast knowledge and analysis. It helps you organize and analyze podcast content, particularly focusing on YouTube content initially. The system allows for:
Importing YouTube watch history
Tracking podcast metadata
Analyzing viewing patterns
Managing a personal knowledge base
Key Features
1. YouTube History Integration
Podcast Metadata Management
PostgreSQL Database
4. TypeScript + Prisma ORM
Express.js API Server
Next Steps
Complete the initial setup
Import your first YouTube history
Start the development server
4. Access Prisma Studio to view your data
Begin building additional features
-----------------------------------
Would you like me to add any additional sections to this setup guide?

Configure Database:
# Connect to PostgreSQL as superuser
psql postgres

# In the PostgreSQL prompt, run these commands:
CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;
\q

# Create the database
createdb codex_dev

# Grant all privileges
psql -d codex_dev -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;"
psql -d codex_dev -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;"