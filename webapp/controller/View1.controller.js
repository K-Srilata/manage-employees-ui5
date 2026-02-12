sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    Controller,
    MessageToast,
    Fragment,
    Filter,
    FilterOperator,
    MessageBox,
    ValueState,
    JSONModel,
  ) {
    "use strict";

    return Controller.extend("com.test.manageemployees.controller.View1", {
      onInit: function () {
        var oViewModel = new JSONModel({
          mode: "create",
          editMode: false,
        });

        this.getView().setModel(oViewModel, "viewModel");

        this.getOwnerComponent()
          .getRouter()
          .getRoute("RouteView1")
          .attachPatternMatched(this.onRouteMatched, this);
      },
      onRouteMatched: function (oEvent) {
        var sMode = oEvent.getParameter("arguments").mode;
        console.log("MODE:", sMode);
        var sPath = decodeURIComponent(oEvent.getParameter("arguments").path);
        console.log("PATH:", sPath);
        var oVM = this.getView().getModel("viewModel");
        if (sMode === "edit") {
          oVM.setProperty("/mode", "edit");
          oVM.setProperty("/editMode", false);
          //   this.getView().getModel("viewModel").setProperty("/mode", "edit");
          //   this.getView().getModel("viewModel").setProperty("/editMode", false);
          // } else {
          //   this.getView().getModel("viewModel").setProperty("/mode", "create");
          //   this.getView().getModel("viewModel").setProperty("/editMode", true);
          this.getView().bindElement({
            path: sPath,
            model: "employeeModel", 
          });
          console.log("Binding context:", this.getView().getBindingContext("employeeModel"));
        } else {
          oVM.setProperty("/mode", "create");
          oVM.setProperty("/editMode", true);
          this.onReset();
          // this.getView().unbindElement();
          this.getView().bindElement({ path: "/", model: "employeeModel" })
        }
      },
      _clearValueStates: function () {
        var aIds = [
          "firstName",
          "lastName",
          "emailId",
          "department",
          "managerSelect",
        ];

        aIds.forEach(
          function (sId) {
            var oControl = this.byId(sId);
            if (oControl) {
              oControl.setValueState(ValueState.None);
              oControl.setValueStateText("");
            }
          }.bind(this),
        );
      },
      onDeptHelp: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue();

        if (!this._pValueHelpDialog) {
          this._pValueHelpDialog = Fragment.load({
            id: this.getView().getId(),
            name: "com.test.manageemployees.view.DeptValueHelpDailog",
            controller: this,
          }).then(
            function (oDialog) {
              this.getView().addDependent(oDialog);
              return oDialog;
            }.bind(this),
          );
        }
        this._pValueHelpDialog.then(function (oDialog) {
          var oFilter = new Filter(
            "dept",
            FilterOperator.Contains,
            sInputValue,
          );
          // Create a filter for the binding
          oDialog.getBinding("items").filter([oFilter]);
          // Open ValueHelpDialog filtered by the input's value
          oDialog.open(sInputValue);
        });
      },
      onDeptSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("dept", FilterOperator.Contains, sValue);
        oEvent.getSource().getBinding("items").filter([oFilter]);
      },
      onDeptConfirm: function (oEvent) {
        var oSelectedItem = oEvent.getParameter("selectedItem");
        oEvent.getSource().getBinding("items").filter([]);

        if (oSelectedItem) {
          var sDept = oSelectedItem.getTitle();
          // this.getView()
          //   .getModel("employeeModel")
          //   .setProperty("/department", sDept);
          var oModel = this.getView().getModel("employeeModel");
          var oContext = this.getView().getBindingContext("employeeModel");
          var sPath = oContext ? "department" : "/department";
          oModel.setProperty(sPath, sDept, oContext);

          this.byId("department").setValueState("None");
        }
      },
      onDeptChange: function (oEvent) {
        var sValue = oEvent.getSource().getValue();

        var aDepts = this.getView()
          .getModel("deptModel")
          .getProperty("/departments");

        var bValid = false;

        for (var i = 0; i < aDepts.length; i++) {
          if (aDepts[i].dept === sValue) {
            bValid = true;
            break;
          }
        }

        oEvent
          .getSource()
          .setValueState(bValid ? ValueState.None : ValueState.Error);

        oEvent
          .getSource()
          .setValueStateText(bValid ? "" : "Please enter valid data");
      },
      onReset: function () {
        var oModel = this.getView().getModel("employeeModel");
        var oContext = this.getView().getBindingContext("employeeModel");
        var sPath = oContext ? "" : "/";
        oModel.setProperty(sPath + "firstName", "", oContext);
        oModel.setProperty(sPath + "middleName", "", oContext);
        oModel.setProperty(sPath + "lastName", "", oContext);
        oModel.setProperty(sPath + "email", "", oContext);
        oModel.setProperty(sPath + "phone", "", oContext);
        oModel.setProperty(sPath + "department", "", oContext);
        oModel.setProperty(sPath + "manager", "", oContext);
        oModel.setProperty(sPath + "managerId", "", oContext);
        oModel.setProperty(sPath + "startDate", "", oContext);
        this._clearValueStates();
      },
      onCancel: function () {
        MessageBox.confirm("Discard changes?", {
          title: "Confirm",
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
              this.onReset();
              // this.getRouter().navTo("RouteDetail");
              var oRouter = this.getOwnerComponent().getRouter();
              oRouter.navTo("RouteDetail");
            }
          }.bind(this),
        });
      },
      onEditPress: function () {
        var oVM = this.getView().getModel("viewModel");
        var bEdit = oVM.getProperty("/editMode");

        // If already editing → Save clicked
        if (bEdit) {
          this.onSubmit();
          return;
        }

        // else → enable editing
        oVM.setProperty("/editMode", true);
      },
      onManagerChange: function (oEvent) {
        var oCombo = oEvent.getSource();
        var sValue = oCombo.getValue();
        var sKey = oCombo.getSelectedKey();

        var oModel = this.getView().getModel("employeeModel");
        var oContext = this.getView().getBindingContext("employeeModel");
        var sPath = oContext ? "managerId" : "/managerId";

        var aManagers = this.getView()
          .getModel("managerModel")
          .getProperty("/managers");

        if (sKey) {
          oModel.setProperty(sPath, sKey, oContext);
          oCombo.setValueState(ValueState.None);
          return;
        }

        var oMatch = null;
        for (var i = 0; i < aManagers.length; i++) {
          if (aManagers[i].name === sValue) {
            oMatch = aManagers[i];
            break;
          }
        }

        if (!oMatch) {
          oCombo.setValueState(ValueState.Error);
          oCombo.setValueStateText("Please select a valid Manager");
          return;
        }

        oCombo.setSelectedKey(oMatch.id);
        oModel.setProperty(sPath, oMatch.id, oContext);
        oCombo.setValueState(ValueState.None);
      },
      onSubmit: function () {
        //   var oFirstNameInput = this.byId("firstName");
        //   var sFirstName = oFirstNameInput.getValue();
        //   var oLastNameInput = this.byId("lastName");
        //   var sLastName = oLastNameInput.getValue();
        //   var oEmailIdInput = this.byId("emailId");
        //   var sEmailId = oEmailIdInput.getValue();
        //   var oDeptInput = this.byId("department");
        //   var sDeptValue = oDeptInput.getValue();
        //   oFirstNameInput.setValueState("None");
        //   oLastNameInput.setValueState("None");
        //   oEmailIdInput.setValueState("None");

        //   if(!sFirstName || !sLastName || !sEmailId || !sDeptValue) {
        //     oFirstNameInput.setValueState("Error");
        //     oLastNameInput.setValueState("Error");
        //     oEmailIdInput.setValueState("Error");
        //     oDeptInput.setValueState("Error");
        //     MessageToast.error()
        //   }

        //   if (!sFirstName) {
        //     oFirstNameInput.setValueState("Error");
        //     oFirstNameInput.setValueStateText("First Name Required");
        //     MessageToast.show("First Name is required");
        //     return;
        //   }

        //   if (!sLastName) {
        //     oLastNameInput.setValueState("Error");
        //     oLastNameInput.setValueStateText("Last name Required");
        //     MessageToast.show("Last Name is required");
        //     return;
        //   }

        //   if (!sEmailId) {
        //     oEmailIdInput.setValueState("Error");
        //     oEmailIdInput.setValueStateText("Email is required");
        //     MessageToast.show("Email required");
        //     return;
        //   }
        //   if (!sDeptValue) {
        //     oDeptInput.setValueState("Error");
        //     oDeptInput.setValueStateText("Department is required");
        //     MessageToast.show("Select Department");
        //     return;
        //   }

        var sMode = this.getView().getModel("viewModel").getProperty("/mode");

        var bValid = true;

        var aFields = [
          { id: "firstName", msg: "First Name is required" },
          { id: "lastName", msg: "Last Name is required" },
          { id: "emailId", msg: "Email is required" },
          { id: "department", msg: "Department is required" },
        ];

        aFields.forEach(
          function (oField) {
            var oControl = this.byId(oField.id);
            var sValue = oControl.getValue();

            if (!sValue) {
              oControl.setValueState("Error");
              oControl.setValueStateText(oField.msg);
              bValid = false;
            } else {
              oControl.setValueState("None");
            }
          }.bind(this),
        );

        var oManager = this.byId("managerSelect");
        console.log(oManager);
        var sManagerKey = oManager.getSelectedKey();
        if (!sManagerKey) {
          oManager.setValueState(ValueState.Error);
          oManager.setValueStateText("Please select a valid Manager");
          bValid = false;
        } else {
          oManager.setValueState(ValueState.None);
        }

        if (!bValid) {
          MessageToast.show("Please fill all required fields");
          return;
        }

        var oEmpModel = this.getView().getModel("employeeModel");
        var sDept = oEmpModel.getProperty("/department");

        var aDepts = this.getView()
          .getModel("deptModel")
          .getProperty("/departments");

        var dValid = false;

        for (var i = 0; i < aDepts.length; i++) {
          if (aDepts[i].dept === sDept) {
            dValid = true;
            break;
          }
        }

        var oDeptInput = this.getView().byId("department");

        if (!dValid) {
          oDeptInput.setValueState(ValueState.Error);
          oDeptInput.setValueStateText("Please select a valid Department");
          return;
        }

        oDeptInput.setValueState(ValueState.None);

        // var oData = oEmpModel.getData();
        // var aEmployees = oEmpModel.getProperty("/employees") || [];

        // var oNewEmployee = {
        //   firstName: oData.firstName,
        //   middleName: oData.middleName,
        //   lastName: oData.lastName,
        //   email: oData.email,
        //   phone: oData.phone,
        //   department: oData.department,
        //   manager: oData.manager,
        //   startDate: oData.startDate,
        // };

        // aEmployees.push(oNewEmployee);
        // oEmpModel.setProperty("/employees", aEmployees);

        // MessageToast.show("Employee created!");
        // this.onReset();
        // this.getOwnerComponent().getRouter().navTo("RouteDetail");

        var oData = oEmpModel.getData();
        var aEmployees = oEmpModel.getProperty("/employees") || [];

        if (sMode === "create") {
          var oNewEmployee = {
            firstName: oData.firstName,
            middleName: oData.middleName,
            lastName: oData.lastName,
            email: oData.email,
            phone: oData.phone,
            department: oData.department,
            manager: oData.manager,
            startDate: oData.startDate,
          };

          aEmployees.push(oNewEmployee);
          oEmpModel.setProperty("/employees", aEmployees);

          MessageToast.show("Employee created!");
        } else {
          // //edit
          // var iIndex = aEmployees.findIndex(function (emp) {
          //   return emp.email === oData.email;
          // });

          // if (iIndex !== -1) {
          //   aEmployees[iIndex] = oData;
          //   oEmpModel.setProperty("/employees", aEmployees);
          // }
          MessageToast.show("Employee updated!");
        }
        this.getView().getModel("viewModel").setProperty("/editMode", false);
        this.getOwnerComponent().getRouter().navTo("RouteDetail");
      },
    });
  },
);
