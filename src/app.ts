require("@dotenvx/dotenvx").config();
import Adb from "@devicefarmer/adbkit";

async function main() {
  const client = Adb.createClient();
  const adbDevice = client.getDevice(process.env.SERIAL!);
  const stream = await adbDevice.shell("seq -w 16 | xargs -n 4 echo");
  const output = await Adb.util.readAll(stream);
  console.log("%s", output.toString().trim());
}

main().catch(console.error);
