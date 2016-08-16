(function(global){
    'use strict';

    global.sapientia = function(url)
    {
        constructor(url);
    }
    
    var objectBuilder = function(controlId)
    {
        var control = $(this);
        var id = controlId || control.attr('id');

        control.addClass('sap-jumbotron').text('test');
        //console.info(url);
    }
    
    function constructor(url)
    {
        var $=global.$;
        var culture = {material:'material',content:'contenido',questions:'preguntas',answers:'respuestas'};
        var version = '1.0.0';
        var self = this;
        var url = url;
        
        var sapientia = objectBuilder;

        $.prototype.sapientia = sapientia;
    }

})(window);