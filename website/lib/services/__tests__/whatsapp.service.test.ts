import { describe, it, expect } from 'vitest'
import {
  parseEmployeeResponse,
  type ParsedMessageResponse
} from '@/lib/services/whatsapp.service'

describe('parseEmployeeResponse', () => {
  it('should correctly identify ACCEPT responses', () => {
    const acceptMessages = [
      'Accept',
      'ACCEPT',
      'accept',
      'Yes',
      'OK',
      'Ok',
      'sure',
      'Will do',
      'On it',
      'Got it',
      '👍',
      '✅'
    ]

    acceptMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).toBe('ACCEPT')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  it('should correctly identify DECLINE responses', () => {
    const declineMessages = [
      'Decline',
      'DECLINE',
      'decline',
      'No',
      'nope',
      'Can\'t',
      'Cannot',
      'Unable',
      'Not available',
      'Sorry',
      '❌'
    ]

    declineMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).toBe('DECLINE')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  it('should correctly identify PROGRESS responses', () => {
    const progressMessages = [
      'On my way',
      'Started',
      'Working on it',
      'In progress',
      'Arrived',
      'At location',
      'Going',
      'Heading there'
    ]

    progressMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).toBe('PROGRESS')
      expect(result.confidence).toBeGreaterThan(0.7)
    })
  })

  it('should correctly identify COMPLETE responses', () => {
    const completeMessages = [
      'Done',
      'Finished',
      'Complete',
      'Completed',
      'Ready',
      'Submitted',
      '✅'
    ]

    completeMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).toBe('COMPLETE')
      expect(result.confidence).toBeGreaterThan(0.8)
    })
  })

  it('should correctly identify DELAY responses', () => {
    const delayMessages = [
      'Running late',
      'Need more time',
      'Will be there in 30 minutes',
      'Delay',
      'Need extension'
    ]

    delayMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).toBe('DELAY')
      expect(result.confidence).toBeGreaterThan(0.7)
    })
  })

  it('should extract budget information from messages', () => {
    const messages = [
      'I need BD 20 for parking',
      'Need $15 for transport',
      'require 10 BD for expenses'
    ]

    messages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.extractedInfo).toBeDefined()
      expect(result.extractedInfo?.budget).toBeGreaterThan(0)
    })
  })

  it('should extract phone numbers from messages', () => {
    const messages = [
      'Contact Mr. Ahmed at 97312345678',
      'Call 12345678 for details',
      'Spoke to someone at +973 1234 5678'
    ]

    messages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.extractedInfo).toBeDefined()
      expect(result.extractedInfo?.contact).toBeDefined()
    })
  })

  it('should identify UNKNOWN actions for unclear messages', () => {
    const unclearMessages = [
      'Hello',
      'How are you?',
      'What is this?',
      'Random text message'
    ]

    unclearMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).toBe('UNKNOWN')
      expect(result.confidence).toBeLessThan(0.5)
    })
  })

  it('should handle empty messages', () => {
    const result = parseEmployeeResponse('')
    expect(result.action).toBe('UNKNOWN')
    expect(result.confidence).toBe(0)
  })

  it('should handle mixed case messages', () => {
    const mixedMessages = [
      'i WiLl Do IT',
      'YES, I accept',
      'No, I decline'
    ]

    mixedMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).not.toBe('UNKNOWN')
      expect(result.confidence).toBeGreaterThan(0)
    })
  })

  it('should prioritize specific patterns over general ones', () => {
    const message = 'I accept the task, on my way'
    const result = parseEmployeeResponse(message)
    expect(result.action).toBe('ACCEPT')
    expect(result.confidence).toBeGreaterThan(0.8)
  })

  it('should handle messages with emojis correctly', () => {
    const emojiMessages = [
      '👍 Yes',
      '✅ Done',
      '❌ No',
      '👍',
      '✅'
    ]

    emojiMessages.forEach((message) => {
      const result = parseEmployeeResponse(message)
      expect(result.action).not.toBe('UNKNOWN')
    })
  })
})
