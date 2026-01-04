"use client";

import { AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeneratedRegexProps {
	pattern: string;
	replacement: string;
	isValid: boolean;
	error: string | null;
	onCopyPattern: () => void;
	onCopyReplacement: () => void;
	onCopyBoth: () => void;
}

export function GeneratedRegex({
	pattern,
	replacement,
	isValid,
	error,
	onCopyPattern,
	onCopyReplacement,
	onCopyBoth,
}: GeneratedRegexProps) {
	return (
		<div className="space-y-4">
			{/* Error display */}
			{error && (
				<div className="text-destructive flex items-center gap-2 text-sm">
					<AlertCircle className="size-4" />
					{error}
				</div>
			)}

			{/* Generated patterns */}
			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label className="text-muted-foreground mb-1 block text-xs uppercase tracking-wide">
						Pattern
					</label>
					<code
						className={cn(
							"bg-muted block rounded-md p-2 font-mono text-sm",
							"max-h-20 overflow-auto",
							!pattern && "text-muted-foreground italic",
						)}
					>
						{pattern || "No pattern yet"}
					</code>
				</div>
				<div>
					<label className="text-muted-foreground mb-1 block text-xs uppercase tracking-wide">
						Replacement
					</label>
					<code
						className={cn(
							"bg-muted block rounded-md p-2 font-mono text-sm",
							"max-h-20 overflow-auto",
							!replacement && "text-muted-foreground italic",
						)}
					>
						{replacement || "No replacement yet"}
					</code>
				</div>
			</div>

			{/* Copy buttons */}
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onCopyPattern}
					disabled={!pattern || !isValid}
				>
					<Copy className="mr-1.5 size-3.5" />
					Copy Pattern
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onCopyReplacement}
					disabled={!replacement}
				>
					<Copy className="mr-1.5 size-3.5" />
					Copy Replacement
				</Button>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={onCopyBoth}
					disabled={!pattern || !isValid}
				>
					<Copy className="mr-1.5 size-3.5" />
					Copy Both
				</Button>
			</div>

			<p className="text-muted-foreground text-xs">
				Paste into VSCode/Cursor find & replace (Cmd+H / Ctrl+H)
			</p>
		</div>
	);
}
