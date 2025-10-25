
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/accessories" | "/api" | "/api/events" | "/api/projects" | "/api/projects/[id]" | "/api/tasks" | "/archived" | "/budget" | "/calendar" | "/characters" | "/dashboard" | "/equipment" | "/events" | "/ideas" | "/in-progress" | "/marketplace" | "/materials" | "/messages" | "/outfits" | "/photoshoots" | "/planning" | "/post-production" | "/profile" | "/projects" | "/projects/[id]" | "/props" | "/settings" | "/settings/profile" | "/settings/team" | "/tasks" | "/timeline" | "/tools";
		RouteParams(): {
			"/api/projects/[id]": { id: string };
			"/projects/[id]": { id: string }
		};
		LayoutParams(): {
			"/": { id?: string };
			"/accessories": Record<string, never>;
			"/api": { id?: string };
			"/api/events": Record<string, never>;
			"/api/projects": { id?: string };
			"/api/projects/[id]": { id: string };
			"/api/tasks": Record<string, never>;
			"/archived": Record<string, never>;
			"/budget": Record<string, never>;
			"/calendar": Record<string, never>;
			"/characters": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/equipment": Record<string, never>;
			"/events": Record<string, never>;
			"/ideas": Record<string, never>;
			"/in-progress": Record<string, never>;
			"/marketplace": Record<string, never>;
			"/materials": Record<string, never>;
			"/messages": Record<string, never>;
			"/outfits": Record<string, never>;
			"/photoshoots": Record<string, never>;
			"/planning": Record<string, never>;
			"/post-production": Record<string, never>;
			"/profile": Record<string, never>;
			"/projects": { id?: string };
			"/projects/[id]": { id: string };
			"/props": Record<string, never>;
			"/settings": Record<string, never>;
			"/settings/profile": Record<string, never>;
			"/settings/team": Record<string, never>;
			"/tasks": Record<string, never>;
			"/timeline": Record<string, never>;
			"/tools": Record<string, never>
		};
		Pathname(): "/" | "/accessories" | "/accessories/" | "/api" | "/api/" | "/api/events" | "/api/events/" | "/api/projects" | "/api/projects/" | `/api/projects/${string}` & {} | `/api/projects/${string}/` & {} | "/api/tasks" | "/api/tasks/" | "/archived" | "/archived/" | "/budget" | "/budget/" | "/calendar" | "/calendar/" | "/characters" | "/characters/" | "/dashboard" | "/dashboard/" | "/equipment" | "/equipment/" | "/events" | "/events/" | "/ideas" | "/ideas/" | "/in-progress" | "/in-progress/" | "/marketplace" | "/marketplace/" | "/materials" | "/materials/" | "/messages" | "/messages/" | "/outfits" | "/outfits/" | "/photoshoots" | "/photoshoots/" | "/planning" | "/planning/" | "/post-production" | "/post-production/" | "/profile" | "/profile/" | "/projects" | "/projects/" | `/projects/${string}` & {} | `/projects/${string}/` & {} | "/props" | "/props/" | "/settings" | "/settings/" | "/settings/profile" | "/settings/profile/" | "/settings/team" | "/settings/team/" | "/tasks" | "/tasks/" | "/timeline" | "/timeline/" | "/tools" | "/tools/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/anime-character-purple-kimono.jpg" | "/armor-chest-plate.jpg" | "/armor-shoulder.jpg" | "/colorful-anime-wig-styling.jpg" | "/cosplay-makeup-special-effects.jpg" | "/cosplay-photo-.jpg" | "/cosplay-photoshoot-studio.jpg" | "/cosplay-prop-weapon-sword.jpg" | "/cyberpunk-character-neon-jacket.jpg" | "/detailed-cosplay-costume-armor.jpg" | "/diverse-group-candid-photo.png" | "/fantasy-warrior-armor-red-hair.jpg" | "/fantasy-warrior-white-hair-sword.jpg" | "/favicon.png" | "/futuristic-goggles-neon.jpg" | "/futuristic-pistol-neon.jpg" | "/group-cosplay-team-photo.jpg" | "/jinx-arcane-blue-hair-twin-braids.jpg" | "/placeholder-logo.png" | "/placeholder-logo.svg" | "/placeholder-user.jpg" | "/placeholder.jpg" | "/placeholder.svg" | "/purple-japanese-hair-ornament.jpg" | "/purple-katana-sword.jpg" | "/robots.txt" | "/silver-medieval-sword.jpg" | string & {};
	}
}