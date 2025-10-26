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
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33'),
	() => import('./nodes/34'),
	() => import('./nodes/35')
];

export const server_loads = [0];

export const dictionary = {
		"/": [5],
		"/accessories": [6],
		"/archived": [7],
		"/auth/callback": [~8],
		"/budget": [9],
		"/calendar": [10],
		"/characters": [11,[],[2]],
		"/dashboard": [12],
		"/equipment": [13],
		"/events": [14],
		"/forgot-password": [15],
		"/ideas": [16],
		"/in-progress": [17],
		"/login": [18],
		"/logout": [~19],
		"/marketplace": [20],
		"/materials": [21],
		"/messages": [22],
		"/outfits": [23],
		"/photoshoots": [24],
		"/planning": [25],
		"/post-production": [26],
		"/profile": [27],
		"/projects/[id]": [28],
		"/props": [29],
		"/settings/profile": [30,[3],[4]],
		"/settings/team": [31,[3],[4]],
		"/signup": [32],
		"/tasks": [33],
		"/timeline": [34],
		"/tools": [35]
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