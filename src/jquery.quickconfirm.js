/**
 * jQuery Quick Confirm
 * @version 0.0.1
 * @author Scott Rabin
 */

/**
 * @license MIT
 * Copyright (C) 2012 Scott Rabin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

;(function( $ ){

    // arrow directional assist mapping
    var opposite_direction = {
        'top' : 'bottom',
        'bottom' : 'top',
        'left' : 'right',
        'right' : 'left'
    };

    // the global defaults for all quickConfirm dialogs
    var defaults = {
        arrow : {
            height : 10,
            width : 10
        },
        // default to 'under the triggering element'
        position : 'bottom',
        // an additional class to add to the quickConfirm element
        className : '',
        // the default css properties
        css : {
            // not part of the page flow; it should render on top
            position : 'absolute',
            // the border color; can be set via css, but it would be lost on the "arrow"
            borderColor : '#ccc',
            // the background color of the dialog
            backgroundColor : 'white'
        },
        // the default contents of the quickConfirm dialog box
        contents : '<div><span>This is a test</span><a href="#" onclick="$(this).quickConfirm(\'close\'); return false;">Close dialog</a></div>'
    };

    var methods = {
        init : function( options ){
            var params = $.extend( {}, defaults, options );

            // run an initialization for each matched element
            return this.each( function(){
                // the triggering element
                var trigger = $(this),
                // for positioning
                    offset = trigger.offset(),
                // the displayed element for the quickConfirm dialog
                // reuse the old element if it exists
                    quickConfirmElement = trigger.data( 'quickConfirm.element' ) || $( document.createElement('div') );

                // apply properties to the quickConfirm element
                quickConfirmElement
                // attach it to the trigger so the dialog can be found
                    .data( 'quickConfirm.trigger', trigger )
                // append it directly to the body
                    .appendTo( 'body' )
                // add an appropriate class, plus any user-defined classes
                    .addClass( 'quickConfirm' ).addClass( params.className )
                // append the contents
                    .html( params.contents )
                // apply the styles
                    .css( params.css );

                if( null !== params.arrow ){
                    var arrowEl = $( document.createElement('div') ).addClass( 'quickConfirm-arrow' ),
                        arrowBorderEl = $( document.createElement('div') ).addClass( 'quickConfirm-arrow-border' );

                    var _width = params.arrow.width + 'px', _height = params.arrow.height + 'px',
                    _outlineWidth = (params.arrow.width + 2) + 'px', _outlineHeight = (params.arrow.height + 2) + 'px',
                    common = {
                        position : 'absolute',
                        height : 0,
                        width : 0,
                        borderStyle : 'solid'
                    };
                    var css, bordercss;

                    switch( params.position ){
                      case 'bottom' :
                        bordercss = {
                            top : - (params.arrow.height + 2),
                            left : (quickConfirmElement.outerWidth() / 2) - (params.arrow.width) - 2,
                            borderWidth : [0, _outlineWidth, _outlineWidth].join(' '),
                            borderColor : ['transparent', 'transparent', params.css.borderColor].join(' ')
                        };
                        css = {
                            top : - params.arrow.height,
                            left : (quickConfirmElement.outerWidth() / 2) - (params.arrow.width),
                            borderWidth : [0, _width, _width].join(' '),
                            borderColor : ['transparent', 'transparent', params.css.backgroundColor].join(' ')
                        };
                        break;
                    }

                    console.log( css );

                    // append the arrows
                    quickConfirmElement
                        .css( 'margin-' + opposite_direction[ params.position ], params.arrow.height )
                        .append(
                            arrowBorderEl.css( common ).css( bordercss ),
                            arrowEl.css( common ).css( css )
                        );
                }

                // add some properties to the trigger
                trigger.data( 'quickConfirm.element', quickConfirmElement );

            });
        },
        /**
         * Replaces the default options for all quickConfirm dialogs
         *
         * @param {Object} options The new default options for quickConfirm dialogs
         * @return {Object} the `defaults` object if `options` is not defined; else,
         *                   returns the chainable jQuery object
         */
        defaults : function( options ){
            // if options is not defined, return the defaults
            if( !options ) {
                return defaults;
            } else {
                // extend the defaults, deep-copy style
                $.extend( true, defaults, options );

                return this;
            }
        },
        /**
         * Closes the quickConfirm dialog
         *
         * @param {HTMLElement=} element The element associated with the quickConfirm dialog to close.
         *                               If undefined, defaults to `this`.
         * @return {jQuery} The chainable jQuery object.
         */
        close : function( element ){
            // find the quick confirm dialog
            var el = $( element || this ), qc;
            // cycle to find the element with the quickConfirm element attached
            while( el.length > 0 ){
                // if el has 'quickConfirm.trigger', that's the triggering element
                if( el.data( 'quickConfirm.trigger' ) ){
                    el = el.data( 'quickConfirm.trigger' );
                }

                // see if the element has the 'quickConfirm.element' property
                if( qc = el.data( 'quickConfirm.element' ) ){
                    // already set qc, just break out of the loop
                    break;
                }

                // no quickConfirm attributes found; try the parent
                el = el.parent();
            }

            if( qc ){
                // remove the quickConfirm data property
                el.removeData( 'quickConfirm.element' );
                // remove the quickConfirm element
                qc.remove();
            }

            // return the chainable jQuery object
            return this;
        }
    };

    // Define the prototype method
    $.fn.quickConfirm = function( method ){
        if( method && methods[method] ){
            // if a defined method is specified, pass the remaining arguments to that method handler
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ) );
        } else if( $.isPlainObject( method ) || !method ){
            // if a method is not specified, it is assumed to be options for the 'init' method
            return methods.init.apply( this, arguments );
        } else {
            // invalid options to quickConfirm
            if( console && console.error ){
                console.error( 'Invalid arguments to jQuery.quickConfirm:', arguments );
            } else {
                $.error( 'Invalid arguments to jQuery.quickConfirm: ' + Array.prototype.join.call( arguments, ', ' ) );
            }
        }
    };

})( jQuery );