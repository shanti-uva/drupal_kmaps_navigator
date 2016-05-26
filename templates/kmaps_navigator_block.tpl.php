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
                    <?php print render($search); ?>
                </div>
                <section class="search-filters">
                    <?php print render($filters); ?>
                </section><!-- END seach filters -->
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
                <div class="view-wrap"> <!-- view-wrap controls container height -->
                </div>
            </div>
        </div>
    </section><!-- END view section -->
</section><!-- END kmaps-search -->
