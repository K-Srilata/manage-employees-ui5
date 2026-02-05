/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define(
  [
    "sap/ui/core/UIComponent", //core lib
    "sap/ui/Device", //device model
    "com/test/manageemployees/model/models",
  ],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("com.test.manageemployees.Component", {
      //creates app component(app constructor)
      metadata: {
        manifest: "json",
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        UIComponent.prototype.init.apply(this, arguments); //calls parent class init this is pointing current controller
        var oManagerModel = this.getModel("managerModel");

        if (oManagerModel) {
          oManagerModel.setSizeLimit(500);
        }

        this.getRouter().initialize();

        this.setModel(models.createDeviceModel(), "device");
        // this.setModel(oModel, "device");
      },
    });
  }
);
