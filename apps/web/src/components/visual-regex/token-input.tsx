"use client";

import { useRef, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FindSegment, ReplaceSegment } from "@/lib/visual-regex/types";
import { getTokenDefinition } from "@/lib/visual-regex/token-definitions";

interface TokenInputProps {
	segments: FindSegment[] | ReplaceSegment[];
	onTextChange: (text: string) => void;
	onDeleteSegment?: (index: number) => void;
	placeholder?: string;
	label: string;
	className?: string;
}

/**
 * Simplified token input that uses a regular input field
 * Tokens are displayed as chips below the input
 */
export function TokenInput({
	segments,
	onTextChange,
	onDeleteSegment,
	placeholder,
	label,
	className,
}: TokenInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	// Extract current text value (combines all text segments)
	const textValue = segments
		.filter((s): s is { kind: "text"; value: string } => s.kind === "text")
		.map((s) => s.value)
		.join("");

	// Get non-text segments (tokens/captures)
	const tokenSegments = segments.filter((s) => s.kind !== "text");

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
		}
	};

	return (
		<div className={className}>
			<label className="mb-2 block font-medium text-sm">{label}</label>

			{/* Text input */}
			<input
				ref={inputRef}
				type="text"
				value={textValue}
				onChange={(e) => onTextChange(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className={cn(
					"border-input dark:bg-input/30 h-10 w-full rounded-md border bg-transparent px-3 py-2",
					"font-mono text-sm",
					"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
					"placeholder:text-muted-foreground",
				)}
			/>

			{/* Token chips displayed below */}
			{tokenSegments.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1.5">
					{segments.map((seg, index) => {
						if (seg.kind === "token") {
							const def = getTokenDefinition(seg.tokenType);
							return (
								<span
									key={seg.id}
									className={cn(
										"inline-flex items-center gap-1 rounded-md px-2 py-1",
										"bg-primary/10 text-primary border border-primary/20",
										"font-medium text-sm",
									)}
								>
									{def.label}
									{onDeleteSegment && (
										<button
											type="button"
											onClick={() => onDeleteSegment(index)}
											className="hover:bg-primary/20 -mr-1 rounded p-0.5"
											aria-label={`Remove ${def.label}`}
										>
											<X className="size-3" />
										</button>
									)}
								</span>
							);
						}

						if (seg.kind === "capture-ref") {
							return (
								<span
									key={seg.id}
									className={cn(
										"inline-flex items-center gap-1 rounded-md px-2 py-1",
										"border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400 border",
										"font-medium text-sm",
									)}
								>
									${seg.captureIndex}
									{onDeleteSegment && (
										<button
											type="button"
											onClick={() => onDeleteSegment(index)}
											className="-mr-1 rounded p-0.5 hover:bg-green-500/20"
											aria-label="Remove capture"
										>
											<X className="size-3" />
										</button>
									)}
								</span>
							);
						}

						return null;
					})}
				</div>
			)}
		</div>
	);
}
