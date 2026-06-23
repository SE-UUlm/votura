export default {
  locales: [
    "en",
    "de"
  ],
  extract: {
    input: "src/**/*.{ts,tsx}",
    output: "public/locales/{{language}}/{{namespace}}.json"
  }
}