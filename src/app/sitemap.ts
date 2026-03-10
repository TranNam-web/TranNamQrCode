import dishApiRequest from '@/apiRequests/dish'
import envConfig, { locales } from '@/config'
import { generateSlugUrl } from '@/lib/utils'
import type { MetadataRoute } from 'next'

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: '',
    changeFrequency: 'daily',
    priority: 1
  },
  {
    url: '/login',
    changeFrequency: 'yearly',
    priority: 0.5
  }
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

  let dishList: any[] = []

  // ❗ chỉ gọi API khi không phải build
  if (process.env.VERCEL_ENV !== 'production') {
    try {
      const result = await dishApiRequest.list()
      dishList = result?.payload?.data || []
    } catch {
      dishList = []
    }
  }

  const localizeStaticSiteMap = locales.reduce((acc, locale) => {
    return [
      ...acc,
      ...staticRoutes.map((route) => ({
        ...route,
        url: `${envConfig.NEXT_PUBLIC_URL}/${locale}${route.url}`,
        lastModified: new Date()
      }))
    ]
  }, [] as MetadataRoute.Sitemap)

  const localizeDishSiteMap = locales.reduce((acc, locale) => {
    const dishListSiteMap: MetadataRoute.Sitemap = dishList.map((dish) => ({
      url: `${envConfig.NEXT_PUBLIC_URL}/${locale}/dishes/${generateSlugUrl({
        id: dish.id,
        name: dish.name
      })}`,
      lastModified: dish.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9
    }))

    return [...acc, ...dishListSiteMap]
  }, [] as MetadataRoute.Sitemap)

  return [...localizeStaticSiteMap, ...localizeDishSiteMap]
}