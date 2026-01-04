"use client";

import { useRef, useState } from "react";
import { Copy, Check, ChevronRight } from "lucide-react";
import { useVisualRegex } from "@/hooks/use-visual-regex";
import { cn } from "@/lib/utils";
import { TOKEN_DEFINITIONS } from "@/lib/visual-regex/token-definitions";
import { EXAMPLES } from "@/lib/visual-regex/examples";
import type {
	WildcardTokenType,
	FindSegment,
	ReplaceSegment,
} from "@/lib/visual-regex/types";

// Muted token colors for dark theme
const TOKEN_COLORS: Record<string, string> = {
	word: "bg-amber-500/20 text-amber-400",
	words: "bg-amber-500/20 text-amber-400",
	number: "bg-sky-500/20 text-sky-400",
	decimal: "bg-sky-500/20 text-sky-400",
	character: "bg-violet-500/20 text-violet-400",
	characters: "bg-violet-500/20 text-violet-400",
	whitespace: "bg-neutral-500/20 text-neutral-400",
	letter: "bg-emerald-500/20 text-emerald-400",
	letters: "bg-emerald-500/20 text-emerald-400",
	start: "bg-rose-500/20 text-rose-400",
	end: "bg-rose-500/20 text-rose-400",
};

const FRIENDLY_NAMES: Record<string, string> = {
	word: "word",
	words: "words",
	number: "num",
	decimal: "dec",
	character: "char",
	characters: "any",
	whitespace: "ws",
	letter: "ltr",
	letters: "ltrs",
	start: "^",
	end: "$",
};

