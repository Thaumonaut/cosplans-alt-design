import { lighten, darken, mix, rgba } from 'color2k';

/**
 * Maps base variables to their related variations
 */
const VARIATION_MAP: Record<string, string[]> = {
	'--theme-primary': [
		'--theme-primary-hover',
		'--theme-sidebar-accent',
		'--theme-header-muted'
	],
	'--theme-primary-hover': [
		'--theme-primary'
	],
	'--theme-accent': [
		'--theme-accent-hover',
		'--theme-focus',
		'--theme-border-focus'
	],
	'--theme-accent-hover': [
		'--theme-accent'
	],
	'--theme-error': [
		'--theme-error-bg',
		'--theme-priority-high-dot',
		'--theme-priority-high-border'
	],
	'--theme-success': [
		'--theme-success-bg'
	],
	'--theme-warning': [
		'--theme-warning-bg',
		'--theme-priority-medium-dot',
		'--theme-priority-medium-border'
	],
	'--theme-info': [
		'--theme-info-bg',
		'--theme-priority-low-dot',
		'--theme-priority-low-border'
	],
	'--theme-foreground': [
		'--theme-sidebar-text',
		'--theme-header-text'
	],
	'--theme-text-muted': [
		'--theme-sidebar-muted',
		'--theme-header-muted'
	],
	'--theme-background': [
		'--theme-section-bg',
		'--theme-card-bg',
		'--theme-sidebar-bg',
		'--theme-header-bg'
	],
	'--theme-hover': [
		'--theme-interactive-hover',
		'--theme-sidebar-hover',
		'--theme-header-hover'
	],
	'--theme-active': [
		'--theme-interactive-active',
		'--theme-sidebar-active',
		'--theme-header-active'
	],
	'--theme-border': [
		'--theme-sidebar-border'
	]
};

/**
 * Get all variables that are variations of a base variable
 */
export function getVariableVariations(varName: string): string[] {
	return VARIATION_MAP[varName] || [];
}

/**
 * Get the base variable for a variation (if it exists)
 */
export function getBaseVariable(varName: string): string | undefined {
	for (const [base, variations] of Object.entries(VARIATION_MAP)) {
		if (variations.includes(varName)) {
			return base;
		}
	}
	return undefined;
}

/**
 * Check if a variable is a base variable (has variations)
 */
export function isBaseVariable(varName: string): boolean {
	return varName in VARIATION_MAP;
}

/**
 * Generate a variation value from a base value
 * @param baseVar - The base variable name
 * @param baseValue - The base color/value
 * @param variationType - Type of variation: 'hover', 'active', 'bg', 'muted', etc.
 * @param mode - Theme mode: 'light' or 'dark'
 */
export function generateVariation(
	baseVar: string,
	baseValue: string,
	variationType: 'hover' | 'active' | 'bg' | 'muted' | 'border' | 'dot',
	mode: 'light' | 'dark'
): string {
	// Validate input
	if (!baseValue || typeof baseValue !== 'string' || !baseValue.trim()) {
		console.warn(`Invalid base value for ${baseVar}:`, baseValue);
		return '';
	}
	
	// Check for invalid values
	if (baseValue.includes('NaN') || baseValue.includes('undefined') || baseValue.includes('null')) {
		console.warn(`Invalid base value contains NaN/undefined/null for ${baseVar}:`, baseValue);
		return '';
	}
	
	// Only generate for color values
	if (!isColorValue(baseValue)) {
		return baseValue;
	}

	try {
		let result: string;
		
		switch (variationType) {
			case 'hover':
				// Hover states use background color with opacity
				if (mode === 'light') {
					result = rgba(baseValue, 0.1);
				} else {
					result = 'rgba(255, 255, 255, 0.1)';
				}
				break;
			
			case 'active':
				// Active states use background color with slightly more opacity
				if (mode === 'light') {
					result = rgba(baseValue, 0.15);
				} else {
					result = 'rgba(255, 255, 255, 0.15)';
				}
				break;
			
			case 'bg':
				// Background variations are tinted backgrounds (mix with white/black)
				// Use mix to create a subtle tinted background rather than aggressive lightening
				if (mode === 'light') {
					// Mix 15% base color with 85% white for a subtle tinted background
					result = mix(baseValue, '#ffffff', 0.85);
				} else {
					// Mix 20% base color with 80% black for dark mode
					result = mix(baseValue, '#000000', 0.80);
				}
				break;
			
			case 'muted':
				// Muted variations are desaturated
				result = mix(baseValue, mode === 'light' ? '#ffffff' : '#000000', 0.6);
				break;
			
			case 'border':
				// Border variations use color-mix with transparency
				result = `color-mix(in srgb, ${baseValue} 30%, transparent)`;
				break;
			
			case 'dot':
				// Dot variations are the same as base for semantic colors
				result = baseValue;
				break;
			
			default:
				result = baseValue;
		}
		
		// Validate result - check for NaN or invalid values
		if (!result || typeof result !== 'string' || result.includes('NaN') || result.includes('undefined') || result.includes('null')) {
			console.warn(`Invalid variation result for ${baseVar} (${variationType}):`, result, 'from base:', baseValue);
			return baseValue; // Return original value if result is invalid
		}
		
		return result;
	} catch (error) {
		console.warn(`Failed to generate variation for ${baseVar}:`, error);
		return baseValue;
	}
}

