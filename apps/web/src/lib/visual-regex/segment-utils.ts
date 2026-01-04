import type {
	FindSegment,
	ReplaceSegment,
	TokenSegment,
	CaptureRefSegment,
	CursorPosition,
	WildcardTokenType,
} from "./types";

/**
 * Generate a unique ID for segments
 */
export function generateId(): string {
	return Math.random().toString(36).slice(2, 9);
}

/**
 * Create a text segment
 */
export function createTextSegment(value: string): FindSegment {
	return { kind: "text", value };
}

/**
 * Create a token segment
 */
export function createTokenSegment(tokenType: WildcardTokenType): TokenSegment {
	return {
		kind: "token",
		id: generateId(),
		tokenType,
	};
}

/**
 * Create a capture reference segment
 */
export function createCaptureRef(
	refersToTokenId: string,
	captureIndex: number,
): CaptureRefSegment {
	return {
		kind: "capture-ref",
		id: generateId(),
		refersToTokenId,
		captureIndex,
	};
}

/**
 * Get the display length of a segment (tokens count as 1)
 */
export function getSegmentLength(segment: FindSegment | ReplaceSegment): number {
	if (segment.kind === "text") {
		return segment.value.length;
	}
	return 1; // Tokens and capture refs count as 1
}

/**
 * Get total length of all segments
 */
export function getTotalLength(segments: (FindSegment | ReplaceSegment)[]): number {
	return segments.reduce((sum, seg) => sum + getSegmentLength(seg), 0);
}

/**
 * Convert flat cursor position to segment position
 */
export function flatToSegmentPosition(
	segments: (FindSegment | ReplaceSegment)[],
	flatPosition: number,
): CursorPosition {
	let remaining = flatPosition;

	for (let i = 0; i < segments.length; i++) {
		const length = getSegmentLength(segments.at(i)!);
		if (remaining <= length) {
			return { segmentIndex: i, offsetInSegment: remaining };
		}
		remaining -= length;
	}

	// Past end - return end of last segment
	const lastIndex = Math.max(0, segments.length - 1);
	return {
		segmentIndex: lastIndex,
		offsetInSegment: segments.length > 0 ? getSegmentLength(segments.at(lastIndex)!) : 0,
	};
}

/**
 * Convert segment position to flat cursor position
 */
export function segmentToFlatPosition(
	segments: (FindSegment | ReplaceSegment)[],
	position: CursorPosition,
): number {
	let flat = 0;

	for (let i = 0; i < position.segmentIndex && i < segments.length; i++) {
		flat += getSegmentLength(segments.at(i)!);
	}

	return flat + position.offsetInSegment;
}

/**
 * Merge adjacent text segments
 */
export function mergeAdjacentText<T extends FindSegment | ReplaceSegment>(
	segments: T[],
): T[] {
	const result: T[] = [];

	for (const segment of segments) {
		const last = result.at(-1);
		if (segment.kind === "text" && last?.kind === "text") {
			// Merge with previous text segment
			(last as { kind: "text"; value: string }).value += segment.value;
		} else if (segment.kind !== "text" || segment.value !== "") {
			// Add non-empty segments
			result.push(segment);
		}
	}

	return result;
}

/**
 * Insert a token at the given cursor position in find segments
 */
export function insertTokenAtPosition(
	segments: FindSegment[],
	position: CursorPosition,
	tokenType: WildcardTokenType,
): { segments: FindSegment[]; newPosition: CursorPosition } {
	const newSegments = [...segments];
	const token = createTokenSegment(tokenType);

	if (segments.length === 0) {
		return {
			segments: [token],
			newPosition: { segmentIndex: 0, offsetInSegment: 1 },
		};
	}

	const targetSegment = segments.at(position.segmentIndex);

	if (!targetSegment) {
		// Append at end
		newSegments.push(token);
		return {
			segments: mergeAdjacentText(newSegments),
			newPosition: { segmentIndex: newSegments.length - 1, offsetInSegment: 1 },
		};
	}

	if (targetSegment.kind === "text") {
		// Split text segment and insert token
		const before = targetSegment.value.slice(0, position.offsetInSegment);
		const after = targetSegment.value.slice(position.offsetInSegment);

		const replacement: FindSegment[] = [];
		if (before) replacement.push(createTextSegment(before));
		replacement.push(token);
		if (after) replacement.push(createTextSegment(after));

		newSegments.splice(position.segmentIndex, 1, ...replacement);

		const tokenIndex = position.segmentIndex + (before ? 1 : 0);
		return {
			segments: mergeAdjacentText(newSegments),
			newPosition: { segmentIndex: tokenIndex, offsetInSegment: 1 },
		};
	}

	// Insert after token
	newSegments.splice(position.segmentIndex + 1, 0, token);
	return {
		segments: mergeAdjacentText(newSegments),
		newPosition: { segmentIndex: position.segmentIndex + 1, offsetInSegment: 1 },
	};
}

/**
 * Insert a capture reference at the given position in replace segments
 */
