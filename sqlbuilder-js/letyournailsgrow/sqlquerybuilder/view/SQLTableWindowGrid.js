Ext.define('Ext.letyournailsgrow.sqlquerybuilder.view.SQLTableWindowGrid', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.sqbtablefieldsgrid'],
    border: false,
    hideHeaders: true,
	
   viewConfig: {
        listeners: {
		render: function(view){
			this.dd = {};
			
			this.dd.dragZone = new Ext.view.DragZone({
			    view: view,
			    ddGroup: 'SQLTableWindowGridDDGroup',
			    dragText: '{0} selected table column{1}',
			    onInitDrag: function(x, y){
				var me = this, 
				      data = me.dragData, 
				      view = data.view, 
				      selectionModel = view.getSelectionModel(), 
				      record = view.getRecord(data.item), 
				      e = data.event;
				data.records = [record];
				me.ddel.update(me.getDragText());
				me.proxy.update(me.ddel.dom);
				me.onStartDrag(x, y);
				return true;
			    }
			});
			
			this.dd.dropZone = new Ext.grid.ViewDropZone({
			    view: view,
			    ddGroup: 'SQLTableWindowGridDDGroup',
			    handleNodeDrop: function(data, record, position){
				    
			    },
			    onNodeOver: function(node, dragZone, e, data){
				var me = this, 
				      view = me.view, 
				      pos = me.getPosition(e, node), 
				      overRecord = view.getRecord(node), 
				      draggingRecords = data.records;
				
				if (!Ext.Array.contains(data.records, me.view.getRecord(node))) {
				    if (!Ext.Array.contains(draggingRecords, overRecord) && data.records[0].get('field') != '*') {
					me.valid = true;					
				    }
				    else {					
					me.valid = false;
				    }
				}
				return me.valid ? me.dropAllowed : me.dropNotAllowed;
			    },
			    onContainerOver: function(dd, e, data){
				var me = this;				
				me.valid = false;
				return me.dropNotAllowed;
			    }
			});
                },
		
		drop: function(node, data, dropRec, dropPosition){			     			   
			   
			  var showJoinContextMenu = function(event, el){				    				    
				    event.stopEvent();				    
				    var cm = Ext.create('Ext.menu.Menu', {
					items: [
					    // nu are rost
					    /*{
						    text: 'Edit Join',
						    icon: 'resources/images/document_edit16x16.gif',
						    handler: Ext.Function.bind(function(){
						    
						    }, this)
					    },*/
					  {
						    text: 'Remove Join',
						    icon: 'resources/images/remove.gif',
						    handler: Ext.Function.bind(function(){	
							var controller = Ext.getCmp('SQLQueryBuilderPanel').getController();							    
							var connections = Ext.Array.filter(controller.getConnections(), function(connection){
							    var isJoinRemove = false;
							    if (this.uuid == connection.uuid) {
								this.line.remove();
								this.bgLine.remove();
								this.miniLine1.remove();
								this.miniLine2.remove();
								isJoinRemove = true;
							    }
							    return !isJoinRemove;
							}, this);
							
							controller.setConnections(connections);
							controller.removeJoinById(this.uuid);
						    }, this)
					    } 
						// nu are rost
						/*,{
						    text: 'Close Menu',
						    icon: 'resources/images/cross.gif',
						    handler: Ext.emptyFn
						}*/
					]
				    });                    
				    cm.showAt(event.getXY());
			  };
			  
		
			  if (node.boundView) {
				 
				var controller = Ext.getCmp('SQLQueryBuilderPanel').getController();
				  
				var sqlTableWindow1 = data.view.up('window');
				var sqlTableWindow2 = Ext.getCmp(node.boundView).up('window');
				   
			        sqlTableWindow1.shadowSprite.hasJoins = true;				
				sqlTableWindow2.shadowSprite.hasJoins = true;
				  
				var dropTable = controller.getTableById(sqlTableWindow1.tableId);
				var targetTable = controller.getTableById(sqlTableWindow2.tableId);
				  
				var index1 = data.item.viewIndex;
				var index2 = data.item.viewIndex;
				
				var connection = sqlTableWindow2.joinTable(sqlTableWindow1.shadowSprite, sqlTableWindow2.shadowSprite, "#000", [index1, index2]);
				  				
				sqlTableWindow1.connectionUUIDs.push(connection.uuid);
				sqlTableWindow2.connectionUUIDs.push(connection.uuid);
					
				controller.addConnection(connection); // nu stiu daca e ok aici
				
				connection.bgLine.el.on('contextmenu', showJoinContextMenu, connection);
				connection.line.el.on('contextmenu', showJoinContextMenu, connection);
		    
				// se creaza o legaura (join) intre tabele:	
				var join = Ext.create('Ext.letyournailsgrow.sqlquerybuilder.model.SQLJoinModel');
				var joinCondition = '';		
				if (dropTable.get('tableAlias') != '') {
					joinCondition = joinCondition + dropTable.get('tableAlias') + '.' + join.get('leftTableField') + '=';
				}else {
					joinCondition = joinCondition + dropTable.get('tableName') + '.' + join.get('leftTableField') + '=';
				}                    
				if (targetTable.get('tableAlias') != '') {
					joinCondition = joinCondition + targetTable.get('tableAlias') + '.' + join.get('rightTableField');
				} else {
					joinCondition = joinCondition + targetTable.get('tableName') + '.' + join.get('rightTableField');
				}
				
				join.set('id', connection.uuid);			
				join.set('leftTableId', sqlTableWindow1.tableId);			
				join.set('leftTableField', data.records[0].get('field'));			
				join.set('rightTableId', sqlTableWindow2.tableId);			
				join.set('rightTableField', sqlTableWindow2.down('grid').store.getAt(node.viewIndex).get('field'));			
				join.set('joinType', 'INNER');					                    
				join.set('joinCondition', joinCondition);
				
				controller.addJoin(join);
				

			}
		},
		
		bodyscroll: function(){
			// SPIRIDUS: cand se face scrool, se face scrool si la spiridus
			var scrollOffset = this.el.getScroll();
			var sqlTable = this.up('sqltablewindow');
			sqlTable.shadowSprite.scrollTop = scrollOffset.top;
						
			var controller = Ext.getCmp('SQLQueryBuilderPanel').getController();
			for (var i = controller.getConnections().length; i--;) {
				sqlTable.updateJoinTable(controller.getConnections()[i]);
			}
						
		}
            
	}
    },
		
    initComponent: function(){
    
        this.columns = [{
		    xtype: 'gridcolumn',
		    width: 16,
		    dataIndex: 'key',
		    renderer: function(val, meta, model){
			if (val == 'PRI') {
			    meta.style = 'background-image:url(resources/images/key.gif) !important;background-position:2px 3px;background-repeat:no-repeat;';
			}
			return '&nbsp;';
		    }
		}, {
		    xtype: 'gridcolumn',
		    flex: 1,
		    dataIndex: 'field',
		    renderer: function(val, meta, model){
			if (model.get('key') == 'PRI') {
			    return '<span style="font-weight: bold;">' + val + '</span>&nbsp;&nbsp;<span style="color:#aaa;">' + model.get('type') + '</span>';
			}
			return val + '&nbsp;&nbsp;<span style="color:#999;">' + model.get('type') + '</span>';
			
		    }
        }];
        
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            mode: 'SIMPLE',
            checkOnly: true,
            listeners: {
                select: function(selModel, data){
			var controller = Ext.getCmp('SQLQueryBuilderPanel').getController();	
			controller.addFieldRecord(data, true);
                },
                deselect: function(selModel, data){
			var controller = Ext.getCmp('SQLQueryBuilderPanel').getController();	
			controller.removeFieldById(data.get('id'));						
		}
            }
        });
        
        this.callParent(arguments);
    }
    
});