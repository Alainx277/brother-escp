import { Printer, Page, PageSettings, Orientation, TextAlignment } from "../dist/index.js";

const page = new Page();
page.ignoreMissingCharacters = true;
page
    .lineFeedDots(0)
    .text("Normal text ")
    .bold(true)
    .text("Bold text ")
    .bold(false)
    .italic(true)
    .text("Italic text ")
    .bold(true)
    .text("Bold and italic text ")
    .bold(false).italic(false)
    .doubleStrike(true)
    .text("Striked text")
    .doubleStrike(false)
    .emptyLine()
    .autoStretch()
    .text("Stretched text")
    .emptyLine()
    .characterSize(32)
    .text("Big text!")
    .characterSize(24)
    .emptyLine()
    .underline(2)
    .text("Underline text yeah")
    .underline(0)
    .emptyLine()
    .text("Characters: öhm äh u are β and man ☑ ¿¿ ╬ invālid")
    .emptyLine()
    .alignment(TextAlignment.Right)
    .text("Right text :D")
    .alignment(null)
    .emptyLine()
    .line("-=");

const printer = await Printer.connect(process.argv[2]);
console.log("Connected to printer");

const settings = new PageSettings();
settings.orientation = Orientation.Landscape;
await printer.setPageSettings(settings);

await printer.print(page);
console.log("Finished printing");

await printer.disconnect();
