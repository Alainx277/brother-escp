import { CharacterSet, CharacterSets, textToBuffer } from "./characterSets";

/**
 * Used to arrange text for the printer.
 *
 * ```typescript
 * const page = new Page()
 *     .bold(true)
 *     .text("Hello World!")
 *     .bold(false)
 *     .emptyLine()
 *     .underline(2)
 *     .text("Can you hear me?");
 * ```
 */
export class Page {
    private chunks: Buffer[] = [];
    /**
     * The character set to encode characters with. Must match the one set on the printer.
     */
    characterSet: CharacterSet = CharacterSets.Brother;
    /**
     * If missing characters should be replaced with a replacement symbol instead of throwing an exception.
     */
    ignoreMissingCharacters: boolean = false;
    /**
     * The width to assume for the page in characters.
     */
    width: number = 48;

    toBuffer(): Buffer {
        return Buffer.concat(this.chunks);
    }

    /**
     * Prints text
     * @param text The text to print
     */
    text(text: string): this {
        this.chunks.push(textToBuffer(text, this.characterSet, !this.ignoreMissingCharacters));
        return this;
    }

    /**
     * Moves to a new line
     */
    newline(): this {
        this.chunks.push(Buffer.from("\n", "ascii"));
        return this;
    }

    /**
     * Creates an empty line
     */
    emptyLine(): this {
        this.chunks.push(Buffer.from("\n\n", "ascii"));
        return this;
    }

    /**
     * Sets the text alignment
     * @param alignment The text alignment or `null` for default
     */
    alignment(alignment: TextAlignment | null): this {
        this.chunks.push(Buffer.from([0x1B, 0x61, alignment ?? 0]));
        return this;
    }

    /**
     * Prints a line of characters
     * @param characters A string of one or more characters. Multiple characters are repeated.
     */
    line(characters: string): this {
        let lineText = "";
        for (let i = 0; i < this.width; i++) {
            lineText += characters[i % characters.length];
        }
        this.text(lineText);
        return this;
    }

    /**
     * Enables and disables italic text
     * @param state Should italics be enabled
     */
    italic(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, state ? 0x34 : 0x35]));
        return this;
    }

    /**
     * Enables and disables bold text
     * @param state Should bold text be enabled
     */
    bold(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, state ? 0x45 : 0x46]));
        return this;
    }

    /**
     * Enables and disables striked text
     * @param state Should striked text be enabled
     */
    doubleStrike(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, state ? 0x47 : 0x48]));
        return this;
    }

    /**
     * Enables and disables double width text
     * @param state Should double width text be enabled
     */
    doubleWidth(state: boolean): this {
        this.chunks.push(Buffer.from([0x1B, 0x57, state ? 0x1 : 0x0]));
        return this;
    }

    /**
     * Enables stretching text. Is automatically disabled after a line break.
     */
    autoStretch(): this {
        this.chunks.push(Buffer.from([0x1B, 0xE]));
        return this;
    }

    /**
     * Enables and disables underlined text
     * @param amount The distance of the underline. Must be between 0 and 4. 0 disables underline.
     */
    underline(amount: number): this {
        if (amount < 0 || amount > 4) {
            throw new RangeError("Underline amount must be between 0 and 4");
        }

        this.chunks.push(Buffer.from([0x1B, 0x2D, amount]));
        return this;
    }

    /**
     * Sets the space between characters
     * @param amount The amount of spacing in dots. Must be between 0 and 127.
     */
    characterSpacing(amount: number): this {
        if (amount < 0 || amount > 127) {
            throw new RangeError("Spacing must be between 0 and 127");
        }

        this.chunks.push(Buffer.from([0x1B, 0x20, amount]));
        return this;
    }

    /**
     * Sets the character size
     * @param size The size of the text. Valid values: 16, 24, 32, 48. Not all values work with all fonts.
     */
    characterSize(size: number): this {
        const buffer = Buffer.alloc(5);
        buffer.writeUint8(0x1B, 0);
        buffer.writeUint8(0x58, 1);
        buffer.writeUint8(0x0, 2);
        buffer.writeUint16LE(size, 3);
        this.chunks.push(buffer);
        return this;
    }

    /**
     * Sets the height of a line feed
     * @param dots The height of the line feed in dots
     */
    lineFeedDots(dots: number) {
        if (dots < 0 || dots > 255) {
            throw new RangeError("Dots must be between 0 and 255");
        }

        this.chunks.push(Buffer.from([0x1B, 0x33, dots]));
        return this;
    }
}

/**
 * The orientation of a page
 */
export enum Orientation {
    Portrait = 0,
    Landscape = 1,
}

/**
 * Settings for the page layout
 */
export class PageSettings {
    orientation: Orientation = Orientation.Portrait;
    topMargin: number = 0;
    bottomMargin: number = 0;
    /**
     * The page length in dots.
     * A page length of 0 means automatic.
     */
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

/**
 * Alignment of text on the page
 */
export enum TextAlignment {
    Left = 0,
    Center,
    Right
}
