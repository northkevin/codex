# Project Setup Guide: Codex
(A digital library for podcast knowledge and analysis)

## 1. Initial Repository Setup
````bash
mkdir codex
cd codex
git init
````

## 2. Development Environment Setup

### Create mise.toml
````toml:mise.toml
[tools]
node = "20.11.1"
postgres = "16.2"
pnpm = "8.15.4"

[env]
NODE_ENV = "development"
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/codex_dev"
````

### macOS Prerequisites
````bash
# Install Homebrew if not present
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install essential tools
brew install mise postgresql@16 watchman
brew install --cask pgadmin4

# Start PostgreSQL service
brew services start postgresql@16
````

## 3. Project Initialization
````bash
# Initialize Node.js project
pnpm init

# Install core dependencies
pnpm add -D typescript @types/node ts-node prisma
pnpm add @prisma/client express @types/express

# Initialize TypeScript
pnpm tsc --init

# Initialize Prisma
pnpm prisma init
````

## 4. Project Structure
````
codex/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── scripts/
│   │   └── importYouTubeHistory.ts
│   ├── routes/
│   │   └── podcasts.ts
│   ├── services/
│   │   └── podcastService.ts
│   └── index.ts
├── scripts/
│   └── youtube_parser.py
├── tests/
│   └── setup.test.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── mise.toml
````

## 5. Initial Schema Setup
````prisma:prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Podcast {
  id              Int       @id @default(autoincrement())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  title           String
  url             String    @unique
  platform        String    // youtube, spotify, etc.
  channelId       String?
  channelTitle    String?
  publishedAt     DateTime?
  durationSeconds Int?
  description     String?   @db.Text
  thumbnailUrl    String?
  viewCount       Int?
  likeCount       Int?
  watchedAt       DateTime?
  metadata        Json?     // Additional platform-specific data
}
````

## 6. Environment Setup
````env:.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codex_dev"
NODE_ENV="development"
````

## 7. Python Script for YouTube History
````python:scripts/youtube_parser.py
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

def parse_youtube_history(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    videos = []
    for entry in soup.find_all('div', class_='content-cell'):
        title_elem = entry.find('a')
        if not title_elem:
            continue
            
        title = title_elem.text.strip()
        url = title_elem['href']
        
        # Extract video ID from URL
        video_id = re.search(r'v=([^&]+)', url)
        if not video_id:
            continue
            
        timestamp = entry.find('div', class_='date').text.strip()
        
        videos.append({
            'title': title,
            'url': url,
            'videoId': video_id.group(1),
            'watchedAt': timestamp,
            'platform': 'youtube'
        })
    
    # Save to JSON
    with open('youtube_history.json', 'w') as f:
        json.dump(videos, f, indent=2)
    
    return len(videos)

if __name__ == '__main__':
    count = parse_youtube_history('watch-history.html')
    print(f"Extracted {count} videos")
````

## 8. Validation Script
````typescript:tests/setup.test.ts
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function validateSetup() {
  try {
    // Check database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check Prisma schema
    const { stdout } = await execAsync('pnpm prisma format')
    console.log('✅ Prisma schema is valid')
    
    // Test database operations
    const testPodcast = await prisma.podcast.create({
      data: {
        title: 'Test Podcast',
        url: 'https://youtube.com/watch?v=test123',
        platform: 'youtube'
      }
    })
    console.log('✅ Database operations working')
    
    // Cleanup test data
    await prisma.podcast.delete({
      where: { id: testPodcast.id }
    })
    
  } catch (error) {
    console.error('❌ Setup validation failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateSetup()
````

## 9. Setup Validation Commands
Add to package.json:
````json:package.json
{
  "scripts": {
    "setup:validate": "ts-node tests/setup.test.ts",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
````

## Validation Steps
1. Install mise and tools:
````bash
mise install
mise trust
````

2. Setup database:
````bash
createdb codex_dev
pnpm db:push
````

3. Run validation:
````bash
pnpm setup:validate
````

4. Start development server:
````bash
pnpm dev
````

5. Open Prisma Studio:
````bash
pnpm db:studio
````

The name "Codex" fits well as it traditionally refers to a book of knowledge or systematic collection of writings, which aligns perfectly with your goal of creating a structured database of podcast knowledge that can be analyzed and explored in various ways.