$(function(){
    $('body')
        .on('click', '.clickquick', function(){
            $(this).quickConfirm();
        });

    $('[rel]').each(function(){
        var code = $( $(this).attr('rel') );
        if( code.length > 0 ){
            code = code.text();
            $(this).bind( 'click', function() {
                eval( code );
            });
        }
    });
});