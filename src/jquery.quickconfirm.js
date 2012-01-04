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
        contents : '<div>This is a test</div>'
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
                // the css object (for mandatory properties beyond typical styling)
                    cssProperties = { position : 'absolute' },
                // the displayed element for the quickConfirm dialog
                    quickConfirmElement = $( document.createElement('div') );

                // apply properties to the quickConfirm element
                quickConfirmElement
                // append it directly to the body
                    .appendTo( 'body' )
                // add an appropriate class
                    .addClass( 'quickConfirm' )
                // append the contents
                    .html( params.contents )
                // apply the styles
                    .css( cssProperties );

                // add some properties to the trigger
                trigger.data( 'quickConfirm.element', quickConfirmElement );

            });
        },
        /**
         * Replaces the default options for all quickConfirm dialogs
         *
         * @param {Object} options The new default options for quickConfirm dialogs
         */
        defaults : function( options ){
            $.extend( defaults, options );

            return this;
        },
        close : function( options ){

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