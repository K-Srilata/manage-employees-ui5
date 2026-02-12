sap.ui.define(
  ["sap/ui/core/mvc/Controller", 
    "com/test/manageemployees/model/formatter",
  "sap/ui/model/Filter",
"sap/ui/model/FilterOperator"
],
  function (Controller, formatter, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.test.manageemployees.controller.Detail", {
      formatter: formatter,
      onInit() { },
      onCreateNewEmployee: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("RouteView1" , {
          mode: "create",
          path: "new"
        });
      },
      onTogglePress: function (oEvent) {
        var bPressed = oEvent.getParameter("pressed");

        if (bPressed) {
          // show list
          this.byId("employeeTable").setVisible(false);
          this.byId("employeelist").setVisible(true);

          oEvent.getSource().setText("Show Table View");
        } else {
          // show table
          this.byId("employeeTable").setVisible(true);
          this.byId("employeelist").setVisible(false);

          oEvent.getSource().setText("Show List View");
        }
      },
      //   onSwitchChange : function(oEvent) {
      //     var bState = oEvent.getParameter("state")

      //     this.byId("employeeTable").setVisible(!bState)
      //     this.byId("employeelist").setVisible(bState)
      //   },

      // onEmployeePress: function (oEvent) {
      //   var oControl = oEvent.getSource().getBindingContext("employeeModel");
      //   var oEmployee = oControl.getObject();
      //   console.log(oEmployee);
      //   var oModel = this.getOwnerComponent().getModel("selectedEmployee");
      //   oModel.setData(oEmployee);
      //   console.log(oEmployee);
      //   console.log("Selected model:", oModel.getData());
      //   this.getOwnerComponent().getRouter().navTo("RouteView1" , {
      //     mode:"edit"
      //   });

      //   // var oRouter = this.getOwnerComponent().getRouter();
      //   // oRouter.navTo("EmployeeDetail")
      // },

      onEmployeePress: function (oEvent) {

        // var oEmp = oEvent
        //   .getSource()
        //   .getBindingContext("employeeModel")
        //   .getObject();
        var oEmp = oEvent 
            .getSource()
            .getBindingContext("employeeModel")
            

        var sPath = oEmp.getPath();


        // var oModel = this.getOwnerComponent().getModel("employeeModel");

        // oModel.setProperty("/firstName", oEmp.firstName);
        // oModel.setProperty("/middleName", oEmp.middleName);
        // oModel.setProperty("/lastName", oEmp.lastName);
        // oModel.setProperty("/email", oEmp.email);
        // oModel.setProperty("/phone", oEmp.phone);
        // oModel.setProperty("/department", oEmp.department);
        // oModel.setProperty("/manager", oEmp.manager);
        // oModel.setProperty("/startDate", oEmp.startDate);

        this.getOwnerComponent().getRouter().navTo("RouteView1", { 
          mode: "edit" ,
          path: encodeURIComponent(sPath) 
        });
      },

onSearch: function (oEvent) {

    var sQuery = oEvent.getSource().getValue();
    var oTable = this.byId("employeeTable");
    var oList = this.byId("employeelist");

    var aFilters = [];

    if (sQuery && sQuery.length > 0) {

        var aSubFilters = [
            new Filter("firstName", sap.ui.model.FilterOperator.Contains, sQuery),
            new Filter("lastName", sap.ui.model.FilterOperator.Contains, sQuery),
            new Filter("email", sap.ui.model.FilterOperator.Contains, sQuery),
            new Filter("phone", sap.ui.model.FilterOperator.Contains, sQuery),
            new Filter("department", sap.ui.model.FilterOperator.Contains, sQuery),
            new Filter("manager", sap.ui.model.FilterOperator.Contains, sQuery),
            new Filter("startDate", sap.ui.model.FilterOperator.Contains, sQuery)

        ];

        aFilters.push(new Filter({
            filters: aSubFilters,
            and: false   // Orcondition
        }));
    }
    //table
    var oTableBinding = oTable.getBinding("items");
    oTableBinding.filter(aFilters);
    //list
    var oListBinding = oList.getBinding("items");
    oListBinding.filter(aFilters);
},
      //     onHelloHrBtnPress: function () {
      //     // alert("click me")
      //     // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      //     var oRouter = this.getOwnerComponent().getRouter();
      //     oRouter.navTo("RouteView1");
      //   },
      //     helloWorldBtnPress: function() {
      //         window.history.go(-1);
      //     }
    });
  },
);
