(function (global) {
    'use strict';
    var $ = global.$;
    var version = '1.0.0';
    var container = null;
    var ad = true; //autodraw
    var db = null;
	var contentTypes = ['pdf','vid','pps']

    var labels = {
        pdf: 'Pdf',
        vid: 'Video',
		pps: 'Presentación',
        materials: 'Materiales',
        activities: 'Actividades',
        tests: 'Pruebas'
    }

    //constructor recibiendo una url en busca del contenido
    function sapientia(code) {
        var sapientia = objectSetter;

        $.getJSON('http://sapientia.azurewebsites.net/api/Content?shorturl='+code+'&callback=?', loadObjects);
        $.prototype.sapientia = sapientia;
    }

    //instancia en el objeto global una instancia
    global.sapientia = function (code) {
        sapientia(code);
    }

    global.sapientia.labels = labels;
    global.sapientia.version = version;

    //Identificador cuando se utiliza un selector
    var objectSetter = function (autodraw) {
        ad = autodraw || true;

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
        drawTitle();
        drawMaterial();
        drawActivities();
        drawTests();
    }

    var drawTitle = function () {
        var title = db.name;
        var description = db.description;

        if (title) {
            var jumbotron = $('<div>');
            jumbotron.attr('id', 'sap-title')
            jumbotron.addClass('jumbotron');

            var h1 = $('<h1>');
            h1.text(title);

            jumbotron.append(h1);

            if (description) {
                var p = $('<p>');
                p.text(description);

                jumbotron.append(p);
            }

            container.append(jumbotron);
        }
    }

    var drawMaterial = function () {
        var material = db.content.material;

        if (material) {
            var wrapper = $('<div>');
            wrapper.attr('id', 'sap-materials')

            drawH2(labels.materials, wrapper);

            var ul = $('<ul>');
            ul.attr('id', 'materials');
            ul.addClass('nav nav-tabs nav-justified');

            var expositor = $('<div>');
            expositor.attr('id', 'expositor');
            expositor.addClass('embed-responsive embed-responsive-16by9');

            var currentTabs = [];

            $.each(material, function (i, obj) {
				var li = $('<li>');
                var a = $('<a>');

                if (i === 0) { //Si es el primer elemento lo activa y muestra
                    li.addClass('active');
                    var content = renderByType(obj);
                    expositor.append(content);
                }

                li.data('info', obj);
                li.attr('role', 'material')
                a.attr('href', '#');

                var indexTab = currentTabs.lastIndexOf(labels[obj.type]);

                if (indexTab >= 0) {
                    a.text(labels[contentTypes[obj.type]] + '-' + indexTab);
                } else {
                    a.text(labels[contentTypes[obj.type]]);
                }

                currentTabs.push(labels[obj.type]);
				
                li.append(a);
                ul.append(li);

                li.click(function () {
                    expositor.empty();
                    $('#materials li').removeClass('active');
                    $(this).addClass('active');
                    var dataItem = $(this).data().info;

                    var type = dataItem.type;

                    var content = renderByType(dataItem);

                    expositor.append(content);
                });
            })

            wrapper.append(ul);

            wrapper.append(expositor);

            container.append(wrapper);
        }

        function renderByType(dataItem) {
            switch (dataItem.type) {
            case 0:
                return renderPdf(dataItem);
                break;
            case 1:
                return renderVideo(dataItem);
                break;
			case 2:
                return renderPps(dataItem);
                break;
            }
        }

        function renderPdf(dataItem) {
            var content = null;
            if (dataItem) {
                if (dataItem.location) {
                    if (dataItem.location.substring(dataItem.location.length - 4, dataItem.location.length) === '.pdf') { //pdf
                        content = $('<iframe>');
                        content.addClass('embed-responsive-item');
                        content.attr('src', 'http://docs.google.com/gview?url=' + dataItem.location + '&embedded=true');
                        content.attr('width', '100%');
                        content.attr('height', '100%');
                        content.attr('frameborder', '0');
                    }
                }
            }
            return content;
        }

        function renderPps(dataItem) {
            var content = null;
            if (dataItem) {
                if (dataItem.location) {
                    if (dataItem.location.slice(-4, -1) === '.pp') { //Powerpoint pps|ppt
                        content = $('<iframe>');
                        content.addClass('embed-responsive-item');
                        content.attr('src', 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(dataItem.location));
                        content.attr('width', '100%');
                        content.attr('height', '100%');
                        content.attr('frameborder', '0');
                    }
                }
            }
            return content;
        }

        function renderVideo(dataItem) {
            var content = null;
            if (dataItem) {
                var isFile = dataItem.location.slice(-4, -3) === '.';

                if (isFile) {
                    content = $('<video>');
                    content.attr('controls', 'controls');

                    var src = $('<source>');

                    src.attr('src', dataItem.location);
                    src.attr('type', 'video/' + dataItem.location.slice(-3));

                    content.append(src);
                } else {
                    content = $('<iframe>');

                    if (dataItem.location.search('youtu') > -1) { //Si es un video de youtube
                        if (dataItem.location.search('embed') > -1) {
                            content.attr('src', dataItem.location)
                        } else {
                            content.attr('src', dataItem.location.replace('youtube.com/', 'youtube.com/embed/').replace('watch?v=', '').replace('youtu.be/', 'www.youtube.com/embed/'))
                        }
                    }
                }

                content.addClass('embed-responsive-item');
            }
            return content;
        }

    }

    var drawActivities = function () {
        var wrapper = $('<div>');
        wrapper.attr('id', 'sap-activities')
        var activities = db.content.activities;

        if (activities) {
            drawH2(labels.activities, wrapper);
        }

        container.append(wrapper);
    }

    var drawTests = function () {
        var wrapper = $('<div>');
        wrapper.attr('id', 'sap-tests')
        var tests = db.content.tests;

        if (tests) {
            drawH2(labels.tests, wrapper);
        }

        container.append(wrapper);
    }

    function drawH2(content, wrapper) {
        var title = labels.materials;
        var h2 = $('<h2>');
        h2.addClass('page-header')
        h2.text(content);

        wrapper = wrapper || container;

        wrapper.append(h2);
    }

})(window);