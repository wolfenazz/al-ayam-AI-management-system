import { cache } from 'react'
import {
  createDocument,
  updateDocument,
  getDocument,
  deleteDocument,
  getCollection
} from '../firebase/firestore'
import { query, where, orderBy } from 'firebase/firestore'
import type { Task, TaskFormData, TaskType, TaskPriority } from '../types/task'
import type { Employee } from '../types/employee'

const COLLECTION = 'task_templates'

export interface TaskTemplate {
  readonly id: string
  readonly name: string
  readonly type: TaskType
  readonly description: string | null
  readonly defaultPriority: TaskPriority
  readonly estimatedDuration: number | null
  readonly requiredDeliverables: Task['deliverables'] | null
  readonly defaultBudget: number | null
  readonly defaultDescription: string
  readonly isActive: boolean
  readonly createdBy: string
  readonly createdAt: Date
  readonly usageCount: number
}

export const getTaskTemplate = cache(
  async (templateId: string): Promise<TaskTemplate | null> => {
    return getDocument<TaskTemplate>(COLLECTION, templateId)
  }
)

export const getTaskTemplates = cache(
  async (activeOnly = true): Promise<TaskTemplate[]> => {
    const constraints = []
    
    if (activeOnly) {
      constraints.push(where('isActive', '==', true))
    }
    
    constraints.push(orderBy('usageCount', 'desc'))
    
    return getCollection<TaskTemplate>(COLLECTION, constraints)
  }
)

export const getTemplatesByType = cache(
  async (taskType: TaskType): Promise<TaskTemplate[]> => {
    return getCollection<TaskTemplate>(COLLECTION, [
      where('type', '==', taskType),
      where('isActive', '==', true),
      orderBy('usageCount', 'desc')
    ])
  }
)

export async function createTaskTemplate(
  data: {
    readonly name: string
    readonly type: TaskType
    readonly description: string | null
    readonly defaultPriority: TaskPriority
    readonly estimatedDuration: number | null
    readonly requiredDeliverables: Task['deliverables'] | null
    readonly defaultBudget: number | null
    readonly defaultDescription: string
    readonly createdBy: string
  }
): Promise<string> {
  const template: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount'> = {
    ...data,
    isActive: true,
    createdAt: new Date(),
    usageCount: 0
  }

  return createDocument(COLLECTION, template)
}

export async function updateTaskTemplate(
  templateId: string,
  data: Partial<TaskTemplate>
): Promise<void> {
  await updateDocument(COLLECTION, templateId, data)
}

export async function deleteTaskTemplate(
  templateId: string
): Promise<void> {
  await deleteDocument(COLLECTION, templateId)
}

export async function applyTemplate(
  templateId: string,
  customizations?: Partial<TaskFormData>
): Promise<TaskFormData> {
  const template = await getTaskTemplate(templateId)
  
  if (!template) {
    throw new Error('Template not found')
  }

  const formData: TaskFormData = {
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
  }

  if (customizations) {
    Object.assign(formData, customizations)
  }

  await incrementTemplateUsage(templateId)

  return formData
}

export async function incrementTemplateUsage(
  templateId: string
): Promise<void> {
  const template = await getTaskTemplate(templateId)
  
  if (!template) return

  await updateDocument(COLLECTION, templateId, {
    usageCount: template.usageCount + 1
  })
}

export async function deactivateTemplate(
  templateId: string
): Promise<void> {
  await updateDocument(COLLECTION, templateId, {
    isActive: false
  })
}

export async function activateTemplate(
  templateId: string
): Promise<void> {
  await updateDocument(COLLECTION, templateId, {
    isActive: true
  })
}

export async function duplicateTemplate(
  templateId: string,
  newCreatedBy: string
): Promise<string> {
  const template = await getTaskTemplate(templateId)
  
  if (!template) {
    throw new Error('Template not found')
  }

  const newTemplate: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount'> = {
    name: `${template.name} (Copy)`,
    type: template.type,
    description: template.description,
    defaultPriority: template.defaultPriority,
    estimatedDuration: template.estimatedDuration,
    requiredDeliverables: template.requiredDeliverables,
    defaultBudget: template.defaultBudget,
    defaultDescription: template.defaultDescription,
    isActive: true,
    createdBy: newCreatedBy
  }

  return createDocument(COLLECTION, newTemplate)
}

export const DEFAULT_TEMPLATES: Omit<TaskTemplate, 'id' | 'createdAt' | 'usageCount' | 'createdBy'>[] = [
  {
    name: 'Breaking News Coverage',
    type: 'BREAKING_NEWS',
    description: 'Quick response task for breaking news events',
    defaultPriority: 'URGENT',
    estimatedDuration: 120,
    requiredDeliverables: {
      photos: 5,
      quotes: 3
    },
    defaultBudget: 50,
    defaultDescription: 'Cover breaking news event. Get on-the-scene photos and witness interviews.',
    isActive: true
  },
  {
    name: 'Press Conference Attendance',
    type: 'PRESS_CONF',
    description: 'Full coverage of press conferences and official statements',
    defaultPriority: 'HIGH',
    estimatedDuration: 180,
    requiredDeliverables: {
      photos: 10,
      quotes: 5,
      articles: 1
    },
    defaultBudget: 75,
    defaultDescription: 'Attend press conference and provide full coverage including notes, photos, and key quotes.',
    isActive: true
  },
  {
    name: 'Interview Request',
    type: 'INTERVIEW',
    description: 'Conduct interviews with key figures and experts',
    defaultPriority: 'HIGH',
    estimatedDuration: 60,
    requiredDeliverables: {
      quotes: 5,
      photos: 3
    },
    defaultBudget: 30,
    defaultDescription: 'Conduct interview with provided contact person and gather quotes, photos, and key information.',
    isActive: true
  },
  {
    name: 'Photo/Video Assignment',
    type: 'PHOTO_ASSIGN',
    description: 'Photography and videography assignments for events',
    defaultPriority: 'NORMAL',
    estimatedDuration: 120,
    requiredDeliverables: {
      photos: 20,
      videos: 2
    },
    defaultBudget: 100,
    defaultDescription: 'Capture high-quality photos and videos of the event or location.',
    isActive: true
  },
  {
    name: 'Fact-Check Mission',
    type: 'FACT_CHECK',
    description: 'Verify claims and fact-check statements',
    defaultPriority: 'NORMAL',
    estimatedDuration: 180,
    requiredDeliverables: {
      articles: 1
    },
    defaultBudget: 50,
    defaultDescription: 'Fact-check the provided claims and statements. Provide evidence and sources.',
    isActive: true
  }
]

export async function initializeDefaultTemplates(
  createdBy: string
): Promise<void> {
  const existingTemplates = await getTaskTemplates()
  
  if (existingTemplates.length > 0) {
    return
  }

  for (const template of DEFAULT_TEMPLATES) {
    await createTaskTemplate({
      ...template,
      createdBy
    })
  }
}
