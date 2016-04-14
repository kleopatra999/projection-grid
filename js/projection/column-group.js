define([
  'lib/underscore',
  'lib/backbone',
  'component/grid/projection/base',
  'component/grid/schema/properties',
  'component/grid/model/response',
], function (_, Backbone, BaseProjection, schemaProperties /* , Response */) {
  var Model = BaseProjection.extend({
    defaults: {
      'column.group': {},
      'column.groupExpansion': [],
      'column.select': null
    },
    name: 'column-group',

    events: {
      'layout:click:header': 'onClickHeader',
    },

    update: function (options) {
      // Model.__super__.update.call(this, options);

      if (Model.__super__.update.call(this, options)) {
        var model = this.src.data;
        var columnGroup = this.get('column.group') || {};
        var groupExpansion = {};
        _.each(this.get('column.groupExpansion') || [], function(columnName) {
          groupExpansion[columnName] = true;
        });
        var select = this.get('column.select') || model.get('select');
        var columns = model.get('columns');
        var subSelect = [], isApplyGroup = false;

        _.each(columnGroup, function(subColumns, name) {
          if (columns[name] == null) return;
          isApplyGroup = true;
          columns[name].group = subColumns;
          // remove the columns that appear in the select
          select = _.difference(select, subColumns);
          columns[name].groupExpansion = _.has(groupExpansion, name);
        }, this);
        var selectExpand = select.slice(0);

        _.each(select, function(columnName) {
          var column = columns[columnName];
          var subColumns = column.group;
          if (column.groupExpansion) {
            var nameIndex = selectExpand.indexOf(columnName);
            selectExpand.splice.apply(selectExpand, [nameIndex, 1].concat(subColumns));
            subSelect = subSelect.concat(subColumns);
          }
        }, this);

        this.patch({
          columns: columns,
          select: select,
          subSelect: subSelect,
          selectExpand: selectExpand,
          isApplyGroup: isApplyGroup
        });
      } else {
        // todo [akamel] unset our properties only
        // this.unset();
      }
    },

    onClickHeader: function (e, arg) {
      var column = arg.column;
      if (column.group != null) {
        var groupExpansion = this.get('column.groupExpansion') || [];
        if (column.groupExpansion) {
          groupExpansion = _.without(groupExpansion, column.property);
        } else {
          groupExpansion = _.union(groupExpansion, [column.property]);
        }
        this.set({'column.groupExpansion': groupExpansion});
      }
    }
  });

  return Model;
});
