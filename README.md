# Cumulocity Operation Widget

## Purpose

This widget plugin allows you to send operations to a selected device in Cumulocity. Key features include:

- **Device Selection**: Choose a target device to send operations to
- **Configurable Parameters**: Define custom parameters for each operation
- **Dynamic UI**: Update parameter values directly in the UI when invoking the operation
- **Easy Integration**: Install as a plugin to any Cumulocity application

![Sample Image](assets/operation-button-pr.png)

## Configuration

Each button in the widget is configured independently with the following settings:

| Setting | Description |
|---|---|
| Button icon | Icon shown inside the button (searchable from the c8y icon set) |
| Button size | Visual size class (`btn-lg`, `btn-sm`, etc.) |
| Button label | Text displayed on the button |
| Button title | Tooltip shown on hover |
| Supported operations | Choose from the device's `c8y_SupportedOperations`, or select **Custom operation** |
| Operation fragment | The operation fragment key sent in the payload (e.g. `c8y_Restart`) |
| Requires confirmation | When enabled, a confirmation dialog is shown before the operation is sent |
| Confirmation text | Message shown in the confirmation dialog |

### Custom Operations and Operation Variables

When **Custom operation** is selected, an **Operation Value** textarea appears. Enter a valid JSON payload to be sent with the operation, for example:

```json
{ "c8y_Command": { "text": "restart" } }
```

#### Dynamic Variables

To make values user-editable at runtime, embed placeholders using the `${variableName}` syntax:

```json
{
  "c8y_Command": {
    "text": "${command}",
    "retries": "${retryCount}"
  }
}
```

The widget automatically detects every `${...}` placeholder and creates an **Operation Variables** section below the textarea. For each variable you can configure:

| Field | Description |
|---|---|
| **Type** | `text` — value is kept as a JSON string; `number` — surrounding quotes are stripped so the value becomes a raw JSON number |
| **Default value** | Pre-filled value shown to the user at runtime |

At runtime, the widget renders a collapsible **Parameters** panel below the button. The user fills in the inputs and the placeholders are substituted before the operation is dispatched. If any required field is left empty, the operation is blocked and a warning is shown.

**Number type example** — the template `"${retryCount}"` with type `number` and value `3` produces the JSON:
```json
{ "retries": 3 }
```
instead of the string `"3"`.