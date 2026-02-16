import { describe, it, expect, vi } from 'vitest'
import {
  createTaskTemplate,
  getTaskTemplates,
  applyTemplate,
  duplicateTemplate,
  type TaskTemplate
} from '@/lib/services/task-template.service'

vi.mock('@/lib/firebase/firestore', () => ({
  createDocument: vi.fn(),
  getCollection: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn()
}))

describe('TaskTemplateService', () => {
  const mockTemplate: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount'> = {
    name: 'Breaking News Template',
    type: 'BREAKING_NEWS',
    description: 'Quick response for breaking news',
    defaultPriority: 'URGENT',
    estimatedDuration: 120,
    requiredDeliverables: {
      photos: 5,
      quotes: 3
    },
    defaultBudget: 50,
    defaultDescription: 'Cover breaking news event',
    isActive: true,
    createdBy: 'user-1'
  }

  describe('createTaskTemplate', () => {
    it('should create a new task template', async () => {
      const templateId = await createTaskTemplate(mockTemplate)

      expect(templateId).toBeDefined()
      expect(typeof templateId).toBe('string')
    })

    it('should initialize default fields', async () => {
      await createTaskTemplate(mockTemplate)

      const { createDocument } = await import('@/lib/firebase/firestore')
      
      expect(createDocument).toHaveBeenCalledWith(
        'task_templates',
        expect.objectContaining({
          isActive: true,
          createdAt: expect.any(Date),
          usageCount: 0
        })
      )
    })
  })

  describe('getTaskTemplates', () => {
    it('should return active templates by default', async () => {
      const templates = await getTaskTemplates(true)

      expect(Array.isArray(templates)).toBe(true)
      expect(templates.every(t => t.isActive)).toBe(true)
    })

    it('should return all templates when activeOnly is false', async () => {
      const templates = await getTaskTemplates(false)

      expect(Array.isArray(templates)).toBe(true)
    })

    it('should return empty array when no templates exist', async () => {
      const { getCollection } = await import('@/lib/firebase/firestore')
      vi.mocked(getCollection).mockResolvedValue([])

      const templates = await getTaskTemplates()

      expect(templates).toHaveLength(0)
    })
  })

  describe('applyTemplate', () => {
    it('should apply template to task form data', async () => {
      const { getDocument } = await import('@/lib/firebase/firestore')
      const template: TaskTemplate = {
        id: 'template-1',
        ...mockTemplate,
        createdAt: new Date(),
        usageCount: 0
      }

      vi.mocked(getDocument).mockResolvedValue(template)

      const formData = await applyTemplate('template-1')

      expect(formData).toMatchObject({
        title: '',
        description: template.defaultDescription,
        type: template.type,
        priority: template.defaultPriority,
        assigneeId: null,
        deadline: null,
        estimatedDuration: template.estimatedDuration,
        budget: template.defaultBudget,
        deliverables: template.requiredDeliverables,
        location: null
      })
    })

    it('should apply customizations over template defaults', async () => {
      const { getDocument } = await import('@/lib/firebase/firestore')
      const template: TaskTemplate = {
        id: 'template-1',
        ...mockTemplate,
        createdAt: new Date(),
        usageCount: 0
      }

      vi.mocked(getDocument).mockResolvedValue(template)

      const customizations = {
        title: 'Custom Title',
        priority: 'HIGH' as const
      }

      const formData = await applyTemplate('template-1', customizations)

      expect(formData.title).toBe('Custom Title')
      expect(formData.priority).toBe('HIGH')
    })

    it('should increment template usage', async () => {
      const { getDocument } = await import('@/lib/firebase/firestore')
      const { updateDocument } = await import('@/lib/firebase/firestore')

      const template: TaskTemplate = {
        id: 'template-1',
        ...mockTemplate,
        createdAt: new Date(),
        usageCount: 5
      }

      vi.mocked(getDocument).mockResolvedValue(template)

      await applyTemplate('template-1')

      expect(updateDocument).toHaveBeenCalledWith(
        'task_templates',
        'template-1',
        { usageCount: 6 }
      )
    })
  })

  describe('duplicateTemplate', () => {
    it('should duplicate template with copy suffix', async () => {
      const { getDocument } = await import('@/lib/firebase/firestore')
      const template: TaskTemplate = {
        id: 'template-1',
        ...mockTemplate,
        createdAt: new Date(),
        usageCount: 10
      }

      vi.mocked(getDocument).mockResolvedValue(template)

      const newTemplateId = await duplicateTemplate('template-1', 'user-2')

      expect(newTemplateId).toBeDefined()

      const { createDocument } = await import('@/lib/firebase/firestore')
      expect(createDocument).toHaveBeenCalledWith(
        'task_templates',
        expect.objectContaining({
          name: 'Breaking News Template (Copy)',
          createdBy: 'user-2',
          usageCount: 0
        })
      )
    })
  })

  describe('DEFAULT_TEMPLATES', () => {
    it('should have 5 default templates', async () => {
      const { DEFAULT_TEMPLATES } = await import('@/lib/services/task-template.service')

      expect(DEFAULT_TEMPLATES).toHaveLength(5)
    })

    it('should include all required template types', async () => {
      const { DEFAULT_TEMPLATES } = await import('@/lib/services/task-template.service')
      const types = DEFAULT_TEMPLATES.map(t => t.type)

      expect(types).toContain('BREAKING_NEWS')
      expect(types).toContain('PRESS_CONF')
      expect(types).toContain('INTERVIEW')
      expect(types).toContain('PHOTO_ASSIGN')
      expect(types).toContain('FACT_CHECK')
    })

    it('should have proper default values for breaking news', async () => {
      const { DEFAULT_TEMPLATES } = await import('@/lib/services/task-template.service')
      const breakingNews = DEFAULT_TEMPLATES.find(t => t.type === 'BREAKING_NEWS')

      expect(breakingNews).toMatchObject({
        name: 'Breaking News Coverage',
        defaultPriority: 'URGENT',
        estimatedDuration: 120,
        defaultBudget: 50,
        isActive: true
      })

      expect(breakingNews?.requiredDeliverables).toEqual({
        photos: 5,
        quotes: 3
      })
    })

    it('should have proper default values for press conference', async () => {
      const { DEFAULT_TEMPLATES } = await import('@/lib/services/task-template.service')
      const pressConf = DEFAULT_TEMPLATES.find(t => t.type === 'PRESS_CONF')

      expect(pressConf).toMatchObject({
        name: 'Press Conference Attendance',
        defaultPriority: 'HIGH',
        estimatedDuration: 180,
        defaultBudget: 75,
        isActive: true
      })

      expect(pressConf?.requiredDeliverables).toEqual({
        photos: 10,
        quotes: 5,
        articles: 1
      })
    })
  })
})
