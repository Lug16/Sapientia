(function (global) {
    'use strict';
    var $ = global.$;
    var version = '1.0.0';
    var culture = {material:'material',content:'contenido',questions:'preguntas',answers:'respuestas'};
    var controls = [];
        
    function sapientia(url) {
        var sapientia = objectSetter;

        $.getJSON(url, loadObjects);

        $.prototype.sapientia = sapientia;
    }
    
    global.sapientia = function (url) {
        sapientia(url);
    }
    
    var objectSetter = function(controlId) {
        var control = $(this);
        var id = controlId || control.attr('id');

        controls.push({'id':id, 'content':null});
    }
    
    function loadObjects(data)
    {   
        $.each(controls,function(i,item){
            item.content = objectGetter(data,item.id);     
        });
        
        console.info(controls);
    }
    
    function objectGetter(data, nodeName){
        var result = null;

        for(var t in data) {
          if(data[t].constructor===Array)
          {
              if(t===nodeName)
              {
                  result = data[t];
              }else{
                  objectGetter(data[t])
              }
          }
        }
        
        return result;
    }
    
    function contentAssembler(contentNode)
    {
        
    }
    
})(window);