# Android-Preference-Editor js library

**View** and **edit** on-device preferences: **NO ROOT** required! 🥳

> Both _legacy_ **shared** preferences and **Datastore** preferences are supported! 😎

## Requirements

- [Node.js](https://nodejs.org)
- Android [adb](https://developer.android.com/tools/adb)

## Usage

```ts
import { Preference, TypeTag, changePreference } from "@charlesmuchene/pref-editor";

const connection = {
    deviceId: 'emulator-5554',
    appId: 'com.charlesmuchene.datastore',
    filename: 'settings.preferences_pb',
}

const pref: Preference = {
    key: "isVisited",
    value: "false",
    tag: TypeTag.BOOLEAN,
};

changePreference(pref, connection);
```

See the [Pref-Editor MCP server](https://github.com/charlesmuchene/pref-editor-mcp-server) project on more usages.

## Known issues

- _string-set key-value_ preference type operations are partially supported

## Build

- `npm install`
- `npm run build`

## Contributing

See [Contributing](./CONTRIBUTING.md).

## License

See [LICENSE](./LICENSE)
