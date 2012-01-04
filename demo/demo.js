$(function(){
    $('body')
        .on('click', '.clickquick', function(){
            $(this).quickConfirm();
        });
});