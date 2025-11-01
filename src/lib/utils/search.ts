import Fuse from 'fuse.js'

export function createFuzzySearch<T>(items: T[], keys: Array<keyof T>) {
  return new Fuse(items, {
    keys: keys as string[],
    threshold: 0.3,
    distance: 100,
    ignoreLocation: true,
  })
}


