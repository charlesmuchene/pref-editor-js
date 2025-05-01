import Adb, { Device as FarmDevice } from "@devicefarmer/adbkit";
import { Devices } from "../types/type";

export interface AdbClient {
  listDevices(): Promise<Devices>;
  shell(serial: string, command: string): Promise<Buffer<ArrayBufferLike>>;
}

class FarmClient implements AdbClient {
  client = Adb.createClient();

  async listDevices(): Promise<Devices> {
    return this.client
      .listDevices()
      .then((devices: FarmDevice[]) =>
        devices.map((device) => ({ serial: device.id, state: device.type }))
      );
  }

  async shell(
    serial: string,
    command: string
  ): Promise<Buffer<ArrayBufferLike>> {
    const stream = await this.client.getDevice(serial).shell(command);
    return await Adb.util.readAll(stream);
  }
}

const client: AdbClient = new FarmClient();

export default client;
