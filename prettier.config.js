/** @type {import('prettier').Config} */
export default {
  semi: false,

  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],

  importOrder: [
    "^@/components/(.*)$",
    "^@/lib/(.*)$",
    "^@/db/(.*)$",
    "^@/config/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