export function VisualFindReplace() {
	const [showTokens, setShowTokens] = useState(false);
	const [copied, setCopied] = useState(false);

	const findInputRef = useRef<HTMLInputElement>(null);
	const replaceInputRef = useRef<HTMLInputElement>(null);

	const {
		findPattern,
		setFindPattern,
		findSegments,
		insertTokenAtCursor,

		replacePattern,
		setReplacePattern,
		replaceSegments,

		captures,
		generatedPattern,
		generatedReplacement,
		isValid,

		sampleText,
		setSampleText,
		previewResult,
		matchCount,

		clearAll,
	} = useVisualRegex();

	const handleCopy = async () => {
		if (!generatedPattern) return;
		try {
			await navigator.clipboard.writeText(
				`${generatedPattern}\n${generatedReplacement}`
			);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// ignore
		}
	};

	const handleInsertToken = (tokenType: WildcardTokenType) => {
		const cursorPos =
			findInputRef.current?.selectionStart ?? findPattern.length;
		insertTokenAtCursor(tokenType, cursorPos);
		setShowTokens(false);
		setTimeout(() => {
			if (findInputRef.current) {
				findInputRef.current.focus();
				const newPos = cursorPos + tokenType.length + 2;
				findInputRef.current.setSelectionRange(newPos, newPos);
			}
		}, 0);
	};

	const loadExample = (example: (typeof EXAMPLES)[0]) => {
		setFindPattern(example.find);
		setReplacePattern(example.replace);
		setSampleText(example.sample);
	};

	const hasContent = findPattern.length > 0;

	return (
		<div className="space-y-6">
			{/* Minimal branding */}
			<div className="flex items-center justify-between">
				<span className="font-mono text-muted-foreground text-xs tracking-wider uppercase">
					regexscope
				</span>
				{hasContent && (
					<button
						type="button"
						onClick={clearAll}
						className="font-mono text-muted-foreground text-xs transition-colors hover:text-foreground"
					>
						clear
					</button>
				)}
			</div>

			{/* Main input area */}
			<div className="space-y-3">
				{/* Find field */}
				<div className="group relative">
					<div className="flex items-center gap-3">
						<span className="w-12 shrink-0 font-mono text-muted-foreground text-xs">
							find
						</span>
						<div className="relative flex-1">
							<input
								ref={findInputRef}
								type="text"
								value={findPattern}
								onChange={(e) => setFindPattern(e.target.value)}
								placeholder="bg-{word}-{number}"
								className="w-full border-b border-border bg-transparent py-2 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
							/>
							{/* Token insert button */}
							<button
								type="button"
								onClick={() => setShowTokens(!showTokens)}
								className={cn(
									"absolute top-1/2 right-0 -translate-y-1/2 px-2 py-1 font-mono text-muted-foreground text-xs transition-colors hover:text-foreground",
									showTokens && "text-primary"
								)}
							>
								+token
							</button>
						</div>
					</div>

					{/* Token dropdown */}
					{showTokens && (
						<>
							<div
								className="fixed inset-0 z-40"
								onClick={() => setShowTokens(false)}
							/>
							<div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-md border border-border bg-card p-1 shadow-lg">
								{TOKEN_DEFINITIONS.map((token) => (
									<button
										key={token.type}
										type="button"
										onClick={() => handleInsertToken(token.type)}
										className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-muted"
									>
										<code
											className={cn(
												"rounded px-1.5 py-0.5 font-mono text-xs",
												TOKEN_COLORS[token.type]
											)}
										>
											{token.type}
										</code>
										<span className="text-muted-foreground text-xs">
											{token.description}
										</span>
									</button>
								))}
							</div>
						</>
					)}

					{/* Parsed segments preview */}
					{findSegments.length > 0 && (
						<div className="mt-2 flex flex-wrap items-center gap-1 pl-15">
							{findSegments.map((segment, i) => (
								<SegmentChip key={i} segment={segment} />
							))}
						</div>
					)}
				</div>

				{/* Replace field */}
				<div>
					<div className="flex items-center gap-3">
						<span className="w-12 shrink-0 font-mono text-muted-foreground text-xs">
							with
						</span>
						<input
							ref={replaceInputRef}
							type="text"
							value={replacePattern}
							onChange={(e) => setReplacePattern(e.target.value)}
							placeholder={captures.length > 0 ? "bg-gray-{2}" : "replacement"}
							className="w-full border-b border-border bg-transparent py-2 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
						/>
					</div>

					{/* Parsed replacement preview */}
					{replaceSegments.length > 0 && (
						<div className="mt-2 flex flex-wrap items-center gap-1 pl-15">
							{replaceSegments.map((segment, i) => (
								<ReplaceSegmentChip key={i} segment={segment} />
							))}
						</div>
					)}

					{/* Captures hint */}
					{captures.length > 0 && (
						<div className="mt-2 pl-15">
							<span className="font-mono text-muted-foreground text-xs">
								captures:{" "}
								{captures.map((_, i) => `{${i + 1}}`).join(" ")}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Generated output & copy */}
			{generatedPattern && (
				<div className="flex items-start justify-between gap-4 rounded-md bg-muted/50 p-3">
					<div className="min-w-0 flex-1 space-y-1">
						<div className="truncate font-mono text-xs">
							<span className="text-muted-foreground">→ </span>
							{generatedPattern}
						</div>
						{generatedReplacement && (
							<div className="truncate font-mono text-xs">
								<span className="text-muted-foreground">← </span>
								{generatedReplacement}
							</div>
						)}
					</div>
					<button
						type="button"
						onClick={handleCopy}
						disabled={!isValid}
						className="shrink-0 rounded bg-primary px-3 py-1.5 font-mono text-primary-foreground text-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
					>
						{copied ? (
							<Check className="size-3.5" />
						) : (
							<Copy className="size-3.5" />
						)}
					</button>
				</div>
			)}

			{/* Test area - only show when there's a pattern */}
			{generatedPattern && (
				<div className="space-y-2">
					<div className="flex items-center gap-3">
						<span className="w-12 shrink-0 font-mono text-muted-foreground text-xs">
							test
						</span>
						<input
							type="text"
							value={sampleText}
							onChange={(e) => setSampleText(e.target.value)}
							placeholder="paste sample text..."
							className="w-full border-b border-border bg-transparent py-2 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50"
						/>
						{matchCount > 0 && (
							<span className="shrink-0 font-mono text-muted-foreground text-xs">
								{matchCount}×
							</span>
						)}
					</div>
					{sampleText && matchCount > 0 && (
						<div className="flex items-center gap-3">
							<span className="w-12 shrink-0" />
							<div className="font-mono text-emerald-400 text-sm">
								{previewResult}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Examples - subtle, at the bottom */}
			<div className="space-y-2 pt-4">
				<span className="font-mono text-muted-foreground/60 text-xs">
					examples
				</span>
				<div className="flex flex-wrap gap-1.5">
					{EXAMPLES.map((example) => (
						<button
							key={example.name}
							type="button"
							onClick={() => loadExample(example)}
							className="rounded border border-border bg-transparent px-2 py-1 font-mono text-muted-foreground text-xs transition-colors hover:border-muted-foreground/50 hover:text-foreground"
						>
							{example.name}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function SegmentChip({ segment }: { segment: FindSegment }) {
	if (segment.kind === "text") {
		return (
			<span className="font-mono text-muted-foreground text-xs">
				{segment.value}
			</span>
		);
	}

	if (segment.kind === "token") {
		const colorClass = TOKEN_COLORS[segment.tokenType] || TOKEN_COLORS.word;
		return (
			<span
				className={cn("rounded px-1.5 py-0.5 font-mono text-xs", colorClass)}
			>
				{FRIENDLY_NAMES[segment.tokenType]}
			</span>
		);
	}

	return null;
}

function ReplaceSegmentChip({ segment }: { segment: ReplaceSegment }) {
	if (segment.kind === "text") {
		return (
			<span className="font-mono text-muted-foreground text-xs">
				{segment.value}
			</span>
		);
	}

	if (segment.kind === "capture-ref") {
		return (
			<span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-emerald-400 text-xs">
				${segment.captureIndex}
			</span>
		);
	}

	return null;
}
