"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaptureInfo } from "@/lib/visual-regex/types";
import { getTokenDefinition } from "@/lib/visual-regex/token-definitions";

interface CaptureChipProps {
	capture: CaptureInfo;
	onDelete?: () => void;
	onClick?: () => void;
	className?: string;
}

export function CaptureChip({
	capture,
	onDelete,
	onClick,
	className,
}: CaptureChipProps) {
	const def = getTokenDefinition(capture.tokenType);

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-2 py-0.5",
				"bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20",
				"font-medium text-sm",
				"select-none",
				onClick && "cursor-pointer hover:bg-green-500/20",
				className,
			)}
			contentEditable={false}
			onClick={onClick}
			onKeyDown={(e) => {
				if (onClick && (e.key === "Enter" || e.key === " ")) {
					e.preventDefault();
					onClick();
				}
			}}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			{def.label} {capture.captureIndex}
			{onDelete && (
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onDelete();
					}}
					className="-mr-1 rounded p-0.5 hover:bg-green-500/20"
					aria-label={`Remove ${capture.label}`}
				>
					<X className="size-3" />
				</button>
			)}
		</span>
	);
}
