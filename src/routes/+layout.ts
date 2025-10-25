import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
  return {
    title: 'Cosplans - Cosplay Project Tracker',
    description: 'Track your cosplay projects from inspiration to completion'
  };
};