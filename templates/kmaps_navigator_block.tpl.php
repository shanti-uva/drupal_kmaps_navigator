<?php
/**
 * @file
 */
?>


<?php 
//error_log("Yo bang on the new template!  What to do now?"); 
?>

<section id="kmaps-search" role="search">
    <!-- BEGIN Input section -->
    <section class="input-section" style="display:none;">
        <form class="form">
            <fieldset>
                <div class="search-group">
                    <div class="input-group" id="searcharea">
                        <input id="kmaps-navigator-search-term" type="text" class="form-control kms" placeholder="Enter Search...">
                        <span class="input-group-btn">
                          <button type="button" class="btn btn-default" id="searchbutton"><span class="icon"></span></button>
                          <button type="reset" class="btn searchreset"><span class="icon"></span></button>
                        </span>
                    </div>

                    <!-- search scope -->
                    <div class="form-group">
<!--                        <label class="checkbox-inline"><input type="checkbox" id="summaryscope" name="summary-scope" checked="checked" data-value="summaries">Summaries</label>
                        <label class="checkbox-inline" ><input type="checkbox" id="essayscope" name="essay-scope" data-value="essays">Essays</label>
-->
                        <a href="#" class="advanced-link toggle-link" style="display:block;"><span class="icon"></span>Advanced</a>
                    </div>
                </div>

<!--                <div id="notification-wrapper"></div> -->


                <section class="advanced-view">
<!--                    <div class="form-group" id="searchScopeGroup">
                        <label class="radio-inline" for="scopeAll">
                            <input type="radio" name="scope" id="scopeAll" value="all" checked="checked">
                            All Text</label>
                        <label class="radio-inline" for="scopeName">
                            <input type="radio" name="scope" id="scopeName" value="name">
                            Name </label>
                    </div>

                    <div class="form-group" id="searchAnchorGroup">
                        <label class="radio-inline" for="anchorContains">
                            <input type="radio" name="anchor" id="anchorContains" value="contains" checked="checked">
                            Contains</label>
                        <label class="radio-inline" for="anchorStartsWith">
                            <input type="radio" name="anchor" id="anchorStartsWith" value="startsWith">
                            Starts With</label>
                        <label class="radio-inline" for="anchorExact">
                            <input type="radio" name="anchor" id="anchorExact" value="exact">
                            Exactly</label>
                    </div>
-->

                    <!-- feature type -->
                    <div class="advanced-input kmap-filter form-wrapper">
<!--                        <span class="filter type"><label>Filter:</label> <span id="matches1"></span></span>
-->
                        <label><span>Filter:</span> Select Feature Types</label>
                        <input id="kmaps-navigator-search-filter-feature_type" class="kmap-search-filter form-control" data-search-filter="feature_type" type="text" placeholder="Filter by Feature Type">
                        <div id="kmaps-navigator-filter-box-feature_type" class="kmap-filter-box form-wrapper" data-search-filter="feature_type"> </div>
<!--                        <button id="feature1a-reset" class="feature-reset"><span class="icon"></span></button>

                        <div class="dropdown-menu feature-menu dropdown-type">
                            <div class="tree-wrap">

                                <div class="feature-container">
                                    <div id="feature-tree1"></div>
                                </div>

                                <div class="feature-submit">
                                    <button type="button" id="feature1-select" class="btn btn-default">Select</button>
                                    <button type="reset" id="feature1b-reset" class="btn btn-default clear-form">Cancel<span class="icon"></span></button>
                                </div>

                            </div>
                        </div>
-->
                    </div>


                    <!-- associated subject -->
                    <div class="advanced-input kmap-filter form-wrapper">
<!--                        <span class="filter subject"><label>Filter:</label> <span id="matches2"></span></span>
-->
                        <label><span>Filter:</span> Select Associated Subjects</label
                        <input id="kmaps-navigator-search-filter-associated_subject" class="kmap-search-filter form-control" data-search-filter="associated_subject" type="text" placeholder="Filter by Associated Subject">
                        <div id="kmaps-navigator-filter-box-associated_subject" class="kmap-filter-box form-wrapper" data-search-filter="associated_subject"> </div>
