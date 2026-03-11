import dishApiRequest from '@/apiRequests/dish'
import envConfig, { locales } from '@/config'
import { generateSlugUrl } from '@/lib/utils'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

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
  try {
    const result = await dishApiRequest.list()
    const dishList = result.payload.data

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
  } catch (error) {
    console.error('Sitemap error:', error)

    // fallback sitemap nếu API lỗi
    return locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        ...route,
        url: `${envConfig.NEXT_PUBLIC_URL}/${locale}${route.url}`,
        lastModified: new Date()
      }))
    )
  }
}