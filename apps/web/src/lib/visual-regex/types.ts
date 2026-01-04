/**
 * Available wildcard token types (Nova-inspired)
 */
export type WildcardTokenType =
	| "word"
	| "words"
	| "number"
	| "decimal"
	| "character"
	| "characters"
	| "whitespace"
	| "letter"
	| "letters"
	| "start"
	| "end";

/**
 * A text segment in the input
 */
export interface TextSegment {
	kind: "text";
	value: string;
}

/**
 * A token segment in the Find field
 */
export interface TokenSegment {
	kind: "token";
	id: string;
	tokenType: WildcardTokenType;
}

/**
 * A capture reference in the Replace field
 */
export interface CaptureRefSegment {
	kind: "capture-ref";
	id: string;
	refersToTokenId: string;
	captureIndex: number;
}

/**
 * Segment in the Find field (text or token)
 */
export type FindSegment = TextSegment | TokenSegment;

/**
 * Segment in the Replace field (text or capture reference)
 */
export type ReplaceSegment = TextSegment | CaptureRefSegment;

/**
 * Cursor position within segmented input
 */
export interface CursorPosition {
	segmentIndex: number;
	offsetInSegment: number;
}

/**
 * Information about a captured token
 */
export interface CaptureInfo {
	tokenId: string;
	captureIndex: number;
	tokenType: WildcardTokenType;
	label: string;
}

/**
 * Generated regex output
 */
export interface GeneratedRegex {
	pattern: string;
	replacement: string;
	captureMap: Map<string, number>;
	isValid: boolean;
	error: string | null;
}

/**
 * Token type metadata
 */
export interface TokenDefinition {
	type: WildcardTokenType;
	label: string;
	shortLabel: string;
	pattern: string;
	isCapturing: boolean;
	description: string;
	icon: string;
}
