<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/an-old-hope.min.css">

# Creating Custom Dynamic Cell

# URL Api

The URL Api makes it easier to create a dynamic cell by providing multiple query parameters that define some of the user preferences The description of each parameter can be found below.

## Parameters

### preview

Whether the cell is rendered as a preview

*Possible values:* `true` | `false`

### w (width)

The width of the cell\
(This parameter does not exist if the `preview` parameter is set to true)

*Possible values:* `Positive number`

### h (height)

The height of the cell\
(This parameter does not exist if the `preview` parameter is set to true)

*Possible values:* `Positive number`

### bgColor

The background color of the page\
(This parameter does not exist if the `preview` parameter is set to true)

*Possible values:* `Hexadecimal code of the color`

### cellColor

The default color of a cell\
(This parameter does not exist if the `preview` parameter is set to true)

*Possible values:* `Hexadecimal code of the color`

# Widget Api

To create a good dynamic cell you should also use the Widget Api. It allows to do things that require a communication between the iframe (your dynamic cell) and the main page like creating popups and enabling context menu.

## Usage

To use the Widget Api you need to embed the script by inserting it into the html of your dynamic cell:
```html
<script src="https://widgetblocks.herokuapp.com/static/js/iframe-api.js"></script>
```
After that a `window.createWidget` function should be available in your js.

To create a widget simply call this function:
```js
const widget = window.createWidget()
```
This will enable the Widget Api and allow you to use all of the below methods.

>⚠️ **The `createWidget` function creates its own `contextmenu` listener to allow main page context menu to work properly. You should avoid creating your own `contextmenu` event listeners and stick with the ones provided by the API.**

## Methods

### addContextMenuBtn

The `addContextMenuBtn` method allows you to create custom buttons in the main context menu. The button can be either global (always in the menu) or bound to an element (in the menu only if the specified HTML element was right-clicked)

**Calling**

* addContextMenuBtn(btn: CustomBtn) - adds one global button
* addContextMenuBtn(btns: CustomBtn[]) - adds multiple global buttons
* addContextMenuBtn(el: HTMLElement, btn: CustomBtn) - adds one button to the element
* addContextMenuBtn(el: HTMLElement, btns: CustomBtn[]) - adds multiple buttons to the element

**Returns**: `number[]` - The ids of added buttons in the same order that they were provided

### removeContextMenuBtn

The `removeContextMenuBtn` method removes buttons from the main context menu by their id or an HTML element related to them.

**Calling**

* removeContextMenuBtn(id: number) - removes a single buttons by its id
* removeContextMenuBtn(ids: number[]) - removes multiple buttons by their ids
* removeContextMenuBtn(el: HTMLElement) - removes every button from an element
* removeContextMenuBtn(els: HTMLElement[]) - removes every button from all of the specified elements

### createError

Creates an error popup on the screen

**Calling**

* createError(msg: string) - shows an error with the specified message

## Types

### CustomBtn

* `text` - string (max length: 32 characters)
* `action` - a function that gets called when the button is clicked

<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js"></script>
<script>hljs.highlightAll()</script>
