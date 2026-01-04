"use client";

import type { CaptureInfo } from "@/lib/visual-regex/types";
import { CaptureChip } from "./capture-chip";

interface CapturesPanelProps {
	captures: CaptureInfo[];
	onInsertCapture: (capture: CaptureInfo) => void;
}

export function CapturesPanel({ captures, onInsertCapture }: CapturesPanelProps) {
	if (captures.length === 0) {
		return (
			<div className="rounded-md border p-3">
				<h3 className="text-muted-foreground mb-1 font-medium text-sm">
					Captures
				</h3>
				<p className="text-muted-foreground text-xs">
					Add tokens to Find field to create capture groups
				</p>
			</div>
		);
	}

	return (
		<div className="rounded-md border p-3">
			<h3 className="mb-2 font-medium text-sm">
				Captures ({captures.length})
			</h3>
			<p className="text-muted-foreground mb-2 text-xs">
				Click to insert into Replace field
			</p>
			<div className="flex flex-wrap gap-1.5">
				{captures.map((capture) => (
					<CaptureChip
						key={capture.tokenId}
						capture={capture}
						onClick={() => onInsertCapture(capture)}
					/>
				))}
			</div>
		</div>
	);
}
