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

    // the global defaults for all quickConfirm dialogs
    var defaults = {
        arrow : {
            height : 10,
            width : 10,
            borderWidth : 1
        },
        // an additional class to add to the quickConfirm element
        className : '',
        // close the dialog when anything outside of the dialog is clicked
        closeOnBlur : true,
        // the default contents of the quickConfirm dialog box
        contents : {
            // the dialog text
            text : 'quickConfirm',
            // the 'proceed' button text
            proceed : 'Proceed',
            // the 'cancel' button text
            cancel : 'Cancel'
        },
        // the default css options to be set directly on the quickConfirm
        css : {
            position : 'absolute'
        },
        // the default 'proceed' function
        onproceed : function(){ $(this).quickConfirm('close'); },
        // the default 'cancel' function
        oncancel : function(){ $(this).quickConfirm('close'); },
        // default to 'under the triggering element'
        position : 'bottom',
        // the generic template to use when rendering objects
        template : '<span>{{text}}</span><div style="overflow: hidden;"><button style="float: left;" onclick="$(this).quickConfirm(\'cancel\');">{{cancel}}</button><button style="float: right;" onclick="$(this).quickConfirm(\'proceed\');">{{proceed}}</button></div>',
        // the generic template render function
        renderTemplate : function( str, obj ){
            obj = $.isPlainObject( obj ) ? obj : {};
            return (str || '').replace(/{{(.*?)}}/g, function(m, prop){
                return obj[prop];
            });
        }
    };

    // dynamically determine the equivalent of 'transparent'
    // (used when automatically determining border/background colors for arrows)
    var transparent = 'transparent';
    $(function(){
        var x = $('<div></div>').appendTo('body').hide().css('backgroundColor', transparent);
        transparent = x.css('backgroundColor');
        x.remove();
    });

    // arrow style assistance functions
    var arrow = {
        getPosition : function( position, qcEl, width, height, params ){
            if( position === 'bottom' ){
                return {
                    left : qcEl.outerWidth() / 2 - width,
                    top : - height
                };
            } else if( position === 'top' ){
                // because of the way outerHeight is calculated, we need to remove the borders
                return {
                    left : qcEl.outerWidth() / 2 - width,
                    top : qcEl.outerHeight() - parseInt( qcEl.css('borderTopWidth'), 10 )
                        - parseInt( qcEl.css('borderBottomWidth'), 10 )
                };
            } else if( position === 'right' ){
                return {
                    left : - width,
                    top : qcEl.outerHeight() / 2 - height
                };
            } else if( position === 'left' ){
                // because of the way outerWidth is calculated, we need to remove the borders
                return {
                    left : qcEl.outerWidth() - parseInt( qcEl.css('borderLeftWidth'), 10 )
                        - parseInt( qcEl.css('borderRightWidth'), 10 ),
                    top : qcEl.outerHeight() / 2 - height
                };
            }
        },
        getBorderColor : function( position, color ){
            var bc = ['transparent', 'transparent', 'transparent', 'transparent'];
            if(      position === 'bottom' ){ bc[2] = color; }
            else if( position === 'top'    ){ bc[0] = color; }
            else if( position === 'right'  ){ bc[1] = color; }
            else if( position === 'left'   ){ bc[3] = color; }

            return bc.join(' ');
        },
        getBorderWidth : function( position, width, height ){
            var bw = [];
            if( position === 'bottom' ){
                bw = [ 0, width, height, width ];
            } else if( position === 'top' ){
                bw = [ height, width, 0, width ];
            } else if( position === 'right' ){
                bw = [ height, width, height, 0 ];
            } else if( position === 'left' ){
                bw = [ height, 0, height, width ];
            }

            return bw.concat('').join('px ');
        },
        getStyle : function( position, width, height, color, qcEl ){
            return $.extend({
                position : 'absolute',
                height : 0,
                width: 0,
                borderStyle : 'solid',
                borderWidth : arrow.getBorderWidth( position, width, height ),
                borderColor : arrow.getBorderColor( position, color )
            }, arrow.getPosition( position, qcEl, width, height ) );
        }
    };

    var methods = {
        init : function( options ){
            var params = $.extend(true, {}, defaults, options );

            // render a template, if needed (when `contents` is a plain object
            if( $.isPlainObject( params.contents ) ){
                params.contents = params.renderTemplate( params.template, params.contents );
            }

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
                    .css( params.css )
                // bind the onproceed and oncancel handlers
                    .bind( 'proceed', params.onproceed )
                    .bind( 'cancel',  params.oncancel );

                // add some data to the trigger
                trigger.data( 'quickConfirm.element', quickConfirmElement );

                // handle the closeOnBlur option
                if( params.closeOnBlur ){
                    // attach a body handler to close this if it's not within the dialog
                    // but do it after everything else has been done
                    setTimeout( function(){
                        $('body').on('click', function closeQC( event ){
                            // was the clicked element within the dialog?
                            if( ($(event.target).closest( quickConfirmElement ).length === 0) &&
                                // and the trigger wasn't clicked a second time
                                ($(event.target).closest( trigger ).length === 0)
                              ){
                                trigger.quickConfirm('close');
                                $('body').off('click', closeQC);
                            }
                        });
                    }, 1);
                }

                // handle positioning of the element
                var pos = { top : 0, left : 0 },
                    trigger_offset = trigger.offset();
                switch( params.position ){
                  case 'bottom' :
                    // element will appear beneath the trigger element
                    pos.top = trigger_offset.top + trigger.outerHeight();

                    pos.left = trigger_offset.left + trigger.outerWidth() / 2
                        - quickConfirmElement.outerWidth() / 2;
                    break;
                  case 'top' :
                    // element will appear on top of the trigger element
                    pos.top = trigger_offset.top - quickConfirmElement.outerHeight();

                    pos.left = trigger_offset.left + trigger.outerWidth() / 2
                        - quickConfirmElement.outerWidth() / 2;
                    break;
                  case 'right' :
                    // element will appear to the right of the trigger element
                    pos.top = trigger_offset.top + trigger.outerHeight() / 2
                        - quickConfirmElement.outerHeight() / 2;

                    pos.left = trigger_offset.left + trigger.outerWidth();
                    break;
                  case 'left' :
                    // element will appear to the left of the trigger element
                    pos.top = trigger_offset.top + trigger.outerHeight() / 2
                        - quickConfirmElement.outerHeight() / 2;

                    pos.left = trigger_offset.left - quickConfirmElement.outerWidth();
                    break;
                }

                quickConfirmElement.css( pos );

                // handle arrows
                if( null !== params.arrow ){
                    var arrowEl = $( document.createElement('div') ),
                        arrowBorderEl = $( document.createElement('div') );

                    // append the elements
                    quickConfirmElement.append( arrowBorderEl, arrowEl );

                    // determine the arrow internal color
                    var color = arrowEl.css('backgroundColor');
                    arrowEl
                        .addClass( 'quickConfirm-arrow' )
                        .css(
                            arrow.getStyle(
                                params.position,
                                params.arrow.width,
                                params.arrow.height,
                                (color === transparent ?
                                 quickConfirmElement.css('backgroundColor') :
                                 color),
                                quickConfirmElement )
                        );

                    color = arrowBorderEl.css('backgroundColor');
                    arrowBorderEl
                        .addClass( 'quickConfirm-arrow-border' )
                        .css(
                            arrow.getStyle(
                                params.position,
                                params.arrow.width + params.arrow.borderWidth,
                                params.arrow.height + params.arrow.borderWidth,
                                ( color === transparent ?
                                  quickConfirmElement.css('border' + params.position.substr(0,1).toUpperCase() + params.position.substr(1) + 'Color') :
                                  color ),
                                quickConfirmElement )
                        );

                    // adjust the element position to show the arrow
                    var marg = '';
                    if( params.position === 'bottom' ){
                        marg = { marginTop : params.arrow.height + 2 };
                    } else if( params.position === 'top' ){
                        marg = { marginTop : - (params.arrow.height + 2) };
                    } else if( params.position === 'right' ){
                        marg = { marginLeft : params.arrow.width + 2 };
                    } else if( params.position === 'left' ){
                        marg = { marginLeft : - (params.arrow.width + 2) };
                    }

                    quickConfirmElement.css( marg );
                }
            });

            // jQuery chain
            return this;
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
            var el = $( element || this ),
                qc = methods.dialog( el );

            if( qc ){
                // remove the quickConfirm data property
                el.removeData( 'quickConfirm.element' );
                // remove the quickConfirm element
                qc.remove();
            }

            // return the chainable jQuery object
            return this;
        },
        /**
         * Finds the quickConfirm dialog element
         *
         * @param {HTMLElement=} element The element to find the associated quickConfirm dialog of.
         *                               If undefined, defaults to `this`.
         *
         * @return {jQuery} The quickConfirm dialog element
         */
        dialog : function( element ){
            var el = $( element || this ), qc;

            // cycle through each element
            while( el.length > 0 ){
                // if el has 'quickConfirm.trigger', that's the triggering element
                if( el.data( 'quickConfirm.trigger' ) ){
                    el = el.data( 'quickConfirm.trigger' );
                }

                // see if the element has the 'quickConfirm.element' property
                if( null != (qc = el.data( 'quickConfirm.element' )) ){
                    // already set qc, just break out of the loop
                    break;
                }

                // no quickConfirm attributes found; try the parent
                el = el.parent();
            }

            return qc;
        },
        /**
         * Triggers the 'proceed' event on the quickConfirm dialog
         *
         * @param {...} var_args Arguments to be passed to the onproceed method
         *
         * @return {jQuery} The chainable jQuery element
         */
        proceed : function(){
            // find the dialog
            var el = methods.dialog( this );

            // if it exists, trigger the 'proceed' event
            if( el ){
                el.trigger('proceed');
            }

            // chainable jQuery object
            return this;
        },
        /**
         * Triggers the 'cancel' event on the quickConfirm dialog
         *
         * @param {...} var_args Arguments to be passed to the oncancel method
         *
         * @return {jQuery} The chainable jQuery element
         */
        cancel : function(){
            // find the dialog
            var el = methods.dialog( this );

            // if it exists, trigger the 'cancel' event
            if( el ){
                el.trigger('cancel');
            }

            // chainable jQuery object
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