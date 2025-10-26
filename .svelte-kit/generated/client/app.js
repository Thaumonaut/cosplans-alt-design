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
	() => import('./nodes/35'),
	() => import('./nodes/36')
];

export const server_loads = [0,2];

export const dictionary = {
		"/": [6],
		"/(auth)/accessories": [7,[2]],
		"/(auth)/archived": [8,[2]],
		"/auth/callback": [~32],
		"/(auth)/budget": [9,[2]],
		"/(auth)/calendar": [10,[2]],
		"/(auth)/characters": [11,[2],[,3]],
		"/(auth)/dashboard": [12,[2]],
		"/(auth)/equipment": [13,[2]],
		"/(auth)/events": [14,[2]],
		"/forgot-password": [33],
		"/(auth)/ideas": [15,[2]],
		"/(auth)/in-progress": [16,[2]],
		"/login": [34],
		"/logout": [~35],
		"/(auth)/marketplace": [17,[2]],
		"/(auth)/materials": [18,[2]],
		"/(auth)/messages": [19,[2]],
		"/(auth)/outfits": [20,[2]],
		"/(auth)/photoshoots": [21,[2]],
		"/(auth)/planning": [22,[2]],
		"/(auth)/post-production": [23,[2]],
		"/(auth)/profile": [24,[2]],
		"/(auth)/projects/[id]": [25,[2]],
		"/(auth)/props": [26,[2]],
		"/(auth)/settings/profile": [27,[2,4],[,5]],
		"/(auth)/settings/team": [28,[2,4],[,5]],
		"/signup": [36],
		"/(auth)/tasks": [29,[2]],
		"/(auth)/timeline": [30,[2]],
		"/(auth)/tools": [31,[2]]
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