/**
 * Check if a value is a color (hex, rgb, rgba, hsl, hsla, or named color)
 */
function isColorValue(value: string): boolean {
	// Remove whitespace
	const trimmed = value.trim();
	
	// Hex colors
	if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
		return true;
	}
	
	// RGB/RGBA
	if (/^rgba?\(/.test(trimmed)) {
		return true;
	}
	
	// HSL/HSLA
	if (/^hsla?\(/.test(trimmed)) {
		return true;
	}
	
	// Named colors (basic set)
	const namedColors = [
		'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
		'transparent', 'currentColor'
	];
	if (namedColors.includes(trimmed.toLowerCase())) {
		return true;
	}
	
	// CSS custom property reference
	if (trimmed.startsWith('var(')) {
		return false; // Don't generate variations for var() references
	}
	
	return false;
}

/**
 * Auto-generate all variations for a base variable
 */
export function generateAllVariations(
	baseVar: string,
	baseValue: string,
	mode: 'light' | 'dark'
): Record<string, string> {
	// Validate inputs
	if (!baseVar || !baseValue || typeof baseValue !== 'string' || !baseValue.trim()) {
		console.warn(`[generateAllVariations] Invalid inputs: baseVar=${baseVar}, baseValue=${baseValue}`);
		return {};
	}
	
	// Check for invalid values in base
	if (baseValue.includes('NaN') || baseValue.includes('undefined') || baseValue.includes('null')) {
		console.warn(`[generateAllVariations] Base value contains invalid data for ${baseVar}:`, baseValue);
		return {};
	}
	
	const variations: Record<string, string> = {};
	const relatedVars = getVariableVariations(baseVar);
	
	for (const varName of relatedVars) {
		// Skip if this is the base variable itself (shouldn't happen, but safety check)
		if (varName === baseVar) {
			continue;
		}
		
		// Determine variation type from variable name
		let variationType: 'hover' | 'active' | 'bg' | 'muted' | 'border' | 'dot' = 'hover';
		
		if (varName.includes('-hover')) {
			variationType = 'hover';
		} else if (varName.includes('-active')) {
			variationType = 'active';
		} else if (varName.includes('-bg')) {
			variationType = 'bg';
		} else if (varName.includes('-muted')) {
			variationType = 'muted';
		} else if (varName.includes('-border')) {
			variationType = 'border';
		} else if (varName.includes('-dot')) {
			variationType = 'dot';
		}
		
		const generated = generateVariation(baseVar, baseValue, variationType, mode);
		
		// Only add if generation was successful and result is valid
		if (generated && generated.trim() && !generated.includes('NaN') && !generated.includes('undefined') && !generated.includes('null')) {
			variations[varName] = generated;
		} else {
			console.warn(`[generateAllVariations] Skipping invalid variation ${varName} for ${baseVar}`);
		}
	}
	
	return variations;
}