<!--                        <button id="feature2a-reset" class="feature-reset"><span class="icon"></span></button>

                        <div class="dropdown-menu feature-menu dropdown-subject">
                            <div class="tree-wrap">

                                <div class="feature-container">
                                    <div id="feature-tree2"></div>
                                </div>

                                <div class="feature-submit">
                                    <button type="button" id="feature2-select" class="btn btn-default">Select</button>
                                    <button type="reset" id="feature2b-reset" class="btn btn-default clear-form">Cancel<span class="icon"></span></button>
                                </div>

                            </div>
                        </div>
-->
                    </div>

                    <!-- feature 3 region -->
 <!--                   <div class="form-group advanced-input feature-group dropdown" style="border-top:none;">
                        <span class="filter region"><label>Filter:</label> <span id="matches3"></span></span>
                        <input class="form-control feature-region" id="feature-region" name="feature-region" type="text" placeholder="Filter by Feature Region">
                        <button id="feature3a-reset" class="feature-reset"><span class="icon"></span></button>

                        <div class="dropdown-menu feature-menu dropdown-region">
                            <div class="tree-wrap">

                                <div class="feature-container">
                                    <div id="feature-tree3"></div>
                                </div>

                                <div class="feature-submit">
                                    <button type="button" id="feature3-select" class="btn btn-default">Select</button>
                                    <button type="reset" id="feature3b-reset" class="btn btn-default clear-form">Cancel<span class="icon"></span></button>
                                </div>

                            </div>
                        </div>
                        -
                    </div> --> <!-- END feature-group -->

                    <!--
                    <div class="form-group advanced-input select-type" >
                        <span>Show only results containing:</span>
                        <select class="selectpicker" id="selector1" name="selector1" data-selected-text-format="count" data-header="Select one or <b>more...</b>" data-width="100%" multiple >
                            <option data-icon="shanticon-essays">Essays</option>
                            <option data-icon="shanticon-places">Places</option>
                            <option data-icon="shanticon-agents">Agents</option>
                            <option data-icon="shanticon-events">Events</option>
                            <option data-icon="shanticon-photos">Photos</option>
                            <option data-icon="shanticon-audio-video">Audio-Video</option>
                            <option data-icon="shanticon-visuals">Visuals</option>
                            <option data-icon="shanticon-texts">Texts</option>
                            <option data-icon="shanticon-terms">Terms</option>
                            <option data-icon="shanticon-sources">Sources</option>
                        </select>
                    </div>
                    <div class="form-group advanced-input select-type">
                        <div class="form-group advanced-input select-type">
                            <span>Show only feature types:</span>
                            <select class="selectpicker" id="feature_types" name="selector2" data-selected-text-format="count" data-header="Select one <b>or</b> more..." data-width="100%" multiple >
                                <option>Essays</option>
                                <option>Essays</option>
                                <option>Essays</option>
                                <option>Essays</option>
                                <option>Essays</option>
                                <option>Essays</option>
                                <option>Essays</option>
                            </select>
                        </div>
                    </div> -->

                </section><!-- END advanced section -->
            </fieldset>
        </form>

    </section> <!-- END input section -->

    <!-- BEGIN view section -->
    <section class="view-section">
        <ul class="nav nav-tabs">
            <li class="treeview active"><a href=".treeview" data-toggle="tab"><span class="icon shanticon-tree"></span>Tree</a></li>
            <li class="listview"><a href=".listview" data-toggle="tab"><span class="icon shanticon-list"></span>List</a></li>
        </ul>
        <div class="tab-content">
            <!-- TAB - tree view -->
            <div class="treeview tab-pane active">
                <div id="tree" class="view-wrap"><!-- view-wrap controls tree container height --></div>
            </div>
            <!-- TAB - list view -->
            <div class="listview tab-pane">
                <div id="pager" class="pagination"></div>

                <div class="view-wrap"> <!-- view-wrap controls container height -->
                    <div class="table-responsive">
                        <table class="table table-condensed table-results">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Feature Type</th>
                            </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                        <div id="pager-header"></div>
                    </div>
                </div>
            </div>
        </div>

    </section><!-- END view section -->
</section><!-- END kmaps-search -->
