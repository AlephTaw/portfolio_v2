# Boilerplate

Independent mobile-first single-page app starter, copied from the terminal shell before financial features were added. Same React 19, Next 16, Vinext/Vite, Tailwind 4, TypeScript and ESLint setup as mobile-mvp.

Run from the workspace root:

```sh
pnpm --filter @stevenwilcox/boilerplate dev
pnpm --filter @stevenwilcox/boilerplate typecheck
pnpm --filter @stevenwilcox/boilerplate lint
pnpm --filter @stevenwilcox/boilerplate build
```

Preview: http://localhost:3009. The only route is /. The terminal, ...next action composer, safe-area shell, centered desktop layout, and placeholder navigation remain. Enter adds a local session action; Shift+Enter inserts a newline. No command execution or persistence. The plus focuses the composer.

Feature components live in app/components/actions/{layouts,views,history,navigation}. app/lib and tests are reserved for new app logic. public contains a generic icon and manifest. No financial data, sibling runtime imports, or financial features are included. Offline caching and full PWA installation are not implemented.
