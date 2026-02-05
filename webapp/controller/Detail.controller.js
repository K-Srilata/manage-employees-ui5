sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/test/manageemployees/model/formatter"
], function (Controller, formatter) {
    "use strict";

    return Controller.extend("com.test.manageemployees.controller.Detail", {
        formatter: formatter,
        onInit() {

        },
        onCreateNewEmployee: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView1")
        }
        //     onHelloHrBtnPress: function () {
        //     // alert("click me")
        //     // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //     var oRouter = this.getOwnerComponent().getRouter();
        //     oRouter.navTo("RouteView1");
        //   },
        //     helloWorldBtnPress: function() {
        //         window.history.go(-1);
        //     }
    })
})