export function insertCaptureAtPosition(
	segments: ReplaceSegment[],
	position: CursorPosition,
	refersToTokenId: string,
	captureIndex: number,
): { segments: ReplaceSegment[]; newPosition: CursorPosition } {
	const newSegments = [...segments];
	const captureRef = createCaptureRef(refersToTokenId, captureIndex);

	if (segments.length === 0) {
		return {
			segments: [captureRef],
			newPosition: { segmentIndex: 0, offsetInSegment: 1 },
		};
	}

	const targetSegment = segments.at(position.segmentIndex);

	if (!targetSegment) {
		newSegments.push(captureRef);
		return {
			segments: mergeAdjacentText(newSegments),
			newPosition: { segmentIndex: newSegments.length - 1, offsetInSegment: 1 },
		};
	}

	if (targetSegment.kind === "text") {
		const before = targetSegment.value.slice(0, position.offsetInSegment);
		const after = targetSegment.value.slice(position.offsetInSegment);

		const replacement: ReplaceSegment[] = [];
		if (before) replacement.push(createTextSegment(before) as ReplaceSegment);
		replacement.push(captureRef);
		if (after) replacement.push(createTextSegment(after) as ReplaceSegment);

		newSegments.splice(position.segmentIndex, 1, ...replacement);

		const refIndex = position.segmentIndex + (before ? 1 : 0);
		return {
			segments: mergeAdjacentText(newSegments),
			newPosition: { segmentIndex: refIndex, offsetInSegment: 1 },
		};
	}

	newSegments.splice(position.segmentIndex + 1, 0, captureRef);
	return {
		segments: mergeAdjacentText(newSegments),
		newPosition: { segmentIndex: position.segmentIndex + 1, offsetInSegment: 1 },
	};
}

/**
 * Delete at cursor position (backspace behavior)
 */
export function deleteAtPosition<T extends FindSegment | ReplaceSegment>(
	segments: T[],
	position: CursorPosition,
): { segments: T[]; newPosition: CursorPosition } {
	if (segments.length === 0) {
		return { segments, newPosition: position };
	}

	const newSegments = [...segments];
	const targetSegment = segments.at(position.segmentIndex);

	if (!targetSegment) {
		return { segments: newSegments, newPosition: position };
	}

	if (targetSegment.kind === "text") {
		if (position.offsetInSegment > 0) {
			// Delete character before cursor
			const newValue =
				targetSegment.value.slice(0, position.offsetInSegment - 1) +
				targetSegment.value.slice(position.offsetInSegment);

			if (newValue === "") {
				// Remove empty text segment
				newSegments.splice(position.segmentIndex, 1);
				return {
					segments: mergeAdjacentText(newSegments) as T[],
					newPosition: {
						segmentIndex: Math.max(0, position.segmentIndex - 1),
						offsetInSegment:
							position.segmentIndex > 0
								? getSegmentLength(newSegments.at(position.segmentIndex - 1)!)
								: 0,
					},
				};
			}

			(newSegments[position.segmentIndex] as { kind: "text"; value: string }).value = newValue;
			return {
				segments: mergeAdjacentText(newSegments) as T[],
				newPosition: {
					segmentIndex: position.segmentIndex,
					offsetInSegment: position.offsetInSegment - 1,
				},
			};
		}

		// At start of text segment - delete previous segment
		if (position.segmentIndex > 0) {
			const prevSegment = newSegments.at(position.segmentIndex - 1)!;
			if (prevSegment.kind !== "text") {
				// Delete token/capture-ref before
				newSegments.splice(position.segmentIndex - 1, 1);
				return {
					segments: mergeAdjacentText(newSegments) as T[],
					newPosition: {
						segmentIndex: position.segmentIndex - 1,
						offsetInSegment: 0,
					},
				};
			}
		}
	} else {
		// On a token/capture-ref - delete it
		if (position.offsetInSegment === 0 && position.segmentIndex > 0) {
			// Cursor is before token, delete previous
			const prevSegment = newSegments.at(position.segmentIndex - 1)!;
			if (prevSegment.kind === "text") {
				// Delete last char of previous text
				const newValue = prevSegment.value.slice(0, -1);
				if (newValue === "") {
					newSegments.splice(position.segmentIndex - 1, 1);
				} else {
					(newSegments[position.segmentIndex - 1] as { kind: "text"; value: string }).value = newValue;
				}
			} else {
				newSegments.splice(position.segmentIndex - 1, 1);
			}
			return {
				segments: mergeAdjacentText(newSegments) as T[],
				newPosition: {
					segmentIndex: Math.max(0, position.segmentIndex - 1),
					offsetInSegment: 0,
				},
			};
		}

		// Delete the token itself
		newSegments.splice(position.segmentIndex, 1);
		return {
			segments: mergeAdjacentText(newSegments) as T[],
			newPosition: {
				segmentIndex: position.segmentIndex,
				offsetInSegment: 0,
			},
		};
	}

	return { segments: mergeAdjacentText(newSegments) as T[], newPosition: position };
}

/**
 * Convert segments to plain text (for display)
 */
export function segmentsToText(segments: (FindSegment | ReplaceSegment)[]): string {
	return segments
		.map((seg) => {
			if (seg.kind === "text") return seg.value;
			return "\uFFFC"; // Object replacement character for tokens
		})
		.join("");
}

/**
 * Update text in segments while preserving tokens
 */
export function updateTextInSegments<T extends FindSegment | ReplaceSegment>(
	segments: T[],
	newText: string,
): T[] {
	// Simple implementation: if text contains only text (no replacement chars),
	// replace all text segments with the new text
	if (!newText.includes("\uFFFC")) {
		// No tokens in new text - just return single text segment
		if (newText === "") return [];
		return [createTextSegment(newText) as T];
	}

	// Complex case: need to map tokens back
	// For now, keep existing behavior
	return segments;
}
