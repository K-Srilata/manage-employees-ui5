sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("com.test.manageemployees.controller.Onboarding", {

    onInit: function () {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("RouteOnboarding")
        .attachPatternMatched(this._onMatched, this);
    },

_onMatched: function (oEvent) {

  var sPath = decodeURIComponent(
    oEvent.getParameter("arguments").path
  );

  var oModel = this.getView().getModel();

  oModel.read(sPath, {
    success: function (oData) {

      // Bind element fresh
      this.getView().bindElement({
        path: sPath
      });

      // Build timeline using fresh backend data
      this._buildTimeline(oData);

    }.bind(this),

    error: function () {
      sap.m.MessageToast.show("Error loading onboarding data");
    }
  });
},

    _buildTimeline: function (oData) {

      var aItems = [];

      function createItem(label, flag) {

        var bCompleted = flag === "X";

        return {
          title: label,
          description: bCompleted
            ? label + " completed successfully"
            : label + " is pending",
          state: bCompleted ? "Success" : "Warning",
          icon: bCompleted
            ? "sap-icon://accept"
            : "sap-icon://pending"
        };
      }

      aItems.push(createItem("Paperwork", oData.Paperwork));
      aItems.push(createItem("Equipment Assignment", oData.Equipment));
      aItems.push(createItem("Orientation", oData.Orientation));
      aItems.push(createItem("IT Access", oData.Itaccess));

      var iProgress = this._calculateProgress(oData);

      var oModel = new JSONModel({
        items: aItems,
        progress: iProgress
      });

      this.getView().setModel(oModel, "timelineModel");
    },

    _calculateProgress: function (oData) {
      if (!oData) return 0;
      var aFlags = [
        oData.Paperwork,
        oData.Equipment,
        oData.Orientation,
        oData.Itaccess
      ];

      var iCompleted = aFlags.filter(function (f) {
        return f === "X";
      }).length;

      return Math.round((iCompleted / aFlags.length) * 100);
    }

  });
});