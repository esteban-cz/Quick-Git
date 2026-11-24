import parser from "@typescript-eslint/parser";

export default [{
  files: ["src/**/*.ts"],
  languageOptions: { parser },
  rules: {
    curly: "error",
    eqeqeq: "error",
    "no-throw-literal": "error",
    semi: ["error", "always"],
  },
}];
