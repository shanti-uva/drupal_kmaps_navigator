/**
 * Created by ys2n on 10/3/14.
 */

(function ($) {
  Drupal.behaviors.kmaps_navigator = {
    attach: function (context, settings) {
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

        //console.log("BEGIN");

        var theType = (Drupal.settings.kmaps_explorer)? Drupal.settings.kmaps_explorer.app:"places";
        var Settings = {
            type: theType,
            baseUrl: 'http://' + theType + '.kmaps.virginia.edu',
            mmsUrl: "http://mms.thlib.org",
            placesUrl: "http://places.kmaps.virginia.edu",
            subjectsUrl: "http://subjects.kmaps.virginia.edu",
            mediabaseURL: "http://mediabase.drupal-test.shanti.virginia.edu"
        };
        // search min length
        const SEARCH_MIN_LENGTH = 2;

        $(function () {

            $("#tree").fancytree({
                extensions: [ "filter", "glyph"],
                checkbox: false,
                selectMode: 2,
                theme: 'bootstrap',
                debugLevel: 0,
                // autoScroll: true,
                autoScroll: false,
                filter: {
                    mode: "hide",
                    leavesOnly: false
                },
                activate: function (event, data) {
                    Settings.type = (Drupal.settings.kmaps_explorer)? Drupal.settings.kmaps_explorer.app:"places";
                    event.preventDefault();
                    var listitem = $(".title-field[kid='" + data.node.key + "']");
                    $('.row_selected').removeClass('row_selected');
                    $(listitem).closest('tr').addClass('row_selected');
                    $('#ajax-id-' + data.node.key).trigger('navigate').once('ajax-id-' + data.node.key, function() {
                        var base = $(this).attr('id');
                        var argument = $(this).attr('argument');
                        var url = location.origin + location.pathname.substring(0, location.pathname.indexOf(Settings.type)) + Settings.type + '/' + data.node.key + '/overview/nojs';

                        window.history.pushState({tag: true}, null, url);

                        var element_settings = {
                          url: url,
                          event: 'navigate',
                          progress: {
                            type: 'throbber'
                          }
                        };
                        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
                    }).trigger('navigate');
                },
                createNode: function (event, data) {
                    data.node.span.childNodes[2].innerHTML = '<span id="ajax-id-' + data.node.key + '">' + data.node.title + '</span>';
                    return data;
                },
                renderNode: function (event, data) {
                    data.node.span.childNodes[2].innerHTML = '<span id="ajax-id-' + data.node.key + '">' + data.node.title + '</span>';
                    var path = $.makeArray(data.node.getParentList(false, true).map(function (x) {
                        return x.title;
                    })).join("/");

                    decorateElementWithPopover(data.node.span, data.node.key, path, data.node.title, data.node.data.caption);
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
                focus: function (event, data) {
                    data.node.scrollIntoView(true);
                },
                cookieId: "kmaps1tree", // set cookies for search-browse tree, the first fancytree loaded
                idPrefix: "kmaps1tree"
            });

            $('.advanced-link').click ( function () {
                $(this).toggleClass("show-advanced",'fast');
                $(".advanced-view").slideToggle('fast');
                $(".advanced-view").toggleClass("show-options");
                $(".view-wrap").toggleClass("short-wrap"); // ----- toggle class for managing view-section height
            });

            $("#searchbutton").on('click',function() {
                // console.log("triggering doSearch!");
                $("#searchform").trigger('doSearch');
            })

            $('#searchform').attr('autocomplete', 'off'); // turn off browser autocomplete

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

            // Run when switching to tree view
            $('.treeview').on('shown.bs.tab', function () {
                var activeNode = $('#tree').fancytree("getTree").getActiveNode();
                if (activeNode) {
                    activeNode.makeVisible();
                }
            });

            // If there is a error node in fancytree.  Then you can click it to retry.
            $('#tree').on('click', '.fancytree-statusnode-error', function () {
                $('#tree').fancytree();
            });

            // iCheck fixup -- added by gketuma
            $('nav li.form-group input[name=option2]').on('ifChecked', function (e) {
                var newSource = Settings.baseUrl + "/features/fancy_nested.json?view_code=" + $('nav li.form-group input[name=option2]:checked').val();
                $("#tree").fancytree("option", "source.url", newSource);
            });

            // kludge, to prevent regular form submission.
            $('#kmaps-search form').on('submit', function(event,target) { event.preventDefault(); });

        });

        function maskSearchResults(isMasked) {
            var showhide = (isMasked) ? 'show' : 'hide';
            $('.view-section>.tab-content').overlayMask(showhide);
        }

        function maskTree(isMasked) {
            var showhide = (isMasked) ? 'show' : 'hide';
            $('#tree').overlayMask(showhide);
        }

        function decorateElementWithPopover(elem, key, title, path, caption ) {
            if (jQuery(elem).popover) {
                jQuery(elem).attr('rel', 'popover');
                jQuery(elem).popover({
                        html: true,
                        content: function () {
                            var caption = ((caption) ? caption : "");
                            var popover = "<div class='kmap-path'>/" + path + "</div>" + caption +
                                "<div class='info-wrap' id='infowrap" + key + "'><div class='counts-display'>...</div></div>";
                            return popover;
                        },
                        title: function () {
                            return title + "<span class='kmapid-display'>" + key + "</span>";
                        },
                        trigger: 'hover',
                        placement: 'left',
                        delay: { hide: 5 },
                        container: 'body'
                    }
                );

                jQuery(elem).on('shown.bs.popover', function (x) {
                    $("body > .popover").removeClass("related-resources-popover"); // target css styles on search tree popups
                    $("body > .popover").addClass("search-popover"); // target css styles on search tree popups

                    var countsElem = $("#infowrap" + key + " .counts-display");

                    // highlight matching text (if/where they occur).
                    var txt = $('#searchform').val();
                    $('.popover-caption').highlight(txt, {element: 'mark'});

                    $.ajax({
                        type: "GET",
                        url: Settings.baseUrl + "/features/" + key + ".xml",
                        dataType: "xml",
                        timeout: 30000,
                        beforeSend: function () {
                            countsElem.html("<span class='assoc-resources-loading'>loading...</span>");
                        },
                        error: function (e) {
                            countsElem.html("<i class='glyphicon glyphicon-warning-sign' title='" + e.statusText);
                        },
                        success: function (xml) {
                            Settings.type = (Drupal.settings.kmaps_explorer)? Drupal.settings.kmaps_explorer.app:"places";

                            // force the counts to be evaluated as numbers.
                            var related_count = Number($(xml).find('related_feature_count').text());
                            var description_count = Number($(xml).find('description_count').text());
                            var place_count = Number($(xml).find('place_count').text());
                            var picture_count = Number($(xml).find('picture_count').text());
                            var video_count = Number($(xml).find('video_count').text());
                            var document_count = Number($(xml).find('document_count').text());
                            var subject_count = Number($(xml).find('subject_count').text());

                            if (Settings.type === "places") {
                                place_count = related_count;
                            } else if (Settings.type === "subjects") {
                                subject_count = related_count;
                            }
                            countsElem.html("");
                            countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-audio-video'></i><span class='badge' >" + video_count + "</span></span>");
                            countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-photos'></i><span class='badge' >" + picture_count + "</span></span>");
                            countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-places'></i><span class='badge' >" + place_count + "</span></span>");
                            countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-subjects'></i><span class='badge' >" + subject_count + "</span></span>");
                            countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-essays'></i><span class='badge' >" + description_count + "</span></span>");

                        },
                        complete: function() {

                        // console.log("HRUMPHPHPHP");
                        // console.dir(Drupal.settings);
                        // console.dir(Drupal.settings);


                        var kmidxBase = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr;
                        if (!kmidxBase) {
                            kmidxBase = 'http://kidx.shanti.virginia.edu/solr/kmindex';
                            console.error("Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr not defined. using default value: " + kmidxBase );
                        }
                        var solrURL = kmidxBase + '/select?q=kmapid:' + Settings.type + '-' + key + '&fq=&start=0&facets=on&group=true&group.field=asset_type&group.facet=true&group.ngroups=true&group.limit=0&wt=json';
                            $.get(solrURL, function (json) {
                                var updates = {};
                                var data = JSON.parse(json);
                                $.each(data.grouped.asset_type.groups, function (x, y) {
                                    var asset_type = y.groupValue;
                                    var asset_count = y.doclist.numFound;
                                    updates[asset_type]=asset_count;
                                });
                                // console.log(key + "(" + title + ") : " + JSON.stringify(updates));
                                update_counts(countsElem,updates)
                            });
                        }
                    });
                });
            }



            function update_counts(elem, counts) {

                var av = elem.find('i.shanticon-audio-video ~ span.badge');
                if (typeof(counts["audio-video"]) != "undefined") {
                    (counts["audio-video"]) ? av.html(counts["audio-video"]).parent().show() : av.parent().hide();
                }
                if (Number(av.text()) > 0) { av.parent().show() }

                var photos = elem.find('i.shanticon-photos ~ span.badge');
                if (typeof(counts.photos) != "undefined") { photos.html(counts.photos) }
                (Number(photos.text()) > 0)?photos.parent().show():photos.parent().hide();

                var places = elem.find('i.shanticon-places ~ span.badge');
                if (typeof(counts.places) != "undefined") { places.html(counts.places) }
                if (Number(places.text()) > 0) { places.parent().show() }

                var essays = elem.find('i.shanticon-essays ~ span.badge');
                if (typeof(counts.texts) != "undefined") {essays.html(counts["texts"])}
                if (Number(essays.text()) > 0) { essays.parent().show() }

                var subjects = elem.find('i.shanticon-subjects ~ span.badge');
                if (typeof(counts.subjects) != "undefined") {subjects.html(counts.subjects)}
                if (Number(subjects.text()) > 0) { subjects.parent().show() }
                elem.find('.assoc-resources-loading').hide();

            }



            return elem;
        };

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
                    var header = (location.pathname.indexOf('subjects') !== -1) ? "<th>Name</th><th>Root Category</th>" : "<th>Name</th><th>Feature Type</th>";
                    $(this.target).append('<thead><tr>' + header + '</tr></thead>');
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
                            "template": '<div class="popover search-popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
                        }
                    );

                    $(this.target).on('click', 'tr', function (event) {
                        var kid = $(event.target).closest('.title-field').attr('kid') || $($(event.target).find('.title-field')[0]).attr('kid');
                        $('.row_selected').removeClass('row_selected');
                        $(event.target).closest('tr').addClass('row_selected');
                        $("#tree").animate({scrollTop: 0}, "slow");
                        $("#tree").fancytree('getTree').activateKey(kid);
                    });

                    var txt = $('#searchform').val();
                    // trunk8 as needed.  REALLY there should be one place for adding trunk8 on changes
                    $("table.table-results tbody td span").highlight(txt, {element: 'mark'}).trunk8({tooltip: false});
                },

                template: function (doc) {
                    var snippet = '';
                    if (doc.header.length > 300) {
                        snippet += doc.header.substring(0, 300);
                        snippet += '<span style="display:none;">' + doc.header.substring(300);
                        snippet += '</span> <a href="#" class="more">more</a>';
                    }
                    else {
                        snippet += doc.header;
                    }

                    var path = "<div class='kmap-path'>/" + $.makeArray(doc.ancestors.map(function (x) {
                            return x;
                        })).join("/") + "</div>";
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

                    var output = '<tr>';
                    output += '<td><span>' + doc.header + ' </span></td>';
                    output += '<td id="links_' + localid + '" class="links"><span>' + info + '</span></td>';
                    output += '</tr>';

                    var elem = $(output);
                    decorateElementWithPopover(elem,localid,doc.header,$.makeArray(doc.ancestors.map(function (x) {
                        return x;
                    })).join("/"),caption);
                    return elem;
                }
            });


        var termidx = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr_term;

        if (!termidx) {
            termidx = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr;
            termidx = termidx.replace(/kmindex/,'termindex');
        }

        if (!termidx) {
            termidx = 'http://kidx.shanti.virginia.edu/solr/termindex-dev';
        }

            Settings.type = (Drupal.settings.kmaps_explorer)? Drupal.settings.kmaps_explorer.app:"places";

            Manager = new AjaxSolr.Manager({
            solrUrl: termidx + "/"
            });

            // alert("adding widget!");
            Manager.addWidget(new AjaxSolr.ResultWidget({
                id: 'result',
                target: 'div.listview div div.table-responsive table.table-results'
            }));

            Manager.addWidget(new AjaxSolr.TextWidget({
                id: 'textsearch',
                target: '#searchform',
                notify: notify
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


    //        $('div.listview').on('shown.bs.popover', function (x) {
    //            var kid = x.target.attributes['kid'].nodeValue;
    //
    //
    //            var countsElem = $("#infowrap" + kid + " .counts-display");
    //
    //
    //            decorateElementWithPopover(countsElem, key, title, path, caption )
    //
    ////            var solrURL = 'http://kidx.shanti.virginia.edu/solr/kmindex/select?q=kmapid:' + Settings.type + '-' + kid + '&fq=&start=0&facets=on&group=true&group.field=service&group.facet=true&group.ngroups=true&group.limit=0&wt=json';
    ////
    //////            console.log("getting " + solrURL);
    ////            $.get(solrURL, function (json) {
    ////                var data = JSON.parse(json);
    ////                $.each(data.grouped.service.groups, function (x, y) {
    ////                   console.log("groupValue: " + y.groupValue);
    ////                    console.log("numFound: " + y.doclist.numFound);
    ////                });
    ////            });
    ////
    ////                timeout: 30000,
    ////            $.ajax({
    ////                type: "GET",
    ////                url: Settings.baseUrl + "/features/" + kid + ".xml",
    ////                dataType: "xml",
    ////                beforeSend: function () {
    ////                    countsElem.find('.assoc-resources-loading').show();
    ////                    countsElem.find('.associated').hide();
    ////                },
    ////                error: function (e) {
    ////                    countsElem.html("<i class='glyphicon glyphicon-warning-sign' title='" + e.statusText);
    ////                },
    ////                success: function (xml) {
    ////
    ////                    // force the counts to be evaluated as numbers.
    ////                    var subject_count = (Settings.type === 'subjects') ? Number($(xml).find('related_feature_count').text()) : Number($(xml).find('subject_count').text());
    ////                    var essay_count = Number($(xml).find('description_count').text());  // This will be overridden.
    ////                    var place_count = (Settings.type === 'places') ? Number($(xml).find('related_feature_count').text()) : Number($(xml).find('place_count').text());
    ////                    var picture_count = Number($(xml).find('picture_count').text()); // this will be overridden
    ////                    var video_count = Number($(xml).find('video_count').text()); // this will be overridden
    ////                    var document_count = Number($(xml).find('document_count').text());
    ////
    ////                    update_counts(countsElem, {
    ////                        videos: video_count,
    ////                        photos: picture_count,
    ////                        places: place_count,
    ////                        essays: essay_count,
    ////                        subjects: subject_count
    ////                    });
    ////                }
    ////            });
    //
    //        });
        });





        $(function() {
            var kms = $("#searchform"); // the main search input
            $(kms).data("holder", $(kms).attr("placeholder"));

            // --- features inputs - focusin / focusout
            $(kms).focusin(function () {
                $(kms).attr("placeholder", "");
                $("button.searchreset").show("fast");
            });
            $(kms).focusout(function () {
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
               searchUtil.clearSearch();
                $('#tree').fancytree("getTree").clearFilter();

            });
        });
    }//end of attach
  };

})(jQuery);
