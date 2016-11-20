(function (global) {
    'use strict';
    var $ = global.$;
    var version = '1.0.0';
    var container = null;
    var ad = true; //autodraw
    var db = null;
    var contentTypes = ['pdf', 'vid', 'pps']
    var msgTypes = Object.freeze({ info: 0, success: 1, error: 2 });

    var labels = {
        pdf: 'Pdf',
        vid: 'Video',
        pps: 'Presentación',
        materials: 'Materiales',
        activities: 'Actividades',
        hypotheses: 'Hipótesis',
        tests: 'Pruebas'
    }

    var fonsUrl = '';

    //constructor recibiendo una url en busca del contenido
    function sapientia(code) {
        $.prototype.sapientia = objectSetter

        var jqxhr = $.getJSON(fonsUrl + '/api/Content?shorturl=' + code + '&callback=?', loadObjects);

        jqxhr.fail(function (response) {
            displayMessage(response.statusText + " - " + response.status, msgTypes.error)
        });
    }

    //instancia el objeto global
    global.sapientia = function (code, url) {
        fonsUrl = url || 'http://sapientia.azurewebsites.net';
        sapientia(code);
    }

    global.sapientia.labels = labels;
    global.sapientia.version = version;

    //Identificador cuando se utiliza un selector
    var objectSetter = function (autodraw) {
        ad = autodraw || true;
        container = $(this);
        container.css('padding-bottom', '10px');

        drawMessenger();

        var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

        if (isFirefox) {
            displayMessage('Firefox is not well supported', msgTypes.error);
        }
    }

    //Crea el objeto que se utilizará como repositorio de mensajes
    function drawMessenger() {
        var div = $('<div>');

        div.attr('id', 'msgbox');

        container.append(div);
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
        drawHypotheses();
        //drawActivities();
        //drawTests();
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
                case 1:
                    return renderVideo(dataItem);
                case 2:
                    return renderPps(dataItem);
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

    var drawHypotheses = function () {
        var hypotheses = db.content.hypotheses;
        var questions = db.content.questions;

        if (hypotheses) {
            var wrapper = $('<div>');
            wrapper.attr('id', 'sap-hypotheses')

            drawH2(labels.hypotheses, wrapper);

            var hypContainer = $('<div>');

            hypContainer.attr('id', 'hypContainer');

            $.each(hypotheses, function (i, obj) {
                var panel = $('<div>');
                panel.attr('id', 'hyp_' + i);
                $.data(panel[0], 'dataItem', obj);
                panel.addClass('panel panel-primary');
                panel.css('width', (100 / hypotheses.length) - (hypotheses.length * 1) + '%');
                panel.css('margin', '2px');
                panel.css('vertical-align', 'top');

                if (hypotheses.length > 1) {
                    panel.css('display', 'inline-block');
                }

                panel.on('drop dragdrop', function (e) {
                    var sourceId = '#' + e.originalEvent.dataTransfer.getData("text");
                    var sourceHeigth = $(sourceId).height() + $(sourceId).outerHeight();

                    var panelBody = $(this).children().last();

                    var panelBodyHeight = (panelBody.children().length * sourceHeigth) + sourceHeigth;

                    panelBody.css('background-color', '#eee');
                    panelBody.height(panelBodyHeight);
                    panelBody.append($(sourceId));

                    var qContainer = $('#qContainer');
                    if (!qContainer.children().length) {
                        qContainer.text('Drag here question without hypothesys');
                        qContainer.addClass('panel-heading');
                    }
                });
                panel.on('dragenter', function (event) {
                    event.preventDefault();
                })
                panel.on('dragleave', function () {
                    $(this).children().last().css('background-color', '#eee');
                })
                panel.on('dragover', function (event) {
                    event.preventDefault();
                    $(this).children().last().css('background-color', 'gray');
                })

                var panelTitle = $('<div>');
                panelTitle.addClass('panel-heading');
                panelTitle.text(obj.desc);

                var panelBody = $('<div>');
                panelBody.height(30).css('background-color', '#eee');

                panel.append(panelTitle);
                panel.append(panelBody);

                hypContainer.append(panel);
            });

            var qContainer = $('<div>');
            qContainer.attr('id', 'qContainer');

            qContainer.on('drop dragdrop', function (e) {
                var sourceId = '#' + e.originalEvent.dataTransfer.getData("text");
                if (!$(this).children().length) {
                    $(this).empty();
                }
                $(this).css('background-color', '#fff');
                $(this).append($(sourceId));
            });
            qContainer.on('dragleave', function () {
                $(this).css('background-color', '#fff');
            })
            qContainer.on('dragover', function () {
                event.preventDefault();
                $(this).css('background-color', 'gray');
            })
            qContainer.on('dragenter', function (event) {
                event.preventDefault();
            })

            $.each(questions, function (i, obj) {
                var qdiv = $('<div>');
                $.data(qdiv, 'dataItem', obj);
                qdiv.text(obj.desc);

                qdiv.attr('id', 'q_' + i);
                qdiv.attr('draggable', 'true');
                qdiv.on('dragstart', function (e) {
                    e.originalEvent.dataTransfer.setData('text', this.id);
                });
                qdiv.addClass('panel-heading');
                qdiv.css('border', 'solid 1px gainsboro').css('margin-bottom', '5px').css('background-color', '#fff');

                qContainer.append(qdiv);
            });

            var btnPlay = $('<button>');
            btnPlay.addClass('btn btn-success');
            btnPlay.text('Play');

            btnPlay.on('click', function () {
                var hypContainer = $("#hypContainer");
                $.each(hypContainer.children(), function (i, obj) {
                    var key = $.data(obj, 'dataItem').key;
                    var panelBody = $(obj).children().last();
                    var answersInside =panelBody.children();

                    if(answersInside.length > 0)
                    {
                        $.each(answersInside,function(j,ob){
                            //TODO: Validate body answers
                        });
                    }                         
                });
            });

            wrapper.append(hypContainer);
            wrapper.append(qContainer);
            wrapper.append(btnPlay);
            container.append(wrapper);
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
        var h2 = $('<h2>');
        h2.addClass('page-header')
        h2.text(content);

        wrapper = wrapper || container;

        wrapper.append(h2);
    }

    function displayMessage(msg, type) {
        var msgbox = $('#msgbox');
        msgbox.text(msg);
        msgbox.removeClass();

        if (type == msgTypes.success) {
            msgbox.addClass('alert alert-success');
        } else if (type == msgTypes.error) {
            msgbox.addClass('alert alert-danger');
        } else {
            msgbox.addClass('alert alert-info');
        }
    }

})(window);