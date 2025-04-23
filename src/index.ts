import Adb from "@devicefarmer/adbkit";
import type { Device } from "@devicefarmer/adbkit";

const client = Adb.createClient();

client
  .listDevices()
  .then((devices: Device[]) =>
    Promise.all(
      devices.map(async (device) => {
        const adbDevice = client.getDevice(device.id);
        const stream = await adbDevice.shell("seq -w 16 | xargs -n 4 echo");
        const output = await Adb.util.readAll(stream);
        console.log("[%s]\n%s", device.id, output.toString().trim());
      })
    )
  )
  .then(() => console.log("\nDone bridging."))
  .catch((err: Error) => console.error("See what went wrong:", err.stack));
