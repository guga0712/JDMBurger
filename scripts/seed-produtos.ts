import 'dotenv/config'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const DOCS = path.join(process.cwd(), 'docs')
const BUCKET = 'jdm-images'

type CropRegion = { left: number; top: number; width: number; height: number }

async function cropAndUpload(filename: string, crop: CropRegion, slug: string): Promise<string> {
  const buffer = await sharp(path.join(DOCS, filename))
    .extract(crop)
    .jpeg({ quality: 88 })
    .toBuffer()

  const filePath = `produtos/${slug}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) throw new Error(`Upload failed for ${slug}: ${error.message}`)

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filePath}`
  console.log(`  ✓ imagem enviada: ${slug}`)
  return url
}

// ─── Imagens do cardápio ───────────────────────────────────────────────────
// Arquivo 2: lanches 350Z, Supra Bi-Turbo, Subaru Impreza, NSX  (828×1151)
const IMG_LANCHES_1 = 'WhatsApp Image 2026-06-25 at 09.03.00 (1).jpeg'
// Arquivo 3: lanches Silvia S15, Civic Burguer, RX-7, Skyline R34 (828×1151)
const IMG_LANCHES_2 = 'WhatsApp Image 2026-06-25 at 09.03.00.jpeg'
// Arquivo 1: bebidas (sem foto) + doces Miata e BRZ (828×1146)
const IMG_DOCES    = 'WhatsApp Image 2026-06-25 at 09.02.59.jpeg'

// Coordenadas dos crops (left, top, width, height)
// Cada row de lanche começa após o header (~165px) e tem ~245px de altura
const CROPS: Record<string, { file: string; crop: CropRegion }> = {
  '350z':          { file: IMG_LANCHES_1, crop: { left: 0, top: 165, width: 270, height: 245 } },
  'supra-bi-turbo':{ file: IMG_LANCHES_1, crop: { left: 0, top: 410, width: 270, height: 245 } },
  'subaru-impreza':{ file: IMG_LANCHES_1, crop: { left: 0, top: 655, width: 270, height: 245 } },
  'nsx':           { file: IMG_LANCHES_1, crop: { left: 0, top: 900, width: 270, height: 245 } },
  'silvia-s15':    { file: IMG_LANCHES_2, crop: { left: 0, top: 165, width: 270, height: 245 } },
  'civic-burguer': { file: IMG_LANCHES_2, crop: { left: 0, top: 410, width: 270, height: 245 } },
  'rx-7':          { file: IMG_LANCHES_2, crop: { left: 0, top: 655, width: 270, height: 245 } },
  'skyline-r34':   { file: IMG_LANCHES_2, crop: { left: 0, top: 900, width: 270, height: 245 } },
  'miata':         { file: IMG_DOCES,     crop: { left: 0, top: 685, width: 240, height: 225 } },
  'brz':           { file: IMG_DOCES,     crop: { left: 0, top: 910, width: 240, height: 225 } },
}

// ─── Definição dos produtos ────────────────────────────────────────────────
const PRODUTOS = [
  // Lanches
  { nome: '350Z',           categoria: 'lanches'        as const, preco: 0, slug: '350z' },
  { nome: 'Supra Bi-Turbo', categoria: 'lanches'        as const, preco: 0, slug: 'supra-bi-turbo' },
  { nome: 'Subaru Impreza', categoria: 'lanches'        as const, preco: 0, slug: 'subaru-impreza' },
  { nome: 'NSX',            categoria: 'lanches'        as const, preco: 0, slug: 'nsx' },
  { nome: 'Silvia S15',     categoria: 'lanches'        as const, preco: 0, slug: 'silvia-s15' },
  { nome: 'Civic Burguer',  categoria: 'lanches'        as const, preco: 0, slug: 'civic-burguer' },
  { nome: 'RX-7',           categoria: 'lanches'        as const, preco: 0, slug: 'rx-7' },
  { nome: 'Skyline R34',    categoria: 'lanches'        as const, preco: 0, slug: 'skyline-r34' },
  // Bebidas (sem foto)
  { nome: 'Água Natural',   categoria: 'bebidas'        as const, preco: 5.00,  slug: null },
  { nome: 'Água com Gás',   categoria: 'bebidas'        as const, preco: 5.50,  slug: null },
  { nome: 'Coca Cola',      categoria: 'bebidas'        as const, preco: 6.50,  slug: null },
  { nome: 'Coca Cola Zero', categoria: 'bebidas'        as const, preco: 6.75,  slug: null },
  { nome: 'Guaraná',        categoria: 'bebidas'        as const, preco: 6.00,  slug: null },
  { nome: 'Soda',           categoria: 'bebidas'        as const, preco: 6.00,  slug: null },
  { nome: 'Limão',          categoria: 'bebidas'        as const, preco: 7.50,  slug: null },
  { nome: 'Pêssego',        categoria: 'bebidas'        as const, preco: 7.50,  slug: null },
  { nome: 'Red Bull',       categoria: 'bebidas'        as const, preco: 12.00, slug: null },
  { nome: 'Monster',        categoria: 'bebidas'        as const, preco: 12.00, slug: null },
  { nome: 'Smirnoff Ice',   categoria: 'bebidas'        as const, preco: 15.00, slug: null },
  { nome: 'Skol Beats',     categoria: 'bebidas'        as const, preco: 15.00, slug: null },
  { nome: 'Cerveja',        categoria: 'bebidas'        as const, preco: 12.00, slug: null },
  { nome: 'Del Valle',      categoria: 'bebidas'        as const, preco: 8.00,  slug: null },
  { nome: 'Suco Natural',   categoria: 'bebidas'        as const, preco: 12.00, slug: null },
  // Doces
  { nome: 'Miata',          categoria: 'doces'          as const, preco: 0, slug: 'miata' },
  { nome: 'BRZ',            categoria: 'doces'          as const, preco: 0, slug: 'brz' },
]

async function main() {
  console.log('🍔 Iniciando seed de produtos...\n')

  for (const produto of PRODUTOS) {
    const exists = await prisma.produto.findFirst({ where: { nome: produto.nome } })
    if (exists) {
      console.log(`  — já existe: ${produto.nome}`)
      continue
    }

    let imagemUrl: string | null = null

    if (produto.slug && CROPS[produto.slug]) {
      const { file, crop } = CROPS[produto.slug]
      imagemUrl = await cropAndUpload(file, crop, produto.slug)
    }

    await prisma.produto.create({
      data: {
        nome: produto.nome,
        categoria: produto.categoria,
        preco: produto.preco,
        disponivel: true,
        imagemUrl,
      },
    })

    console.log(`  ✓ criado: ${produto.nome}`)
  }

  console.log('\n✅ Seed concluído!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
