# Android-Preference-Editor js library

**View** and **edit** on-device preferences: **NO ROOT** required! 🥳

> This library supports reading and writing _legacy_ **shared** preferences and **Datastore** preferences! 😎

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

    Copyright (c) 2025 Charles Muchene

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
