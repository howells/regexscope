import { VisualFindReplace } from "@/components/visual-regex";

export default function Home() {
	return (
		<main className="flex min-h-svh items-start justify-center px-4 pt-[12vh]">
			<div className="w-full max-w-xl">
				<VisualFindReplace />
			</div>
		</main>
	);
}
