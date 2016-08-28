(function (global) {
    'use strict';
    var $ = global.$;
    var version = '1.0.0';
    var container = null;
    var ad = false;
    var db = null;
    var labels ={pdf:'Pdf',pps:'Presentation',vid:'Video'}

    //constructor recibiendo una url en busca del contenido
    function sapientia(url) {
        var sapientia = objectSetter;
        
        $.getJSON(url,  loadObjects);
        $.prototype.sapientia = sapientia;
    }
    
    //instancia en el objeto global una instancia
    global.sapientia = function (url) {
        sapientia(url);
    }
    
    global.sapientia.labels = labels;
    global.sapientia.version = version;
    
    //Identificador cuando se utiliza un selector
    var objectSetter = function(autodraw) {
        ad = autodraw;
        container = $(this); 
    }
    
    //Cuando recibe los objetos de la consulta JSON
    var loadObjects = function(data)
    {
        console.info(data);
        db = data;
        container.data("info",data);
        build();
    }
    
    //Construir los objetos
    var build = function()
    {
        if(ad){
            draw();
        }
    }
    
    var draw = function()
    {
        var material = db.content.material;
        drawMaterial(material,ad);
    }
    
    function applyClass(selector,oclass,withStyle)
    {
        if(withStyle){
            selector.addClass(oclass);
        }
    }
    
    var drawMaterial = function(material,withStyle)
    {
        if(material){
            var ul = $('<ul>');
            ul.attr('id','materials');    
            applyClass(ul,'nav nav-tabs nav-justified',withStyle);
            
            var expositor = $('<div>');
            expositor.attr('id','expositor');
            
            $.each(material,function(i,obj){
                var li = $('<li>');
                var a = $('<a>');
                
                if(i===0){
                    li.addClass('active');
                }
                
                li.click(function(){
                    $('#materials li').removeClass('active');
                    $(this).addClass('active');
                    var dataItem = $(this).data().info;
                    var type = dataItem.type;
                    expositor.empty();
                    var content = null;
                    
                    switch(type){
                        case 'vid':
                            expositor.addClass('embed-responsive embed-responsive-16by9');
                            
                            content = $('<video>');
                            content.attr('controls','controls');
                            content.addClass('embed-responsive-item');
                            var src = $('<source>');
                            
                            src.attr('src',dataItem.location);
                            src.attr('type','video/' + dataItem.location.slice(-3));
                            
                            content.append(src);
                            
                            
                            break;
                    }
                    
                    expositor.append(content);

                });
                
                li.data('info',obj);
                li.attr('role','material')
                a.attr('href','#');
                a.text(labels[obj.type]);
                
                li.append(a);
                ul.append(li);
            })
            
            container.append(ul);
            
            container.append(expositor);
        }
    }
    
})(window);