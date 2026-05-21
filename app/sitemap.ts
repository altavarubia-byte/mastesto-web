import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug,updated_at')
    .eq('publicado', true);

  const blogUrls = (blogs || []).map((blog) => ({
    url: `https://www.mastesto.es/blog/${blog.slug}`,

    lastModified: blog.updated_at
      ? new Date(blog.updated_at)
      : new Date(),

    changeFrequency: 'weekly' as const,

    priority: 0.85,
  }));

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

    ...blogUrls,
  ];
}
