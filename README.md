# Cumulocity sample plugin

This is the Cumulocity module federation plugin. Plugins can be developed like any Cumulocity application, but can be used at runtime by other applications. Therefore, they export an Angular module which can then be imported by any other application. The exports are defined in `cumulocity.config.ts`:

```json
"exports": [
  {
     "name": "Example sample plugin widget",
     "module": "OperationButtonWidgetModule",
     "path": "./src/app/index.ts",
     "description": "Adds a custom widget to the shell application"
  }
]
```
Once the application has been built, the exports are also defined in the `cumulocity.json` file.

**How to start**
Run the commands below to scaffold a `sample-plugin`.

```bash
npx @angular/cli@v19-lts new --style=less # Install the correct version of Angular, which should be the same as your application.
cd <new-application-name>
ng add @c8y/websdk --application @c8y/sample-plugin
```

As the app.module is a typical Cumulocity application, any new plugin can be tested via the CLI:

```bash
ng serve --shell cockpit
```

In the Module Federation terminology, `sample` plugin is called `remote` and the `cockpit` is called `shell`. Modules provided by this `sample` will be loaded by the `cockpit` application at the runtime. This plugin provides a basic custom widget that can be accessed through the `Add widget` menu and a new view in a left-hand navigator, where you can find links to Codex hooks entries.

> Note that the `--shell` flag creates a proxy to the cockpit application and provides `OperationButtonWidgetModule` as an `remote` via URL options.

Also deploying needs no special handling and can be simply done via `npm run deploy`. As soon as the application has exports it will be uploaded as a plugin.
