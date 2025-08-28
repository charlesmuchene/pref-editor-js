import Adb, { Client, Device as FarmDevice } from "@devicefarmer/adbkit";
import { Devices } from "../types/type";

export interface AdbClient {
  listDevices(): Promise<Devices>;
  shell(serial: string, command: string): Promise<Buffer>;
}

class FarmClient implements AdbClient {
  client: Client;

  constructor() {
    this.client = Adb.createClient({
      host: this.parseHost(process.env.PREF_EDITOR_ADB_HOST),
      port: this.parsePort(process.env.PREF_EDITOR_ADB_PORT),
    });
  }

  private parseHost(hostEnv: string | undefined): string | undefined {
    if (!hostEnv) return undefined;

    // Trim whitespace
    const trimmedHost = hostEnv.trim();

    // Check if empty after trimming
    if (trimmedHost.length === 0) return undefined;

    // Check for localhost first
    if (trimmedHost === "localhost" || trimmedHost === "127.0.0.1") {
      return trimmedHost;
    }

    // Check for valid IP address (0-255 for each octet)
    const ipParts = trimmedHost.split(".");
    if (ipParts.length === 4) {
      const isValidIP = ipParts.every((part) => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
      });
      if (isValidIP) {
        return trimmedHost;
      }
    }

    // Check for valid domain name
    const domainPattern =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    if (domainPattern.test(trimmedHost)) {
      return trimmedHost;
    }

    return undefined;
  }

  private parsePort(portEnv: string | undefined): number {
    if (!portEnv) return 5037;

    const parsedPort = parseInt(portEnv, 10);
    return !isNaN(parsedPort) && parsedPort > 0 ? parsedPort : 5037;
  }

  async listDevices(): Promise<Devices> {
    return this.client
      .listDevices()
      .then((devices: FarmDevice[]) =>
        devices.map((device) => ({ serial: device.id, state: device.type }))
      );
  }

  async shell(serial: string, command: string): Promise<Buffer> {
    try {
      const device = this.client.getDevice(serial);
      const stream = await device.shell(command);
      return await Adb.util.readAll(stream);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

const client: AdbClient = new FarmClient();

export default client;
