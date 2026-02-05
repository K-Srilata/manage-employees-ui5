sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
  ],
  function (
    Controller,
    MessageToast,
    Fragment,
    Filter,
    FilterOperator,
    MessageBox,
    ValueState,
  ) {
    "use strict";

    return Controller.extend("com.test.manageemployees.controller.View1", {
      onInit: function () {
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
          }).then(function (oDialog) {
            this.getView().addDependent(oDialog);
            return oDialog;
          }.bind(this));
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
          this.getView()
            .getModel("employeeModel")
            .setProperty("/department", sDept);

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
        var oModel = this.getView().getModel("employeeModel")
         oModel.setProperty("/firstName", "");
          oModel.setProperty("/middleName", "");
          oModel.setProperty("/lastName", "");
          oModel.setProperty("/email", "");
          oModel.setProperty("/phone", "");
          oModel.setProperty("/department", "");
          oModel.setProperty("/manager", "");
          oModel.setProperty("/startDate", "");
        this._clearValueStates();
      },
      onCancel: function () {
        MessageBox.confirm("Discard changes?", {
          title: "Confirm",
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
              this.getView().getModel("employeeModel").setData({
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                phone: "",
                department: "",
                managerId: "",
                startDate: "",
              });
              this._clearValueStates();
              // this.getRouter().navTo("RouteDetail");
              var oRouter = this.getOwnerComponent().getRouter();
              oRouter.navTo("RouteDetail");
            }
          }.bind(this),
        });
      },

      onManagerChange: function (oEvent) {
        var oCombo = oEvent.getSource();
        var sValue = oCombo.getValue();
        var sKey = oCombo.getSelectedKey();

        var aManagers = this.getView()
          .getModel("managerModel")
          .getProperty("/managers");

        if (sKey) {
          this.getView()
            .getModel("employeeModel")
            .setProperty("/managerId", sKey);

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
        this.getView()
          .getModel("employeeModel")
          .setProperty("/managerId", oMatch.id);

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

        var aDepts = this.getView().getModel("deptModel").getProperty("/departments");

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

        var oData = oEmpModel.getData();
        var aEmployees = oEmpModel.getProperty("/employees") || [];

        var oNewEmployee = {
          firstName: oData.firstName,
          middleName: oData.middleName,
          lastName: oData.lastName,
          email: oData.email,
          phone: oData.phone,
          department: oData.department,
          manager: oData.manager,
          startDate: oData.startDate
        };

        aEmployees.push(oNewEmployee);
        oEmpModel.setProperty("/employees", aEmployees);

        MessageToast.show("Employee created!");
        this.onReset();
        this.getOwnerComponent().getRouter().navTo("RouteDetail");
      },
    });
  },
);
