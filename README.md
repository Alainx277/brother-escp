# brother-escp
<img src="https://img.shields.io/npm/v/brother-escp">

An NPM package to interface with Brother receipt and label printers using ESC/P.

## Installation

`npm install brother-escp`

## Example

See the [examples folder](examples/) for more functions.

```js
import { Printer, Page, TextAlignment } from "brother-escp";

const page = new Page();
page
    .text("Normal text ")
    .bold(true)
    .text("Bold text ")
    .bold(false)
    .italic(true)
    .text("Italic text ")
    .bold(true)
    .text("Bold and italic text ")
    .bold(false).italic(false)
    .emptyLine()
    .characterSize(32)
    .text("Big text!")
    .characterSize(24)
    .emptyLine()
    .text("Characters: öhm äh u are β and man ☑ ¿¿ ╬")
    .emptyLine()
    .alignment(TextAlignment.Right)
    .text("Right text :D")
    .alignment(null);

const printer = await Printer.connect("ip address");
await printer.print(page);
await printer.disconnect();
```
