app.directive( 'treeView', function ($q, $timeout, ViewDataSource, ngDialog, ngNotify, $filter) {

/*
    Dynamic Tree View Control. Parameters:
    options: {
        mode: string; // Values: 'groups', 'assets' - this determines the behavior of the TreeView. The standard case is `assets`
        topTierBO: string; // Values: bo string - this indicates the business object type of the top asset that holds the rest of them,
        viewDS: ViewDataSource // Values: ViewDataSource service - this is a ViewDataSource service object 
    }

 */

return {
    restrict: 'E',
    scope: {
        options: '=',
        editItem: '=?',
        updateItem: '=?'
    },
    //templateUrl: 'treeView/treeView.pug',
    template: '<div class="mvTreeView"><div id="{{controlId}}"></div></div>',
    controller: function ($scope) {
        $scope.controlId = 'tree_view_' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
        var _controlSelector = '#' + $scope.controlId,
            _mode = $scope.options.mode || 'groups';


        $scope.boMeta = $scope.options.boMeta;
        $scope.topTierBO = $scope.options.topTierBO || 'groups';
        $scope.isGroups = _mode === 'groups';
        $scope.isAssets = _mode === 'assets';        
        var _viewDS = null;
        $scope.editItem = null;
        if ($scope.options.viewDS) {
            _viewDS = $scope.options.viewDS;
            _viewDS.updateInternalData(); // In case state is changed and data is messed up
        } else {
            _viewDS = new ViewDataSource({
                rawData: $scope.options.data,
                topTierBO: $scope.options.topTierBO,
                mode: 'tree-view',
                boMeta: $scope.options.boMeta,
                tvMode: $scope.options.mode
            });
        }

        _viewDS.setTreeViewSelector(_controlSelector);

        _viewDS.events.addListener('data_updated', function (selector) {
            $scope.tvActions.redrawTreeView(selector);
        });

        $scope.tvSelectedNode = null;

        $scope.tvActions = {
            initTreeControl: function () {
                var $jsTree = $(_controlSelector);
                var plugins = ["wholerow", "contextmenu", "search", "state"];

                if ($scope.options.dragAndDrop) {
                    plugins.push("dnd");
                }

                if ($scope.options.checkbox) {
                    plugins.push("checkbox");
                }

                $jsTree
                    .jstree({
                        core : {
                            data: _viewDS.getTreeViewData(),
                            check_callback: function (operation, node, node_parent, node_position, more) {
                                // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
                                // in case of 'rename_node' node_position is filled with the new node name
                                var result = true;

                                if (operation === 'move_node') {
                                    result = $scope.tvActions.checkMoveEnabled(node, more, node_parent);
                                    //console.log('Current check move result:', {result: result}); 
                                }

                                return result;
                            }
                        },
                        state: {
                            key: "assetManagerTreeView"
                        },
                        plugins: plugins,
                        contextmenu: {
                            select_node: false,
                            items: initContextMenu
                        }
                    });

                $jsTree.bind('select_node.jstree', function (node, selected, event) {
                    var boData = selected.node.data,
                        boType = selected.node.data.boType;

                    if (boData.isRoot && ($scope.isGroups || !$scope.boMeta[boType].editTemplate)) {
                        $scope.editItem = null;
                        if ($scope.updateItem) {
                            $scope.updateItem(null);
                        }
                    } else {
                        if ($scope.boMeta[boType].edit) {
                            if (!boData.isRoot) {
                                boData.parent = $.jstree.reference(this).get_json(selected.node.parent).data;
                            }
                            
                            if (!boData.data && $scope.boMeta[boType].apiService) {
                                $scope.boMeta[boType].apiService.get(boData._id)
                                    .then(function (response) {                                        
                                        if (response.data) {
                                            boData.data = response.data;

                                            $scope.editItem = angular.copy(boData);

                                            if ($scope.updateItem) {
                                                $scope.updateItem($scope.editItem);
                                                _viewDS.updateItem($scope.editItem, true); 

                                            }
                                        } else {
                                            ngNotify.set('The asset you are trying to retrieve is missing from the database!', 'error');
                                        }
                                    })
                                    .catch(function (err) {
                                        ngNotify.set('Error trying to retrieve asset! Status code: ' + err.status + ' Status Message: ' + err.statusText, 'error');
                                    });
                            } else {
                                $scope.editItem = angular.copy(boData);

                                if ($scope.updateItem) {
                                    $scope.updateItem($scope.editItem);
                                }
                            }
                            //$scope.$parent.$digest();
                        }

                        $scope.tvSelectedNodeObj = selected;

                        if ($scope.boMeta[boType].onClick) {
                            $scope.boMeta[boType].onClick.call($scope, angular.copy(boData));
                        }
                    }

                    $timeout(function () {}, 0);
                });

                $jsTree.bind('move_node.jstree', function (event, params) {                    
                    var changeParams = {
                        position: params.position,
                        old_position: params.old_position
                    };

                    var newParent = $.jstree.reference(_controlSelector).get_node(params.parent);
                    if (newParent.data && newParent.data.boType === params.node.data.boType) {
                        var parentMeta = $scope.boMeta[newParent.data.boType];
                        // In such cases we have a reordering of elements. Now we need to reverse this
                        if (parentMeta.canHave.indexOf(newParent.data.boType) === -1) {
                            var moveParent = $.jstree.reference(_controlSelector).get_node(newParent.parent);
                            var moveIndex = moveParent.children.indexOf(newParent.id) + 1;

                            $jsTree.jstree('move_node', params.node, moveParent, moveIndex);
                            return;
                        }
                    }

                    _viewDS.changeParent(params.node.data, newParent ? newParent.data : "root", changeParams);
                });

                if($scope.isGroups) {
                    $jsTree.bind('delete_node.jstree', function (event, node) {
                        var parent = $.jstree.reference(this).get_json(node.parent).data;                        
                        _viewDS.removeItem(node.node.data, parent);

                    });
                }

                $jsTree.bind('refresh.jstree', function (args) {
                    $scope.options.instance.restore_state();
                });

                $scope.options.instance = $jsTree.jstree();

                $jsTree.bind('loaded.jstree', function (event, node) {
                    _viewDS.treeViewReady($scope.options.instance);
                });
                    

                return '';
            },
            redrawTreeView: function (selector) {
                var jstree = $(selector).jstree(true);                                                    
                if (jstree) { 
                    jstree.save_state();
                    jstree.settings.core.data = _viewDS.getTreeViewData();
                    jstree.refresh();                    
                }
            },
            updateTreeView: function (item) {

            },
            checkMoveEnabled: function (node, params, node_parent) {
                //console.log({node:node, params: params, node_parent: node_parent});
                //return true;
                //node_parent.params = params;
                //console.log(node_parent);

                if (params.is_foreign) {
                    return false;
                }

                if (!params.ref && (!node_parent || !node_parent.data)) {
                    return false;
                }

                // The root of the container, this is the level above the main asset
                if (!node_parent.data && node_parent.parent === null && $scope.isAssets) {
                    return false;
                }

                var targetMeta = null;
                if (params.ref) {
                    targetMeta = $scope.boMeta[params.ref.data.boType];
                } else if (node_parent) {
                    targetMeta = $scope.boMeta[node_parent.data.boType];
                }

                // In order to implement asset reordering I have to allow on this step the move of the element to the same type
                // Additional validation would be carried out in the next step, on the move_node.jstree event.
                if (!params.ref || params.ref.data.boType === node.data.boType) {
                    return true;
                }

                if (!targetMeta.canHave) {
                    return false;
                } else {
                    return targetMeta.canHave.indexOf(node.data.boType) != -1;
                }
            }
        }

        var initContextMenu = function (node) {
            var result = {};
            var obj = $.jstree.reference(_controlSelector).get_json(node),
                parent = $.jstree.reference(_controlSelector).get_node(node.parent).data,
                boMeta = $scope.boMeta[obj.data.boType];

            var contextItems = boMeta.contextItems;
            if (contextItems) {
                for(var i = 0, len = contextItems.length; i < len; i++) {
                    var item = contextItems[i];
                        action = {
                            label: item.label,
                            icon: item.icon || boMeta.icon                                
                        };

                    if (typeof item.action === "string" ) {
                        var actions = item.action.split('_');
                        if (actions[0] === 'add') {
                            action.action = _getAddItemActon(actions[1], obj.data).action;
                        }

                    } else if (typeof item.action === 'function') {
                        action.action = item.action;
                    }

                    result[item.id] = action;
                }
            } else if ($scope.options.defaultActions) {
                $scope.options.defaultActions.forEach(function (action) {
                    if (action === 'add' && !_isActionBlacklisted(obj, boMeta, $scope.options.actionBlacklist, action)) {
                        if (boMeta.canHave) {
                            boMeta.canHave.forEach(function (type) {
                                result['add_' + type] = _getAddItemActon(type, obj.data);
                            });
                        }
                    } else if (action === 'delete' && !obj.data.isRoot && !_isActionBlacklisted(obj, boMeta, $scope.options.actionBlacklist, action)) {
                        result.delete = _getAssetDeleteAction(obj, parent);
                    }
                });
            }            

            return result;
        }

        var _getAssetDeleteAction = function (obj, parent) {
            return {
                label: $filter('translate')("Delete " + $scope.boMeta[obj.data.boType].label + ":EnergyBlocks:Column"),
                icon: 'fa fa-times', 
                action: function (event) {
                    _openDeleteConfim($scope.boMeta[obj.data.boType]).then( function () {
                        var jsTree = $.jstree.reference(event.reference.context);
                            obj = jsTree.get_json(event.reference),
                            meta = $scope.boMeta[obj.data.boType];
                        
                        // Malfunctioning/Non-service related object, just remove from the tree and update parent                        
                        if (meta.apiService && (obj._id || obj.data._id)) {
                            meta.apiService.delete(obj._id || obj.data._id)
                                .then(function (result) {
                                    _viewDS.removeItem(obj.data, parent);
                                    jsTree.delete_node(event.reference);
                                    
                                    if ($scope.updateItem) {
                                        $scope.updateItem(null);
                                    }
                                })
                                .catch(function (err) {
                                    ngNotify.set('Error trying to delete asset! Status code: ' + err.status + ' Status Message: ' + err.statusText, 'error');
                                });
                        } else {
                            _viewDS.removeItem(obj.data, parent);
                            jsTree.delete_node(event.reference);

                            if ($scope.updateItem) {
                                $scope.updateItem(null);
                            }
                        }
                    });
                }
            }
        }            

        var _openDeleteConfim = function (meta) {
            return ngDialog.openConfirm( {
                template: meta.deleteConfirmTemplate || 'custom/modals/confirmDeleteTreeView.pug',
                className: 'ngdialog-theme-default',
                width:'450px'
            } );
        }

        var _getAddItemActon = function (type, parent) {
            var _meta = $scope.boMeta[type];
            var result = {
                label: $filter('translate')('Add ' + _meta.label + ":TreeView"),
                icon: $scope.boMeta[type].icon,
                action: function (event) {
                    if (_meta.onAdd) {
                        _meta.onAdd(event);
                    } else {
                        var jsTree = $.jstree.reference(event.reference.context);
                            obj = jsTree.get_json(event.reference);

                        var newItem = {
                            boType: type,
                            data: {},
                            parent: parent
                        };

                        if ($scope.isGroups) {
                            var prop = (type === 'groups' ? 'parent' : 'group');
                            newItem.data[prop] = parent.isRoot ? {_id: "root", name: $filter('translate')("Root:EnergyBlocks:Column")} : parent.data;
                        }

                        $scope.editItem = newItem;

                        if ($scope.updateItem) {
                            $scope.updateItem(newItem);
                        }
                    }
                }
            };

            return result;
        }

        var _isActionBlacklisted = function (obj, boMeta, actionBlacklist, action) {
            if (actionBlacklist && actionBlacklist[action]) {
                return actionBlacklist[action](obj);
            } else {
                return false;
            }
        }

        $timeout($scope.tvActions.initTreeControl, 0);
    }
}
});
