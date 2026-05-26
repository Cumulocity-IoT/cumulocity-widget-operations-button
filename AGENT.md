# AGENT.md

Guidance for AI coding agents working in this repository.

## Project concept

This repository builds a **Cumulocity IoT widget plugin** — `operation-button-widget` — that renders configurable buttons in a Cumulocity dashboard. Each button sends an **operation** (a device command) to a selected device.

Core capabilities:
- Pick a target device at widget-config time.
- Configure one or more buttons; each button maps to either a device-advertised operation (`c8y_SupportedOperations`) or a **custom operation** with a user-supplied JSON payload.
- Custom payloads may embed `${variableName}` placeholders. The widget auto-detects them and renders a runtime input panel so users can fill values before dispatching.
- Variables are typed (`text` keeps JSON string quoting; `number` strips quotes to produce raw JSON numbers).
- Optional confirmation modal before dispatch.

The widget is packaged as a **Module Federation remote** loaded into a host Cumulocity application (e.g. Cockpit) — it is not a standalone app.

## Tech stack

- Angular `^20.3.0` (core, common, compiler, forms, router, platform-browser, cdk `^20.2.14`) — module federation plugin
- Cumulocity packages `@c8y/ngx-components`, `@c8y/client`, `@c8y/bootstrap`, `@c8y/style`, `@c8y/devkit`, `@c8y/options` — all pinned to `1023.52.0`
- `monaco-editor` `~0.53.0` for the JSON payload editor
- `ngx-bootstrap` `20.0.2` for UI primitives
- `rxjs` `7.8.2`, `zone.js` `~0.15.0`, `tslib` `^2.3.0`
- TypeScript `~5.9.2`
- Build tooling: `@angular/build` `^20.3.12`, `@angular/cli` `^20.3.12`, `@c8y/devkit` `1023.52.0` (`cumulocity.config.ts` drives plugin packaging)
- Tests: Karma `~6.4.0` + Jasmine `~5.9.0` / `~5.1.0` types

## Layout

- [src/app/index.ts](src/app/index.ts) — plugin entry: registers `samplePluginWidgetDefinition` via `hookWidget`. Wires component, config component, schema, and import/export helpers.
- [src/app/operation-widget/widget/](src/app/operation-widget/widget/) — runtime widget (`OperationWidgetComponent`) rendered in dashboards.
- [src/app/operation-widget/button/](src/app/operation-widget/button/) — single button + confirmation modal.
- [src/app/operation-widget/widget-config/](src/app/operation-widget/widget-config/) — config UI (`OperationWidgetConfigComponent`) shown when adding/editing the widget. Includes the Monaco-based operation-value editor and icon picker.
- [src/app/operation-widget/models/operation-widget-model.ts](src/app/operation-widget/models/operation-widget-model.ts) — `IOperationWidgetConfig`, `IOperationButtonConfig`, `IOperationVariable`.
- [src/app/sample-plugin.model.ts](src/app/sample-plugin.model.ts) — schema source for `c8y-schema-loader` (used by import/export).
- [cumulocity.config.ts](cumulocity.config.ts) — plugin manifest: context path, federation shares, exported module.

## Scripts

- `npm start` — `ng serve` against a default shell.
- `npm run start:cockpit` — run inside the Cockpit shell (most realistic local preview).
- `npm run build` / `npm run build-ci` — dev / production build.
- `npm test` — Karma + Jasmine.

## Conventions

- Prettier: 100 col, single quotes, Angular HTML parser.
- File naming follows Angular conventions (`*.component.ts/.html/.css`).
- Keep config model changes in sync between `IOperationButtonConfig` and the schema model in `sample-plugin.model.ts` — import/export relies on the generated schema.
- Variable substitution lives in the runtime button component; preserve the contract that `${name}` placeholders in `operationValue` are replaced by the matching `IOperationVariable.varName`, and that `number` variables strip surrounding quotes.

## When making changes

- UI changes should be verified inside Cockpit (`npm run start:cockpit`) — not just by type-check.
- Don't add backwards-compat shims for the widget config; this is a plugin with a single owner-controlled schema.
- Avoid introducing new top-level deps unless they're also added to the federation share list in `cumulocity.config.ts`, otherwise they'll be bundled twice.
