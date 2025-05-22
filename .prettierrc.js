// Prettier configuration for import sorting

export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  printWidth: 80,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^react', 
    '^@?\\w',
    '^@/components/(.*)$',
    '^@/hooks/(.*)$',
    '^@/lib/(.*)$',
    '^@/utils/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderGroupNamespaceSpecifiers: true,
  importOrderCaseInsensitive: true
};
