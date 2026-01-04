export interface Example {
	name: string;
	description: string;
	find: string;
	replace: string;
	sample: string;
}

export const EXAMPLES: Example[] = [
	{
		name: "Tailwind colors",
		description: "Change all color utilities to gray",
		find: "bg-{word}-{number}",
		replace: "bg-gray-{2}",
		sample: "bg-red-500 bg-blue-700 bg-emerald-100",
	},
	{
		name: "Text colors",
		description: "Standardize text color scale",
		find: "text-{word}-{number}",
		replace: "text-slate-{2}",
		sample: "text-gray-600 text-zinc-400 text-neutral-800",
	},
	{
		name: "Date format",
		description: "US dates to ISO format",
		find: "{number}/{number}/{number}",
		replace: "{3}-{1}-{2}",
		sample: "12/25/2024 01/15/2025 06/30/2023",
	},
	{
		name: "React className",
		description: "Convert class to className for JSX",
		find: "class=\"{characters}\"",
		replace: "className=\"{1}\"",
		sample: 'class="btn primary" class="nav-link active"',
	},
	{
		name: "Console cleanup",
		description: "Remove console.log statements",
		find: "console.log({characters})",
		replace: "",
		sample: "console.log(data)\nconsole.log('debug', value)",
	},
	{
		name: "Arrow functions",
		description: "Convert function declarations",
		find: "function {word}(",
		replace: "const {1} = (",
		sample: "function handleClick(\nfunction fetchData(",
	},
	{
		name: "Import aliases",
		description: "Add @ alias to relative imports",
		find: "from \"../",
		replace: "from \"@/",
		sample: 'from "../components"\nfrom "../utils/helpers"',
	},
	{
		name: "Pixel to rem",
		description: "Convert px values to rem",
		find: "{number}px",
		replace: "{1}rem",
		sample: "16px 24px 32px 48px",
	},
	{
		name: "CSS variables",
		description: "Wrap colors in var()",
		find: "#{word}",
		replace: "var(--color-{1})",
		sample: "#primary #secondary #accent",
	},
	{
		name: "Test describe",
		description: "Rename test blocks",
		find: "describe(\"{characters}\"",
		replace: "describe(\"Feature: {1}\"",
		sample: 'describe("Button"\ndescribe("Modal"',
	},
];
