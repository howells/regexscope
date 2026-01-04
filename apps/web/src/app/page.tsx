import { VisualFindReplace } from "@/components/visual-regex";

export default function Home() {
	return (
		<main className="flex-1 overflow-auto">
			<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
				{/* Hero */}
				<div className="mb-10 text-center">
					<h1 className="mb-3 font-bold text-3xl tracking-tight sm:text-4xl">
						Find & Replace,{" "}
						<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
							Simplified
						</span>
					</h1>
					<p className="mx-auto max-w-md text-muted-foreground text-lg">
						Build powerful search patterns visually. No regex knowledge required.
					</p>
				</div>

				{/* Main Tool */}
				<VisualFindReplace />

				{/* Footer hint */}
				<p className="mt-12 text-center text-muted-foreground text-sm">
					Works with VSCode, Cursor, and any editor with regex find & replace
				</p>
			</div>
		</main>
	);
}
