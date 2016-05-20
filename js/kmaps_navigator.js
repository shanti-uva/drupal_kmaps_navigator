/**
 * Created by ys2n on 10/3/14.
 */

(function ($) {

// Local "globals"
    var filtered = {};

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

    Drupal.behaviors.kmaps_navigator = {
        attach: function (context, settings) {
            var admin = settings.shanti_kmaps_admin;
            //console.dir(settings);
            //console.log(JSON.stringify(settings, undefined, 2));
            var domain = (settings.kmaps_explorer) ? settings.kmaps_explorer.app : 'places';
            var root_kmap_path = domain == 'subjects' ? admin.shanti_kmaps_admin_root_subjects_path : admin.shanti_kmaps_admin_root_places_path;
            var base_url = domain == 'subjects' ? admin.shanti_kmaps_admin_server_subjects : admin.shanti_kmaps_admin_server_places;
            var root_kmapid = domain == 'subjects' ? admin.shanti_kmaps_admin_root_subjects_id : admin.shanti_kmaps_admin_root_places_id;

            var pickFilter = function (namespace, filter_type, suggestion) {
                var filterBox = $('#' + namespace + '_filter_box_' + filter_type);
                var kmap_id = 'F' + suggestion.id;
                var item = {
                    domain: 'subjects', // default
                    id: suggestion.id,
                    header: suggestion.value,
                    path: '{{' + suggestion.id + '}}'
                };
                if (!filtered[namespace][filter_type][kmap_id]) {
                    filtered[namespace][filter_type][kmap_id] = item;
                    // addPickedItem(filterBox, kmap_id, item);
                    // function addPickedItem(containerElement, kmap_id, item) {
                    var pickedElement = $("<div/>").addClass('selected-kmap ' + kmap_id).appendTo(filterBox);
                    $("<span class='icon shanticon-close2'></span>").addClass('delete-me').addClass(kmap_id).appendTo(pickedElement);
                    $("<span>" + item.header + " " + kmap_id + "</span>").addClass('kmap_label').appendTo(pickedElement);
                    pickedElement.attr({
                        'data-kmap-id-int': item.id,
                        'data-kmap-path': item.path,
                        'data-kmap-header': item.header
                    });
                    Drupal.attachBehaviors(pickedElement);
                }
            };

            var extractKMapID = function (line) {
                var kmap_id = null;
                var rgx1 = /\s(\w?\d+)$/;
                var matches = rgx1.exec(line);
                if (matches != null) {
                    var kmap_id = matches[1];
                }
                return kmap_id;
            };

            $('.kmap_filter_box').once('kmaps-navigator').each(function () {
                var filter_type = $(this).attr('data-search-filter');
                var namespace = $(this).attr('id').replace('_filter_box_' + filter_type, '');
                if (!filtered[namespace]) {
                    filtered[namespace] = {};
                }
                filtered[namespace][filter_type] = {}; // Init filters for this field
            });

            $('.kmap_filter_box .delete-me').once('kmaps-navigator').on('click', function (e) {
                var $filter_el = $(this).parent();
                var $filter_box = $(this).closest('.kmap_filter_box');
                var filter_type = $filter_box.attr('data-search-filter'); //feature_type or associated_subject
                var namespace = $filter_box.attr('id').replace('_filter_box_' + filter_type, '');
                var other_type = (filter_type == 'feature_type') ? 'associated_subject' : 'feature_type';
                var kmap_id = extractKMapID($(this).next('span.kmap_label').html());
                var $filter = $('#' + namespace + '_search_filter_' + filter_type);
                var filter_field = filter_type + "_ids";
                var search_key = $filter.typeahead('val'); //get search term
                // var $typeahead = $('#' + my_field + '_search_term');
                // KMapsUtil.removeFilters($typeahead, filter_field, filtered[my_field][filter_type]);
                delete filtered[namespace][filter_type][kmap_id];
                KMapsUtil.trackTypeaheadSelected($filter, filtered[namespace][filter_type]);
                $filter_el.remove();
                var fq = KMapsUtil.getFilters(filter_field, filtered[namespace][filter_type], $filter_box.hasClass('kmaps-conjunctive-filters') ? 'AND' : 'OR');
                // $typeahead.kmapsTypeahead('addFilters', fq).kmapsTypeahead('setValue', $typeahead.typeahead('val'), false);
                $('#' + namespace + '_search_filter_' + other_type).kmapsTypeahead('refetchPrefetch', fq);
                $filter.kmapsTypeahead('refacetPrefetch', fq);
                $filter.kmapsTypeahead('setValue', search_key, false); // 'false' prevents dropdown from re-opening
            });

            $('.kmap_search_filter', context).once('kmaps-navigator').each(function () {
                var $filter = $(this);
                var filter_type = $filter.attr('data-search-filter'); //feature_type or associated_subject
                var filter_field = filter_type + "_ids";
                var $filter_box = $('#kmaps_navigator_filter_box_' + filter_type);
                var namespace = $filter_box.attr('id').replace('_filter_box_' + filter_type, '');
                var search_key = '';
                //var $typeahead = $('#' + namespace + '_search_term');
                $filter.kmapsTypeahead({
                    term_index: admin.shanti_kmaps_admin_server_solr_terms,
                    domain: 'subjects', // always Filter by Subject
                    filters: KMapsUtil.getFilterQueryForFilter(filter_type),
                    ancestors: 'off',
                    min_chars: 0,
                    selected: 'omit',
                    prefetch_facets: 'on',
                    prefetch_field: filter_type + 's', //feature_types or associated_subjects
                    prefetch_filters: ['tree:' + domain, 'ancestor_id_path:' + root_kmap_path],
                    max_terms: 20
                }).bind('typeahead:asyncrequest',
                    function () {
                        search_key = $filter.typeahead('val'); //get search term
                    }
                ).bind('typeahead:select',
                    function (ev, suggestion) {
                        if (suggestion.count > 0) { // should not be able to select zero-result filters
                            //KMapsUtil.removeFilters($typeahead, filter_field, filtered[namespace][filter_type]);
                            var mode = suggestion.refacet ? 'AND' : 'OR';
                            pickFilter(namespace, filter_type, suggestion);
                            $filter_box.toggleClass('kmaps-conjunctive-filters', mode == 'AND');
                            KMapsUtil.trackTypeaheadSelected($filter, filtered[namespace][filter_type]);
                            var fq = KMapsUtil.getFilters(filter_field, filtered[namespace][filter_type], mode);
                            // $typeahead.kmapsTypeahead('addFilters', fq).kmapsTypeahead('setValue', $typeahead.typeahead('val'), false);
                            var other_type = (filter_type == 'feature_type') ? 'associated_subject' : 'feature_type';
                            $('#' + namespace + '_search_filter_' + other_type).kmapsTypeahead('refetchPrefetch', fq);
                            $filter.kmapsTypeahead('refacetPrefetch', fq);
                            $filter.kmapsTypeahead('setValue', search_key, false);
                        }
                    }
                );
            });

            $('#kmaps-search', context).once('kmaps-navigator').each(function () {

                var $typeahead = $('#searchform', this);
                var search = $typeahead.hasClass('kmap_no_search') ? false : true;
                var search_key = '';

                var my_field = $typeahead.attr('id').replace('_search_term', '');
                var $tree = $('#tree');


                ////   RECONFIGURE HERE!

                $tree.kmapsTree({
                    termindex_root: admin.shanti_kmaps_admin_server_solr_terms,
                    kmindex_root: admin.shanti_kmaps_admin_server_solr,
                    type: domain,
                    root_kmap_path: root_kmap_path,
                    baseUrl: base_url
                }).on('useractivate', function (ev, data) {

                    var domain = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";
                    console.dir(ev);
                    console.dir(data);
                    console.log(root_kmapid);
                    Drupal.ajax["ajax-id-" + root_kmapid].createAction(data.key, domain);
                    ev.stopImmediatePropagation();
                    return false;
                });

                if (search) {
                    $typeahead.kmapsTypeahead({
                        menu: $('.listview > .view-wrap'),
                        term_index: admin.shanti_kmaps_admin_server_solr_terms,
                        domain: domain,
                        root_kmapid: root_kmapid,
                        max_terms: 20,
                        min_chars: 1,
                        pager: 'on',
                        filters: admin.shanti_kmaps_admin_solr_filter_query ? admin.shanti_kmaps_admin_solr_filter_query : '',
                        no_results_msg: 'Showing the whole tree.'
                    }).kmapsTypeahead('onSuggest',
                        function (suggestions) {
                            if (suggestions.length == 0) {
                                $tree.kmapsTree('reset', function () {
                                    $tree.fancytree('getTree').getNodeByKey(root_kmapid).scrollIntoView(true);
                                });
                            }
                            else {
                                $tree.kmapsTree('showPaths',
                                    $.map(suggestions, function (val) {
                                        return '/' + val['doc']['ancestor_id_path'];
                                    }),
                                    function () {
                                        // mark already picked items - do it more efficiently?
                                        //for (var kmap_id in picked[my_field]) {
                                        //    $('#ajax-id-' + kmap_id.substring(1), $tree).addClass('picked');
                                        //}
                                        // scroll to top - doesn't work
                                        $tree.fancytree('getTree').getNodeByKey(root_kmapid).scrollIntoView(true);
                                    }
                                );
                            }
                        }
                    ).bind('typeahead:asyncrequest',
                        function () {
                            search_key = $typeahead.typeahead('val'); //get search term
                        }
                    ).bind('typeahead:select',
                        function (ev, suggestion) {
                            var id = suggestion.doc.id.substring(suggestion.doc.id.indexOf('-') + 1);
                            console.log(JSON.stringify(suggestion, undefined, 2));
                        }
                    ).bind('typeahead:cursorchange',
                        function (ev, suggestion) {
                            if (typeof suggestion != 'undefined') {
                                var tree = $tree.fancytree('getTree');
                                var id = suggestion.doc.id.substring(suggestion.doc.id.indexOf('-') + 1);
                                tree.activateKey(id);
                                tree.getNodeByKey(id).scrollIntoView();
                            }
                        }
                    ).on('input',
                        function () {
                            if (this.value == '') {
                                search_key = '';
                                $tree.kmapsTree('reset', function () {
                                    $tree.fancytree('getTree').getNodeByKey(root_kmapid).scrollIntoView(true);
                                });
                            }
                        }
                    );
                }
                /*
                 $('#kmaps-search').once('fancytree', function () {
                 var theType = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";

                 // Root redirect to "places"
                 if (window.location.pathname === Drupal.settings.basePath) {
                 var loc = Drupal.settings.basePath + theType;
                 console.log("REDIRECTING TO " + loc);
                 window.location.href = loc;
                 }

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

                 // $(function () {

                 $("#tree").fancytree({
                 extensions: ["filter", "glyph"],
                 checkbox: false,
                 selectMode: 2,
                 theme: 'bootstrap',
                 debugLevel: 1,
                 // autoScroll: true,
                 autoScroll: false,
                 filter: {
                 mode: "hide",
                 leavesOnly: false
                 },
                 activate: function (event, data) {
                 //console.log("ACTIVATE:");
                 //console.dir(data);

                 Settings.type = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";
                 // event.preventDefault();
                 var listitem = $("td[kid='" + data.node.key + "']");
                 $('.row_selected').removeClass('row_selected');
                 $(listitem).closest('tr').addClass('row_selected');

                 var url = location.origin + location.pathname.substring(0, location.pathname.indexOf(Settings.type)) + Settings.type + '/' + data.node.key + '/overview/nojs';
                 $(data.node.span).find('#ajax-id-' + data.node.key).trigger('navigate');
                 },
                 createNode: function (event, data) {
                 //console.log("createNode: " + data.node.span)
                 //console.dir(data);
                 data.node.span.childNodes[2].innerHTML = '<span id="ajax-id-' + data.node.key + '">' + data.node.title + '</span>';

                 //console.log("STATUS NODE: " + data.node.isStatusNode());
                 //data.node.span.childNodes[2].innerHTML = '<span id="ajax-id-' + data.node.key + '">' + data.node.title + '</span>';
                 var path = $.makeArray(data.node.getParentList(false, true).map(function (x) {
                 return x.title;
                 })).join("/");

                 var theElem = data.node.span;
                 var theKey = data.node.key;
                 var theType = Settings.type;
                 var theTitle = data.node.title;
                 var theCaption = data.node.data.caption;

                 decorateElementWithPopover(theElem, theKey, theTitle, path, theCaption);
                 decorateElemWithDrupalAjax(theElem, theKey, theType);

                 return data;
                 },
                 renderNode: function (event, data) {
                 data.node.span.childNodes[2].innerHTML = '<span id="ajax-id-' + data.node.key + '">' + data.node.title + '</span>';
                 //console.log("renderNode: " + $(data.node.span).val());
                 //console.dir(data);
                 //
                 //console.log("Status Node? " + data.node.isStatusNode());
                 //console.log("Loading? " + data.node.isLoading());

                 //console.log(JSON.stringify(event) + ": " + data.node.statusNodeType);

                 if (!data.node.isStatusNode()) {

                 //console.log("STATUS NODE: " + data.node.isStatusNode());
                 data.node.span.childNodes[2].innerHTML = '<span id="ajax-id-' + data.node.key + '">' + data.node.title + '</span>';
                 var path = $.makeArray(data.node.getParentList(false, true).map(function (x) {
                 return x.title;
                 })).join("/");


                 decorateElementWithPopover(data.node.span, data.node.key, data.node.title, path, data.node.data.caption);
                 $(data.node.span).find('#ajax-id-' + data.node.key).once('nav', function () {
                 var base = $(this).attr('id');
                 var argument = $(this).attr('argument');
                 var url = location.origin + location.pathname.substring(0, location.pathname.indexOf(Settings.type)) + Settings.type + '/' + data.node.key + '/overview/nojs';

                 var element_settings = {
                 url: url,
                 event: 'navigate',
                 progress: {
                 type: 'throbber'
                 }
                 };
                 Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
                 //this.click(function () {
                 //    console.log("pushing state for " + url);
                 //    window.history.pushState({tag: true}, null, url);
                 //});
                 });
                 }

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
                 timeout: 90000,
                 error: function (e) {
                 notify.warn("networkerror", "Error retrieving tree from kmaps server. Error: " + e.message);
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
                 create: function (evt, ctx) {
                 //console.log("EVENT: Create");
                 //console.dir(evt);
                 //console.dir(ctx);
                 },

                 loadChildren: function (evt, ctx) {
                 // console.log("pathname = " + window.location.pathname);
                 // console.log("baseType = "  + Drupal.settings.basePath + Settings.type);


                 //if (window.location.pathname === Drupal.settings.basePath + Settings.type) {
                 //console.dir(Drupal);
                 //console.log("EVENT: loadChildren");
                 //console.dir(evt);
                 //console.dir(ctx);

                 //console.log("YEERT: " + Settings.type);
                 var startId = Drupal.settings.shanti_kmaps_admin['shanti_kmaps_admin_root_' + Settings.type + '_id'];

                 if (startId) {
                 //ctx.tree.activateKey(startId);
                 var startNode = ctx.tree.getNodeByKey(startId);
                 if (startNode) {
                 console.log("autoExpanding node: " + startNode.title + " (" + startNode.key + ")");
                 try {
                 startNode.setExpanded(true);
                 startNode.makeVisible();
                 } catch (e) {
                 console.err("autoExpand failed")
                 }
                 }
                 }
                 //}
                 },
                 cookieId: "kmaps1tree", // set cookies for search-browse tree, the first fancytree loaded
                 idPrefix: "kmaps1tree"
                 });

                 */
                $('.advanced-link').click(function () {
                    $(this).toggleClass("show-advanced", 'fast');
                    $(".advanced-view").slideToggle('fast');
                    $(".advanced-view").toggleClass("show-options");
                    $(".view-wrap").toggleClass("short-wrap"); // ----- toggle class for managing view-section height
                });

                $("#searchbutton").on('click', function () {
                    console.log("triggering doSearch!");
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
                    //});

                });

                // Run when switching to tree view
                $('.treeview').on('shown.bs.tab', function () {
                    var activeNode = $('#tree').fancytree("getTree").getActiveNode();
                    if (activeNode) {
                        activeNode.makeVisible();
                    }
                });


                function maskSearchResults(isMasked) {
                    var showhide = (isMasked) ? 'show' : 'hide';
                    $('.view-section>.tab-content').overlayMask(showhide);
                }

                function maskTree(isMasked) {
                    var showhide = (isMasked) ? 'show' : 'hide';
                    $('#tree').overlayMask(showhide);
                }

                function decorateElementWithPopover(elem, key, title, path, caption) {
                    //console.log("decorateElementWithPopover: "  + elem);
                    if (jQuery(elem).popover) {
                        jQuery(elem).attr('rel', 'popover');

                        //console.log("caption = " + caption);
                        jQuery(elem).popover({
                                html: true,
                                content: function () {
                                    caption = ((caption) ? caption : "");
                                    var popover = "<div class='kmap-path'>/" + path + "</div>" + "<div class='kmap-caption'>" + caption + "</div>" +
                                        "<div class='info-wrap' id='infowrap" + key + "'><div class='counts-display'>...</div></div>";
                                    //console.log("Captioning: " + caption);
                                    return popover;
                                },
                                title: function () {
                                    return title + "<span class='kmapid-display'>" + key + "</span>";
                                },
                                trigger: 'hover',
                                placement: 'left',
                                delay: {hide: 5},
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
                                url: settings.baseUrl + "/features/" + key + ".xml",
                                dataType: "xml",
                                timeout: 90000,
                                beforeSend: function () {
                                    countsElem.html("<span class='assoc-resources-loading'>loading...</span>");
                                },
                                error: function (e) {
                                    countsElem.html("<i class='glyphicon glyphicon-warning-sign' title='" + e.statusText);
                                },
                                success: function (xml) {
                                    settings.type = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";

                                    // force the counts to be evaluated as numbers.
                                    var related_count = Number($(xml).find('related_feature_count').text());
                                    var description_count = Number($(xml).find('description_count').text());
                                    var place_count = Number($(xml).find('place_count').text());
                                    var picture_count = Number($(xml).find('picture_count').text());
                                    var video_count = Number($(xml).find('video_count').text());
                                    var document_count = Number($(xml).find('document_count').text());
                                    var subject_count = Number($(xml).find('subject_count').text());

                                    if (settings.type === "places") {
                                        place_count = related_count;
                                    } else if (settings.type === "subjects") {
                                        subject_count = related_count;
                                    }
                                    countsElem.html("");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-audio-video'></i><span class='badge' >" + video_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-photos'></i><span class='badge' >" + picture_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-places'></i><span class='badge' >" + place_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-subjects'></i><span class='badge' >" + subject_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-texts'></i><span class='badge' >" + description_count + "</span></span>");

                                },
                                complete: function () {

                                    var fq = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_solr_filter_query;

                                    var project_filter = (fq) ? ("&" + fq) : "";
                                    var kmidxBase = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr;
                                    if (!kmidxBase) {
                                        kmidxBase = 'http://kidx.shanti.virginia.edu/solr/kmindex';
                                        console.error("Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr not defined. using default value: " + kmidxBase);
                                    }
                                    var solrURL = kmidxBase + '/select?q=kmapid:' + settings.type + '-' + key + project_filter + '&start=0&facets=on&group=true&group.field=asset_type&group.facet=true&group.ngroups=true&group.limit=0&wt=json';
                                    // console.log ("solrURL = " + solrURL);
                                    $.get(solrURL, function (json) {
                                        //console.log(json);
                                        var updates = {};
                                        var data = JSON.parse(json);
                                        $.each(data.grouped.asset_type.groups, function (x, y) {
                                            var asset_type = y.groupValue;
                                            var asset_count = y.doclist.numFound;
                                            updates[asset_type] = asset_count;
                                        });
                                        //console.log(key + "(" + title + ") : " + JSON.stringify(updates));
                                        update_counts(countsElem, updates)
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
                        if (Number(av.text()) > 0) {
                            av.parent().show()
                        }

                        var photos = elem.find('i.shanticon-photos ~ span.badge');
                        if (typeof(counts.photos) != "undefined") {
                            photos.html(counts.photos)
                        }
                        (Number(photos.text()) > 0) ? photos.parent().show() : photos.parent().hide();

                        var places = elem.find('i.shanticon-places ~ span.badge');
                        if (typeof(counts.places) != "undefined") {
                            places.html(counts.places)
                        }
                        if (Number(places.text()) > 0) {
                            places.parent().show()
                        }

                        var essays = elem.find('i.shanticon-texts ~ span.badge');
                        if (typeof(counts.texts) != "undefined") {
                            essays.html(counts["texts"])
                        }
                        if (Number(essays.text()) > 0) {
                            essays.parent().show()
                        }

                        var subjects = elem.find('i.shanticon-subjects ~ span.badge');
                        if (typeof(counts.subjects) != "undefined") {
                            subjects.html(counts.subjects)
                        }
                        if (Number(subjects.text()) > 0) {
                            subjects.parent().show()
                        }
                        elem.find('.assoc-resources-loading').hide();

                    }


                    return elem;
                };

                /*function decorateElemWithDrupalAjax(theElem, theKey, theType) {
                 //console.log("decorateElementWithDrupalAjax: "  + $(theElem).html());
                 $(theElem).once('nav', function () {
                 //console.log("applying click handling to " + $(this).html());
                 var base = $(this).attr('id') || "ajax-wax-" + theKey;
                 var argument = $(this).attr('argument');
                 var url = location.origin + location.pathname.substring(0, location.pathname.indexOf(theType)) + theType + '/' + theKey + '/overview/nojs';

                 var element_settings = {
                 url: url,
                 event: 'navigate',
                 progress: {
                 type: 'throbber'
                 }
                 };

                 // console.log("Adding to ajax to " + base);

                 Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
                 //this.click(function () {
                 //    console.log("pushing state for " + url);
                 //    window.history.pushState({tag: true}, null, url);
                 //});
                 });
                 };*/

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
                //
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
                // If there is a error node in fancytree.  Then you can click it to retry.
                $('#tree').on('click', '.fancytree-statusnode-error', function () {
                    $('#tree').fancytree();
                });

                // iCheck fixup -- added by gketuma
                $('nav li.form-group input[name=option2]').on('ifChecked', function (e) {
                    var newSource = settings.baseUrl + "/features/fancy_nested.json?view_code=" + $('nav li.form-group input[name=option2]:checked').val();
                    $("#tree").fancytree("option", "source.url", newSource);
                });

                // kludge, to prevent regular form submission.
                $('#kmaps-search form').on('submit', function (event, target) {
                    event.preventDefault();
                    return false;
                });
            }); // end of once
        }

        //end of attach
    };


    // Custom method to execute this ajax action...
    Drupal.ajax.prototype.executeAction = function () {
        var ajax = this;


        // return false;

        // hey buzz off, we're already busy!
        if (ajax.ajaxing) {
            //console.log("WE ARE ALREADY EXECUTING")
            return false;
        }

        try {
            //console.log("WE ARE AJAXING")
            $.ajax(ajax.options);
        }
        catch (err) {
            console.error("Could not process process: " + ajax.options.url);
            console.dir(ajax.options);
            return false;
        }

        return false;
    }

    // Create the custom actions and execute it

    Drupal.ajax.prototype.createAction = function ($id, $app) {
        var admin = Drupal.settings.shanti_kmaps_admin;
        var domain = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";
        var baseUrl = Drupal.settings.basePath;

        // append terminal slash if there isn't one.
        if (!/\/$/.test(baseUrl)) {
            baseUrl += "/";
        }

        // probably should prevent regenerating an ajax action that already exists... Maybe using . once()?
        var settings = {
            url: baseUrl + $app + '/' + $id + '/overview/ajax',
            event: 'click',
            keypress: false,
            prevent: false
        }

        if (!Drupal.ajax['navigate-' + $app + '-' + $id]) {
            //console.error("Adding ajax to navigate-" + $app + '-' + $id);
            Drupal.ajax['navigate-' + $app + '-' + $id] = new Drupal.ajax(null, $('<br/>'), settings);
        }
        //console.error("Executing action navigate-" + $app + '-' + $id);
        Drupal.ajax['navigate-' + $app + '-' + $id].executeAction();
    }


})(jQuery);
