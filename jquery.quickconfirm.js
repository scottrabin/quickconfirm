/**
 * @license
 * jQuery Quick Confirm
 * @version 0.9
 * @author Scott Rabin
 * MIT Licensed (jquery.org/license)
 */

/**
 * Copyright (C) 2012 Scott Rabin
 *
 * MIT LICENSE
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
        // default properties for arrows
        // note - these are border widths, so they will be doubled for orthogonal directions
        arrow : {
            // the height of the arrow
            height : 10,
            // the width of the arrow
            width : 10,
            // the width of the border - 'auto' means detect automatically
            borderWidth : 'auto'
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
    },
	// Minification
	TOP = 'top', BOTTOM = 'bottom', RIGHT = 'right', LEFT = 'left',
	BACKGROUND_COLOR = 'backgroundColor',
	DATA_QC_ELEMENT = 'quickConfirm.element',
	DATA_QC_TRIGGER = 'quickConfirm.trigger',
	// lookup
	OPPOSITE = {},
	CSS_INDEX = {},
	// helpers
	E = function(tag) { return $(document.createElement(tag)); };

	OPPOSITE[TOP]     = BOTTOM;
	OPPOSITE[BOTTOM]  = TOP;
	OPPOSITE[RIGHT]   = LEFT;
	OPPOSITE[LEFT]    = RIGHT;
	
	CSS_INDEX[TOP]    = 0;
	CSS_INDEX[RIGHT]  = 1;
	CSS_INDEX[BOTTOM] = 2;
	CSS_INDEX[LEFT]   = 3;

    // dynamically determine the equivalent of 'transparent'
    // (used when automatically determining border/background colors for arrows)
    var transparent = 'transparent';
    $(function(){
        var x = E('div').appendTo('body').hide().css(BACKGROUND_COLOR, transparent);
        transparent = x.css(BACKGROUND_COLOR);
        x.remove();
    });

    // arrow style assistance functions
    var getArrowStyle = function( position, width, height, thickness, color ){
		var borderColor = [ transparent, transparent, transparent, transparent ],
		borderWidth = [ height, width, height, width ];

		// modify border properties to achieve arrow effect
		borderColor[CSS_INDEX[position]] = color;
		borderWidth[CSS_INDEX[OPPOSITE[position]]] = 0;

		return {
			// required for the angled edges to work
			height : 0,
			width: 0,

			// it always appears solid anyway because of the way the border arrow is faked
			borderStyle : 'solid',
			borderWidth : borderWidth.concat('').join('px '),
			borderColor : borderColor.join(' '),

			// position the arrow relative to the container
			position    : 'absolute',
			left        : (position === BOTTOM || position === TOP ? '50%' :
						   position === LEFT ? '100%' : 0),
			top         : (position === BOTTOM ? '0' :
						   position === TOP ? '100%' : '50%'),

			// adjust the positioning to compensate for the dimensions
			marginLeft  : -(position === TOP || position === BOTTOM ? (width + thickness)/2 :
							position === RIGHT ? width : 0),
			marginTop   : -(position === TOP ? 0 : height)
		};
	};

    var methods = {
        init : function( options ){
            var params = $.extend(true, {}, defaults, options ),

				// minification
				position = params.position,
				position_vertical = (position === TOP || position === BOTTOM);

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
					offset_left = offset[LEFT],
					offset_top = offset[TOP],
                // the displayed element for the quickConfirm dialog
                // reuse the old element if it exists
                    quickConfirmElement = (trigger.data( DATA_QC_ELEMENT ) || E('div'))
												// apply properties to the quickConfirm element
												// attach it to the trigger so the dialog can be found
												.data( DATA_QC_TRIGGER, trigger )
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
                trigger.data( DATA_QC_ELEMENT, quickConfirmElement );

                // handle the closeOnBlur option
                if( params.closeOnBlur ){
                    // attach a body handler to close this if it's not within the dialog
                    // but do it after everything else has been done
                    setTimeout( function(){
                        $('body').on('click', function closeQC( event ){
							var $target = $(event.target);
                            // was the clicked element within the dialog?
                            if( ($target.closest( quickConfirmElement ).length === 0) &&
                                // and the trigger wasn't clicked a second time
                                ($target.closest( trigger ).length === 0)
                              ){
                                trigger.quickConfirm('close');
                                $('body').off('click', closeQC);
                            }
                        });
                    }, 1);
                }

                // handle positioning of the element
                quickConfirmElement.css( {
						top  : (position === BOTTOM ? offset_top + trigger.outerHeight() : // bottom of == trigger element location plus it's height
								position === TOP    ? offset_top - quickConfirmElement.outerHeight() : // top of == trigger element location less the height of the qc dialog
													  offset_top + ( trigger.outerHeight() - quickConfirmElement.outerHeight() ) / 2) // otherwise, halfway point
					  , left : (position === LEFT   ? offset_left - quickConfirmElement.outerWidth() : // left of == trigger element less the width of the qc dialog
								position === RIGHT  ? offset_left + trigger.outerWidth() : // right of == trigger element offset plus it's width
													  offset_left + ( trigger.outerWidth() - quickConfirmElement.outerWidth() ) / 2) // otherwise, halfway
					} );

                // handle arrows
                if( null !== params.arrow ){
					// minification
					var arrowHeight = params.arrow.height,
						arrowWidth = params.arrow.width,
						arrowThickness = (params.arrow.borderWidth === 'auto' ? parseInt(quickConfirmElement.css('border-' + OPPOSITE[position] + '-width'), 10) : params.arrow.borderWidth);

                    quickConfirmElement
						// append the elements
						.append(
							// border arrow
							E('div')
								.addClass('quickConfirm-arrow-border')
								.css( getArrowStyle( position, arrowWidth + arrowThickness, arrowHeight + arrowThickness, arrowThickness, quickConfirmElement.css('border-' + OPPOSITE[position] + '-color') ) ),
							// interior element
							E('div')
								.addClass('quickConfirm-arrow')
								.css( getArrowStyle( position, arrowWidth, arrowHeight, 0, quickConfirmElement.css(BACKGROUND_COLOR)))
						)
	                    // adjust the element position to show the arrow
						.css(
							position_vertical ? 'marginTop' : 'marginLeft',
							(position_vertical ? arrowHeight : arrowWidth) * (position === TOP || position === LEFT ? -1 : 1)
						);
                }
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
            var el = $( element || this ),
                qc = methods.dialog( el );

            if( qc ){
                // remove the quickConfirm data property
                el.removeData( DATA_QC_ELEMENT );
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
                if( el.data( DATA_QC_TRIGGER ) ){
                    el = el.data( DATA_QC_TRIGGER );
                }

                // see if the element has the 'quickConfirm.element' property
                if( null != (qc = el.data( DATA_QC_ELEMENT )) ){
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
