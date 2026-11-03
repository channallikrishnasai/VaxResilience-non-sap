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
  'sap/m/VBox',
  'sap/m/FlexBox',
  'sap/ui/model/json/JSONModel'
], function (Controller, MessageStrip, Title, Label, Text, Table, Column, ColumnListItem, ObjectStatus, Button, SearchField, Toolbar, VBox, FlexBox, JSONModel) {
  'use strict';

  return Controller.extend('vaxresilience.controller.Module', {
    onInit: function () {
      this._page = this.byId('page');
      this._currentModule = null;
      this._archiveOpen = false;
      this._archiveGeneration = 0;
      this._dashboardGeneration = 0;
      this._page.addStyleClass('vr-module-page');
      this._router = this.getOwnerComponent().getRouter();
      this._routeMatched = this._onRouteMatched.bind(this);
      this._routeBypassed = this._onRouteBypassed.bind(this);
      this._router.attachRouteMatched(this._routeMatched);
      this._router.attachBypassed(this._routeBypassed);
      this._renderModule(window.VaxResilienceRouter.fromHash(window.location.hash));
    },

    onExit: function () {
      this._loadGeneration = (this._loadGeneration || 0) + 1;
      this._dashboardGeneration = (this._dashboardGeneration || 0) + 1;
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

    _renderModule: function (moduleId, force) {
      var moduleNames = window.VaxResilienceRouter.moduleNames;
      var title = moduleNames[moduleId] || moduleNames['executive-dashboard'];
      if (!force && this._currentModule === moduleId) return;
      this._archiveGeneration = (this._archiveGeneration || 0) + 1;
      this._dashboardGeneration = (this._dashboardGeneration || 0) + 1;
      this._currentModule = moduleId;
      this._page.setTitle(title);
      this._page.removeAllContent();
      if (moduleId === 'risk-compliance-audit') this._showIntegrationMonitor();
      if (this._archiveOpen) this._showHistoricalArchive(moduleId);
      else if (moduleId === 'executive-dashboard') this._showOperationsDashboard();
      else if (moduleId !== 'risk-compliance-audit') this._addUnavailableState(title);
    },

    _addUnavailableState: function (title) {
      this._page.addContent(new MessageStrip({
        text: 'No operational data is loaded. The baseline scenario and API contracts are not yet approved; historical fixture events are not treated as opening state.',
        type: 'Information', showIcon: true, showCloseButton: false
      }));
      this._page.addContent(new Title({ text: title + ' foundation', level: 'H2' }));
      this._page.addContent(new Text({ text: 'This module has a navigation entry only. No module data or protected action is available in this shell.' }));
      this._page.addContent(new Button({
        text: 'Open historical synthetic fixture archive',
        press: this._openHistoricalArchive.bind(this)
      }));
    },

    _openHistoricalArchive: function () {
      this._archiveOpen = true;
      this._renderModule(this._currentModule || 'executive-dashboard', true);
    },

    _closeHistoricalArchive: function () {
      this._archiveOpen = false;
      this._renderModule(this._currentModule || 'executive-dashboard', true);
    },

    _showHistoricalArchive: async function (moduleId) {
      var generation = this._archiveGeneration;
      var page = this._page;
      var moduleNames = window.VaxResilienceRouter.moduleNames;
      var archiveNotes = {
        'executive-dashboard': 'Scenario facts are synthetic comparisons only; no active incident or normalized forecast is loaded.',
        'supply-chain-digital-twin': 'All organizations and routes are fictional; no live map position or geographic coordinates are supplied.',
        'ai-command-centre': 'Agent records are historical synthetic fixtures; no AI model or live agent runtime is connected.',
        'inventory-manufacturing': 'Stock and qualification records do not indicate current availability or establish supplier eligibility.',
        'customers-orders': 'Orders and demand records are fictional historical examples; no current allocation decision is represented.',
        'approvals-decisions': 'Historical approval records do not authorize current actions; this archive cannot grant an approval.',
        'risk-compliance-audit': 'Alerts and evidence are synthetic; they do not assert real misconduct or current holds.',
        'resilience-impact-analytics': 'Scenario metrics are synthetic estimates, not patient outcomes or validated forecasts.'
      };
      var message = new Text({ text: 'Loading the selected historical fixture records…' });
      page.addContent(new MessageStrip({
        text: 'Historical synthetic archive only — not opening or current operational state. Read-only; no operational action is available.',
        type: 'Warning', showIcon: true, showCloseButton: false
      }));
      page.addContent(new Title({ text: moduleNames[moduleId] + ' — fixture archive', level: 'H2' }));
      page.addContent(new Button({ text: 'Close historical archive', press: this._closeHistoricalArchive.bind(this) }));
      page.addContent(message);

      try {
        var archive = await window.VaxResilienceArchive.load(moduleId);
        if (generation !== this._archiveGeneration || !this._archiveOpen || moduleId !== this._currentModule) return;
        message.setText(`${archive.manifest.title} (${archive.manifest.scenarioStart} to ${archive.manifest.scenarioEnd}). ${archive.manifest.fictionalDisclaimer}`);
        page.addContent(new MessageStrip({
          text: archiveNotes[moduleId],
          type: 'Warning', showIcon: true, showCloseButton: false
        }));
        page.addContent(new MessageStrip({
          text: 'Excluded from this archive: calculationAssumptions and productionPlans (no approved record schemas), dependent productionBatches and productionConsumptions, and impactEstimates that reference unresolved calculation assumptions.',
          type: 'Information', showIcon: true, showCloseButton: false
        }));

        if (moduleId === 'supply-chain-digital-twin') {
          this._showHistoricalNetwork(archive.collections);
          return;
        }
        if (moduleId !== 'executive-dashboard') {
          this._showFixtureCollections(archive.collections);
          return;
        }
        this._showHistoricalDashboard(archive.manifest.scenarioFacts);
        this._showFixtureCollections(archive.collections);
      } catch (_error) {
        if (generation !== this._archiveGeneration || !this._archiveOpen || moduleId !== this._currentModule) return;
        message.setText('Historical fixture records could not be loaded. Close the archive to return to the empty operational foundation.');
      }
    },

    _showHistoricalNetwork: function (collections) {
      var network = window.VaxResilienceDigitalTwin.build(collections);
      this._page.addContent(new MessageStrip({
        text: 'Relationship view is derived only from explicit synthetic fixture references. It has no geographic coordinates, live positions, or map service. Historical shipment and fulfilment states are not current.',
        type: 'Information', showIcon: true, showCloseButton: false
      }));
      this._page.addContent(new Title({ text: 'Synthetic network entities', level: 'H3' }));
      this._page.addContent(this._archiveTable(network.nodes, [
        ['id', 'Record ID'], ['type', 'Entity type'], ['name', 'Name'], ['location', 'Source location'], ['state', 'Fixture state']
      ], 'No network entities are available.'));
      this._page.addContent(new Title({ text: 'Fixture-declared relationships', level: 'H3' }));
      this._page.addContent(this._archiveTable(network.relationships, [
        ['sourceId', 'From ID'], ['sourceName', 'From'], ['targetId', 'To ID'], ['targetName', 'To'], ['relationship', 'Relationship'], ['context', 'Fixture reference']
      ], 'No resolvable network relationships are available.'));
      if (network.unresolvedReferences.length) {
        this._page.addContent(new MessageStrip({
          text: `${network.unresolvedReferences.length} fixture references could not be resolved and are omitted from the relationship table.`,
          type: 'Warning', showIcon: true, showCloseButton: false
        }));
      }
    },

    _showHistoricalDashboard: function (scenarioFacts) {
      var facts = Object.keys(scenarioFacts).map(function (field) {
        var value = scenarioFacts[field];
        return {
          field: field,
          sourceValue: value === null || value === undefined
            ? 'Not provided in source'
            : typeof value === 'object' ? JSON.stringify(value) : String(value)
        };
      });
      this._page.addContent(new MessageStrip({
        text: 'Historical source-manifest facts only. Values are not recalculated. Day-based fields retain their source names; calendar/production-day interpretation is unresolved (D-01). This is not current incident state.',
        type: 'Information', showIcon: true, showCloseButton: false
      }));
      this._page.addContent(new Title({ text: 'Scenario manifest facts', level: 'H3' }));
      this._page.addContent(this._archiveTable(facts, [
        ['field', 'Manifest field'], ['sourceValue', 'Source value']
      ], 'The source manifest has no scenario facts.'));
    },

    _showOperationsDashboard: function () {
      var that = this;
      var model = new JSONModel({
        total: 'Loading…', failed: 'Loading…', retries: 'Loading…', latest: 'Loading…',
        messages: [], error: '', sampleNotice: '', connectionState: 'Checking CAP monitor…'
      });
      var errorStrip = new MessageStrip({
        text: '{/error}', type: 'Error', showIcon: true, showCloseButton: false,
        visible: '{= !!${/error} }'
      });
      var pageIntro = new VBox({ items: [
        new Title({ text: 'Operations overview', level: 'H2' }),
        new Text({ text: 'Monitor CAP integration activity and recover simulated failures.' })
      ] });
      pageIntro.addStyleClass('vr-page-intro');

      var metricDefinitions = [
        ['Integration messages', '{/total}', 'sap-icon://message-popup'],
        ['Failed messages', '{/failed}', 'sap-icon://alert'],
        ['Recorded retries', '{/retries}', 'sap-icon://refresh'],
        ['Latest activity', '{/latest}', 'sap-icon://history']
      ];
      var cards = new FlexBox({
        wrap: 'Wrap', justifyContent: 'Start', alignItems: 'Stretch',
        items: metricDefinitions.map(function (definition) {
          var card = new VBox({ items: [
            new Label({ text: definition[0] }),
            new Text({ text: definition[1], wrapping: true })
          ] });
          card.addStyleClass('vr-metric-card');
          card.addStyleClass('vr-metric-card-' + definition[2].split('/').pop());
          return card;
        })
      });
      cards.setModel(model);

      var table = new Table({
        growing: true,
        growingThreshold: 8,
        popinLayout: 'GridSmall',
        noDataText: 'No integration messages have been recorded.',
        columns: [
          { label: 'Status' }, { label: 'Business object' },
          { label: 'Correlation ID', minScreenWidth: 'Tablet' },
          { label: 'Source' }, { label: 'Updated', minScreenWidth: 'Tablet' }
        ].map(function (column) {
          var settings = { header: new Text({ text: column.label }), popinDisplay: 'Block' };
          if (column.minScreenWidth) {
            settings.minScreenWidth = column.minScreenWidth;
            settings.demandPopin = true;
          }
          return new Column(settings);
        }),
        items: { path: '/messages', template: new ColumnListItem({ cells: [
          new ObjectStatus({ text: '{status}', state: { path: 'status', formatter: function (status) { return status === 'FAILED' ? 'Error' : 'Information'; } } }),
          new Text({ text: '{businessObject}' }), new Text({ text: '{correlationId}' }),
          new Text({ text: '{source}' }), new Text({ text: '{modifiedAt}' })
        ] }) }
      });
      table.setModel(model);

      var toolbar = new Toolbar({ content: [
        new Button({ text: 'Refresh', icon: 'sap-icon://refresh', press: function () { that._loadDashboardMessages(model, table); } }),
        new Button({ text: 'Create simulated failure', icon: 'sap-icon://add', press: function () { that._createDashboardFailure(model, table); } }),
        new Button({ text: 'Generate sample traffic (8)', icon: 'sap-icon://process', tooltip: 'Create eight synthetic CAP messages; record simulated retries for four.', press: function () { that._generateDashboardTraffic(model, table); } }),
        new Button({ text: 'Open integration queue', icon: 'sap-icon://navigation-right-arrow', press: function () {
          that._router.navTo('module', { module: 'risk-compliance-audit' });
        } }),
        new Button({ text: 'Historical fixture archive', icon: 'sap-icon://database', press: this._openHistoricalArchive.bind(this) })
      ] });

      this._page.addContent(new MessageStrip({
        text: 'Connected to the CAP monitoring service. Local simulation only: no SAP Integration Suite or external provider is connected.',
        type: 'Information', showIcon: true, showCloseButton: false
      }));
      this._page.addContent(pageIntro);
      this._page.addContent(errorStrip);
      this._page.addContent(new MessageStrip({
        text: '{/sampleNotice}', type: 'Information', showIcon: true, showCloseButton: true,
        visible: '{= !!${/sampleNotice} }', close: function () { model.setProperty('/sampleNotice', ''); }
      }));
      this._page.addContent(cards);
      this._page.addContent(new Title({ text: 'Recent integration activity', level: 'H3' }));
      this._page.addContent(toolbar);
      this._page.addContent(table);
      this._page.setModel(model);
      this._loadDashboardMessages(model, table);
    },

    _loadDashboardMessages: async function (model, table) {
      var requestId = this._dashboardGeneration = (this._dashboardGeneration || 0) + 1;
      model.setProperty('/error', '');
      model.setProperty('/connectionState', 'Loading CAP monitoring data…');
      table.setBusy(true);
      try {
        var messages = await window.VaxResilienceApi.listMessages();
        if (requestId !== this._dashboardGeneration) return;
        var failed = messages.filter(function (message) { return message.status === 'FAILED'; }).length;
        var retries = messages.reduce(function (total, message) { return total + (Number(message.retryCount) || 0); }, 0);
        model.setProperty('/messages', messages.slice(0, 8));
        model.setProperty('/total', String(messages.length));
        model.setProperty('/failed', String(failed));
        model.setProperty('/retries', String(retries));
        model.setProperty('/latest', messages.length ? String(messages[0].modifiedAt || 'Not provided') : 'No activity yet');
        model.setProperty('/connectionState', 'CAP monitoring service available');
        table.setNoDataText('No integration messages have been recorded. Create a simulated failure to exercise the queue.');
      } catch (_error) {
        if (requestId !== this._dashboardGeneration) return;
        model.setProperty('/messages', []);
        model.setProperty('/total', 'Unavailable');
        model.setProperty('/failed', 'Unavailable');
        model.setProperty('/retries', 'Unavailable');
        model.setProperty('/latest', 'Unavailable');
        model.setProperty('/connectionState', 'CAP monitoring service unavailable');
        model.setProperty('/error', 'CAP monitoring data could not be loaded. Use Refresh to retry.');
        table.setNoDataText('Messages are unavailable until the CAP monitoring service responds.');
      } finally {
        if (requestId === this._dashboardGeneration) table.setBusy(false);
      }
    },

    _createDashboardFailure: async function (model, table) {
      try {
        await window.VaxResilienceApi.createDemoFailure();
        await this._loadDashboardMessages(model, table);
      } catch (_error) {
        model.setProperty('/error', 'The simulated failure could not be created. Check CAP connectivity and retry.');
      }
    },

    _generateDashboardTraffic: async function (model, table) {
      model.setProperty('/error', '');
      model.setProperty('/sampleNotice', '');
      table.setBusy(true);
      try {
        for (var index = 0; index < 8; index += 1) {
          var message = await window.VaxResilienceApi.createDemoFailure();
          if (index % 2 === 1) await window.VaxResilienceApi.retryMessage(message.ID);
        }
        model.setProperty('/sampleNotice', 'Added eight clearly labeled synthetic CAP messages; four retries were recorded locally. No external system was contacted.');
        await this._loadDashboardMessages(model, table);
      } catch (_error) {
        model.setProperty('/sampleNotice', 'Sample traffic stopped before all eight messages were created. Refresh to see records successfully written so far.');
        model.setProperty('/error', 'The sample traffic request did not complete.');
        table.setBusy(false);
      }
    },

    _archiveTable: function (records, fields, emptyText) {
      var model = new JSONModel({ records: records });
      var table = new Table({
        growing: true,
        growingThreshold: 20,
        noDataText: emptyText,
        columns: fields.map(function (field) {
          return new Column({ header: new Text({ text: field[1] }) });
        }),
        items: { path: '/records', template: new ColumnListItem({ cells: fields.map(function (field) {
          return new Text({ text: `{${field[0]}}`, wrapping: true });
        }) }) }
      });
      table.setModel(model);
      return table;
    },

    _showFixtureCollections: function (collections) {
      var that = this;
      collections.forEach(function (collection) {
        that._page.addContent(new Title({ text: collection.name, level: 'H3' }));
        var fieldNames = [...new Set(collection.records.reduce(function (fields, record) {
          return fields.concat(Object.keys(record));
        }, []))];
        if (fieldNames.length === 0) {
          that._page.addContent(new Text({ text: 'No records are present in this fixture collection.' }));
          return;
        }

        var displayRecords = collection.records.map(function (record) {
          var display = {};
          fieldNames.forEach(function (field) {
            var value = record[field];
            display[field] = value === null || value === undefined
              ? 'Not provided in source'
              : typeof value === 'object' ? JSON.stringify(value) : String(value);
          });
          return display;
        });
        var model = new JSONModel({ records: displayRecords });
        var filterField = new SearchField({
          width: '100%',
          placeholder: `Filter historical ${collection.name}`,
          tooltip: `Filter source fixture fields in ${collection.name}; values are not changed`,
          liveChange: function (event) {
            var query = String(event.getParameter('newValue') || '').trim().toLowerCase();
            model.setData({ records: displayRecords.filter(function (record) {
              return JSON.stringify(record).toLowerCase().indexOf(query) >= 0;
            }) });
          }
        });
        var filterLabel = new Label({ text: `Filter ${collection.name}` });
        filterLabel.setLabelFor(filterField);
        that._page.addContent(filterLabel);
        that._page.addContent(filterField);
        var table = new Table({
          growing: true,
          growingThreshold: 20,
          noDataText: 'No historical fixture records match this filter.',
          columns: fieldNames.map(function (field) {
            var header = field.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, function (letter) { return letter.toUpperCase(); });
            return new Column({ header: new Text({ text: header }) });
          }),
          items: { path: '/records', template: new ColumnListItem({ cells: fieldNames.map(function (field) {
            return new Text({ text: `{${field}}`, wrapping: true });
          }) }) }
        });
        table.setModel(model);
        that._page.addContent(table);
      });
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
        new Button({ text: 'Create demo failure', icon: 'sap-icon://add', press: function () { that._createDemoFailure(model, table); } }),
        new Button({
          text: this._archiveOpen ? 'Close historical archive' : 'Open historical synthetic fixture archive',
          press: this._archiveOpen ? this._closeHistoricalArchive.bind(this) : this._openHistoricalArchive.bind(this)
        })
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
