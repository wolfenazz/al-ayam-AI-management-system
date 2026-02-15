'use client'

import { useState, useEffect, useCallback } from 'react'
import { getNewsItem, getNewsItems, getPendingReviewNews, updateNewsStatus } from '../services/news.service'
import type { NewsItem, NewsFilters, NewsFormData } from '../types/news'

export function useNewsItem(newsId: string) {
  const [news, setNews] = useState<NewsItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getNewsItem(newsId)
        setNews(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch news'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [newsId])

  return { news, isLoading, error }
}

export function useNews(filters?: NewsFilters) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getNewsItems(filters)
        setNewsItems(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch news'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [filters])

  return { newsItems, isLoading, error }
}

export function usePendingReviewNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPending() {
      try {
        const data = await getPendingReviewNews()
        setNewsItems(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch pending news'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPending()
  }, [])

  return { newsItems, isLoading, error }
}

export function useNewsActions() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const publishNews = useCallback(
    async (newsId: string) => {
      try {
        setIsSubmitting(true)
        setError(null)
        await updateNewsStatus(newsId, 'PUBLISHED')
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to publish news'))
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  const rejectNews = useCallback(
    async (newsId: string) => {
      try {
        setIsSubmitting(true)
        setError(null)
        await updateNewsStatus(newsId, 'REJECTED')
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to reject news'))
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    []
  )

  return { isSubmitting, error, publishNews, rejectNews }
}
