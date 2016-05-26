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

                    <!-- feature type and associated subject filtering -->
                    <?php print render($filters); ?>

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
