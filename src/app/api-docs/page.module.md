# Creating Custom Dynamic Cell

To facilitate the process of creating a dynamic cell, two APIs have been designed:

1. [URL Api](#url-api) - helps you on the server-side by providing information like: size of the cell, colors etc as query parameters.
2. [Widget Api](#widget-api) - helps on the client-side by communicating internally with the main page which allows you to create popups, context menu buttons, etc.

Description of both of them can be found below.

# URL Api

The URL Api makes it easier to create a dynamic cell by providing multiple query parameters that define some of the user preferences. For example if the user specified: `https://yourapp.com/cell` as a custom iframe src when creating the cell the actual src might look like this:\
`https://yourapp.com/cell?w=2&h=2&bgColor=%23212121&cellColor=%23333333`.\
The description of each parameter can be found below.

> ⚠️ **Every parameter is encoded using `encodeUriComponent` function. Always decode a parameter before using it!**

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
<script src="https://tileio.lolotoster.com/static/js/iframe-api.js"></script>
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

```js
// Example:

// add single global button (1st overload)
widget.addContextMenuBtn({
    text: "Open the app in new window",
    action: () => {
        window.open("https://yourapp.com/")
    }
})

// add multiple buttons to the element (4th overload)
const div = document.createElement("div")
widget.addContextMenuBtn(div, [
    {
        text: "Button 1",
        action: () => console.log("clicked btn 1")
    },{
        text: "Button 2",
        action: () => console.log("clicked btn 2")
    }
])
```

### removeContextMenuBtn

The `removeContextMenuBtn` method removes buttons from the main context menu by their id or an HTML element related to them.

**Calling**

* removeContextMenuBtn(id: number) - removes a single button by its id
* removeContextMenuBtn(ids: number[]) - removes multiple buttons by their ids
* removeContextMenuBtn(el: HTMLElement) - removes every button from the element
* removeContextMenuBtn(els: HTMLElement[]) - removes every button from all of the specified elements

```js
// Example:

// remove buttons by ids (2nd overload)
widget.removeContextMenuBtn([1, 2])

// remove buttons by element (3rd overload)
widget.removeContextMenuBtn(
    document.getElementById("element")
)
```

### createError

Creates an error popup on the screen

**Calling**

* createError(msg: string) - shows an error with the specified message

```js
// Example:
widget.createError("Something went wrong!")
```

## Types

### CustomBtn

* `text` - string (max length: 32 characters)
* `action` - a function that gets called when the button is clicked
