/*
  Warnings:

  - You are about to drop the `Requester` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Requester" DROP CONSTRAINT "Requester_donorId_fkey";

-- DropForeignKey
ALTER TABLE "Requester" DROP CONSTRAINT "Requester_requesterId_fkey";

-- DropTable
DROP TABLE "Requester";

-- CreateTable
CREATE TABLE "Requests" (
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

    CONSTRAINT "Requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requests" ADD CONSTRAINT "Requests_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
