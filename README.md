# Pref Editor

**View** and **edit** Android on-device preferences: **NO ROOT** required! 🥳

> Both _legacy_ **shared** preferences and Preference **Datastore** are supported! 😎

## Requirements

-   Android [adb](https://developer.android.com/tools/adb) server
-   [Node.js](https://nodejs.org) (see [`.nvmrc`](./.nvmrc) for compatible version)

## Usage

Install the [package](https://www.npmjs.com/package/@charlesmuchene/pref-editor):

```sh
npm i @charlesmuchene/pref-editor
```

### Configuration

You can override ADB connection settings with environment variables:

```bash
export PREF_EDITOR_ADB_HOST=localhost
export PREF_EDITOR_ADB_PORT=5037
export PREF_EDITOR_WATCHER_INTERVAL_MS=3000  # Max 180000 (3 minutes)
```

### Basic Usage

```typescript
import {
    Preference,
    TypeTag,
    changePreference,
    watchPreference,
} from "@charlesmuchene/pref-editor";

const connection = {
    deviceId: "emulator-5554",
    appId: "com.charlesmuchene.datastore",
    filename: "settings.preferences_pb",
};

// Change a preference
const pref: Preference = {
    key: "isVisited",
    value: "false",
    type: TypeTag.BOOLEAN,
};

await changePreference(pref, connection);

// Watch for preference changes (NEW: EventEmitter pattern)
const watch = await watchPreference({ key: "isVisited" }, connection);

watch.emitter.on("change", (newValue, preference) => {
    console.log(`Preference changed: ${preference.key} = ${newValue}`);
});

watch.emitter.on("error", (error) => {
    console.error("Watch error:", error);
});

// Clean up when done
watch.close();
```

### API Reference

| Function                                   | Description                  |
| ------------------------------------------ | ---------------------------- |
| `addPreference(preference, connection)`    | Add a new preference         |
| `changePreference(preference, connection)` | Modify existing preference   |
| `deletePreference(key, connection)`        | Remove a preference          |
| `watchPreference(key, connection)`         | Watch for preference changes |
| `readPreferences(connection)`              | Read all preferences         |

See the [Android Preferences Editor MCP server](https://github.com/charlesmuchene/pref-editor-mcp-server) project for comprehensive usage examples.

## Known Issues

-   _string-set key-value_ preference type operations are partially supported

## Development

```bash
# Clone the repository
git clone https://github.com/charlesmuchene/pref-editor-js.git
cd pref-editor-js

# Install dependencies
npm install

# Run verification (lint, build, test, coverage)
npm run verify
```

For detailed development setup and workflow, see [DEV.md](./DEV.md).

## Contributing

We welcome contributions! Please see:

-   [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
-   [DEV.md](./DEV.md) - Development setup and workflow

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and add tests
4. Run verification: `npm run verify`
5. Submit a pull request with title format: `feat:`, `fix:`, or `BREAKING:`

## License

See [LICENSE](./LICENSE)

## Support

-   📖 **Documentation**: [DEV.md](./DEV.md) for development setup
-   🐛 **Bug Reports**: [GitHub Issues](https://github.com/charlesmuchene/pref-editor-js/issues)
-   💡 **Feature Requests**: [GitHub Issues](https://github.com/charlesmuchene/pref-editor-js/issues)
-   🤝 **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Changelog

### v1.0.0 (Upcoming)

-   **BREAKING**: `watchPreference` now uses EventEmitter pattern instead of streams
-   **NEW**: Added 3-minute maximum limit for watch intervals
-   **IMPROVED**: Better error handling and event management

See [releases](https://github.com/charlesmuchene/pref-editor-js/releases) for full changelog.
