(function (global) {
    'use strict';
    var $ = global.$;
    var version = '1.0.0';
    var container = null;
    var ad = false;
    var db = null;
    var labels = {
        pdf: 'Pdf',
        pps: 'Presentation',
        vid: 'Video'
    }

    //constructor recibiendo una url en busca del contenido
    function sapientia(url) {
        var sapientia = objectSetter;

        $.getJSON(url, loadObjects);
        $.prototype.sapientia = sapientia;
    }

    //instancia en el objeto global una instancia
    global.sapientia = function (url) {
        sapientia(url);
    }

    global.sapientia.labels = labels;
    global.sapientia.version = version;

    //Identificador cuando se utiliza un selector
    var objectSetter = function (autodraw) {
        ad = autodraw;
        container = $(this);
    }

    //Cuando recibe los objetos de la consulta JSON
    var loadObjects = function (data) {
        console.info(data);
        db = data;
        container.data("info", data);
        build();
    }

    //Construir los objetos
    var build = function () {
        if (ad) {
            draw();
        }
    }

    var draw = function () {
        var material = db.content.material;
        drawMaterial(material, ad);
    }

    function applyClass(selector, oclass, withStyle) {
        if (withStyle) {
            selector.addClass(oclass);
        }
    }

    function renderVideo(dataItem) {
        var isFile = dataItem.location.slice(-4, -3) === '.';
        var content = null;

        if (isFile) {
            var content = $('<video>');
            content.attr('controls', 'controls');

            var src = $('<source>');

            src.attr('src', dataItem.location);
            src.attr('type', 'video/' + dataItem.location.slice(-3));

            content.append(src);
        } else {
            var content = $('<iframe>');

            if (dataItem.location.search('youtu') > -1) { //Si es un video de youtube
                if (dataItem.location.search('embed') > -1) {
                    content.attr('src', dataItem.location)
                } else {
                    content.attr('src', dataItem.location.replace('youtube.com/', 'youtube.com/embed/').replace('watch?v=', '').replace('youtu.be/', 'www.youtube.com/embed/'))
                }
            }
        }

        content.addClass('embed-responsive-item');

        return content;
    }

    var drawMaterial = function (material, withStyle) {
        if (material) {
            var ul = $('<ul>');
            ul.attr('id', 'materials');
            applyClass(ul, 'nav nav-tabs nav-justified', withStyle);

            var expositor = $('<div>');
            expositor.attr('id', 'expositor');

            var currentTabs = [];

            $.each(material, function (i, obj) {
                var li = $('<li>');
                var a = $('<a>');

                if (i === 0) {
                    li.addClass('active');
                }

                li.data('info', obj);
                li.attr('role', 'material')
                a.attr('href', '#');

                var title = '';

                var indexTab = currentTabs.lastIndexOf(labels[obj.type]);

                if (indexTab >= 0) {
                    a.text(labels[obj.type] + '-' + indexTab);
                } else {
                    a.text(labels[obj.type]);
                }

                currentTabs.push(labels[obj.type]);

                li.append(a);
                ul.append(li);

                li.click(function () {
                    $('#materials li').removeClass('active');
                    $(this).addClass('active');
                    var dataItem = $(this).data().info;
                    var type = dataItem.type;
                    expositor.empty();
                    var content = null;

                    switch (type) {
                    case 'vid':
                        expositor.addClass('embed-responsive embed-responsive-16by9');
                        content = renderVideo(dataItem);
                        break;
                    }

                    expositor.append(content);

                });
            })

            container.append(ul);

            container.append(expositor);
        }
    }

})(window);