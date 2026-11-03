sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/m/MessageStrip',
  'sap/m/Title',
  'sap/m/Label',
  'sap/m/Text',
  'sap/m/Table',
  'sap/m/Column',
  'sap/m/ColumnListItem',
  'sap/m/ObjectStatus',
  'sap/m/Button',
  'sap/m/SearchField',
  'sap/m/Toolbar',
  'sap/ui/model/json/JSONModel'
], function (Controller, MessageStrip, Title, Label, Text, Table, Column, ColumnListItem, ObjectStatus, Button, SearchField, Toolbar, JSONModel) {
  'use strict';

  return Controller.extend('vaxresilience.controller.Module', {
    onInit: function () {
      this._page = this.byId('page');
      this._currentModule = null;
      this._router = this.getOwnerComponent().getRouter();
      this._routeMatched = this._onRouteMatched.bind(this);
      this._routeBypassed = this._onRouteBypassed.bind(this);
      this._router.attachRouteMatched(this._routeMatched);
      this._router.attachBypassed(this._routeBypassed);
      this._renderModule(window.VaxResilienceRouter.fromHash(window.location.hash));
    },

    onExit: function () {
      this._loadGeneration = (this._loadGeneration || 0) + 1;
      this._router.detachRouteMatched(this._routeMatched);
      this._router.detachBypassed(this._routeBypassed);
    },

    _onRouteMatched: function (event) {
      var routeName = event.getParameter('name');
      var routeArguments = event.getParameter('arguments') || {};
      var routeHash = routeName === 'home' ? '' : window.VaxResilienceRouter.toHash(routeArguments.module);
      this._renderModule(window.VaxResilienceRouter.fromHash(routeHash));
    },

    _onRouteBypassed: function () {
      this._router.navTo('home', {}, true);
      this._renderModule('executive-dashboard');
    },

    _renderModule: function (moduleId) {
      var moduleNames = window.VaxResilienceRouter.moduleNames;
      var title = moduleNames[moduleId] || moduleNames['executive-dashboard'];
      if (this._currentModule === moduleId) return;
      this._currentModule = moduleId;
      this._page.setTitle(title);
      this._page.removeAllContent();
      if (moduleId === 'risk-compliance-audit') this._showIntegrationMonitor();
      else this._addUnavailableState(title);
    },

    _addUnavailableState: function (title) {
      this._page.addContent(new MessageStrip({
        text: 'No operational data is loaded. The baseline scenario and API contracts are not yet approved; historical fixture events are not treated as opening state.',
        type: 'Information', showIcon: true, showCloseButton: false
      }));
      this._page.addContent(new Title({ text: title + ' foundation', level: 'H2' }));
      this._page.addContent(new Text({ text: 'This module has a navigation entry only. No module data or protected action is available in this shell.' }));
    },

    _showIntegrationMonitor: function () {
      var that = this;
      var model = new JSONModel({ messages: [], allMessages: [], filterQuery: '', error: '' });
      var errorStrip = new MessageStrip({
        text: '{/error}', type: 'Error', showIcon: true, showCloseButton: false,
        visible: '{= !!${/error} }'
      });
      var table = new Table({
        growing: true,
        popinLayout: 'GridSmall',
        noDataText: 'No integration messages are available in this local demo.',
        columns: [
          { label: 'Status' },
          { label: 'Direction', minScreenWidth: 'Tablet' },
          { label: 'Object' },
          { label: 'Correlation ID', minScreenWidth: 'Desktop' },
          { label: 'Source', minScreenWidth: 'Tablet' },
          { label: 'Retry count', minScreenWidth: 'Tablet' },
          { label: 'Updated', minScreenWidth: 'Desktop' },
          { label: 'Actions' }
        ].map(function (column) {
          var settings = {
            header: new Text({ text: column.label }),
            popinDisplay: 'Block'
          };
          if (column.minScreenWidth) {
            settings.minScreenWidth = column.minScreenWidth;
            settings.demandPopin = true;
          }
          return new Column(settings);
        }),
        items: { path: '/messages', template: new ColumnListItem({ cells: [
          new ObjectStatus({ text: '{status}', state: { path: 'status', formatter: function (status) { return status === 'FAILED' ? 'Error' : 'Information'; } } }),
          new Text({ text: '{direction}' }), new Text({ text: '{businessObject}' }),
          new Text({ text: '{correlationId}' }), new Text({ text: '{source}' }),
          new Text({ text: '{retryCount}' }), new Text({ text: '{modifiedAt}' }),
          new Button({ text: 'Simulate retry', enabled: "{= ${status} === 'FAILED' && ${source} === 'SIMULATION' }", press: function (event) { that._retryMessage(event, model, table); } })
        ] }) }
      });
      var toolbar = new Toolbar({ content: [
        new Button({ text: 'Refresh', icon: 'sap-icon://refresh', press: function () { that._loadMessages(model, table); } }),
        new Button({ text: 'Create demo failure', icon: 'sap-icon://add', press: function () { that._createDemoFailure(model, table); } })
      ] });
      var filterField = new SearchField({
        width: '100%',
        placeholder: 'Status, object, correlation ID, or source',
        tooltip: 'Filter integration messages by status, object, correlation ID, or source',
        liveChange: function (event) { that._applyMessageFilter(model, event.getParameter('newValue')); }
      });
      var filterLabel = new Label({ text: 'Filter integration messages' });
      filterLabel.setLabelFor(filterField);
      this._page.addContent(new MessageStrip({
        text: 'Synthetic demonstration data. No SAP or external provider is connected.',
        type: 'Information', showIcon: true, showCloseButton: false
      }));
      this._page.addContent(errorStrip);
      this._page.addContent(new Title({ text: 'Integration Operations', level: 'H2' }));
      this._page.addContent(filterLabel);
      this._page.addContent(filterField);
      this._page.addContent(toolbar);
      this._page.addContent(table);
      this._page.setModel(model);
      this._loadMessages(model, table);
    },

    _loadMessages: async function (model, table) {
      var requestId = this._loadGeneration = (this._loadGeneration || 0) + 1;
      model.setProperty('/error', '');
      table.setBusy(true);
      try {
        var messages = await window.VaxResilienceApi.listMessages();
        if (requestId !== this._loadGeneration) return;
        model.setProperty('/allMessages', messages);
        this._applyMessageFilter(model, model.getProperty('/filterQuery'));
        table.setNoDataText('No integration messages are available in this local demo.');
      } catch (error) {
        if (requestId !== this._loadGeneration) return;
        model.setProperty('/allMessages', []);
        model.setProperty('/messages', []);
        table.setNoDataText('Messages could not be loaded. Use Refresh to retry.');
        model.setProperty('/error', error.message);
      } finally {
        if (requestId === this._loadGeneration) table.setBusy(false);
      }
    },

    _applyMessageFilter: function (model, query) {
      var normalized = String(query || '').trim().toLowerCase();
      var messages = model.getProperty('/allMessages') || [];
      model.setProperty('/filterQuery', query || '');
      if (!normalized) {
        model.setProperty('/messages', messages.slice());
        return;
      }
      model.setProperty('/messages', messages.filter(function (message) {
        return [message.status, message.direction, message.businessObject, message.correlationId, message.source]
          .some(function (value) { return String(value || '').toLowerCase().indexOf(normalized) >= 0; });
      }));
    },

    _createDemoFailure: async function (model, table) {
      try {
        await window.VaxResilienceApi.createDemoFailure();
        await this._loadMessages(model, table);
      } catch (error) {
        model.setProperty('/error', error.message);
      }
    },

    _retryMessage: async function (event, model, table) {
      var row = event.getSource().getBindingContext().getObject();
      try {
        await window.VaxResilienceApi.retryMessage(row.ID);
        await this._loadMessages(model, table);
      } catch (error) {
        model.setProperty('/error', error.message);
      }
    }
  });
});
