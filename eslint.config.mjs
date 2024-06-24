import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import promise from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...fixupConfigRules(compat.extends(
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "airbnb",
    "airbnb-typescript",
    "prettier",
    "plugin:prettier/recommended",
    "plugin:sonarjs/recommended",
    "plugin:security/recommended",
    "plugin:react-hooks/recommended",
)), {
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        promise,
        react: fixupPluginRules(react),
        "react-hooks": fixupPluginRules(reactHooks),
        prettier: fixupPluginRules(prettier),
    },

    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",

        parserOptions: {
            project: ["tsconfig.json"],

            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    settings: {
        react: {
            pragma: "React",
            version: "detect",
        },

        "import/resolver": {
            node: {
                extensions: [".ts", ".tsx"],
            },
        },
    },

    rules: {
        "prettier/prettier": "error",
        "react/react-in-jsx-scope": "off",
        "react/button-has-type": "off",
        "react/function-component-definition": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "no-console": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "jsx-a11y/no-static-element-interactions": "off",
        "jsx-a11y/no-noninteractive-element-interactions": "off",
        "security/detect-object-injection": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "import/no-extraneous-dependencies": "off",
        "react/no-array-index-key": "off",
        "jsx-a11y/label-has-associated-control": "off",

        "@typescript-eslint/naming-convention": ["error", {
            selector: "default",
            format: ["camelCase", "snake_case", "UPPER_CASE", "PascalCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
        }, {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE", "snake_case", "PascalCase"],
            leadingUnderscore: "allow",
            trailingUnderscore: "allow",
        }, {
            selector: "typeLike",
            format: ["PascalCase"],
        }],

        "arrow-spacing": ["warn", {
            before: true,
            after: true,
        }],

        "comma-dangle": ["error", "never"],
        indent: "off",

        "no-multiple-empty-lines": ["error", {
            max: 1,
        }],

        "no-tabs": ["error", {
            allowIndentationTabs: true,
        }],

        "no-trailing-spaces": ["warn"],
        "no-unused-vars": "off",
        "no-nested-ternary": "off",
        "object-curly-spacing": ["error", "always"],

        quotes: ["error", "single", {
            avoidEscape: true,
        }],

        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "react/require-default-props": "off",
        "jsx-a11y/control-has-associated-label": "off",
        semi: [2, "always"],

        "sort-keys": ["error", "asc", {
            caseSensitive: true,
            natural: false,
            minKeys: 2,
        }],

        "switch-colon-spacing": ["error", {
            after: true,
            before: false,
        }],
    },
}];