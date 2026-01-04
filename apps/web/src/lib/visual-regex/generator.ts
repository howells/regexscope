import type {
	FindSegment,
	ReplaceSegment,
	GeneratedRegex,
	CaptureInfo,
} from "./types";
import { getTokenDefinition } from "./token-definitions";

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Generate a regex pattern from find segments
 */
export function generatePattern(segments: FindSegment[]): {
	pattern: string;
	captureMap: Map<string, number>;
	captures: CaptureInfo[];
} {
	let pattern = "";
	let captureIndex = 1;
	const captureMap = new Map<string, number>();
	const captures: CaptureInfo[] = [];

	for (const segment of segments) {
		if (segment.kind === "text") {
			pattern += escapeRegex(segment.value);
		} else {
			const def = getTokenDefinition(segment.tokenType);
			if (def.isCapturing) {
				pattern += `(${def.pattern})`;
				captureMap.set(segment.id, captureIndex);
				captures.push({
					tokenId: segment.id,
					captureIndex,
					tokenType: segment.tokenType,
					label: `${def.label} ${captureIndex}`,
				});
				captureIndex++;
			} else {
				pattern += def.pattern;
			}
		}
	}

	return { pattern, captureMap, captures };
}

/**
 * Generate a replacement string from replace segments
 */
export function generateReplacement(
	segments: ReplaceSegment[],
	captureMap: Map<string, number>,
): string {
	let replacement = "";

	for (const segment of segments) {
		if (segment.kind === "text") {
			// Escape $ in literal text (use $$ for literal $)
			replacement += segment.value.replace(/\$/g, "$$$$");
		} else {
			// Use the captureIndex directly from the segment (set by parser)
			// or look it up via refersToTokenId for backwards compatibility
			let captureIndex: number | undefined = segment.captureIndex;
			if (captureIndex === undefined && segment.refersToTokenId) {
				captureIndex = captureMap.get(segment.refersToTokenId);
			}
			if (captureIndex !== undefined) {
				replacement += `$${captureIndex}`;
			}
		}
	}

	return replacement;
}

/**
 * Validate a regex pattern
 */
function validatePattern(pattern: string): { valid: boolean; error: string | null } {
	if (!pattern) {
		return { valid: true, error: null };
	}

	try {
		new RegExp(pattern);
		return { valid: true, error: null };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Invalid pattern";
		return { valid: false, error: message };
	}
}

/**
 * Generate complete regex from find and replace segments
 */
export function generateRegex(
	findSegments: FindSegment[],
	replaceSegments: ReplaceSegment[],
): GeneratedRegex {
	const { pattern, captureMap, captures } = generatePattern(findSegments);
	const replacement = generateReplacement(replaceSegments, captureMap);
	const validation = validatePattern(pattern);

	return {
		pattern,
		replacement,
		captureMap,
		isValid: validation.valid,
		error: validation.error,
	};
}

/**
 * Get capture information from find segments
 */
export function getCapturesFromFind(segments: FindSegment[]): CaptureInfo[] {
	const { captures } = generatePattern(segments);
	return captures;
}

/**
 * Apply the generated regex to text
 */
export function applyRegex(
	text: string,
	pattern: string,
	replacement: string,
	flags = "g",
): { result: string; matchCount: number } {
	if (!pattern) {
		return { result: text, matchCount: 0 };
	}

	try {
		const regex = new RegExp(pattern, flags);
		const matches = text.match(regex);
		const matchCount = matches?.length ?? 0;
		const result = text.replace(regex, replacement);
		return { result, matchCount };
	} catch {
		return { result: text, matchCount: 0 };
	}
}
