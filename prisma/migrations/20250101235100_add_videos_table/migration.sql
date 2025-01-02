-- CreateTable
CREATE TABLE "Podcast" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "channelId" TEXT,
    "channelTitle" TEXT,
    "publishedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "viewCount" INTEGER,
    "likeCount" INTEGER,
    "watchedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "channel_title" TEXT,
    "channel_url" TEXT,
    "watched_at" TIMESTAMP(3) NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'youtube',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Podcast_url_key" ON "Podcast"("url");
