import { cache } from 'react'
import { getDocument, createDocument, updateDocument } from '../firebase/firestore'
import { getCollection } from '../firebase/firestore'
import { where, orderBy, QueryConstraint } from 'firebase/firestore'
import type { NewsItem, NewsFormData, NewsFilters, NewsSource } from '../types/news'

const NEWS_COLLECTION = 'news_items'
const SOURCES_COLLECTION = 'news_sources'

export const getNewsItem = cache(
  async (newsId: string): Promise<NewsItem | null> => {
    return getDocument<NewsItem>(NEWS_COLLECTION, newsId)
  }
)

export const getNewsItems = cache(
  async (filters?: NewsFilters): Promise<NewsItem[]> => {
    const constraints: QueryConstraint[] = []

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category))
    }

    if (filters?.region) {
      constraints.push(where('region', '==', filters.region))
    }

    if (filters?.isBreaking !== undefined) {
      constraints.push(where('isBreaking', '==', filters.isBreaking))
    }

    if (filters?.isFeatured !== undefined) {
      constraints.push(where('isFeatured', '==', filters.isFeatured))
    }

    constraints.push(orderBy('createdAt', 'desc'))

    if (filters?.dateFrom || filters?.dateTo) {
      if (filters.dateFrom) {
        constraints.push(
          where('createdAt', '>=', filters.dateFrom.toISOString())
        )
      }
      if (filters.dateTo) {
        constraints.push(
          where('createdAt', '<=', filters.dateTo.toISOString())
        )
      }
    }

    return getCollection<NewsItem>(NEWS_COLLECTION, constraints)
  }
)

export const getPendingReviewNews = cache(
  async (): Promise<NewsItem[]> => {
    return getCollection<NewsItem>(NEWS_COLLECTION, [
      where('status', 'in', ['PENDING_APPROVAL', 'UNDER_REVIEW']),
      orderBy('createdAt', 'desc')
    ])
  }
)

export const getPublishedNews = cache(
  async (limitCount = 20): Promise<NewsItem[]> => {
    return getCollection<NewsItem>(NEWS_COLLECTION, [
      where('status', '==', 'PUBLISHED'),
      orderBy('publishedAt', 'desc')
    ]).then((items) => items.slice(0, limitCount))
  }
)

export async function createNewsItem(data: NewsFormData): Promise<string> {
  const newsItem = {
    ...data,
    status: 'INGESTED' as const,
    slug: data.headline.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    sourceUrl: null,
    sourceId: null,
    rawContent: null,
    aiGeneratedContent: data.content,
    finalContent: data.content,
    summary: data.summary,
    sentiment: null,
    tone: null,
    aiConfidenceScore: null,
    author: null,
    publicationDate: null,
    ingestedAt: new Date().toISOString(),
    processedAt: null,
    reviewedBy: null,
    publishedAt: null,
    readingTime: null,
    viewCount: 0,
    shareCount: 0,
    seoScore: null,
    readabilityScore: null,
    isBreaking: data.isBreaking,
    isFeatured: data.isFeatured,
    tags: data.tags,
    entities: null,
    sourcesUsed: [],
    version: 1
  }

  return createDocument(NEWS_COLLECTION, newsItem)
}

export async function updateNewsItem(
  newsId: string,
  data: Partial<NewsItem>
): Promise<void> {
  await updateDocument(NEWS_COLLECTION, newsId, data)
}

export async function updateNewsStatus(
  newsId: string,
  status: NewsItem['status']
): Promise<void> {
  const updateData = { status } as Partial<NewsItem>

  if (status === 'PUBLISHED') {
    Object.assign(updateData, { publishedAt: new Date() })
  } else if (status === 'UNDER_REVIEW') {
    Object.assign(updateData, { reviewedBy: null })
  }

  await updateNewsItem(newsId, updateData)
}

export const getNewsSource = cache(
  async (sourceId: string): Promise<NewsSource | null> => {
    return getDocument<NewsSource>(SOURCES_COLLECTION, sourceId)
  }
)

export const getNewsSources = cache(
  async (activeOnly = false): Promise<NewsSource[]> => {
    const constraints = activeOnly
      ? [where('isActive', '==', true), orderBy('priority', 'desc')]
      : [orderBy('priority', 'desc')]

    return getCollection<NewsSource>(SOURCES_COLLECTION, constraints)
  }
)

export async function createNewsSource(data: Omit<NewsSource, 'id'>): Promise<string> {
  return createDocument(SOURCES_COLLECTION, data)
}

export async function updateNewsSource(
  sourceId: string,
  data: Partial<NewsSource>
): Promise<void> {
  await updateDocument(SOURCES_COLLECTION, sourceId, data)
}
