import type { FindSegment, ReplaceSegment, WildcardTokenType } from "./types";

/**
 * Token aliases - maps friendly names to token types
 */
const TOKEN_ALIASES: Record<string, WildcardTokenType> = {
	// Word tokens
	word: "word",
	w: "word",
	words: "words",

	// Number tokens
	number: "number",
	num: "number",
	n: "number",
	decimal: "decimal",
	dec: "decimal",

	// Character tokens
	char: "character",
	character: "character",
	any: "characters",
	anything: "characters",
	chars: "characters",
	characters: "characters",

	// Other tokens
	space: "whitespace",
	whitespace: "whitespace",
	letter: "letter",
	letters: "letters",
	start: "start",
	end: "end",
};

/**
 * Parse a pattern string like "bg-{word}-{number}" into segments
 * Supports: {word}, {number}, {any}, etc.
 */
export function parsePatternToSegments(pattern: string): FindSegment[] {
	const segments: FindSegment[] = [];

	// Match {tokenName} placeholders
	const placeholderPattern = /\{([^}]+)\}/g;
	let lastIndex = 0;
	let match;

	while ((match = placeholderPattern.exec(pattern)) !== null) {
		// Add text before this token
		if (match.index > lastIndex) {
			const textBefore = pattern.slice(lastIndex, match.index);
			if (textBefore) {
				segments.push({ kind: "text", value: textBefore });
			}
		}

		// Parse the token
		const tokenName = match[1].toLowerCase().trim();
		const tokenType = TOKEN_ALIASES[tokenName];

		if (tokenType) {
			segments.push({
				kind: "token",
				id: Math.random().toString(36).slice(2, 9),
				tokenType,
			});
		} else {
			// Unknown token - treat as literal text
			segments.push({ kind: "text", value: match[0] });
		}

		lastIndex = placeholderPattern.lastIndex;
	}

	// Add remaining text
	if (lastIndex < pattern.length) {
		const remaining = pattern.slice(lastIndex);
		if (remaining) {
			segments.push({ kind: "text", value: remaining });
		}
	}

	return segments;
}

/**
 * Parse a replacement string like "bg-gray-{2}" into segments
 * Supports: {1}, {2}, etc.
 */
export function parseReplacementToSegments(
	pattern: string,
	captureCount: number
): ReplaceSegment[] {
	const segments: ReplaceSegment[] = [];

	// Match {N} placeholders
	const placeholderPattern = /\{([^}]+)\}/g;
	let lastIndex = 0;
	let match;

	while ((match = placeholderPattern.exec(pattern)) !== null) {
		// Add text before this placeholder
		if (match.index > lastIndex) {
			const textBefore = pattern.slice(lastIndex, match.index);
			if (textBefore) {
				segments.push({ kind: "text", value: textBefore });
			}
		}

		const placeholder = match[1].trim();

		// Check if it's a number reference like {1}, {2}
		const numMatch = placeholder.match(/^(\d+)$/);
		if (numMatch) {
			const captureIndex = parseInt(numMatch[1], 10);
			if (captureIndex >= 1 && captureIndex <= captureCount) {
				segments.push({
					kind: "capture-ref",
					id: Math.random().toString(36).slice(2, 9),
					refersToTokenId: "", // Will be resolved by generator
					captureIndex,
				});
			} else {
				// Invalid capture index - treat as literal
				segments.push({ kind: "text", value: match[0] });
			}
		} else {
			// Unknown placeholder - treat as literal
			segments.push({ kind: "text", value: match[0] });
		}

		lastIndex = placeholderPattern.lastIndex;
	}

	// Add remaining text
	if (lastIndex < pattern.length) {
		const remaining = pattern.slice(lastIndex);
		if (remaining) {
			segments.push({ kind: "text", value: remaining });
		}
	}

	return segments;
}

/**
 * Convert segments back to a display string with placeholders
 */
export function segmentsToDisplayString(segments: FindSegment[]): string {
	return segments
		.map((seg) => {
			if (seg.kind === "text") {
				return seg.value;
			}
			if (seg.kind === "token") {
				return `{${seg.tokenType}}`;
			}
			return "";
		})
		.join("");
}

/**
 * Convert replace segments to display string
 */
export function replaceSegmentsToDisplayString(
	segments: ReplaceSegment[]
): string {
	return segments
		.map((seg) => {
			if (seg.kind === "text") {
				return seg.value;
			}
			if (seg.kind === "capture-ref") {
				return `{${seg.captureIndex}}`;
			}
			return "";
		})
		.join("");
}
