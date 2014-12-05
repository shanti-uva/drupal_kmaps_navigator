<?php
/**
 * @file
 */
?>


<?php error_log("Yo bang on the new template!  What to do now?"); ?>

<section id="kmaps-search" role="search">
    <!-- BEGIN Input section -->
    <section class="input-section" style="display:none;">
        <form class="form">
            <fieldset>
                <div class="search-group">
                    <div class="input-group" id="searcharea">
                        <input type="text" class="form-control kms" id="searchform" placeholder="Enter Search...">
                        <span class="input-group-btn">
                          <button type="button" class="btn btn-default" id="searchbutton"><i class="icon"></i></button>
                          <button type="reset" class="btn searchreset"><i class="icon"></i></button>
                        </span>
                    </div>

                    <!-- search scope -->
                    <div class="form-group">
                        <label class="checkbox-inline"><input type="checkbox" id="summaryscope" name="summary-scope" checked="checked" data-value="summaries">Summaries</label>
                        <label class="checkbox-inline" ><input type="checkbox" id="essayscope" name="essay-scope" data-value="essays">Essays</label>
                        <a href="#" class="advanced-link toggle-link"><i class="icon"></i>Advanced</a>
                    </div>
                </div><!-- END search group -->

                <div id="notification-wrapper"></div>

                <section class="advanced-view" style="display:none;">
                    <div class="form-group" id="searchScopeGroup">
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



                    <!-- feature 1 type -->
                    <div class="form-group advanced-input feature-group dropdown" style="display:none;">
                        <span class="filter type"><label>Filter:</label> <span id="matches1"></span></span>
                        <input class="form-control feature-type" id="feature-type" name="feature-type" type="text" placeholder="Filter by Feature Type">
                        <button id="feature1a-reset" class="feature-reset"><i class="icon"></i></button>

                        <div class="dropdown-menu feature-menu dropdown-type">
                            <div class="tree-wrap">

                                <div class="feature-container">
                                    <div id="feature-tree1"></div> <!-- features tree, under construction -->
                                </div>

                                <div class="feature-submit">
                                    <button type="button" id="feature1-select" class="btn btn-default">Select</button>
                                    <button type="reset" id="feature1b-reset" class="btn btn-default clear-form">Cancel<i class="icon"></i></button>
                                </div>

                            </div>
                        </div> <!-- END dropdown-menu -->
                    </div> <!-- END feature-group -->


                    <!-- feature 2 subject -->
                    <div class="form-group advanced-input feature-group dropdown" style="border-top:none;display:none;">
                        <span class="filter subject"><label>Filter:</label> <span id="matches2"></span></span>
                        <input class="form-control feature-subject" id="feature-subject" name="feature-subject" type="text" placeholder="Filter by Feature Subject">
                        <button id="feature2a-reset" class="feature-reset"><i class="icon"></i></button>

                        <div class="dropdown-menu feature-menu dropdown-subject">
                            <div class="tree-wrap">

                                <div class="feature-container">
                                    <div id="feature-tree2"></div> <!-- features tree, under construction -->
                                </div>

                                <div class="feature-submit">
                                    <button type="button" id="feature2-select" class="btn btn-default">Select</button>
                                    <button type="reset" id="feature2b-reset" class="btn btn-default clear-form">Cancel<i class="icon"></i></button>
                                </div>

                            </div>
                        </div> <!-- END dropdown-menu -->
                    </div> <!-- END feature-group -->


                    <!-- feature 3 region -->
                    <div class="form-group advanced-input feature-group dropdown" style="border-top:none;display:none;">
                        <span class="filter region"><label>Filter:</label> <span id="matches3"></span></span>
                        <input class="form-control feature-region" id="feature-region" name="feature-region" type="text" placeholder="Filter by Feature Region">
                        <button id="feature3a-reset" class="feature-reset"><i class="icon"></i></button>

                        <div class="dropdown-menu feature-menu dropdown-region">
                            <div class="tree-wrap">

                                <div class="feature-container">
                                    <div id="feature-tree3"></div> <!-- features tree, under construction -->
                                </div>

                                <div class="feature-submit">
                                    <button type="button" id="feature3-select" class="btn btn-default">Select</button>
                                    <button type="reset" id="feature3b-reset" class="btn btn-default clear-form">Cancel<i class="icon"></i></button>
                                </div>

                            </div>
                        </div> <!-- END dropdown-menu -->
                    </div> <!-- END feature-group -->


                    <div class="form-group advanced-input select-type">
                        <span>Show only results containing:</span>
                        <select class="selectpicker" id="selector1" name="selector1" data-selected-text-format="count>2" data-header="Select one or more..." data-width="100%" multiple >
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

                </section><!-- END advanced section -->
            </fieldset>
        </form>
    </section> <!-- END input section -->

    <!-- BEGIN view section -->
    <section class="view-section">
        <ul class="nav nav-tabs">
            <li class="treeview active"><a href=".treeview" data-toggle="tab"><i class="icon shanticon-tree"></i>Tree</a></li>
            <li class="listview"><a href=".listview" data-toggle="tab"><i class="icon shanticon-list"></i>List</a></li>
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
