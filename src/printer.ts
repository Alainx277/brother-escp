import { Socket } from "net";
import PromiseSocket from "promise-socket";
import { Page, PageSettings } from "./page";

export class Printer {
    private socket: PromiseSocket<Socket>;

    private constructor(socket: PromiseSocket<Socket>) {
        this.socket = socket;
    }

    static async connect(host: string, port = 9100): Promise<Printer> {
        const socket = new Socket();
        const promiseSocket = new PromiseSocket(socket);
        await promiseSocket.connect(port, host);
        // Specify ESC/P mode
        await promiseSocket.writeAll(Buffer.from([0x1B, 0x69, 0x61, 0x0]));
        const printer = new Printer(promiseSocket);
        await printer.reset();
        return printer;
    }

    async disconnect() {
       await this.socket.end();
    }

    async print(page: Page) {
        const pageBuffer = page.toBuffer();
        const endBuffer = Buffer.from([0x0C]);
        const buffer = Buffer.concat([pageBuffer, endBuffer]);
        await this.socket.writeAll(buffer);
    }

    async setPageSettings(settings: PageSettings) {
        await this.socket.writeAll(settings.toBuffer());
    }

    async reset() {
        await this.socket.writeAll(Buffer.from([0x1B, 0x40]));
    }

    async sendRaw(buffer: Buffer) {
        await this.socket.writeAll(buffer);
    }
}
