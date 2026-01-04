"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WildcardTokenType } from "@/lib/visual-regex/types";
import { getTokenDefinition } from "@/lib/visual-regex/token-definitions";

interface TokenChipProps {
	tokenType: WildcardTokenType;
	onDelete?: () => void;
	className?: string;
}

export function TokenChip({ tokenType, onDelete, className }: TokenChipProps) {
	const def = getTokenDefinition(tokenType);

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-md px-2 py-0.5",
				"bg-primary/10 text-primary border border-primary/20",
				"font-medium text-sm",
				"select-none",
				className,
			)}
			contentEditable={false}
		>
			{def.label}
			{onDelete && (
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onDelete();
					}}
					className="hover:bg-primary/20 -mr-1 rounded p-0.5"
					aria-label={`Remove ${def.label}`}
				>
					<X className="size-3" />
				</button>
			)}
		</span>
	);
}
