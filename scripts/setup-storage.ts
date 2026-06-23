import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'jdm-images'

async function setupStoragePolicies() {
  console.log('Setting up Supabase Storage for bucket:', BUCKET)

  // Check/create bucket
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some((b) => b.name === BUCKET)

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (error) {
      console.error('Error creating bucket:', error.message)
    } else {
      console.log('Bucket created:', BUCKET)
    }
  } else {
    console.log('Bucket already exists:', BUCKET)
    const { error } = await supabase.storage.updateBucket(BUCKET, { public: true })
    if (error) {
      console.warn('Could not update bucket to public:', error.message)
    } else {
      console.log('Bucket set to public')
    }
  }

  // Since the bucket is public, files uploaded to it are publicly readable via the public URL.
  // For server-side uploads using the service role key, no additional RLS policies are needed
  // because the service role bypasses RLS.
  // For anon uploads (from client), we need RLS policies. We'll use the PostgREST approach.

  // Try to insert policies directly via the pg schema using the admin client
  // The storage.objects table has RLS. We need to add policies via SQL.
  // Supabase admin API does not expose a direct SQL endpoint, but we can use
  // the Management API if we have the project ref.

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1]

  if (!projectRef) {
    console.error('Could not extract project ref from URL:', supabaseUrl)
    process.exit(1)
  }

  console.log('Project ref:', projectRef)

  // Use Supabase Management API to run SQL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // The service role key IS the JWT for the Management API when used with /rest/v1/rpc
  // But we need the actual management API token (personal access token) for /v1/projects/{ref}/database/query
  // Instead, let's try to create policies by inserting directly to pg_catalog via the REST API

  // Alternative: use supabase-js with service role to execute raw SQL via the postgres connection
  // The adapter pattern already used in prisma suggests we have direct DB access

  // Let's try the Supabase REST API for raw query (Management API)
  // The management API requires a personal access token, not service role
  // So let's just try inserting via the supabase postgrest

  const insertSql = `
    DO $$
    BEGIN
      -- INSERT policy for authenticated users
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'authenticated_insert_jdm_images'
      ) THEN
        EXECUTE 'CREATE POLICY "authenticated_insert_jdm_images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''${BUCKET}'')';
        RAISE NOTICE 'Created INSERT policy for authenticated';
      ELSE
        RAISE NOTICE 'INSERT policy already exists';
      END IF;

      -- SELECT policy for public (anon)
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage'
          AND tablename = 'objects'
          AND policyname = 'public_select_jdm_images'
      ) THEN
        EXECUTE 'CREATE POLICY "public_select_jdm_images" ON storage.objects FOR SELECT TO anon USING (bucket_id = ''${BUCKET}'')';
        RAISE NOTICE 'Created SELECT policy for anon';
      ELSE
        RAISE NOTICE 'SELECT policy already exists';
      END IF;
    END $$;
  `

  // Try via pg directly
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  try {
    const result = await pool.query(insertSql)
    console.log('Policies created via direct DB connection')
    console.log('Messages:', result)
  } catch (err) {
    const e = err as Error
    console.warn('Direct DB policy creation failed:', e.message)
    console.log('')
    console.log('MANUAL STEPS REQUIRED:')
    console.log('Go to Supabase Dashboard → Storage → Policies and create:')
    console.log(`1. INSERT policy: allow "authenticated" role to INSERT on bucket "${BUCKET}"`)
    console.log(`2. SELECT policy: allow "anon" role to SELECT on bucket "${BUCKET}"`)
    console.log('')
    console.log('Or run this SQL in the SQL Editor:')
    console.log(insertSql)
  } finally {
    await pool.end()
  }

  console.log('\nStorage setup complete.')
  console.log('Public URL base:', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`)
}

setupStoragePolicies().catch(console.error)
