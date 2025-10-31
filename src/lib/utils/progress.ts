type ResourceStatus = 'needed' | 'acquired' | 'in-progress' | 'completed'

const STATUS_VALUES: Record<ResourceStatus, number> = {
  needed: 0,
  acquired: 0.25,
  'in-progress': 0.5,
  completed: 1.0,
}

export function calculateResourceProgress(status: ResourceStatus, completedTasks: number, totalTasks: number): number {
  const statusValue = STATUS_VALUES[status]
  if (!totalTasks) return statusValue
  const taskCompletion = completedTasks / totalTasks
  return (statusValue + taskCompletion) / 2
}

export function hybridProjectProgress(projectCompleted: number, projectTotal: number, resourceAverages: number[], resourceCount: number): number {
  const projectTasks = projectTotal ? projectCompleted / projectTotal : 0
  const resources = resourceCount ? resourceAverages.reduce((a, b) => a + b, 0) / resourceCount : 0
  if (!projectTotal && resourceCount) return Math.round(resources * 100)
  if (projectTotal && !resourceCount) return Math.round(projectTasks * 100)
  return Math.round(((projectTasks + resources) / 2) * 100)
}


