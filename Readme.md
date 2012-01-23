# quickConfirm : a jQuery Plugin

quickConfirm is a lightweight (~1.5 kB) jQuery plugin that provides a quick and non-obtrusive way to request confirmation from users without using disruptive modal dialogs. There are no stylesheets or external dependencies aside from jQuery 1.7+.

See the demos at http://scottrabin.github.com/quickconfirm

### Examples

```javascript
$('#quickconfirm-trigger').quickConfirm({
	contents  : {
		text : "A quickConfirm dialog box"
	},
	onproceed : takeAction
});
```

The above example would display a small, minimally-styled dialog underneath the triggering element `#quickconfirm-trigger`. Additionally, simple tooltip-type dialogs can be generated by replacing the `contents` object with simple text:

```javascript
$('#quickconfirm-trigger').quickConfirm({
	contents : "This is a tooltip-type dialog box"
});
```

More examples can be seen on the demo page: http://scottrabin.github.com/quickconfirm

### Documentation

The following methods and options are available in the quickConfirm plugin. They are called in a jQueryUI fashion by invoking `$(selector).quickConfirm( methodName, args... );` If the first argument is a string, it will be used as the `methodName` parameter. If it is a plain object or falsy (i.e. `!method === true`), then the method is assumed to be `init` and is passed as the `options` hash  to the `init` method.

Arguments denoted with square brackets [] are considered optional. Default values will be denoted when appropriate. All functions return the initial jQuery object for chaining except where otherwise specified.

#### Methods

**init** *([options])*

> Initializes the quickConfirm dialog using the default parameters, extended by the `options` object (if supplied). Subsequent calls to `init` while the dialog is open will re-render all of the dialog contents, but will not replace the existing dialog element. Events such as `proceed` and `cancel` bound to the dialog element will not be lost when calling `init` multiple times.

**close** *([element])*

> Closes the quickConfirm dialog associated with the `element` (or the current selection, if not defined). If `element` is a child element of the quickConfirm dialog, or is a trigger element of a quickConfirm dialog, then that quickConfirm dialog element will be removed from the DOM. If no quickConfirm dialog can be found, no action will be taken.

**defaults** *([options])*

> If `options` is an object, then the default options for all quickConfirm elements will be extended with the supplied properties via deep copy with `$.extend`. If options is undefined or falsy, the current `defaults` object will be returned.

**dialog** *([element])*

> Returns the quickConfirm dialog element associated with the specified element (or the current selection, if not defined). Associated elements include the trigger element from which the quickConfirm dialog was generated and all descendant elements of the quickConfirm dialog itself (including the dialog). If no quickConfirm dialog can be found, returns `undefined`.

**proceed** *([args...])*

> Triggers the `proceed` event of the quickConfirm dialog.

**cancel** *([args...])*

> Triggers the `cancel` event of the quickConfirm dialog.

---

#### Events

The following events are triggered directly from the quickConfirm dialog element (selectable via `$(selector).quickConfirm('dialog')...`)

**proceed**

> Triggered via `$(selector).quickConfirm('proceed');`. By default, triggered when the `Proceed` button is clicked.

**cancel**

> Triggered via `$(selector).quickConfirm('proceed');`. By default, triggered when the `Cancel` button is clicked.

---

#### Options

These options may be specified by overwriting the global defaults via `$.fn.quickConfirm( 'defaults', options );` or by passing in a per-instance options hash when initializing a quickConfirm dialog.

**arrow** : `{ height : 10, width : 10, borderWidth : 1 }`

> Changes the height, width, and border width of the CSS-only arrow. All values are in `px`.

**className** : `''`

> The specified className will be added to the quickConfirm dialog element

**closeOnBlur** : `true`

> Determines the behavior of clicking outside of the quickConfirm dialog element. If true (the default), clicking outside the dialog or trigger element will invoke the `close` method on the dialog. If false, the dialog must be closed manually.

**template** : `[String]`

> The default template string used to render the HTML content of a quickConfirm dialog box

**renderTemplate** : `function( str, obj )`

> renderTemplate takes a template string (as defined by `options.template`) and renders it by inserting the values defined in `obj`. quickConfirm comes with a lightweight templating system that replaces any text of the `template` surrounded by double braces (`{{property}}`) with the value of the corresponding property in the context object (`obj[property]`). The function stub matches with several other templating engines such as Underscore.js and can be easily embedded into quickConfirm. See the demo for example code.

**contents** : `{ text : 'quickConfirm', proceed : 'Proceed', cancel : 'Cancel' }`

> The `contents` object contains the key/value pairs used to render the `template` using the `renderTemplate` function.

**css** : `{ position : 'absolute' }`

> Any CSS attributes passed to quickConfirm will be set directly on the quickConfirm dialog element via `$(quickConfirmElement).css( options.css )`. Changing the `position` attribute to anything other than `absolute` is strongly discouraged, but available for use in certain uncommon cases.

**onproceed** : `function(){ $(this).quickConfirm('close'); }`

**oncancel**  : `function(){ $(this).quickConfirm('close'); }`

> The `onproceed` and `oncancel` callback functions can be directly overridden to provide flexible control over the dialog behavior. The default behavior is to simply close the dialog. Providing alternatives to either of these functions will disable the default close behavior unless deliberately specified.

**position** : `'bottom'`

> Controls the relative positioning of the quickConfirm dialog. The default behavior shows the dialog beneath the triggering element, but can be set to any of `bottom`, `top`, `right`, `left`.
