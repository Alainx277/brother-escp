import { CharacterSet, CharacterSets, textToBuffer } from "./characterSets";

export class Page {
    private chunks: Buffer[] = [];
    characterSet: CharacterSet = CharacterSets.Brother;
    ignoreMissingCharacters: boolean = false;
    width: number = 48;

    toBuffer(): Buffer {
        return Buffer.concat(this.chunks);
    }

    text(text: string): this {
        this.chunks.push(textToBuffer(text, this.characterSet, !this.ignoreMissingCharacters));
        return this;
    }

    newline(): this {
        this.chunks.push(Buffer.from("\n", "ascii"));
        return this;
    }

    emptyLine(): this {
        this.chunks.push(Buffer.from("\n\n", "ascii"));
        return this;
    }

    alignment(alignment: TextAlignment | null): this {
        this.chunks.push(Buffer.from([0x1B, 0x61, alignment ?? 0]));
        return this;
    }

    line(characters: string): this {
        let lineText = "";
        for (let i = 0; i < this.width; i++) {
            lineText += characters[i % characters.length];
        }
        this.text(lineText);
        return this;
    }

    italic(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, state ? 0x34 : 0x35]));
        return this;
    }

    bold(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, state ? 0x45 : 0x46]));
        return this;
    }

    doubleStrike(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, state ? 0x47 : 0x48]));
        return this;
    }

    doubleWidth(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, 0x57, state ? 0x1 : 0x0]));
        return this;
    }

    autoStretch(): this {
        this.chunks.push(Buffer.from([0x1B, 0xE]));
        return this;
    }

    underline(amount: number): this {
        if (amount < 0 || amount > 4) {
            throw new RangeError("Underline amount must be between 0 and 4");
        }

        this.chunks.push(Buffer.from([0x1B, 0x2D, amount]));
        return this;
    }

    characterSpacing(amount: number): this {
        if (amount < 0 || amount > 127) {
            throw new RangeError("Spacing must be between 0 and 127");
        }

        this.chunks.push(Buffer.from([0x1B, 0x20, amount]));
        return this;
    }

    characterSize(size: number): this {
        const buffer = Buffer.alloc(5);
        buffer.writeUint8(0x1B, 0);
        buffer.writeUint8(0x58, 1);
        buffer.writeUint8(0x0, 2);
        buffer.writeUint16LE(size, 3);
        this.chunks.push(buffer);
        return this;
    }

    lineFeedDots(dots: number) {
        if (dots < 0 || dots > 255) {
            throw new RangeError("Dots must be between 0 and 255");
        }

        this.chunks.push(Buffer.from([0x1B, 0x33, dots]));
        return this;
    }
}

export enum Orientation {
    Portrait = 0,
    Landscape = 1,
}

export class PageSettings {
    orientation: Orientation = Orientation.Portrait;
    topMargin: number = 0;
    bottomMargin: number = 0;
    // a page length of 0 means automatic
    pageLength: number = 0;

    toBuffer(): Buffer {
        const buffer = Buffer.alloc(21);

        // Orientation
        buffer.writeUint8(0x1B, 0);
        buffer.writeUint8(0x69, 1);
        buffer.writeUint8(0x4C, 2);
        buffer.writeUint8(this.orientation, 3);

        // Page format
        buffer.writeUint8(0x1B, 5);
        buffer.writeUint8(0x28, 6);
        buffer.writeUint8(0x63, 7);
        buffer.writeUint8(0x4, 8);
        buffer.writeUint8(0x0, 9);
        buffer.writeUInt16LE(this.topMargin, 10);
        buffer.writeUInt16LE(this.bottomMargin, 12);

        // Page length
        buffer.writeUint8(0x1B, 14);
        buffer.writeUint8(0x28, 15);
        buffer.writeUint8(0x43, 16);
        buffer.writeUint8(0x2, 17);
        buffer.writeUint8(0x0, 18);
        buffer.writeUInt16LE(this.pageLength, 19);

        return buffer;
    }
}

export enum TextAlignment {
    Left = 0,
    Center,
    Right
}
