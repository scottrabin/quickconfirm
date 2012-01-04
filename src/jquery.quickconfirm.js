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

    var defaults = {
        position : 'bottom',
        css : {
            position : 'absolute',
            borderColor : '#ccc'
        },
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
                // add an appropriate class
                    .addClass( 'quickConfirm' )
                // append the contents
                    .html( params.contents )
                // apply the styles
                    .css( params.css );

                // add some properties to the trigger
                trigger.data( 'quickConfirm.element', quickConfirmElement );

            });
        },
        /**
         * Replaces the default options for all quickConfirm dialogs
         *
         * @param {Object} options The new default options for quickConfirm dialogs
         * @returns {Object} the `defaults` object if `options` is not defined; else,
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
        close : function( options ){
            console.log( 'closing' );
            // find the quick confirm dialog
            var el = $(this), qc;
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