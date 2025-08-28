import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

const external = ["mathjs"];

const plugins = [
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
  commonjs(),
  babel({
    babelHelpers: "bundled",
    exclude: "node_modules/**",
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            browsers: ["> 1%", "last 2 versions", "not dead"],
          },
          modules: false,
        },
      ],
    ],
  }),
];

export default [
  // ES Module build
  {
    input: "src/index.js",
    external,
    output: {
      file: "dist/index.esm.js",
      format: "es",
      sourcemap: true,
      exports: "auto",
    },
    plugins,
  },
  // CommonJS build
  {
    input: "src/index.js",
    external,
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "auto",
    },
    plugins,
  },
  // UMD build for browsers
  {
    input: "src/index.js",
    external: [],
    output: {
      file: "dist/quanta_sim.umd.js",
      format: "umd",
      name: "QuantaSim",
      sourcemap: true,
      globals: {
        mathjs: "math",
      },
    },
    plugins,
  },
  // Minified UMD build
  {
    input: "src/index.js",
    external: [],
    output: {
      file: "dist/quanta_sim.umd.min.js",
      format: "umd",
      name: "QuantaSim",
      sourcemap: true,
      globals: {
        mathjs: "math",
      },
    },
    plugins: [...plugins, terser()],
  },
];
