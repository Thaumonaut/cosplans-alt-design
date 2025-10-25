// Re-export all stores for easy importing
export { 
  projects, 
  projectsLoading,
  projectsError,
  loadProjects,
  addProject, 
  updateProject, 
  deleteProject,
  addProjectLocal,
  updateProjectLocal,
  deleteProjectLocal,
  activeProjects,
  completedProjects,
  archivedProjects,
  ideaProjects,
  planningProjects,
  projectStats,
  getProjectById
} from './projects.js'
export { user, setUser, clearUser, updateUser } from './user.js'
export { 
  tasks,
  tasksLoading,
  tasksError,
  loadTasks,
  addTask, 
  addTaskLocal,
  updateTask, 
  deleteTask,
  completedTasks,
  pendingTasks,
  overdueTasks,
  tasksByPriority,
  taskStats,
  toggleTaskCompletion,
  getTasksByProject
} from './tasks.js'
export { 
  events,
  eventsLoading,
  eventsError,
  loadEvents,
  addEvent,
  addEventLocal,
  updateEvent, 
  deleteEvent,
  upcomingEvents,
  pastEvents,
  eventsByType,
  eventStats,
  getEventsByProject
} from './events.js'
export { theme, toggleTheme, setTheme } from './theme.js'
export { appSettings, updateSettings } from './settings.js'
export { initializeStores, loadSampleData } from './init.js'
export { setupPersistence, loadPersistedData, clearPersistedData } from './persistence.js'