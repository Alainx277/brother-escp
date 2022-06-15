import { Socket } from "net";
import PromiseSocket from "promise-socket";
import { Page, PageSettings } from "./page";

/**
 * A brother printer.
 *
 * ```typescript
 * const printer = await Printer.connect("ip address");
 * await printer.print(page);
 * await printer.disconnect();
 * ```
 */
export class Printer {
    private socket: PromiseSocket<Socket>;

    private constructor(socket: PromiseSocket<Socket>) {
        this.socket = socket;
    }

    /**
     * Connects to a printer over the network
     * @param host The ip address of the printer
     * @param port The port of the printer
     * @returns A printer instance
     */
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

    /**
     * Disconnects from the printer
     */
    async disconnect() {
       await this.socket.end();
    }

    /**
     * Prints a page on the printer
     * @param page The page to print
     * @param __namedParameters.feedPage If the page should be finished with a page feed (empty space)
     */
    async print(page: Page, { feedPage = true }) {
        let buffer = page.toBuffer();
        if (feedPage) {
            const endBuffer = Buffer.from([0x0C]);
            buffer = Buffer.concat([buffer, endBuffer])
        }
        await this.socket.writeAll(buffer);
    }

    async setPageSettings(settings: PageSettings) {
        await this.socket.writeAll(settings.toBuffer());
    }

    /**
     * Resets all current printer settings (ignores persisted settings)
     */
    async reset() {
        await this.socket.writeAll(Buffer.from([0x1B, 0x40]));
    }

    /**
     * Sends a raw buffer to the printer. Use this if a specific command is not supported.
     * @param buffer The buffer to send
     */
    async sendRaw(buffer: Buffer) {
        await this.socket.writeAll(buffer);
    }
}
