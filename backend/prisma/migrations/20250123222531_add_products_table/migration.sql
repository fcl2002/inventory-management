/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `tagId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bling_id]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bling_id` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_url` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_tagId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "description",
DROP COLUMN "quantity",
DROP COLUMN "tagId",
ADD COLUMN     "bling_id" INTEGER NOT NULL,
ADD COLUMN     "code" INTEGER NOT NULL,
ADD COLUMN     "image_url" TEXT NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "Tag";

-- CreateIndex
CREATE UNIQUE INDEX "Product_bling_id_key" ON "Product"("bling_id");
