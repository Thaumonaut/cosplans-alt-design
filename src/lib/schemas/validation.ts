import { z } from 'zod'

export const ideaSchema = z.object({
  character: z.string().min(1),
  series: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
})

export const projectSchema = z.object({
  character: z.string().min(1),
  series: z.string().min(1),
  status: z.enum(['planning', 'in-progress', 'completed', 'archived']),
})

export const taskSchema = z.object({
  title: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export type IdeaInput = z.infer<typeof ideaSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type TaskInput = z.infer<typeof taskSchema>


