-- CreateEnum
CREATE TYPE "AgeBand" AS ENUM ('BAND_3_5', 'BAND_6_8');

-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('ALPHABETS', 'NUMBERS', 'ANIMALS', 'LANGUAGES', 'SCIENCE', 'ART', 'GOOD_HABITS');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'HINDI');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('QUIZ', 'MATCHING', 'SORTING');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EARNED_ACTIVITY', 'REWARD_REDEMPTION', 'PARENT_ADJUSTMENT', 'REFUND_REDEMPTION');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'FULFILLED');

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARENT',
    "dailyScreenTimeMinutesDefault" INTEGER NOT NULL DEFAULT 30,
    "sessionBreakReminderMinutes" INTEGER NOT NULL DEFAULT 15,
    "monthlyRewardCoinBudget" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'lion',
    "ageBand" "AgeBand" NOT NULL DEFAULT 'BAND_3_5',
    "preferredLanguage" "Language" NOT NULL DEFAULT 'ENGLISH',
    "dailyScreenTimeMinutes" INTEGER NOT NULL DEFAULT 30,
    "breakReminderMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ContentCategory" NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "ageBand" "AgeBand" NOT NULL DEFAULT 'BAND_3_5',
    "durationSeconds" INTEGER NOT NULL DEFAULT 120,
    "publicationStatus" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED',
    "storageKey" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "uploader" TEXT,
    "isSampleContent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_content_approvals" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_content_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_activities" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL DEFAULT 'QUIZ',
    "ageBand" "AgeBand" NOT NULL DEFAULT 'BAND_3_5',
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "category" "ContentCategory" NOT NULL,
    "instructions" TEXT NOT NULL,
    "coinReward" INTEGER NOT NULL DEFAULT 5,
    "questionsData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_attempts" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "rewardAwarded" BOOLEAN NOT NULL DEFAULT false,
    "answersData" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "learning_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coin_transactions" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "learningAttemptId" TEXT,
    "redemptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'OFFLINE_TREAT',
    "coinCost" INTEGER NOT NULL DEFAULT 20,
    "icon" TEXT NOT NULL DEFAULT 'gift',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_redemptions" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "coinCost" INTEGER NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'REQUESTED',
    "parentNote" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "reward_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screen_sessions" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastHeartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "screen_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_email_key" ON "parents"("email");

-- CreateIndex
CREATE INDEX "children_parentId_idx" ON "children"("parentId");

-- CreateIndex
CREATE INDEX "content_items_category_ageBand_publicationStatus_idx" ON "content_items"("category", "ageBand", "publicationStatus");

-- CreateIndex
CREATE INDEX "parent_content_approvals_parentId_childId_idx" ON "parent_content_approvals"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "parent_content_approvals_childId_contentItemId_key" ON "parent_content_approvals"("childId", "contentItemId");

-- CreateIndex
CREATE INDEX "learning_activities_category_ageBand_idx" ON "learning_activities"("category", "ageBand");

-- CreateIndex
CREATE INDEX "learning_attempts_childId_activityId_idx" ON "learning_attempts"("childId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "coin_transactions_idempotencyKey_key" ON "coin_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "coin_transactions_childId_createdAt_idx" ON "coin_transactions"("childId", "createdAt");

-- CreateIndex
CREATE INDEX "rewards_parentId_idx" ON "rewards"("parentId");

-- CreateIndex
CREATE INDEX "reward_redemptions_childId_status_idx" ON "reward_redemptions"("childId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "screen_sessions_sessionToken_key" ON "screen_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "screen_sessions_childId_isActive_idx" ON "screen_sessions"("childId", "isActive");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_content_approvals" ADD CONSTRAINT "parent_content_approvals_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_content_approvals" ADD CONSTRAINT "parent_content_approvals_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_content_approvals" ADD CONSTRAINT "parent_content_approvals_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_attempts" ADD CONSTRAINT "learning_attempts_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_attempts" ADD CONSTRAINT "learning_attempts_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "learning_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_learningAttemptId_fkey" FOREIGN KEY ("learningAttemptId") REFERENCES "learning_attempts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_transactions" ADD CONSTRAINT "coin_transactions_redemptionId_fkey" FOREIGN KEY ("redemptionId") REFERENCES "reward_redemptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screen_sessions" ADD CONSTRAINT "screen_sessions_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
