import type { MetadataRoute } from 'next'
import { getAllTerms } from '@/lib/terms'
import { CATEGORIES } from '@/types/term'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: absoluteUrl(''), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: absoluteUrl(`categories/${c.id}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...getAllTerms().map((t) => ({
      url: absoluteUrl(`terms/${t.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
