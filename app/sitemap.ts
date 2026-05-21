import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const { data } = await supabase
    .from('blogs')
    .select('slug, created_at')
    .eq('publicado', true)

  return [
    {
      url: 'https://www.mastesto.es',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },

    {
      url: 'https://www.mastesto.es/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },

    ...(data ?? []).map((blog) => ({
      url: `https://www.mastesto.es/blog/${blog.slug}`,
      lastModified: blog.created_at
        ? new Date(blog.created_at)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
  ]
}
