import dishApiRequest from '@/apiRequests/dish'
import envConfig, { locales } from '@/config'
import { generateSlugUrl } from '@/lib/utils'
import type { MetadataRoute } from 'next'

export const dynamic = 'force-dynamic'

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

  try {
    const result = await dishApiRequest.list()
    dishList = result?.payload?.data || []
  } catch (error) {
    console.log('Sitemap API error:', error)
    dishList = []
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
      lastModified: dish.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    }))

    return [...acc, ...dishListSiteMap]
  }, [] as MetadataRoute.Sitemap)

  return [...localizeStaticSiteMap, ...localizeDishSiteMap]
}