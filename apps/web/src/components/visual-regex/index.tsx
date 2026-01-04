"use client";

import { useRef, useState } from "react";
import {
	Plus,
	Copy,
	Check,
	ChevronDown,
	Sparkles,
	RotateCcw,
	Eye,
	Code2,
} from "lucide-react";
import { useVisualRegex } from "@/hooks/use-visual-regex";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOKEN_DEFINITIONS } from "@/lib/visual-regex/token-definitions";
import type {
	WildcardTokenType,
	FindSegment,
	ReplaceSegment,
} from "@/lib/visual-regex/types";

// Token color mapping for visual distinction
const TOKEN_COLORS: Record<string, string> = {
	word: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
	words:
		"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
	number: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
	decimal: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
	character:
		"bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
	characters:
		"bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
	whitespace:
		"bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300",
	letter:
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
	letters:
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
	start: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
	end: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

// Friendly display names for tokens (shown in visual preview)
const FRIENDLY_NAMES: Record<string, string> = {
	word: "word",
	words: "words",
	number: "number",
	decimal: "decimal",
	character: "char",
	characters: "any",
	whitespace: "space",
	letter: "letter",
	letters: "letters",
	start: "start",
	end: "end",
};

export function VisualFindReplace() {
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
	const [capturePickerOpen, setCapturePickerOpen] = useState(false);
	const [copied, setCopied] = useState<string | null>(null);

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
		insertCaptureAtCursor,

		captures,
		generatedPattern,
		generatedReplacement,
		isValid,

		sampleText,
		setSampleText,
		previewResult,
		matchCount,

		copyPattern,
		copyReplacement,
		clearAll,
	} = useVisualRegex();

	const handleCopy = async (type: "pattern" | "replacement" | "both") => {
		if (type === "pattern") {
			await copyPattern();
		} else if (type === "replacement") {
			await copyReplacement();
		} else {
			await navigator.clipboard.writeText(
				`Find: ${generatedPattern}\nReplace: ${generatedReplacement}`
			);
		}
		setCopied(type);
		setTimeout(() => setCopied(null), 2000);
	};

	const handleInsertToken = (tokenType: WildcardTokenType) => {
		const cursorPos = findInputRef.current?.selectionStart ?? findPattern.length;
		const newPattern = insertTokenAtCursor(tokenType, cursorPos);
		setTokenPickerOpen(false);

		// Restore focus and set cursor after the inserted token
		setTimeout(() => {
			if (findInputRef.current) {
				findInputRef.current.focus();
				const newCursorPos = cursorPos + tokenType.length + 2; // +2 for { and }
				findInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
			}
		}, 0);
	};

	const handleInsertCapture = (captureIndex: number) => {
		const cursorPos =
			replaceInputRef.current?.selectionStart ?? replacePattern.length;
		const newPattern = insertCaptureAtCursor(captureIndex, cursorPos);
		setCapturePickerOpen(false);

		// Restore focus and set cursor after the inserted capture
		setTimeout(() => {
			if (replaceInputRef.current) {
				replaceInputRef.current.focus();
				const indexStr = String(captureIndex);
				const newCursorPos = cursorPos + indexStr.length + 2; // +2 for { and }
				replaceInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
			}
		}, 0);
	};

	const hasContent = findPattern.length > 0 || replacePattern.length > 0;

	return (
		<div className="space-y-8">
			{/* Main Editor Card */}
			<div className="relative overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-gray-50/50 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-gray-900/50">
				{/* Subtle decorative element */}
				<div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-amber-200/20 to-orange-200/20 blur-3xl dark:from-amber-500/10 dark:to-orange-500/10" />

				<div className="relative p-6 sm:p-8">
					{/* Header */}
					<div className="mb-8 flex items-start justify-between">
						<div>
							<h2 className="flex items-center gap-2 font-semibold text-lg">
								<Sparkles className="size-5 text-amber-500" />
								Pattern Builder
							</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Type patterns like{" "}
								<code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
									bg-{"{word}"}-{"{number}"}
								</code>
							</p>
						</div>
						{hasContent && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearAll}
								className="-mr-2 text-muted-foreground hover:text-foreground"
							>
								<RotateCcw className="mr-1.5 size-3.5" />
								Reset
							</Button>
						)}
					</div>

					{/* Find Field */}
					<div className="space-y-3">
						<label className="block font-medium text-sm">Find</label>
						<div className="group relative">
							<div className="flex items-center gap-2 rounded-xl border-2 border-transparent bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200 transition-all focus-within:border-amber-400 focus-within:ring-amber-100 dark:bg-gray-800/50 dark:ring-gray-700 dark:focus-within:border-amber-500 dark:focus-within:ring-amber-900/30">
								<input
									ref={findInputRef}
									type="text"
									value={findPattern}
									onChange={(e) => setFindPattern(e.target.value)}
									placeholder="e.g. bg-{word}-{number}"
									className="min-w-0 flex-1 bg-transparent font-mono text-base outline-none placeholder:font-sans placeholder:text-gray-400"
								/>

								{/* Add token button */}
								<div className="relative">
									<button
										type="button"
										onClick={() => setTokenPickerOpen(!tokenPickerOpen)}
										className={cn(
											"flex size-7 items-center justify-center rounded-lg transition-colors",
											"bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600",
											tokenPickerOpen &&
												"bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
										)}
									>
										<Plus className="size-4" />
									</button>

									{/* Token picker dropdown */}
									{tokenPickerOpen && (
										<TokenPickerDropdown
											onSelect={handleInsertToken}
											onClose={() => setTokenPickerOpen(false)}
										/>
									)}
								</div>
							</div>

							{/* Visual preview of parsed segments */}
							{findSegments.length > 0 && (
								<div className="mt-2 flex flex-wrap items-center gap-1">
									{findSegments.map((segment, i) => (
										<SegmentChip key={i} segment={segment} />
									))}
								</div>
							)}
						</div>
					</div>

					{/* Captures available */}
					{captures.length > 0 && (
						<div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50/50 px-3 py-2 dark:bg-emerald-900/10">
							<span className="text-emerald-700 text-xs dark:text-emerald-400">
								{captures.length} capture{captures.length !== 1 && "s"} available:
							</span>
							{captures.map((capture, i) => (
								<span
									key={capture.tokenId}
									className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 font-mono text-emerald-700 text-xs dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
								>
									{"{"}
									{i + 1}
									{"}"}
								</span>
							))}
						</div>
					)}

					{/* Replace Field */}
					<div className="mt-6 space-y-3">
						<label className="block font-medium text-sm">Replace with</label>
						<div className="group relative">
							<div className="flex items-center gap-2 rounded-xl border-2 border-transparent bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200 transition-all focus-within:border-emerald-400 focus-within:ring-emerald-100 dark:bg-gray-800/50 dark:ring-gray-700 dark:focus-within:border-emerald-500 dark:focus-within:ring-emerald-900/30">
								<input
									ref={replaceInputRef}
									type="text"
									value={replacePattern}
									onChange={(e) => setReplacePattern(e.target.value)}
									placeholder={
										captures.length > 0
											? "e.g. bg-gray-{1}"
											: "Type replacement text..."
									}
									className="min-w-0 flex-1 bg-transparent font-mono text-base outline-none placeholder:font-sans placeholder:text-gray-400"
								/>

								{/* Add capture button (only when captures exist) */}
								{captures.length > 0 && (
									<div className="relative">
										<button
											type="button"
											onClick={() => setCapturePickerOpen(!capturePickerOpen)}
											className={cn(
												"flex size-7 items-center justify-center rounded-lg transition-colors",
												"bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600",
												capturePickerOpen &&
													"bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
											)}
										>
											<Plus className="size-4" />
										</button>

										{/* Capture picker dropdown */}
										{capturePickerOpen && (
											<CapturePickerDropdown
												captures={captures}
												onSelect={handleInsertCapture}
												onClose={() => setCapturePickerOpen(false)}
											/>
										)}
									</div>
								)}
							</div>

							{/* Visual preview of parsed replacement segments */}
							{replaceSegments.length > 0 && (
								<div className="mt-2 flex flex-wrap items-center gap-1">
									{replaceSegments.map((segment, i) => (
										<ReplaceSegmentChip key={i} segment={segment} />
									))}
								</div>
							)}
						</div>
					</div>

					{/* Copy Actions */}
					{generatedPattern && (
						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Button
								size="lg"
								onClick={() => handleCopy("both")}
								disabled={!isValid}
								className="gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-medium text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg dark:from-amber-600 dark:to-orange-600"
							>
								{copied === "both" ? (
									<>
										<Check className="size-4" />
										Copied!
									</>
								) : (
									<>
										<Copy className="size-4" />
										Copy to Editor
									</>
								)}
							</Button>
							<span className="text-muted-foreground text-sm">
								or copy{" "}
								<button
									type="button"
									onClick={() => handleCopy("pattern")}
									className="font-medium text-foreground underline-offset-2 hover:underline"
								>
									pattern
								</button>
								{" / "}
								<button
									type="button"
									onClick={() => handleCopy("replacement")}
									className="font-medium text-foreground underline-offset-2 hover:underline"
								>
									replacement
								</button>{" "}
								separately
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Expandable sections */}
			<div className="space-y-3">
				{/* Preview section */}
				<button
					type="button"
					onClick={() => setShowPreview(!showPreview)}
					className="flex w-full items-center gap-2 rounded-xl border bg-white/50 px-4 py-3 text-left transition-colors hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900"
				>
					<Eye className="size-4 text-muted-foreground" />
					<span className="flex-1 font-medium text-sm">Test & Preview</span>
					{matchCount > 0 && (
						<span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-400">
							{matchCount} match{matchCount !== 1 && "es"}
						</span>
					)}
					<ChevronDown
						className={cn(
							"size-4 text-muted-foreground transition-transform",
							showPreview && "rotate-180"
						)}
					/>
				</button>

				{showPreview && (
					<div className="animate-in fade-in-0 slide-in-from-top-2 space-y-4 rounded-xl border bg-white p-4 dark:bg-gray-900">
						<div>
							<label
								htmlFor="test-text"
								className="mb-2 block font-medium text-sm"
							>
								Sample text
							</label>
							<textarea
								id="test-text"
								value={sampleText}
								onChange={(e) => setSampleText(e.target.value)}
								placeholder="Paste some text to test your pattern..."
								className="min-h-[100px] w-full resize-none rounded-lg border bg-gray-50 p-3 font-mono text-sm outline-none transition-colors focus:border-amber-400 focus:bg-white dark:bg-gray-800 dark:focus:bg-gray-800"
							/>
						</div>
						{sampleText && matchCount > 0 && (
							<div>
								<label className="mb-2 block font-medium text-sm">
									Preview result
								</label>
								<div className="whitespace-pre-wrap rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50/50 p-3 font-mono text-sm dark:bg-emerald-900/10">
									{previewResult}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Advanced mode */}
				<button
					type="button"
					onClick={() => setShowAdvanced(!showAdvanced)}
					className="flex w-full items-center gap-2 rounded-xl border bg-white/50 px-4 py-3 text-left transition-colors hover:bg-white dark:bg-gray-900/50 dark:hover:bg-gray-900"
				>
					<Code2 className="size-4 text-muted-foreground" />
					<span className="flex-1 font-medium text-sm">
						View Generated Regex
					</span>
					<ChevronDown
						className={cn(
							"size-4 text-muted-foreground transition-transform",
							showAdvanced && "rotate-180"
						)}
					/>
				</button>

				{showAdvanced && (
					<div className="animate-in fade-in-0 slide-in-from-top-2 space-y-3 rounded-xl border bg-white p-4 dark:bg-gray-900">
						<div>
							<label className="mb-1 block text-muted-foreground text-xs uppercase tracking-wide">
								Pattern
							</label>
							<code className="block rounded-lg bg-gray-100 p-3 font-mono text-sm dark:bg-gray-800">
								{generatedPattern || (
									<span className="text-muted-foreground italic">
										No pattern
									</span>
								)}
							</code>
						</div>
						<div>
							<label className="mb-1 block text-muted-foreground text-xs uppercase tracking-wide">
								Replacement
							</label>
							<code className="block rounded-lg bg-gray-100 p-3 font-mono text-sm dark:bg-gray-800">
								{generatedReplacement || (
									<span className="text-muted-foreground italic">
										No replacement
									</span>
								)}
							</code>
						</div>
						<p className="text-muted-foreground text-xs">
							Use in VSCode/Cursor with Cmd+H (Mac) or Ctrl+H (Windows)
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

// Visual chip for find segments
function SegmentChip({ segment }: { segment: FindSegment }) {
	if (segment.kind === "text") {
		return (
			<span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
				{segment.value}
			</span>
		);
	}

	if (segment.kind === "token") {
		const colorClass = TOKEN_COLORS[segment.tokenType] || TOKEN_COLORS.word;
		const friendlyName = FRIENDLY_NAMES[segment.tokenType] || segment.tokenType;
		return (
			<span
				className={cn(
					"rounded-full px-2 py-0.5 font-medium text-xs",
					colorClass
				)}
			>
				{friendlyName}
			</span>
		);
	}

	return null;
}

// Visual chip for replace segments
function ReplaceSegmentChip({ segment }: { segment: ReplaceSegment }) {
	if (segment.kind === "text") {
		return (
			<span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
				{segment.value}
			</span>
		);
	}

	if (segment.kind === "capture-ref") {
		return (
			<span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 text-xs dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
				${segment.captureIndex}
			</span>
		);
	}

	return null;
}

// Token picker dropdown component
function TokenPickerDropdown({
	onSelect,
	onClose,
}: {
	onSelect: (type: WildcardTokenType) => void;
	onClose: () => void;
}) {
	// Group tokens by category
	const textTokens = TOKEN_DEFINITIONS.filter((t) =>
		["word", "words", "letter", "letters"].includes(t.type)
	);
	const numberTokens = TOKEN_DEFINITIONS.filter((t) =>
		["number", "decimal"].includes(t.type)
	);
	const anyTokens = TOKEN_DEFINITIONS.filter((t) =>
		["character", "characters", "whitespace"].includes(t.type)
	);
	const anchorTokens = TOKEN_DEFINITIONS.filter((t) =>
		["start", "end"].includes(t.type)
	);

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-40" onClick={onClose} />

			{/* Dropdown */}
			<div className="animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
				<div className="mb-2 px-2 py-1">
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Insert Token
					</span>
				</div>

				<TokenGroup
					label="Text"
					tokens={textTokens}
					onSelect={onSelect}
					colorKey="word"
				/>
				<TokenGroup
					label="Numbers"
					tokens={numberTokens}
					onSelect={onSelect}
					colorKey="number"
				/>
				<TokenGroup
					label="Any"
					tokens={anyTokens}
					onSelect={onSelect}
					colorKey="character"
				/>
				<TokenGroup
					label="Position"
					tokens={anchorTokens}
					onSelect={onSelect}
					colorKey="start"
				/>
			</div>
		</>
	);
}

function TokenGroup({
	label,
	tokens,
	onSelect,
	colorKey,
}: {
	label: string;
	tokens: typeof TOKEN_DEFINITIONS;
	onSelect: (type: WildcardTokenType) => void;
	colorKey: string;
}) {
	if (tokens.length === 0) return null;

	return (
		<div className="mb-1">
			<div className="px-2 py-1 text-muted-foreground text-xs">{label}</div>
			{tokens.map((token) => (
				<button
					key={token.type}
					type="button"
					onClick={() => onSelect(token.type)}
					className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
				>
					<span
						className={cn(
							"inline-flex rounded-md px-2 py-0.5 font-mono text-xs",
							TOKEN_COLORS[token.type] || TOKEN_COLORS[colorKey]
						)}
					>
						{"{"}
						{token.type}
						{"}"}
					</span>
					<span className="flex-1 text-muted-foreground text-xs">
						{token.description}
					</span>
				</button>
			))}
		</div>
	);
}

// Capture picker dropdown component
function CapturePickerDropdown({
	captures,
	onSelect,
	onClose,
}: {
	captures: Array<{ tokenId: string; label: string; tokenType: string }>;
	onSelect: (captureIndex: number) => void;
	onClose: () => void;
}) {
	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 z-40" onClick={onClose} />

			{/* Dropdown */}
			<div className="animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-50 mt-2 w-48 rounded-xl border bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-900">
				<div className="mb-2 px-2 py-1">
					<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
						Insert Capture
					</span>
				</div>

				{captures.map((capture, index) => (
					<button
						key={capture.tokenId}
						type="button"
						onClick={() => onSelect(index + 1)}
						className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						<span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 font-mono text-emerald-700 text-xs dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
							{"{"}
							{index + 1}
							{"}"}
						</span>
						<span className="flex-1 text-muted-foreground text-xs">
							{capture.label}
						</span>
					</button>
				))}
			</div>
		</>
	);
}
