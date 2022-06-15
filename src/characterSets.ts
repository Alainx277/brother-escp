
export interface CharacterSet {
  [index: string]: number;
}

const Brother = {
    "Ç": 0x80,
    "ü": 0x81,
    "é": 0x82,
    "â": 0x83,
    "ä": 0x84,
    "à": 0x85,
    "å": 0x86,
    "ç": 0x87,
    "ê": 0x88,
    "ë": 0x89,
    "è": 0x8A,
    "ï": 0x8B,
    "î": 0x8C,
    "ì": 0x8D,
    "Ä": 0x8E,
    "Å": 0x8F,
    "É": 0x90,
    "æ": 0x91,
    "Æ": 0x92,
    "ô": 0x93,
    "ö": 0x94,
    "ò": 0x95,
    "û": 0x96,
    "ù": 0x97,
    "ÿ": 0x98,
    "Ö": 0x99,
    "Ü": 0x9A,
    "¢": 0x9B,
    "£": 0x9C,
    "¥": 0x9D,
    "ƒ": 0x9F,
    "á": 0xA0,
    "í": 0xA1,
    "ó": 0xA2,
    "ú": 0xA3,
    "ñ": 0xA4,
    "Ñ": 0xA5,
    "ª": 0xA6,
    "º": 0xA7,
    "¿": 0xA8,
    "®": 0xA9,
    "€": 0xAA,
    "½": 0xAB,
    "¼": 0xAC,
    "¡": 0xAD,
    "«": 0xAE,
    "»": 0xAF,
    "░": 0xB0,
    "▒": 0xB1,
    "▓": 0xB2,
    "│": 0xB3,
    "┤": 0xB4,
    "©": 0xB8,
    "╣": 0xB9,
    "║": 0xBA,
    "╗": 0xBB,
    "╝": 0xBC,
    "┐": 0xBF,
    "└": 0xC0,
    "┴": 0xC1,
    "┬": 0xC2,
    "├": 0xC3,
    "─": 0xC4,
    "┼": 0xC5,
    "╚": 0xC8,
    "╔": 0xC9,
    "╩": 0xCA,
    "╦": 0xCB,
    "╠": 0xCC,
    "═": 0xCD,
    "╬": 0xCE,
    "┘": 0xD9,
    "┌": 0xDA,
    "✓": 0xDB,
    "🗸": 0xDB,
    "✅": 0xDC,
    "☑": 0xDC,
    "□": 0xDF,
    "α": 0xE0,
    "β": 0xE1,
    "μ": 0xE6,
    "Ω": 0xEA,
    "δ": 0xEB,
    "ø": 0xED,
    "±": 0xF1,
    "¾": 0xF3,
    "§": 0xF5,
    "÷": 0xF6,
    "°": 0xF8,
    "·": 0xF9,
    "³": 0xFC,
    "²": 0xFD
}

// TODO: Support all character sets
export const CharacterSets = {
    Brother,
}

export function textToBuffer(text: string, characterSet: CharacterSet, throwOnMissing = true): Buffer {
    const buffer = Buffer.alloc(text.length);
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);

        // All character sets follow the ASCII standard
        if (code <= 127) {
            buffer.writeUint8(code, i);
            continue;
        }

        const character = text.charAt(i);
        let mappedCode = characterSet[character];
        // Handle unknown characters
        if (mappedCode == null) {
            if (throwOnMissing) {
                throw new RangeError(`Unsupported character '${character}'`);
            } else {
                mappedCode = characterSet["░"];
            }
        }
        buffer.writeUInt8(mappedCode, i);
    }

    return buffer;
}
