import type { TokenDefinition, WildcardTokenType } from "./types";

/**
 * Metadata for all available wildcard tokens
 */
export const TOKEN_DEFINITIONS: TokenDefinition[] = [
	{
		type: "word",
		label: "Word",
		shortLabel: "W",
		pattern: "\\w+",
		isCapturing: true,
		description: "One word (letters, numbers, underscores)",
		icon: "Type",
	},
	{
		type: "words",
		label: "Words",
		shortLabel: "Ws",
		pattern: "\\w+(?:\\s+\\w+)*",
		isCapturing: true,
		description: "One or more words",
		icon: "TextCursor",
	},
	{
		type: "number",
		label: "Number",
		shortLabel: "#",
		pattern: "\\d+",
		isCapturing: true,
		description: "One or more digits",
		icon: "Hash",
	},
	{
		type: "decimal",
		label: "Decimal",
		shortLabel: "#.#",
		pattern: "\\d+(?:\\.\\d+)?",
		isCapturing: true,
		description: "Integer or decimal number",
		icon: "Percent",
	},
	{
		type: "character",
		label: "Any Char",
		shortLabel: "?",
		pattern: ".",
		isCapturing: true,
		description: "Any single character",
		icon: "HelpCircle",
	},
	{
		type: "characters",
		label: "Any Chars",
		shortLabel: "...",
		pattern: ".+",
		isCapturing: true,
		description: "One or more characters",
		icon: "MoreHorizontal",
	},
	{
		type: "whitespace",
		label: "Space",
		shortLabel: "␣",
		pattern: "\\s+",
		isCapturing: false,
		description: "Spaces, tabs, newlines",
		icon: "Space",
	},
	{
		type: "letter",
		label: "Letter",
		shortLabel: "A",
		pattern: "[a-zA-Z]",
		isCapturing: true,
		description: "Single letter (a-z, A-Z)",
		icon: "CaseSensitive",
	},
	{
		type: "letters",
		label: "Letters",
		shortLabel: "ABC",
		pattern: "[a-zA-Z]+",
		isCapturing: true,
		description: "One or more letters",
		icon: "Heading",
	},
	{
		type: "start",
		label: "Line Start",
		shortLabel: "^",
		pattern: "^",
		isCapturing: false,
		description: "Start of line",
		icon: "ArrowLeftToLine",
	},
	{
		type: "end",
		label: "Line End",
		shortLabel: "$",
		pattern: "$",
		isCapturing: false,
		description: "End of line",
		icon: "ArrowRightToLine",
	},
];

/**
 * Quick lookup by token type
 */
export const TOKEN_MAP = new Map<WildcardTokenType, TokenDefinition>(
	TOKEN_DEFINITIONS.map((def) => [def.type, def]),
);

/**
 * Get definition for a token type
 */
export function getTokenDefinition(type: WildcardTokenType): TokenDefinition {
	const def = TOKEN_MAP.get(type);
	if (!def) {
		throw new Error(`Unknown token type: ${type}`);
	}
	return def;
}

/**
 * Get only capturing tokens (for display in Replace field)
 */
export function getCapturingTokens(): TokenDefinition[] {
	return TOKEN_DEFINITIONS.filter((t) => t.isCapturing);
}
