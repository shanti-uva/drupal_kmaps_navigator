/**
 * Created by ys2n on 10/3/14.
 */

console.log("OINK");

jQuery(function ($) {


// add a new function overlayMask
    $.fn.overlayMask = function (action) {
        var mask = this.find('.overlay-mask');

        // Create the required mask
        if (!mask.length) {
            mask = $('<div class="overlay-mask"><div class="loading-container"><div class="loading"></div><div id="loading-text">Searching&#133;</div></div></div>');
            mask.css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: '0px',
                left: '0px',
                zIndex: 100,
                opacity: 9,
                backgrogroundColor: 'white'
            }).appendTo(this).fadeTo(0, 0.5).find('div').position({
                my: 'center center',
                at: 'center center',
                of: '.overlay-mask'
            })
        }

        // Act based on params

        if (!action || action === 'show') {
            mask.show();
        } else if (action === 'hide') {
            mask.hide();
        }
        return this;
    };



    console.log("BEGIN");

    var Settings = {
        type: location.pathname.indexOf('subjects') !== -1 ? "subjects" : "places",
        baseUrl: location.pathname.indexOf('subjects') !== -1 ? "http://subjects.kmaps.virginia.edu" : "http://places.kmaps.virginia.edu",
        mmsUrl: "http://mms.thlib.org",
        placesUrl: "http://places.kmaps.virginia.edu",
        subjectsUrl: "http://subjects.kmaps.virginia.edu",
        placesPath: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/places',
        subjectsPath: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/subjects',
        mediabaseURL: "http://mediabase.drupal-dev.shanti.virginia.edu"
    };
    // search min length
    const SEARCH_MIN_LENGTH = 2;

    $(function () {

        //  Let's not do this as globals....
        // set the popover defaults
     //$.fn.popover.Constructor.DEFAULTS.trigger = 'hover';
     //$.fn.popover.Constructor.DEFAULTS.placement = 'left';
     //$.fn.popover.Constructor.DEFAULTS.html = true;
     //$.fn.popover.Constructor.DEFAULTS.delay.hide = '5';
     //$.fn.popover.Constructor.DEFAULTS.container = 'body';

        $("#tree").fancytree({
            extensions: [ "filter", "glyph"],
            checkbox: false,
            selectMode: 2,
            theme: 'bootstrap',
            debugLevel: 0,
            // autoScroll: true,
            filter: {
                mode: "hide",
                leavesOnly: false
            },
            activate: function (event, data) {
                // console.log("activate " + data.node.key);

                event.preventDefault();

                var listitem = $(".title-field[kid='" + data.node.key + "']");
                $('.row_selected').removeClass('row_selected');
                $(listitem).closest('tr').addClass('row_selected');
                $('#ajax-id-' + data.node.key).once('ajax-id-' + data.node.key, function() {
                    var base = $(this).attr('id');
                    var argument = $(this).attr('argument');

                    var element_settings = {
                      url: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf(Settings.type)) + Settings.type + '/' + data.node.key + '/overview/nojs',
                      event: 'click',
                      progress: {
                        type: 'throbber'
                      }
                    };
                    Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
                    $(this).click();
                });



                // TODO: CHANGE THIS TO A CONFIGURABLE CALLBACK
                // CURRENTLY THIS IS A NASTY KLUDGE
                //var loco = ((location.pathname.indexOf('drupal')!= -1)?"/drupal/":"/") + Settings.type  + "/" + data.node.key;
                //console.log ("navigating: " + loco );
                // window.location = loco;
            },
            createNode: function (event, data) {
                console.log(data);
                var nodeUrl = location.origin + location.pathname.substring(0, location.pathname.lastIndexOf(Settings.type))  + Settings.type + '/' + data.node.key + '/overview/nojs';
                data.node.span.childNodes[2].innerHTML = '<a href="' + nodeUrl + '" class="use-ajax" id="ajax-id-' + data.node.key + '">' + data.node.title + '</a>';
                return data;
            },
            glyph: {
                map: {
                    doc: "",
                    docOpen: "",
                    error: "glyphicon glyphicon-warning-sign",
                    expanderClosed: "glyphicon glyphicon-plus-sign",
                    expanderLazy: "glyphicon glyphicon-plus-sign",
                    // expanderLazy: "glyphicon glyphicon-expand",
                    expanderOpen: "glyphicon glyphicon-minus-sign",
                    // expanderOpen: "glyphicon glyphicon-collapse-down",
                    folder: "",
                    folderOpen: "",
                    loading: "glyphicon glyphicon-refresh"
//              loading: "icon-spinner icon-spin"
                }
            },
            source: {
//          url: "/fancy_nested.json",
                url: Settings.baseUrl + "/features/fancy_nested.json?view_code=" + $('nav li.form-group input[name=option2]:checked').val(),
                cache: false,
                debugDelay: 1000,
                timeout: 30000,
                error: function (e) {
                    notify.warn("networkerror", "Error retrieving tree from kmaps server.");
                },
                beforeSend: function () {
                    maskSearchResults(true);
                },
                complete: function () {
                    maskSearchResults(false);
                }
            },
            focus: function (event, data) { /* data.node.scrollIntoView(true); */
            },
            renderNode: function (event, data) {
                if (!data.node.isStatusNode) {
                    decorateElementWithPopover(data.node.span, data.node);
                }
            },
            cookieId: "kmaps1tree", // set cookies for search-browse tree, the first fancytree loaded
            idPrefix: "kmaps1tree"
        });
    });

    function maskSearchResults(isMasked) {
        var showhide = (isMasked) ? 'show' : 'hide';
        $('.view-section>.tab-content').overlayMask(showhide);
    }

    function maskTree(isMasked) {
        var showhide = (isMasked) ? 'show' : 'hide';
        $('#tree').overlayMask(showhide);
    }

    $('#searchform').attr('autocomplete', 'off'); // turn off browser autocomplete

    //    $('.table-v').on('shown.bs.tab', function() { $('.title-field').trunk8(); });
    $('.listview').on('shown.bs.tab', function () {

        if ($('div.listview div div.table-responsive table.table-results tr td').length == 0) {
            notify.warn("warnnoresults", "Enter a search above.");
        }

        var header = (location.pathname.indexOf('subjects') !== -1) ? "<th>Name</th><th>Root Category</th>" : "<th>Name</th><th>Feature Type</th>";
        $('div.listview div div.table-responsive table.table-results tr:has(th):not(:has(td))').html(header);
        $("table.table-results tbody td span").trunk8({tooltip: false});

        if ($('.row_selected')[0]) {
            if ($('.listview')) {
                var me = $('div.listview').find('.row_selected');
                var myWrapper = me.closest('.view-wrap');
                var scrollt = me.offset().top;

                myWrapper.animate({
                    scrollTop: scrollt
                }, 2000);
            }
        }
    });
    $('.treeview').on('shown.bs.tab', function () {

        // This doesn't always scroll correctly
        var activeNode = $('#tree').fancytree("getTree").getActiveNode();
        if (activeNode) {
            activeNode.makeVisible();
        }
    });
    $('#tree').on('click', '.fancytree-statusnode-error', function () {
        $('#tree').fancytree();
    });

    function decorateElementWithPopover(elem, node) {

        if (jQuery(elem).popover) {
            jQuery(elem).attr('rel', 'popover');
            var txt = $('#searchform').val();
            jQuery(elem).popover({
                    html: true,
                    content: function () {
                        var path = $.makeArray(node.getParentList(false, true).map(function (x) {
                            return x.title;
                        })).join("/");
                        var caption = ((node.data.caption) ? node.data.caption : "");
                        var popover = "<div class='kmap-path'>/" + path + "</div>" + caption +
                            "<div class='info-wrap' id='infowrap" + node.key + "'><div class='counts-display'>...</div></div>";
                        return popover;
                    },
                    title: function () {
                        return node.title + "<span class='kmapid-display'>" + node.key + "</span>";
                    },
                    trigger: 'hover',
                    placement: 'left',
                    delay: { hide: 5 },
                    container: 'body'

                }
            );
            jQuery(elem).on('shown.bs.popover', function populateCounts(x) {
                $(".popover").addClass("search-popup"); // target css styles on search tree popups
                var counts = $("#infowrap" + node.key + " .counts-display");
                var txt = $('#searchform').val();
                $('.popover-caption').highlight(txt, {element: 'mark'});

                $.ajax({
                    type: "GET",
                    url: Settings.baseUrl + "/features/" + node.key + ".xml",
                    dataType: "xml",
                    timeout: 30000,
                    beforeSend: function () {
                        counts.html("<span class='assoc-resources-loading'>loading...</span>");
                    },
                    error: function (e) {
                        counts.html("<i class='glyphicon glyphicon-warning-sign' title='" + e.statusText);
                    },
                    success: function (xml) {
                        // force the counts to be evaluated as numbers.
                        var related_count = Number($(xml).find('related_feature_count').text());
                        var description_count = Number($(xml).find('description_count').text());
                        var place_count = Number($(xml).find('place_count').text());
                        var picture_count = Number($(xml).find('picture_count').text());
                        var video_count = Number($(xml).find('video_count').text());
                        var document_count = Number($(xml).find('document_count').text());

                        counts.html("");
                        if (video_count) counts.append("<span class='associated'><i class='icon shanticon-audio-video'></i><span class='badge' + (video_count)?' alert-success':'>" + video_count + "</span></span>");
                        if (picture_count) counts.append("<span class='associated'><i class='icon shanticon-photos'></i><span class='badge' + (picture_count)?' alert-success':'>" + picture_count + "</span></span>");
                        if (place_count) counts.append("<span class='associated'><i class='icon shanticon-places'></i><span class='badge' + (place_count)?' alert-success':'>" + place_count + "</span></span>");
                        if (description_count) counts.append("<span class='associated'><i class='icon shanticon-essays'></i><span class='badge' + (description_count)?' alert-success':'>" + description_count + "</span></span>");
                        if (related_count) counts.append("<span class='associated'><i class='icon shanticon-" + Settings.type + "'></i><span class='badge' + (related_count)?' alert-success':''>" + related_count + "</span></span>");

                    }
                });
            });
        }
        return elem;
    };

    // iCheck fixup -- added by gketuma
    $('nav li.form-group input[name=option2]').on('ifChecked', function (e) {
        var newSource = Settings.baseUrl + "/features/fancy_nested.json?view_code=" + $('nav li.form-group input[name=option2]:checked').val();
        $("#tree").fancytree("option", "source.url", newSource);
    });

    var searchUtil = {
        clearSearch: function () {
//        console.log("BANG: searchUtil.clearSearch()");
            if ($('#tree').fancytree('getActiveNode')) {
                $('#tree').fancytree('getActiveNode').setActive(false);
            }
            $('#tree').fancytree('getTree').clearFilter();
            $('#tree').fancytree("getRootNode").visit(function (node) {
                node.setExpanded(false);
            });
//        $('div.listview div div.table-responsive table.table-results').dataTable().fnDestroy();


            $('div.listview div div.table-responsive table.table-results tr').not(':first').remove();
//        $('div.listview div div.table-responsive table.table-results').dataTable();

            // "unwrap" the <mark>ed text
            $('span.fancytree-title').each(
                function () {
                    $(this).text($(this).text());
                }
            );

        }
    };

    var notify = {
        warn: function (warnid, warnhtml) {
            var wonk = function () {
                if ($('div#' + warnid).length) {
                    $('div#' + warnid).fadeIn();
                } else {
                    jQuery('<div id="' + warnid + '" class="alert alert-danger fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + warnhtml + '</div>').fadeIn().appendTo('#notification-wrapper');
                }
            }

            if ($('#notification-wrapper div#' + warnid).length) {
                $('#notification-wrapper div#' + warnid).fadeOut('slow', wonk);
            } else {
                wonk();
            }
        },

        clear: function (warnid) {

            if (warnid) {
                $('#notification-wrapper div#' + warnid).fadeOut('slow').remove()
            } else {
                $('#notification-wrapper div').fadeOut('slow').remove()
            }
        }
    }

    // SOLR AJAX
    // Adding all the "widgets" to the manager and attaching them to dom elements.

    var Manager;
    $(function () {

        AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({

            afterRequest: function () {

                $(this.target).empty();

                // Add the header row!

                var header = (location.pathname.indexOf('subjects') !== -1) ? "<th>Name</th><th>Root Category</th>" : "<th>Name</th><th>Feature Type</th>";
                $(this.target).append('<thead><tr>' + header + '</tr></thead>');

                // Add a body!

                var body = $(this.target).append('<tbody></tbody>');

                for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
                    var doc = this.manager.response.response.docs[i];
                    body.append(this.template(doc));
                }

                $(this.target).find('tr').popover(
                    {
                        trigger: 'hover',
                        placement: 'left',
                        delay: { hide: 5 },
                        container: 'body',
                        "template": '<div class="popover search-popup" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
                    }

                    // '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
                );

                $(this.target).on('click', 'tr', function (event) {
//                    console.log ("TR CLICKED " + event);
                    var kid = $(event.target).closest('.title-field').attr('kid') || $($(event.target).find('.title-field')[0]).attr('kid');
                    $('.row_selected').removeClass('row_selected');
                    $(event.target).closest('tr').addClass('row_selected');
                    $("#tree").animate({scrollTop: 0}, "slow");
                    $("#tree").fancytree('getTree').activateKey(kid);
                    /* .scrollIntoView(); */
                });


                var txt = $('#searchform').val();
//                console.log("text = " + txt);

                // trunk8 as needed.  REALLY there should be one place for adding trunk8 on changes
                $("table.table-results tbody td span").highlight(txt, {element: 'mark'}).trunk8({tooltip: false});
            },

            template: function (doc) {

                // alert(JSON.stringify(doc));
                var snippet = '';
                if (doc.header.length > 300) {
                    snippet += doc.header.substring(0, 300);
                    snippet += '<span style="display:none;">' + doc.header.substring(300);
                    snippet += '</span> <a href="#" class="more">more</a>';
                }
                else {
                    snippet += doc.header;
                }

//                console.log(JSON.stringify(doc,undefined,2));

//                console.log(doc.ancestors);

                var path = "<div class='kmap-path'>/" + $.makeArray(doc.ancestors.map(function (x) {
                        return x;
                    })).join("/") + "</div>";

//                console.log("PATH = " + path);

                var caption = ((doc.caption_eng) ? doc.caption_eng : "");
                var localid = doc.id.replace('subjects-', '').replace('places-', ''); // shave the kmaps name from the id.
                var kmapid = "<span class='kmapid-display'>" + localid + "</span>";
                var lazycounts = "<div class='counts-display'>" +
                    "<span class='assoc-resources-loading'>loading...</span>" +
                    "<span style='display: none;' class='associated'><i class='icon shanticon-audio-video'></i><span class='badge alert-success'>0</span></span>" +
                    "<span style='display: none;' class='associated'><i class='icon shanticon-photos'></i><span class='badge alert-success'>0</span></span>" +
                    "<span style='display: none;' class='associated'><i class='icon shanticon-places'></i><span class='badge alert-success'>0</span></span>" +
                    "<span style='display: none;' class='associated'><i class='icon shanticon-essays'></i><span class='badge alert-success'>0</span></span>" +
                    "<span style='display: none;' class='associated'><i class='icon shanticon-subjects'></i><span class='badge alert-success'>0</span></span>" +
                    "</div>";
                var content = path + caption + "<div class='info-wrap' id='infowrap" + localid + "'>" + lazycounts + "</div>";
                var title = doc.header + kmapid;

                var info = (doc.feature_types) ? doc.feature_types[0] : doc.ancestors[0];
                var output = '<tr rel="popover" class="title-field" kid="' + localid +
                    '" title="' + title +
                    '" data-content="' + content +
                    '" >';
                output += '<td><span>' + doc.header + ' </span></td>';
                output += '<td id="links_' + localid + '" class="links"><span>' + info + '</span></td>';
                output += '</tr>';
                return output;
            }
        });

        Manager = new AjaxSolr.Manager({
            solrUrl: 'http://kidx.shanti.virginia.edu/solr/termindex/'
        });

        // alert("adding widget!");
        Manager.addWidget(new AjaxSolr.ResultWidget({
            id: 'result',
            target: 'div.listview div div.table-responsive table.table-results'
        }));

        Manager.addWidget(new AjaxSolr.TextWidget({
            id: 'textsearch',
            target: '#searchform'
        }));

        Manager.init();
        Manager.store.addByValue('rows', 10);
        Manager.store.addByValue('q', 'name:*');
        Manager.store.addByValue('fq', 'tree:' + Settings.type);
        Manager.store.addByValue('sort', 'header asc');
        Manager.store.addByValue('df', 'name');
        // Manager.doRequest();

        Manager.addWidget(new AjaxSolr.PagerWidget({
            id: 'pager',
            target: '#pager',
            prevLabel: '&laquo;',
            nextLabel: '&raquo;',
            innerWindow: 1,
            outerWindow: 0,
            renderHeader: function (perPage, offset, total) {
                $('#pager-header').html($('<span></span>').text('displaying ' + Math.min(total, offset + 1) + ' to ' + Math.min(total, offset + perPage) + ' of ' + total));
            }
        }));

        Manager.addWidget(new AjaxSolr.FancyTreeUpdatingWidget({
            id: 'fancytree',
            target: '#tree'
        }));


        $('div.listview').on('shown.bs.popover', function (x) {
            var kid = x.target.attributes['kid'].nodeValue;
//            console.log("kid = " + kid);
            var countsElem = $("#infowrap" + kid + " .counts-display");
            var solrURL = 'http://kidx.shanti.virginia.edu/solr/kmindex/select?q=kmapid:' + Settings.type + '-' + kid + '&fq=&start=0&facets=on&group=true&group.field=service&group.facet=true&group.ngroups=true&group.limit=0&wt=json';

//            console.log("getting " + solrURL);
            $.get(solrURL, function (json) {
                var data = JSON.parse(json);
                $.each(data.grouped.service.groups, function (x, y) {
//                   console.log("groupValue: " + y.groupValue);
//                    console.log("numFound: " + y.doclist.numfound);
                });
            });

            $.ajax({
                type: "GET",
                url: Settings.baseUrl + "/features/" + kid + ".xml",
                dataType: "xml",
                timeout: 30000,
                beforeSend: function () {
                    countsElem.find('.assoc-resources-loading').show();
                    countsElem.find('.associated').hide();
                },
                error: function (e) {
                    countsElem.html("<i class='glyphicon glyphicon-warning-sign' title='" + e.statusText);
                },
                success: function (xml) {

                    // Deal with both sources?
                    // kmaps and the override with solr?
                    // Remember that document order is reverse of display order (OH CSS-hell!).

//                    console.log("SUCCESS");
//                    console.log(xml);
                    // alert(xml);

                    // force the counts to be evaluated as numbers.
                    var subject_count = (Settings.type === 'subjects') ? Number($(xml).find('related_feature_count').text()) : Number($(xml).find('subject_count').text());
                    var essay_count = Number($(xml).find('description_count').text());  // This will be overridden.
                    var place_count = (Settings.type === 'places') ? Number($(xml).find('related_feature_count').text()) : Number($(xml).find('place_count').text());
                    var picture_count = Number($(xml).find('picture_count').text()); // this will be overridden
                    var video_count = Number($(xml).find('video_count').text()); // this will be overridden
                    var document_count = Number($(xml).find('document_count').text());

                    update_counts(countsElem, {
                        videos: video_count,
                        photos: picture_count,
                        places: place_count,
                        essays: essay_count,
                        subjects: subject_count
                    });
                }
            });

            function update_counts(elem, counts) {

                if (typeof(counts.videos) != "undefined") {
                    var av = elem.find('i.shanticon-audio-video ~ span.badge');
                    (counts.videos) ? av.html(counts.videos).parent().show() : av.parent().hide();
                }

                if (typeof(counts.photos) != "undefined") {
                    var photos = elem.find('i.shanticon-photos ~ span.badge');
                    (counts.photos) ? photos.html(counts.photos).parent().show() : photos.parent().hide();
                }

                if (typeof(counts.places) != "undefined") {
                    var places = elem.find('i.shanticon-places ~ span.badge');
                    (counts.places) ? places.html(counts.places).parent().show() : places.parent().hide();
                }

                if (typeof(counts.essays) != "undefined") {
                    var essays = elem.find('i.shanticon-essays ~ span.badge');
                    (counts.essays) ? essays.html(counts.essays).parent().show : essays.parent().hide();
                }

                if (typeof(counts.subjects) != "undefined") {
                    var subjects = elem.find('i.shanticon-subjects ~ span.badge');
                    (counts.subjects) ? subjects.html(counts.subjects).parent().show() : subjects.parent().hide();
                }

                elem.find('.assoc-resources-loading').hide();
            }
        });
    });
}(jQuery));


jQuery(function ($) {
    var kms = $("#searchform"); // the main search input
    $(kms).data("holder", $(kms).attr("placeholder"));

    // --- features inputs - focusin / focusout
    $(kms).focusin(function () {
        $(kms).attr("placeholder", "");
        $("button.searchreset").show("fast");
    });
    $(kms).focusout(function () {
        $(kms).attr("placeholder", $(kms).data("holder"));
        $(kms).attr("placeholder", $(kms).data("holder"));
        $("button.searchreset").hide();

        var str = "Enter Search...";
        var txt = $(kms).val();

        if (str.indexOf(txt) > -1) {
            $("button.searchreset").hide();
            return true;
        } else {
            $("button.searchreset").show(100);
            return false;
        }
    });
    // --- close and clear all
    $("button.searchreset").click(function () {
        $(kms).attr("placeholder", $(kms).data("holder"));
        $("button.searchreset").hide();
        $(".alert").hide();
//    console.log("clearFilter()");
        $('#tree').fancytree("getTree").clearFilter();
        searchUtil.clearSearch();
    });

}(jQuery));




