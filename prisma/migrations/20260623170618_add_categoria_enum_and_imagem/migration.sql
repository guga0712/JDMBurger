/*
  Warnings:

  - Changed the type of `categoria` on the `Produto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('lanches', 'bebidas', 'acompanhamento', 'doces');

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "imagemUrl" TEXT,
DROP COLUMN "categoria",
ADD COLUMN     "categoria" "Categoria" NOT NULL;
