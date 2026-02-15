export type NewsCategory =
  | 'POLITICS'
  | 'SPORTS'
  | 'BUSINESS'
  | 'TECHNOLOGY'
  | 'ENTERTAINMENT'
  | 'HEALTH'
  | 'WORLD'
  | 'LOCAL'

export type NewsStatus =
  | 'INGESTED'
  | 'PROCESSING'
  | 'PENDING_APPROVAL'
  | 'UNDER_REVIEW'
  | 'READY_TO_POST'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'NEEDS_REVISION'

export type NewsSentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED'

export type NewsTone = 'OBJECTIVE' | 'OPINIONATED' | 'URGENT' | 'CELEBRATORY'

export interface NewsSource {
  readonly id: string
  readonly name: string
  readonly url: string
  readonly rssFeedUrl: string | null
  readonly apiEndpoint: string | null
  readonly type: 'RSS' | 'API' | 'SCRAPER' | 'SOCIAL_MEDIA'
  readonly category: string | null
  readonly region: string | null
  readonly language: string
  readonly priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'
  readonly pollingInterval: number
  readonly credibilityScore: number | null
  readonly isActive: boolean
  readonly lastChecked: Date | null
  readonly lastArticleDate: Date | null
  readonly totalArticlesIngested: number
  readonly errorCount: number
  readonly lastError: string | null
  readonly createdAt: Date
}

export interface NewsItem {
  readonly id: string
  readonly headline: string
  readonly slug: string
  readonly sourceUrl: string
  readonly sourceId: string | null
  readonly category: NewsCategory
  readonly region: string | null
  readonly status: NewsStatus
  readonly rawContent: string | null
  readonly aiGeneratedContent: string | null
  readonly finalContent: string | null
  readonly summary: string | null
  readonly sentiment: NewsSentiment | null
  readonly tone: NewsTone | null
  readonly aiConfidenceScore: number | null
  readonly author: string | null
  readonly publicationDate: Date | null
  readonly ingestedAt: Date
  readonly processedAt: Date | null
  readonly reviewedBy: string | null
  readonly publishedAt: Date | null
  readonly readingTime: number | null
  readonly viewCount: number
  readonly shareCount: number
  readonly seoScore: number | null
  readonly readabilityScore: number | null
  readonly isBreaking: boolean
  readonly isFeatured: boolean
  readonly tags: readonly string[]
  readonly entities: NewsEntities | null
  readonly sourcesUsed: readonly string[]
  readonly version: number
}

export interface NewsEntities {
  readonly people: readonly string[]
  readonly organizations: readonly string[]
  readonly locations: readonly string[]
  readonly dates: readonly string[]
}

export interface NewsFormData {
  readonly headline: string
  readonly summary: string
  readonly content: string
  readonly category: NewsCategory
  readonly region: string | null
  readonly tags: readonly string[]
  readonly isBreaking: boolean
  readonly isFeatured: boolean
}

export interface NewsFilters {
  readonly status?: NewsStatus
  readonly category?: NewsCategory
  readonly region?: string
  readonly dateFrom?: Date
  readonly dateTo?: Date
  readonly search?: string
  readonly isBreaking?: boolean
  readonly isFeatured?: boolean
}
