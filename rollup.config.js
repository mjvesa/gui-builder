import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import typescript from "@rollup/plugin-typescript";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: "src/main.ts",
    output: {
      file: "public/bundle.js",
      name: "bundle",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      typescript(),
      css({ output: "public/bundle.css" }),
      resolve(),
      commonjs(),
      production && terser({ compress: { drop_console: true } }),
    ],
  },
  {
    input: "src/comod/vaadin/main.js",
    output: {
      file: "public/iframe_bundle.js",
      name: "iframe_bundle",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      css({ output: "public/iframe_bundle.css" }),
      resolve(),
      commonjs(),
      production && terser({ compress: { drop_console: true } }),
    ],
  },
];
