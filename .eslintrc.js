module.exports = {
  "env": {
    "es6": true,
    "node": true,
    "mocha": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  parser: "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/indent": [2,2],
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/type-annotation-spacing": "off",
    "@typescript-eslint/member-delimiter-style":"off",
    "@typescript-eslint/explicit-function-return-type":"off",
    "@typescript-eslint/no-explicit-any":"off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    'semi':'error',
    "no-trailing-spaces": "error"
  },
  "overrides": [
    {
      "files": ["*.js"],
      "rules": {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ]
};