app.service('ViewDataSource', function ($q, $filter) {

    /*
        options: {
            rawData: [],                        // Array with the raw data provided to the service. It should be still
                                                // have boType field and a data field with the db-level data
            topTierBO: 'buildings',              // the current type of bo that is displayed in the ListView and in the 'groups' type TreeView
            mode: 'multi-view'                  // The DataSource mode. It could be `multi-view` or `tree-view`. The latter is for stand-alone
                                                // Tree View usage.
            tvMode: 'groups',                   // The Tree View format that is being used. Options are: `groups` and `assets`
            boMeta: [],                         //
        }
    */

    var _checkGroupsData = function (data) {
        if (!data) {
            throw "No data was provided for the tree view!";
        } else if (data.constructor === Array) { // Assume the data has been prepared beforehand
            return data;
        } else { // Assume we have an object with asset data
            return _prepareGroupsData(data);
        }
    }

    var _formatAsset = function (asset, boType) {
        var result = {
            _id: asset._id,
            boType: boType,
            data: asset,
            children: []
        };

        return result;
    }

    _findGroupChildren = function (group, allGroups) {
        var result = [];
        for(var i = 0, len = allGroups.length; i < len; i++) {
            var _group = allGroups[i];
            if (_group.parent && _group.parent._id === group.data._id) {
                result.push(_formatAsset(_group, 'groups'));
            }
        }

        for(var i = 0, len = result.length; i < len; i++) {
            var _group = result[i];
            _group.children = _findGroupChildren(_group, allGroups);
        }

        return result;
    }

    var _getAssetGroupId = function (asset) {
        if (!asset.group) {
            return null;
        } else if (typeof asset.group === "string") {
            try {
                // the group param could be a stringified object with _id property inside
                var parsedGroup = JSON.parse(asset.group);
                return parsedGroup._id;
            } catch (ex) {
                // If JSON parse fails it means that the asset.group property is an _id string
                return asset.group;
            }
        } else if (typeof asset.group === "object") {
            return asset.group._id;
        }
        
    };

    var _addAssetToGroup = function (asset, rawData, boType) {
        for(var i = 0, len = rawData.length; i < len; i++) {
            var _item = rawData[i];
            if (_item.boType === 'groups') {
                if (_item._id === _getAssetGroupId(asset)) {
                    _item.children.push(_formatAsset(asset,boType));
                } else if (_item.children && _item.children.length > 0) {
                    _addAssetToGroup(asset, _item.children, boType);
                }
            }
        }
    };

    var _prepareGroupsData = function (data) {
        var result = [];

        if (!data.groups) {
            data.groups = [];
            console.warn('No `groups` property was found in the raw data passed to the ViewDataSource, did you forget to pass it?')
        }

        // Add top level groups
        for(var i = 0, len = data.groups.length; i < len; i++) {
            if (!data.groups[i].parent) {
                result.push(_formatAsset(data.groups[i], 'groups'));
            }
        }

        // Add the group children to the groups
        for(var i = 0, len = result.length; i < len; i++) {
            var topLevelGroup = result[i];
            topLevelGroup.children = _findGroupChildren(topLevelGroup, result);
        }

        // Start adding non-group assets to the array
        for (var assetType in data) {
            if (assetType === 'groups') {
                continue;
            }

            var assetData = data[assetType];

            for(var i = 0, len = assetData.length; i < len; i++) {
                var asset = assetData[i];
                if (asset.group) {
                    _addAssetToGroup(asset, result, assetType);
                } else {
                    result.push(_formatAsset(asset, assetType));
                }
            }
        }

        return result;

    }

    var _prepareRawData = function (asset, type, meta) {
        var result = {
            boType: type,
            data: asset,
            children: _prepareRawDataChildren(typeof asset.children === "string" ? JSON.parse(asset.children) : asset.children, meta),
            childrenLoaded: false
        };

        return result;
    }

    var _prepareRawDataChildren = function (children, meta) {
        var result = [];

        if (children) {
            children.forEach(function (child) {
                var _item = {
                    name: child.name,
                    boType: child.type,
                    children: _prepareRawDataChildren(child.children, meta),
                    _id: child._id,
                    childrenLoaded: false
                }

                if (!meta[child.type].apiService) {
                    _item.data = child.data;
                }

                result.push(_item);
            });
        }
        return result;
    }

    var _getObjId = function (obj) {
        return obj._id ? obj._id : obj.data ? obj.data._id : undefined;
    }

    return function (options) {
        var _this = this;
         _this.listViewData = [],
        _this.treeViewData = [],
        _this.topTierBO = options.topTierBO;
        _this.mode = options.mode,
        _this.tvMode = options.tvMode,
        _this.boMeta = options.boMeta,
        _this.isGroups = _this.tvMode === 'groups',
        _this.isAssets = _this.tvMode === 'assets',
        _this.eventEmitter = new EventEmitter(),
        _this.treeViewSelector = '',
        _this.initialLoad = true;

        var _rawData = _this.isAssets ? _prepareRawData(options.rawData, _this.topTierBO, _this.boMeta) : _checkGroupsData(options.rawData);

        var _prepareListViewData = function (data) {
            var result = [];
            for(var i = 0, len = data.length; i < len; i++) {
                if (data[i].boType === _this.topTierBO) {
                    result.push(data[i].data)
                } else if (data[i].boType === 'groups' && data[i].children) {
                    result = result.concat(_prepareListViewData(data[i].children, _this.topTierBO));
                }
            }
            return result;
        };

        var _prepareTreeViewObj = function (obj) {
            var result = {};

            result.icon = _this.boMeta[obj.boType].icon;
            result.state = {
                opened: false,
                disabled: false,
                selected: false
            };
            result.data = {
                boType: obj.boType,
                name: _getObjDisplayField(obj),
                children: _cleanChildren(obj.children),
                _id: _getObjId(obj)
            }
            result.id = obj.boType + '_' + _getObjId(obj);
            if (obj.data) {
                result.data.data = obj.data;
                
            }            

            if (_this.isGroups) {
                result.text = _getObjDisplayField(obj);
            } else if (_this.isAssets) {
                result.text = _getObjDisplayField(obj);
            }

            if (obj.children) {
                if ((_this.isGroups && obj.boType === 'groups') || _this.isAssets) {
                    result.children = _prepareTreeViewData(obj.children);
                }
            }

            return result;
        }

        var _cleanChildren = function (children) {
            var result = []

            children = children || [];
            children.forEach(function (item) {
                result.push({
                    boType: item.boType,
                    data: item.data,
                    children: _cleanChildren(item.children),
                    _id: _getObjId(item),
                    name: _getObjDisplayField(item)
                });
            });

            return result;
        }

        var _createRootGroup = function () {
            return {
                id: 'rootGroup',
                text: $filter('translate')("Root:ViewDataSource:RootGroup"),
                icon: _this.boMeta['groups'].icon,
                state: {
                    opened: true,
                    disabled: false,
                    selected: false
                },
                data: {
                    isRoot: true,
                    boType: 'groups',
                    data: {
                        name: '<root>',
                        isRoot: true
                    }

                }
            }
        };


        var _prepareAssetsRoot = function (item) {
            return {
                id: 'root',
                text: item.data[_this.boMeta[_this.topTierBO].displayField],
                icon: _this.boMeta[_this.topTierBO].icon,
                state: {
                    opened: true,
                    disabled: false,
                    selected: false
                },
                childrenLoaded: false,
                data: {
                    isRoot: true,
                    boType: _this.topTierBO,
                    data: item.data
                }
            }
        }

/*
            if (_this.isGroups) {
                debugger;
                var _root = _createRootGroup();
                _root.children = [].concat(result);
                return [_root];
            } */

        var _prepareTreeViewData = function (data) {
            var result = [];

            for(var i = 0, len = data.length; i < len; i++) {
                if ((_this.isGroups && (data[i].boType === _this.topTierBO || data[i].boType === 'groups')) || _this.isAssets) {
                    result.push(_prepareTreeViewObj(data[i]));
                }
            }

            return result;
        }

        var _updateItemGroup = function (obj) {
            // Find the previous parent, according to the _rawData structure
            var prevGroup = _findObjParent(obj, _rawData);

            // No change to the parent group
            if ((prevGroup === null && !obj.data.group) || (prevGroup && obj.data.group && prevGroup._id === obj.data.group._id)) {
                return;
            }

            // If prevGroup is null, then the element was in the root, we must remove it from the root _rawData
            if (prevGroup === null) {
                for(var i = 0, len = _rawData.length; i < len; i++) {                    
                    if (_rawData[i]._id === obj._id) {
                        // Remove the element from the root
                        _rawData.splice(i, 1);
                        break;
                    }
                }
            } else if (prevGroup._id != obj.group) { // If the previous group is different than the current group then move the element to the new group
                for(var i = 0, len = prevGroup.children.length; i < len; i++) {
                    var elem = prevGroup.children[i];
                    if (elem._id === obj._id) {
                        // Remove the element from its previous group parent
                        prevGroup.children.splice(i, 1);
                        break;
                    }
                }
            }

            // If the current group is empty, add the element to the _rawData root 
            if (!obj.data.group || obj.data.group.isRoot) {
                _rawData.push(obj);
            } else {
                var newGroup = _findObj({
                    _id: obj.data.group._id,
                    boType: 'groups',
                    data: obj.data.group,
                }, _rawData);
                newGroup.children = newGroup.children || [];
                newGroup.children.push(obj);
            }
        };

        var _updateInternalData = function () {
            if (_this.mode === 'multi-view') {
                _listViewData = _prepareListViewData(_rawData);
                var _tvData = _prepareTreeViewData(_rawData),
                    _root = _createRootGroup();
                    _root.children = _tvData;

                _this.treeViewData = [_root];
            } else if (_this.mode === 'tree-view') {
                var data = null;
                if (_this.isAssets) {
                    data = _rawData.children;
                } else if ( _this.isGroups ) {
                    data = _rawData;
                }

                var _tvData = _prepareTreeViewData(data);
                if (_this.isAssets) {
                    var _root = _prepareAssetsRoot(_rawData);
                    _root.children = _tvData;
                    _this.treeViewData = [_root];
                }
            }
        };

        var _findObj = function (obj, data) {
            var result = null,
                _data = data.children ? data.children : data;

            for(var i = 0, len = _data.length; i < len; i++) {
                if (_data[i].boType === obj.boType && _getObjId(_data[i]) == obj._id) {
                    result = _data[i];
                    break;
                } else if (_data[i].children && _data[i].children.length > 0){
                    result = _findObj(obj, _data[i].children);
                    if (result) {
                        break;
                    }
                }
            }

            return result;
        }

        var _saveChild = function (obj, children, position) {
            for(var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                if (obj._id === child._id && obj.boType === child.boType) {
                    if (obj.data) {
                        child.data = obj.data;
                    }
                    return children;
                }
            }

            // It wasn't an update, then add the child
            var newObj = {
                boType: obj.boType,
                _id: _getObjId(obj),
                name: _getObjDisplayField(obj),
                children: obj.children                
            };

            if (obj.data) {
                newObj.data = obj.data;
            }

            if (typeof position != 'undefined') {
                children.splice(position, 0 ,newObj);
            } else {
                children.push(newObj);
            }

            return children;
        }

        // var _findParent = function (obj, data, parent) {
        //     var result;

        //     if (!data) {
        //         if(_this.isAssets) {
        //             result = _findParent(obj,_rawData.children, _rawData);
        //         } else if (_this.isGroups) {
        //             result = _findParent(obj,_rawData);
        //         }
        //     } else {
        //         data.forEach(function (item) {
        //             if ()
        //         });
        //     }

        //     return result;
        // }

        // This method removes a child element that for some reason has no _id and no data attrubites. 
        // This happens sometimes when there was an error when saving an asset
        var deleteInvalidChild = function (obj, _children) {
            for(var i = 0, len = _children.length; i < len; i++) {
                var _self = _children[i];                        
                if(_self.boType === obj.boType && !_self._id) {
                    _children.splice(i, 1);
                    _this.eventEmitter.emit('item_deleted');
                    break;
                }
            }
        }

        var _getObjDisplayField = function (obj) {
            return obj.name ? obj.name : (obj.data ? (_this.boMeta[obj.boType].displayField ? obj.data[_this.boMeta[obj.boType].displayField] : obj.data.name) : '');
        }

        var _removeItem = function (obj, parent, isMove) {
             var _rawDataItem = null;
             if (_this.isGroups) {
                 _rawDataItem = _findObj(obj, _rawData);
             } else if (_this.isAssets) {
                 _rawDataItem = _findObj(obj, _rawData.children);
             }


             if (_rawDataItem) {
                if (!isMove && _rawDataItem.children) {
                    _rawDataItem.children.forEach(function (item) {
                        _removeItem(item, _rawDataItem);
                    });
                }

                var _children;

                if (parent.isRoot) {
                    if (_this.isAssets) {
                        _children = _rawData.children;
                    } else if (_this.isGroups) {
                        _children = _rawData;
                    }
                } else {
                    if (_this.isAssets) {
                        _children = _findObj(parent, _rawData.children).children;
                    } else if (_this.isGroups) {
                        _children = _findObj(parent, _rawData).children;
                    }
                }

                if (_children) {
                    if (!_rawDataItem._id) {
                        deleteInvalidChild(_rawDataItem, _children);
                    } else {
                        for(var i = 0, len = _children.length; i < len; i++) {
                            var _self = _children[i];                        
                            if(_self.boType === _rawDataItem.boType && _self._id === _rawDataItem._id) {
                                _children.splice(i, 1);
                                if (!isMove) {
                                    _this.eventEmitter.emit('item_deleted');
                                }
                                break;
                            }
                        }
                    }                    
                }
             }
        }

        var _formatAssetsDataChild = function (obj) {
            var result = {
                _id: obj._id,
                type: obj.boType,
                name: _getObjDisplayField(obj),
                children: []
            };

            if (!_this.boMeta[obj.boType].apiService) {
                result.data = obj.data;
            }

            if (obj.children) {
                obj.children.forEach(function (child) {
                    result.children.push(_formatAssetsDataChild(child));
                });
            }

            return result;
        };

        var _getTreeViewAssetsData = function () {
            var assets = [];

            if (_rawData.children) {
                _rawData.children.forEach(function (item) {
                    assets.push(_formatAssetsDataChild(item));
                });
            }

            return assets;
        };

        var _findChildrenOfType = function (type, children, parent) {
            var result = [];

            if(children) {
                children.forEach(function (item) {
                    if (item.boType === type) {
                        item.parent = parent;
                        result.push(item);
                    } else if (item.children) {
                        result = result.concat(_findChildrenOfType(type, item.children, item));
                    }
                });
            }

            return result;
        };

        var _getItemsOfType = function (type) {
            var _data = null,
                result = [],
                parent = null;

            if (_this.isAssets) {
                data = _rawData.children;
                parent = _rawData;
            } else if ( _this.isGroups ) {
                data = _rawData;
                parent = {
                    isRoot: true,
                    boType: 'groups',
                    data: {
                        name: '<root>',
                        isRoot: true                    
                    }
                }
            }

            result = _findChildrenOfType(type, data, _rawData);

            return result;
        };

        var _findObjParent = function (obj, elements) {
            var result = null;

            for(var i = 0, len = elements.length; i < len; i++) {
                var elem = elements[i];
                if (elem.children) {
                    for(var j = 0, len_j = elem.children.length; j < len_j; j++) {
                        if (elem.children[j]._id === obj._id) {
                            result = elem;
                            break;
                        } else if (elem.children[j].children) {
                            var found = _findObjParent(obj, [elem.children[j]]);
                            if (found) {
                                result = found;
                                break;
                            } 
                        }
                    }
                }                
            }

            return result;
        };

        var _changeAssetParent = function (obj, newParent, params) {
            if (newParent === "root") {
                newParent = _this.treeViewData[0];
            }

            if (!_this.boMeta[newParent.boType].canHave || _this.boMeta[newParent.boType].canHave.indexOf(obj.boType) === -1) {
                throw "Cannot move obj to a new parent because the parent does not have in its canHave field the object's type added."; 
            }

            var oldParent = _findObjParent(obj, _this.isGroups ? _rawData : [_rawData]);
            if (oldParent) {
                if (oldParent.boType === _this.topTierBO && _this.isAssets) {
                    oldParent.isRoot = true;
                }

                _removeItem(obj, oldParent, true);
                this.addItem(obj, newParent, true, params.position);

                _this.eventEmitter.emitEvent('change_parent', [obj, newParent]);
            }
        }

        _updateInternalData();
        _this.initialLoad = false;

        return {
            getListViewData: function () {
                return _listViewData;
            },
            getTreeViewData: function () {
                return _this.treeViewData;
            },
            addItem: function (obj, parent, skipRefresh, position) {
                if (!parent || parent.isRoot || (_this.isAssets && parent.boType === _this.topTierBO)) {
                    var _rawDataItem = _findObj(obj, _rawData);
                    if(_rawDataItem) {
                        _rawDataItem.data = obj.data;
                    } else {
                        if (_this.isAssets) {
                            if (typeof position != 'undefined') {
                                _rawData.children.splice(position, 0, obj);
                            } else {
                                _rawData.children.push(obj);
                            }
                        } else if (_this.isGroups) {
                            _rawData.push(obj);
                        }
                    }

                } else {
                    var dataParent = _findObj(parent, _rawData);
                    if (dataParent.children) {
                        dataParent.children = _saveChild(obj, dataParent.children, position);
                    } else {
                        dataParent.children = [obj];
                    }
                }
                if (!skipRefresh) {
                    _updateInternalData();
                    _this.eventEmitter.emitEvent('data_updated', [_this.treeViewSelector]);
                }
            },
            updateItem: function (item, skipRefresh) {
                var obj = _findObj(item, _rawData);
                obj.data = item.data;
                obj.name = _getObjDisplayField(obj.data);
                if (!obj._id) {
                    obj._id = item.data._id;
                }

                if (_this.isGroups) {
                    _updateItemGroup(obj);
                }

                _updateInternalData();
                if (!skipRefresh) {
                    _this.eventEmitter.emitEvent('data_updated', [_this.treeViewSelector]);
                }
            },
            removeItem: function (obj, parent) {
                _removeItem(obj, parent);
                _updateInternalData();
            },
            getTreeViewAssets: function () {
                return _getTreeViewAssetsData();
            },
            setTreeViewSelector: function (selector) {
                _this.treeViewSelector = selector;
            },
            getTreeViewSelector: function () {
                return _this.treeViewSelector;
            },
            getItemsOfType: function (type) {
                return _getItemsOfType(type);
            },
            getItem: function (id, type) {
                return _findObj({
                    boType: type,
                    data: {
                        _id: id
                    }
                }, _rawData);
            },
            updateInternalData: function (notify) {
                _updateInternalData();
                if (notify) {
                    _this.eventEmitter.emitEvent('data_updated', [_this.treeViewSelector]);
                }
            },
            events: _this.eventEmitter,
            setTVMode: function (newMode) {
                _this.tvMode = newMode;
                _this.isGroups = _this.tvMode === 'groups';
                _this.isAssets = _this.tvMode === 'assets';
            },
            changeParent: function (obj, newParent, params) {
                if (_this.isAssets) {
                    _changeAssetParent.call(this, obj, newParent, params);
                } else if (_this.isGroups) {
                    obj.data.group = newParent.data;
                    _updateItemGroup(obj);
                    _this.eventEmitter.emitEvent('change_parent', [obj, newParent]);
                }
            },
            treeViewReady: function (tvInstance) {
                _this.eventEmitter.emitEvent('treeView_ready', [tvInstance]);
            }
        }
    }
});
