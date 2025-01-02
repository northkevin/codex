/*
  Warnings:

  - You are about to drop the column `channel_url` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `videos` table. All the data in the column will be lost.
  - You are about to drop the column `watched_at` on the `videos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[video_id]` on the table `videos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `videos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "videos" DROP COLUMN "channel_url",
DROP COLUMN "platform",
DROP COLUMN "url",
DROP COLUMN "watched_at",
ADD COLUMN     "channel_id" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "published_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "view_count" INTEGER;

-- CreateTable
CREATE TABLE "watch_history" (
    "id" SERIAL NOT NULL,
    "video_id" TEXT NOT NULL,
    "watched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watch_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "watch_history_video_id_idx" ON "watch_history"("video_id");

-- CreateIndex
CREATE INDEX "watch_history_watched_at_idx" ON "watch_history"("watched_at");

-- CreateIndex
CREATE UNIQUE INDEX "videos_video_id_key" ON "videos"("video_id");

-- AddForeignKey
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("video_id") ON DELETE RESTRICT ON UPDATE CASCADE;
