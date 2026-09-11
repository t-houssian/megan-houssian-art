import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  { ignores: ["dist/**", "sanity/dist/**", "test-results/**", "playwright-report/**"] },
];

export default eslintConfig;
