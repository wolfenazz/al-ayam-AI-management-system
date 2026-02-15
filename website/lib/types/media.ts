export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'

export interface MediaFile {
  readonly id: string
  readonly taskId: string
  readonly messageId: string | null
  readonly uploaderId: string
  readonly mediaType: MediaType
  readonly fileName: string
  readonly filePath: string
  readonly fileUrl: string
  readonly fileSize: number
  readonly mimeType: string
  readonly width: number | null
  readonly height: number | null
  readonly duration: number | null
  readonly thumbnailUrl: string | null
  readonly caption: string | null
  readonly isWatermarked: boolean
  readonly transcription: string | null
  readonly uploadedAt: Date
  readonly isApproved: boolean | null
}

export interface MediaFilters {
  readonly taskId?: string
  readonly uploaderId?: string
  readonly mediaType?: MediaType
  readonly dateFrom?: Date
  readonly dateTo?: Date
}
