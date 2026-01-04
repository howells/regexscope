"use client";

import {
	Type,
	TextCursor,
	Hash,
	Percent,
	HelpCircle,
	MoreHorizontal,
	Space,
	CaseSensitive,
	Heading,
	ArrowLeftToLine,
	ArrowRightToLine,
	type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOKEN_DEFINITIONS } from "@/lib/visual-regex/token-definitions";
import type { WildcardTokenType } from "@/lib/visual-regex/types";

const ICON_MAP: Record<string, LucideIcon> = {
	Type,
	TextCursor,
	Hash,
	Percent,
	HelpCircle,
	MoreHorizontal,
	Space,
	CaseSensitive,
	Heading,
	ArrowLeftToLine,
	ArrowRightToLine,
};

interface TokenToolbarProps {
	onInsert: (tokenType: WildcardTokenType) => void;
	disabled?: boolean;
}

export function TokenToolbar({ onInsert, disabled }: TokenToolbarProps) {
	return (
		<div className="flex flex-wrap gap-1">
			{TOKEN_DEFINITIONS.map((def) => {
				const IconComponent = ICON_MAP[def.icon] ?? Type;

				return (
					<Button
						key={def.type}
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onInsert(def.type)}
						disabled={disabled}
						title={def.description}
						className="h-7 px-2 text-xs"
					>
						<IconComponent className="mr-1 size-3" />
						{def.shortLabel}
					</Button>
				);
			})}
		</div>
	);
}
