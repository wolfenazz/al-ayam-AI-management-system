import type { NewsStatus, NewsCategory, NewsSentiment, NewsTone } from '../types/news'

export const NEWS_STATUS: Record<NewsStatus, string> = {
  INGESTED: 'Ingested',
  PROCESSING: 'Processing',
  PENDING_APPROVAL: 'Pending Approval',
  UNDER_REVIEW: 'Under Review',
  READY_TO_POST: 'Ready to Post',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
  NEEDS_REVISION: 'Needs Revision'
} as const

export const NEWS_CATEGORY: Record<NewsCategory, string> = {
  POLITICS: 'Politics',
  SPORTS: 'Sports',
  BUSINESS: 'Business',
  TECHNOLOGY: 'Technology',
  ENTERTAINMENT: 'Entertainment',
  HEALTH: 'Health',
  WORLD: 'World',
  LOCAL: 'Local'
} as const

export const NEWS_SENTIMENT: Record<NewsSentiment, string> = {
  POSITIVE: 'Positive',
  NEGATIVE: 'Negative',
  NEUTRAL: 'Neutral',
  MIXED: 'Mixed'
} as const

export const NEWS_TONE: Record<NewsTone, string> = {
  OBJECTIVE: 'Objective',
  OPINIONATED: 'Opinionated',
  URGENT: 'Urgent',
  CELEBRATORY: 'Celebratory'
} as const

export const DEFAULT_POLLING_INTERVALS: Record<'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW', number> = {
  CRITICAL: 5,
  HIGH: 10,
  NORMAL: 15,
  LOW: 30
} as const

export const CATEGORY_COLORS: Record<NewsCategory, string> = {
  POLITICS: 'purple.500',
  SPORTS: 'green.500',
  BUSINESS: 'blue.500',
  TECHNOLOGY: 'cyan.500',
  ENTERTAINMENT: 'pink.500',
  HEALTH: 'red.500',
  WORLD: 'orange.500',
  LOCAL: 'teal.500'
} as const
