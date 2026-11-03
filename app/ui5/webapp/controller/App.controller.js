sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'], function (Controller, MessageToast) {
  'use strict';

  var MODULES = [
    'executive-dashboard', 'supply-chain-digital-twin', 'ai-command-centre',
    'inventory-manufacturing', 'customers-orders', 'approvals-decisions',
    'risk-compliance-audit', 'resilience-impact-analytics'
  ];

  return Controller.extend('vaxresilience.controller.App', {
    onInit: function () {
      this._router = this.getOwnerComponent().getRouter();
      this._routeMatched = this._syncNavigation.bind(this);
      this._router.attachRouteMatched(this._routeMatched);
      this._syncNavigation();
    },

    onExit: function () {
      this._router.detachRouteMatched(this._routeMatched);
    },

    onAfterRendering: function () {
      this._syncNavigation();
    },

    onToggleNavigation: function () {
      this.byId('toolPage').toggleSideContentMode();
    },

    onNavigationSelect: function (event) {
      var key = event.getParameter('item').getKey();
      if (MODULES.indexOf(key) < 0) return;
      if (key === 'executive-dashboard') this._router.navTo('home');
      else this._router.navTo('module', { module: key });
    },

    onGlobalSearch: function (event) {
      var query = String(event.getParameter('query') || '').trim().toLocaleLowerCase();
      if (!query) return;

      var moduleNames = window.VaxResilienceRouter.moduleNames;
      var matches = MODULES.filter(function (moduleId) {
        return moduleId.toLowerCase().indexOf(query) >= 0 || moduleNames[moduleId].toLowerCase().indexOf(query) >= 0;
      });
      if (matches.length === 1) {
        this.onNavigationSelect({ getParameter: function () { return { getKey: function () { return matches[0]; } }; } });
        return;
      }

      MessageToast.show(matches.length > 0
        ? 'Search is ambiguous. Refine the module name. Business record search is unavailable.'
        : 'No module matches. Search covers module names only; business record search is unavailable.');
    },

    onNotifications: function () {
      MessageToast.show('Notifications are unavailable because no notification source is connected.');
    },

    _syncNavigation: function (event) {
      var routeName = event && event.getParameter('name');
      var args = event && event.getParameter('arguments') || {};
      var active = routeName === 'home' ? 'executive-dashboard' : args.module;
      if (routeName === 'module' && window.VaxResilienceRouter) {
        active = window.VaxResilienceRouter.fromHash(window.VaxResilienceRouter.toHash(args.module));
        if (args.module !== active) this._router.navTo('home', {}, true);
      }
      if (!active && window.VaxResilienceRouter) active = window.VaxResilienceRouter.fromHash(window.location.hash);
      var list = this.byId('moduleNavigation');
      if (!list) return;
      list.setSelectedKey(active);
    }
  });
});
