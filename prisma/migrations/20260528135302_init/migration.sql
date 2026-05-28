-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ACTOR', 'AGENCY', 'ADMIN');

-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('TEENS', 'TWENTIES', 'THIRTIES', 'FORTIES', 'FIFTIES');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('FILM', 'DRAMA', 'OTT', 'WEB_DRAMA', 'SHORT_FILM', 'AD', 'MUSIC_VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "FilmRole" AS ENUM ('LEAD', 'SUPPORTING', 'EXTRA', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectMediaType" AS ENUM ('DRAMA', 'FILM', 'OTT', 'WEB_DRAMA', 'AD', 'OTHER');

-- CreateEnum
CREATE TYPE "RecruitStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "CastingStatus" AS ENUM ('OPEN', 'CASTING', 'CAST');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'AUDITION_SUBMITTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CASTING', 'FEED', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,
    "roleType" "RoleType" NOT NULL DEFAULT 'ACTOR',
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "location" TEXT,
    "contactableTime" TEXT,
    "contactMemo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ageRange" "AgeRange",
    "gender" "Gender",
    "height" INTEGER,
    "weight" INTEGER,
    "skills" TEXT[],
    "preferredGenres" TEXT[],
    "publicPortfolioUrl" TEXT,

    CONSTRAINT "ActorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "position" TEXT,
    "preferredGenres" TEXT[],

    CONSTRAINT "AgencyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filmography" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL DEFAULT 'DRAMA',
    "role" "FilmRole" NOT NULL DEFAULT 'LEAD',
    "characterName" TEXT,
    "genre" TEXT,
    "year" INTEGER NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filmography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showreel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "filmographyId" TEXT,
    "tags" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Showreel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mediaType" "ProjectMediaType" NOT NULL DEFAULT 'DRAMA',
    "genre" TEXT,
    "platform" TEXT,
    "logline" TEXT,
    "synopsis" TEXT,
    "recruitStatus" "RecruitStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ageRange" "AgeRange",
    "gender" "Gender",
    "description" TEXT,
    "keywords" TEXT[],
    "castingStatus" "CastingStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CastingOffer" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "receiverUserId" TEXT NOT NULL,
    "shootingPeriod" TEXT,
    "shootingLocation" TEXT,
    "conditions" TEXT,
    "message" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "auditionVideoUrl" TEXT,
    "auditionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CastingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentlyViewedActor" (
    "id" TEXT NOT NULL,
    "viewerUserId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyViewedActor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_roleType_idx" ON "User"("roleType");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ActorProfile_userId_key" ON "ActorProfile"("userId");

-- CreateIndex
CREATE INDEX "ActorProfile_ageRange_idx" ON "ActorProfile"("ageRange");

-- CreateIndex
CREATE INDEX "ActorProfile_gender_idx" ON "ActorProfile"("gender");

-- CreateIndex
CREATE UNIQUE INDEX "AgencyProfile_userId_key" ON "AgencyProfile"("userId");

-- CreateIndex
CREATE INDEX "Filmography_userId_idx" ON "Filmography"("userId");

-- CreateIndex
CREATE INDEX "Filmography_year_idx" ON "Filmography"("year");

-- CreateIndex
CREATE INDEX "Showreel_userId_idx" ON "Showreel"("userId");

-- CreateIndex
CREATE INDEX "Showreel_isFeatured_idx" ON "Showreel"("isFeatured");

-- CreateIndex
CREATE INDEX "Project_ownerUserId_idx" ON "Project"("ownerUserId");

-- CreateIndex
CREATE INDEX "Project_recruitStatus_idx" ON "Project"("recruitStatus");

-- CreateIndex
CREATE INDEX "Character_projectId_idx" ON "Character"("projectId");

-- CreateIndex
CREATE INDEX "CastingOffer_senderUserId_idx" ON "CastingOffer"("senderUserId");

-- CreateIndex
CREATE INDEX "CastingOffer_receiverUserId_idx" ON "CastingOffer"("receiverUserId");

-- CreateIndex
CREATE INDEX "CastingOffer_status_idx" ON "CastingOffer"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "RecentlyViewedActor_viewerUserId_idx" ON "RecentlyViewedActor"("viewerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyViewedActor_viewerUserId_actorUserId_key" ON "RecentlyViewedActor"("viewerUserId", "actorUserId");

-- AddForeignKey
ALTER TABLE "ActorProfile" ADD CONSTRAINT "ActorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyProfile" ADD CONSTRAINT "AgencyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filmography" ADD CONSTRAINT "Filmography_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showreel" ADD CONSTRAINT "Showreel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showreel" ADD CONSTRAINT "Showreel_filmographyId_fkey" FOREIGN KEY ("filmographyId") REFERENCES "Filmography"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingOffer" ADD CONSTRAINT "CastingOffer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingOffer" ADD CONSTRAINT "CastingOffer_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingOffer" ADD CONSTRAINT "CastingOffer_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastingOffer" ADD CONSTRAINT "CastingOffer_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedActor" ADD CONSTRAINT "RecentlyViewedActor_viewerUserId_fkey" FOREIGN KEY ("viewerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedActor" ADD CONSTRAINT "RecentlyViewedActor_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
