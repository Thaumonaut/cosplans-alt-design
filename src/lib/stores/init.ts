import { browser } from '$app/environment'
import { theme } from './theme.js'
import { appSettings } from './settings.js'
import { projects, addProjectLocal, loadProjects } from './projects.js'
import { tasks, addTaskLocal, loadTasks } from './tasks.js'
import { events, addEventLocal, loadEvents } from './events.js'
import { user, setUser } from './user.js'
import { setupPersistence, loadPersistedData } from './persistence.js'
import { get } from 'svelte/store'

/**
 * Initialize all stores that need browser-specific setup
 * Call this in the root layout or app initialization
 */
export async function initializeStores() {
  if (!browser) return

  // Initialize theme and settings
  theme.init()
  appSettings.init()
  
  // Set up automatic persistence for local data
  setupPersistence()
  
  // Try to load data from API first
  try {
    await Promise.all([
      loadProjects(),
      loadTasks(),
      loadEvents()
    ])
    
    // If API data is loaded successfully, we're done
    if (get(projects).length > 0) {
      return
    }
  } catch (error) {
    console.warn('Failed to load data from API, falling back to local storage:', error)
  }
  
  // Fallback: Load persisted data from localStorage
  loadPersistedData()
  
  // Load sample data if stores are still empty (first time users)
  if (get(projects).length === 0) {
    loadSampleData()
  }
}

/**
 * Load sample data for development/demo purposes
 */
export function loadSampleData() {
  // Set sample user
  setUser({
    id: '1',
    name: 'Alex Cosplayer',
    email: 'alex@example.com',
    avatar: '/avatars/alex.jpg'
  })

  // Add sample projects using local functions
  const sampleProjects = [
    {
      title: 'Nezuko Kamado',
      character: 'Nezuko Kamado',
      series: 'Demon Slayer',
      image: '/anime-character-purple-kimono.jpg',
      progress: 75,
      budget: { spent: 150, total: 200 },
      deadline: '2025-12-15',
      status: 'in-progress' as const
    },
    {
      title: 'Sailor Moon',
      character: 'Usagi Tsukino',
      series: 'Sailor Moon',
      image: '/jinx-arcane-blue-hair-twin-braids.jpg',
      progress: 100,
      budget: { spent: 180, total: 180 },
      status: 'completed' as const
    },
    {
      title: 'Gojo Satoru',
      character: 'Gojo Satoru',
      series: 'Jujutsu Kaisen',
      image: '/fantasy-warrior-white-hair-sword.jpg',
      progress: 25,
      budget: { spent: 50, total: 300 },
      deadline: '2026-03-20',
      status: 'planning' as const
    }
  ]

  sampleProjects.forEach(project => addProjectLocal(project))

  // Add sample tasks using local functions
  const sampleTasks = [
    {
      title: 'Order bamboo muzzle prop',
      description: 'Find and order the bamboo muzzle for Nezuko cosplay',
      completed: false,
      projectId: 1,
      dueDate: new Date('2025-11-15'),
      priority: 'high' as const
    },
    {
      title: 'Sew kimono sleeves',
      description: 'Complete the kimono sleeves with proper measurements',
      completed: true,
      projectId: 1,
      priority: 'medium' as const
    },
    {
      title: 'Style wig',
      description: 'Cut and style the white wig for Gojo',
      completed: false,
      projectId: 3,
      dueDate: new Date('2025-12-01'),
      priority: 'medium' as const
    }
  ]

  sampleTasks.forEach(task => addTaskLocal(task))

  // Add sample events using local functions
  const sampleEvents = [
    {
      title: 'Anime Expo 2025',
      description: 'Major anime convention in Los Angeles',
      date: new Date('2025-07-04'),
      type: 'convention' as const,
      projectId: 1
    },
    {
      title: 'Photoshoot with photographer',
      description: 'Professional photoshoot for Sailor Moon cosplay',
      date: new Date('2025-11-20'),
      type: 'photoshoot' as const,
      projectId: 2
    },
    {
      title: 'Nezuko deadline',
      description: 'Final deadline for Nezuko cosplay completion',
      date: new Date('2025-12-15'),
      type: 'deadline' as const,
      projectId: 1
    }
  ]

  sampleEvents.forEach(event => addEventLocal(event))
}