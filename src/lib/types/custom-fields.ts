/**
 * Custom Field Types
 * 
 * Defines types for team-scoped custom fields that extend task data.
 * Supports 10 field types: text, textarea, number, currency, dropdown, multi-select,
 * checkbox, date, URL, email.
 */

/**
 * Supported Custom Field Types
 */
export type CustomFieldType =
	| 'text'
	| 'textarea'
	| 'number'
	| 'currency'
	| 'dropdown'
	| 'multi-select'
	| 'checkbox'
	| 'date'
	| 'url'
	| 'email';

/**
 * CustomFieldDefinition - Schema for a custom field
 */
export interface CustomFieldDefinition {
	id: string;
	team_id: string;
	field_name: string;
	field_type: CustomFieldType;
	required: boolean;
	default_value?: string;
	options?: CustomFieldOptions; // Stored as JSONB
	display_order: number;
	show_on_card: boolean; // Display on task cards in list/board view
	created_at: string;
	updated_at: string;
}

/**
 * CustomFieldOptions - Type-specific configuration
 */
export interface CustomFieldOptions {
	// For dropdown/multi-select
	choices?: string[];
	// For currency
	default_currency?: string; // ISO 4217 code (e.g., "USD", "EUR", "GBP")
	// For number
	min?: number;
	max?: number;
	// For text/textarea
	max_length?: number;
	// For URL
	allowed_protocols?: string[]; // e.g., ["https", "http"]
}

export type CustomFieldDefinitionInsert = Omit<CustomFieldDefinition, 'id' | 'created_at' | 'updated_at'>;
export type CustomFieldDefinitionUpdate = Partial<Omit<CustomFieldDefinition, 'id' | 'team_id' | 'created_at'>>;

/**
 * TaskCustomFieldValue - Actual value for a task's custom field
 * All values stored as TEXT with type-specific parsing
 */
export interface TaskCustomFieldValue {
	id: string;
	task_id: string;
	field_definition_id: string;
	value: string; // Always TEXT, parsed based on field_type
	created_at: string;
	updated_at: string;
	// Relations
	field_definition?: CustomFieldDefinition;
}

export type TaskCustomFieldValueInsert = Omit<TaskCustomFieldValue, 'id' | 'created_at' | 'updated_at' | 'field_definition'>;
export type TaskCustomFieldValueUpdate = Pick<TaskCustomFieldValue, 'value'>;

/**
 * Parsed Custom Field Value by Type
 */
export type ParsedCustomFieldValue =
	| { type: 'text'; value: string }
	| { type: 'textarea'; value: string }
	| { type: 'number'; value: number }
	| { type: 'currency'; value: CurrencyValue }
	| { type: 'dropdown'; value: string }
	| { type: 'multi-select'; value: string[] }
	| { type: 'checkbox'; value: boolean }
	| { type: 'date'; value: string } // ISO 8601 date string
	| { type: 'url'; value: string }
	| { type: 'email'; value: string };

/**
 * Currency Value with Code and Amount
 */
export interface CurrencyValue {
	amount: string; // Stored as string to avoid floating point issues
	currency: string; // ISO 4217 code
}

/**
 * Type-safe Custom Field Value Types
 */
export interface CustomFieldValueTypes {
	text: string;
	textarea: string;
	number: number;
	currency: CurrencyValue;
	dropdown: string;
	'multi-select': string[];
	checkbox: boolean;
	date: string; // ISO 8601
	url: string;
	email: string;
}

/**
 * Custom Field with Value (for task detail display)
 */
export interface CustomFieldWithValue {
	definition: CustomFieldDefinition;
	value?: TaskCustomFieldValue;
	parsed_value?: ParsedCustomFieldValue;
}

/**
 * Custom Field Export/Import
 */
export interface CustomFieldExport {
	field_name: string;
	field_type: CustomFieldType;
	required: boolean;
	default_value?: string;
	options?: CustomFieldOptions;
	display_order: number;
}

export interface CustomFieldImportResult {
	imported: number;
	skipped: number;
	errors: Array<{
		field_name: string;
		reason: string;
	}>;
}

/**
 * Currency Display Format
 */
export interface CurrencyFormat {
	code: string; // ISO 4217
	symbol: string; // e.g., "$", "€", "£"
	position: 'before' | 'after'; // Symbol position relative to amount
	decimal_places: number;
	thousands_separator: string;
	decimal_separator: string;
}

/**
 * Common Currency Formats (ISO 4217)
 */
export const CURRENCY_FORMATS: Record<string, CurrencyFormat> = {
	USD: { code: 'USD', symbol: '$', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
	EUR: { code: 'EUR', symbol: '€', position: 'after', decimal_places: 2, thousands_separator: '.', decimal_separator: ',' },
	GBP: { code: 'GBP', symbol: '£', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
	JPY: { code: 'JPY', symbol: '¥', position: 'before', decimal_places: 0, thousands_separator: ',', decimal_separator: '.' },
	CAD: { code: 'CAD', symbol: 'C$', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
	AUD: { code: 'AUD', symbol: 'A$', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
	CHF: { code: 'CHF', symbol: 'CHF', position: 'after', decimal_places: 2, thousands_separator: "'", decimal_separator: '.' },
	CNY: { code: 'CNY', symbol: '¥', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
	INR: { code: 'INR', symbol: '₹', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
	MXN: { code: 'MXN', symbol: '$', position: 'before', decimal_places: 2, thousands_separator: ',', decimal_separator: '.' },
};

