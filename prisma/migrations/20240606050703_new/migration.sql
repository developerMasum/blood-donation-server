-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'DONOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "role" "UserRole" DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "role" "UserRole" DEFAULT 'DONOR',
    "location" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorProfile" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "bio" TEXT,
    "age" INTEGER,
    "contactNumber" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "lastDonationDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requester" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "dateOfDonation" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "hospitalAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DonorProfile_donorId_key" ON "DonorProfile"("donorId");

-- AddForeignKey
ALTER TABLE "DonorProfile" ADD CONSTRAINT "DonorProfile_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requester" ADD CONSTRAINT "Requester_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requester" ADD CONSTRAINT "Requester_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
