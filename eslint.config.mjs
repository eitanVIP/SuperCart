import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
	{
		ignores: [".expo/**", "dist/**", "expo-env.d.ts", "node_modules/**", "web-build/**"],
	},
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": tseslint,
			prettier: prettierPlugin,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...prettierConfig.rules,
			"@typescript-eslint/no-unused-vars": "warn",
			"no-console": "warn",
			"prettier/prettier": "error",
		},
	},
];
