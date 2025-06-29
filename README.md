# Android-Preference-Editor js library

**View** and **edit** on-device preferences: **NO ROOT** required! 🥳

> Both _legacy_ **shared** preferences and Preference **Datastore** are supported! 😎

## Requirements

-   Android [adb](https://developer.android.com/tools/adb) server
-   [Node.js](https://nodejs.org) (see [`.nvmrc`](./.nvmrc) for compatible version)

## Usage

Install the [package](https://www.npmjs.com/package/@charlesmuchene/pref-editor):

```sh
npm i @charlesmuchene/pref-editor
```

> You can override ADB **host** and **port** by setting the following environment variables:
>
> -   PREF_EDITOR_ADB_HOST
> -   PREF_EDITOR_ADB_PORT
>
> See example [use case](https://github.com/charlesmuchene/pref-editor-mcp-server/blob/db88b548abf3509890008ca2b374407db9af0b72/Dockerfile#L4-L5).

Sample code to change a user preference:

```ts
import {
    Preference,
    TypeTag,
    changePreference,
} from "@charlesmuchene/pref-editor";

const connection = {
    deviceId: "emulator-5554",
    appId: "com.charlesmuchene.datastore",
    filename: "settings.preferences_pb",
};

const pref: Preference = {
    key: "isVisited",
    value: "false",
    tag: TypeTag.BOOLEAN,
};

changePreference(pref, connection);
```

See the [Android Preferences Editor MCP server](https://github.com/charlesmuchene/pref-editor-mcp-server) project for comprehensive usages.

## Known issues

-   _string-set key-value_ preference type _operations_ are partially supported

## Build

```sh
# Clone the repository
git clone https://github.com/charlesmuchene/pref-editor-js.git
cd pref-editor

# Install dependencies and build
npm install
```

## Contributing

See [Contributing](./CONTRIBUTING.md).

## License

See [LICENSE](./LICENSE)

## Contact

For questions or support, reach out via [GitHub Issues](https://github.com/charlesmuchene/pref-editor-js/issues).
