Ext.define('Ext.letyourneilsgrow.sqlquerybuilder.controller.SQLQueryBuilderController', {
	
    config: {
        tableStore: '',
        projectionAndSelectionStore: '',
        joinStore: ''
    },
    
    constructor: function(){
	 
	this.projectionAndSelectionStore = Ext.create('Ext.letyourneilsgrow.sqlquerybuilder.store.SQLProjectionAndSelectionStore', {
            storeId: 'SQLProjectionAndSelectionStore'
        });	    
	
	this.tableStore = Ext.create('Ext.letyourneilsgrow.sqlquerybuilder.store.SQLTableStore', {
            storeId: 'SQLTableStore'
        });
        
	this.joinStore = Ext.create('Ext.letyourneilsgrow.sqlquerybuilder.store.SQLJoinStore', {
            storeId: 'SQLJoinStore'
        });
        	        
        this.tableStore.on('update', this.onSQLTableUpdate, this);
        this.tableStore.on('add', this.onSQLTableAdd, this);
        this.tableStore.on('remove', this.onSQLTableRemove, this);
         
        this.projectionAndSelectionStore.on('update', this.onSQLProjectionAndSelectionChanges, this);
        this.projectionAndSelectionStore.on('remove', this.onSQLProjectionAndSelectionRemove, this);
                        
        this.joinStore.on('add', this.onSQLJoinChanges, this);
        this.joinStore.on('remove', this.onSQLJoinChanges, this);
        
        this.callParent(arguments);    
    },
    
    onSQLTableUpdate: function(tableStore, table, operation){
        alert("onSQLTableUpdate");
    },
    
    onSQLTableAdd: function(tableStore, table, index){
	alert("onSQLTableAdd");        
    },
    
    onSQLTableRemove: function(tableStore, table, index){
        alert("onSQLTableRemove");
    },
    
    onSQLJoinChanges: function(joinStore, join){
        alert("onSQLJoinChanges");
    },
    
    onSQLProjectionAndSelectionChanges: function(fieldStore, model, operation){
	alert("handleSQLFieldChanges");
    },
    
    onSQLProjectionAndSelectionRemove: function(fieldStore){
         alert("handleSQLFieldRemove");
    }
    
});