
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
		RouteId(): "/(auth)" | "/" | "/(auth)/accessories" | "/api" | "/api/events" | "/api/projects" | "/api/projects/[id]" | "/api/tasks" | "/(auth)/archived" | "/auth" | "/auth/callback" | "/(auth)/budget" | "/(auth)/calendar" | "/(auth)/characters" | "/(auth)/dashboard" | "/(auth)/equipment" | "/(auth)/events" | "/forgot-password" | "/(auth)/ideas" | "/(auth)/in-progress" | "/login" | "/logout" | "/(auth)/marketplace" | "/(auth)/materials" | "/(auth)/messages" | "/(auth)/outfits" | "/(auth)/photoshoots" | "/(auth)/planning" | "/(auth)/post-production" | "/(auth)/profile" | "/(auth)/projects" | "/(auth)/projects/[id]" | "/(auth)/props" | "/(auth)/settings" | "/(auth)/settings/profile" | "/(auth)/settings/team" | "/signup" | "/(auth)/tasks" | "/(auth)/timeline" | "/(auth)/tools";
		RouteParams(): {
			"/api/projects/[id]": { id: string };
			"/(auth)/projects/[id]": { id: string }
		};
		LayoutParams(): {
			"/(auth)": { id?: string };
			"/": { id?: string };
			"/(auth)/accessories": Record<string, never>;
			"/api": { id?: string };
			"/api/events": Record<string, never>;
			"/api/projects": { id?: string };
			"/api/projects/[id]": { id: string };
			"/api/tasks": Record<string, never>;
			"/(auth)/archived": Record<string, never>;
			"/auth": Record<string, never>;
			"/auth/callback": Record<string, never>;
			"/(auth)/budget": Record<string, never>;
			"/(auth)/calendar": Record<string, never>;
			"/(auth)/characters": Record<string, never>;
			"/(auth)/dashboard": Record<string, never>;
			"/(auth)/equipment": Record<string, never>;
			"/(auth)/events": Record<string, never>;
			"/forgot-password": Record<string, never>;
			"/(auth)/ideas": Record<string, never>;
			"/(auth)/in-progress": Record<string, never>;
			"/login": Record<string, never>;
			"/logout": Record<string, never>;
			"/(auth)/marketplace": Record<string, never>;
			"/(auth)/materials": Record<string, never>;
			"/(auth)/messages": Record<string, never>;
			"/(auth)/outfits": Record<string, never>;
			"/(auth)/photoshoots": Record<string, never>;
			"/(auth)/planning": Record<string, never>;
			"/(auth)/post-production": Record<string, never>;
			"/(auth)/profile": Record<string, never>;
			"/(auth)/projects": { id?: string };
			"/(auth)/projects/[id]": { id: string };
			"/(auth)/props": Record<string, never>;
			"/(auth)/settings": Record<string, never>;
			"/(auth)/settings/profile": Record<string, never>;
			"/(auth)/settings/team": Record<string, never>;
			"/signup": Record<string, never>;
			"/(auth)/tasks": Record<string, never>;
			"/(auth)/timeline": Record<string, never>;
			"/(auth)/tools": Record<string, never>
		};
		Pathname(): "/" | "/accessories" | "/accessories/" | "/api" | "/api/" | "/api/events" | "/api/events/" | "/api/projects" | "/api/projects/" | `/api/projects/${string}` & {} | `/api/projects/${string}/` & {} | "/api/tasks" | "/api/tasks/" | "/archived" | "/archived/" | "/auth" | "/auth/" | "/auth/callback" | "/auth/callback/" | "/budget" | "/budget/" | "/calendar" | "/calendar/" | "/characters" | "/characters/" | "/dashboard" | "/dashboard/" | "/equipment" | "/equipment/" | "/events" | "/events/" | "/forgot-password" | "/forgot-password/" | "/ideas" | "/ideas/" | "/in-progress" | "/in-progress/" | "/login" | "/login/" | "/logout" | "/logout/" | "/marketplace" | "/marketplace/" | "/materials" | "/materials/" | "/messages" | "/messages/" | "/outfits" | "/outfits/" | "/photoshoots" | "/photoshoots/" | "/planning" | "/planning/" | "/post-production" | "/post-production/" | "/profile" | "/profile/" | "/projects" | "/projects/" | `/projects/${string}` & {} | `/projects/${string}/` & {} | "/props" | "/props/" | "/settings" | "/settings/" | "/settings/profile" | "/settings/profile/" | "/settings/team" | "/settings/team/" | "/signup" | "/signup/" | "/tasks" | "/tasks/" | "/timeline" | "/timeline/" | "/tools" | "/tools/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/anime-character-purple-kimono.jpg" | "/armor-chest-plate.jpg" | "/armor-shoulder.jpg" | "/colorful-anime-wig-styling.jpg" | "/cosplay-makeup-special-effects.jpg" | "/cosplay-photo-.jpg" | "/cosplay-photoshoot-studio.jpg" | "/cosplay-prop-weapon-sword.jpg" | "/cyberpunk-character-neon-jacket.jpg" | "/detailed-cosplay-costume-armor.jpg" | "/diverse-group-candid-photo.png" | "/fantasy-warrior-armor-red-hair.jpg" | "/fantasy-warrior-white-hair-sword.jpg" | "/favicon.png" | "/futuristic-goggles-neon.jpg" | "/futuristic-pistol-neon.jpg" | "/group-cosplay-team-photo.jpg" | "/jinx-arcane-blue-hair-twin-braids.jpg" | "/placeholder-logo.png" | "/placeholder-logo.svg" | "/placeholder-user.jpg" | "/placeholder.jpg" | "/placeholder.svg" | "/purple-japanese-hair-ornament.jpg" | "/purple-katana-sword.jpg" | "/robots.txt" | "/silver-medieval-sword.jpg" | string & {};
	}
}