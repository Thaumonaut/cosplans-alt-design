import { performance } from 'node:perf_hooks';
import { expect } from 'vitest';

export async function measureQueryTime(fn: () => Promise<unknown>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

export async function measureMemoryUsage<T>(
  fn: () => Promise<T> | T
): Promise<{ result: T; before: NodeJS.MemoryUsage; after: NodeJS.MemoryUsage; deltaBytes: number }> {
  const before = process.memoryUsage();
  const result = await fn();
  const after = process.memoryUsage();

  return {
    result,
    before,
    after,
    deltaBytes: Math.max(after.heapUsed - before.heapUsed, 0),
  };
}

export async function runBenchmark(
  name: string,
  fn: () => Promise<unknown>,
  iterations: number = 5
): Promise<{ name: string; iterations: number; avg: number; min: number; max: number }> {
  const durations: number[] = [];

  for (let i = 0; i < iterations; i += 1) {
    const duration = await measureQueryTime(fn);
    durations.push(duration);
  }

  const total = durations.reduce((sum, value) => sum + value, 0);
  const avg = total / durations.length;
  const min = Math.min(...durations);
  const max = Math.max(...durations);

  return { name, iterations, avg, min, max };
}

export function assertPerformance(duration: number, threshold: number, message: string): void {
  expect(duration, message).toBeLessThan(threshold);
}
