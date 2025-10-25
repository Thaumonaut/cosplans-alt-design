export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30')
];

export const server_loads = [];

export const dictionary = {
		"/": [5],
		"/accessories": [6],
		"/archived": [7],
		"/budget": [8],
		"/calendar": [9],
		"/characters": [10,[],[2]],
		"/dashboard": [11],
		"/equipment": [12],
		"/events": [13],
		"/ideas": [14],
		"/in-progress": [15],
		"/marketplace": [16],
		"/materials": [17],
		"/messages": [18],
		"/outfits": [19],
		"/photoshoots": [20],
		"/planning": [21],
		"/post-production": [22],
		"/profile": [23],
		"/projects/[id]": [24],
		"/props": [25],
		"/settings/profile": [26,[3],[4]],
		"/settings/team": [27,[3],[4]],
		"/tasks": [28],
		"/timeline": [29],
		"/tools": [30]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.js';