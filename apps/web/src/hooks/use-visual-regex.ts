"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
	FindSegment,
	ReplaceSegment,
	CaptureInfo,
	WildcardTokenType,
} from "@/lib/visual-regex/types";
import {
	generateRegex,
	getCapturesFromFind,
	applyRegex,
} from "@/lib/visual-regex/generator";
import {
	parsePatternToSegments,
	parseReplacementToSegments,
	segmentsToDisplayString,
	replaceSegmentsToDisplayString,
} from "@/lib/visual-regex/pattern-parser";

export interface UseVisualRegexReturn {
	// Find field - now uses raw pattern string
	findPattern: string;
	setFindPattern: (pattern: string) => void;
	findSegments: FindSegment[];
	insertTokenAtCursor: (tokenType: WildcardTokenType, cursorPos: number) => string;

	// Replace field
	replacePattern: string;
	setReplacePattern: (pattern: string) => void;
	replaceSegments: ReplaceSegment[];
	insertCaptureAtCursor: (captureIndex: number, cursorPos: number) => string;

	// Computed
	captures: CaptureInfo[];
	generatedPattern: string;
	generatedReplacement: string;
	isValid: boolean;
	error: string | null;

	// Sample text
	sampleText: string;
	setSampleText: (text: string) => void;
	previewResult: string;
	matchCount: number;

	// Actions
	copyPattern: () => Promise<void>;
	copyReplacement: () => Promise<void>;
	copyBoth: () => Promise<void>;
	clearAll: () => void;
}

export function useVisualRegex(): UseVisualRegexReturn {
	// Raw pattern strings (user input)
	const [findPattern, setFindPattern] = useState("");
	const [replacePattern, setReplacePattern] = useState("");

	// Sample text
	const [sampleText, setSampleText] = useState("");

	// Parse find pattern into segments
	const findSegments = useMemo(
		() => parsePatternToSegments(findPattern),
		[findPattern]
	);

	// Compute captures from find segments
	const captures = useMemo(
		() => getCapturesFromFind(findSegments),
		[findSegments]
	);

	// Parse replace pattern into segments
	const replaceSegments = useMemo(
		() => parseReplacementToSegments(replacePattern, captures.length),
		[replacePattern, captures.length]
	);

	// Generate regex
	const generated = useMemo(
		() => generateRegex(findSegments, replaceSegments),
		[findSegments, replaceSegments]
	);

	// Apply regex to sample text
	const { result: previewResult, matchCount } = useMemo(
		() =>
			generated.isValid
				? applyRegex(sampleText, generated.pattern, generated.replacement)
				: { result: sampleText, matchCount: 0 },
		[sampleText, generated]
	);

	// Insert token at cursor position in find pattern
	const insertTokenAtCursor = useCallback(
		(tokenType: WildcardTokenType, cursorPos: number): string => {
			const before = findPattern.slice(0, cursorPos);
			const after = findPattern.slice(cursorPos);
			const newPattern = `${before}{${tokenType}}${after}`;
			setFindPattern(newPattern);
			return newPattern;
		},
		[findPattern]
	);

	// Insert capture reference at cursor position in replace pattern
	const insertCaptureAtCursor = useCallback(
		(captureIndex: number, cursorPos: number): string => {
			const before = replacePattern.slice(0, cursorPos);
			const after = replacePattern.slice(cursorPos);
			const newPattern = `${before}{${captureIndex}}${after}`;
			setReplacePattern(newPattern);
			return newPattern;
		},
		[replacePattern]
	);

	// Copy actions
	const copyPattern = useCallback(async () => {
		if (!generated.pattern) {
			toast.error("No pattern to copy");
			return;
		}
		try {
			await navigator.clipboard.writeText(generated.pattern);
			toast.success("Pattern copied");
		} catch {
			toast.error("Failed to copy");
		}
	}, [generated.pattern]);

	const copyReplacement = useCallback(async () => {
		if (!generated.replacement) {
			toast.error("No replacement to copy");
			return;
		}
		try {
			await navigator.clipboard.writeText(generated.replacement);
			toast.success("Replacement copied");
		} catch {
			toast.error("Failed to copy");
		}
	}, [generated.replacement]);

	const copyBoth = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(
				`Find: ${generated.pattern}\nReplace: ${generated.replacement}`
			);
			toast.success("Copied to clipboard");
		} catch {
			toast.error("Failed to copy");
		}
	}, [generated]);

	// Clear all
	const clearAll = useCallback(() => {
		setFindPattern("");
		setReplacePattern("");
		setSampleText("");
	}, []);

	return {
		findPattern,
		setFindPattern,
		findSegments,
		insertTokenAtCursor,

		replacePattern,
		setReplacePattern,
		replaceSegments,
		insertCaptureAtCursor,

		captures,
		generatedPattern: generated.pattern,
		generatedReplacement: generated.replacement,
		isValid: generated.isValid,
		error: generated.error,

		sampleText,
		setSampleText,
		previewResult,
		matchCount,

		copyPattern,
		copyReplacement,
		copyBoth,
		clearAll,
	};
}
