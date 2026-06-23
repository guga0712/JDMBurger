/*
  Warnings:

  - You are about to drop the column `endereco` on the `Cliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cliente" DROP COLUMN "endereco",
ADD COLUMN     "email" TEXT;
