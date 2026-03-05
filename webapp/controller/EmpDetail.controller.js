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

    return Controller.extend("com.test.manageemployees.controller.EmpDetail", {
      onInit: function () {
        var oViewModel = new JSONModel({
          mode: "create",
        });

        this.getView().setModel(oViewModel, "viewModel");

        this.getOwnerComponent()
          .getRouter()
          .getRoute("RouteEmpDetail")
          .attachPatternMatched(this.onRouteMatched, this);
      },

      onOpenChecklist: function () {
        var oView = this.getView();
        var oContext = oView.getBindingContext();

        if (!this._pChecklistDialog) {
          this._pChecklistDialog = Fragment.load({
            id: oView.getId(),
            name: "com.test.manageemployees.fragment.OnboardingChecklist",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog; 
          });
        }

        this._pChecklistDialog.then(function (oDialog) {
          // Set correct binding context every time
          oDialog.setBindingContext(oContext);

          oDialog.open();
        });
      },

      onCloseChecklist: function () {
        this._pChecklistDialog.then(function (oDialog) {
          oDialog.close();
        });
      },

      onPaperworkChange: function (oEvent) {
        this._updateOnboardingFlag(
          "Paperwork",
          oEvent.getParameter("selected"),
        );
      },

      onEquipmentChange: function (oEvent) {
        this._updateOnboardingFlag(
          "Equipment",
          oEvent.getParameter("selected"),
        );
      },

      onOrientationChange: function (oEvent) {
        this._updateOnboardingFlag(
          "Orientation",
          oEvent.getParameter("selected"),
        );
      },
      onItAccessChange: function (oEvent) {
        this._updateOnboardingFlag("Itaccess", oEvent.getParameter("selected"));
      },
      _updateOnboardingFlag: function (sProperty, bSelected) {
        var oModel = this.getView().getModel();
        var oContext = this.getView().getBindingContext();
        var oPayload = {};
        oPayload[sProperty] = bSelected ? "X" : "";
        oModel.update(oContext.getPath(), oPayload, {
          success: function () {
            oModel.refresh(true);
            sap.m.MessageToast.show("Updated successfully");
          },
          error: function () {
            sap.m.MessageToast.show("Update failed");
          },
        });
      },

      onOpenTimeline: function () {
        var sPath = this.getView().getBindingContext().getPath();

        this.getOwnerComponent()
          .getRouter()
          .navTo("RouteOnboarding", {
            path: encodeURIComponent(sPath),
          });
      },

      onEmpIdLiveChange: function (oEvent) {
        var _oInput = oEvent.getSource();
        var val = _oInput.getValue();
        val = val.replace(/[^\d]/g, "");
        _oInput.setValue(val);
      },

      onRouteMatched: function (oEvent) {
        var sMode = oEvent.getParameter("arguments").mode;
        console.log("MODE:", sMode);
        var sPath = decodeURIComponent(oEvent.getParameter("arguments").path);
        console.log("PATH:", sPath);

        // Clear previous element binding and context to prevent data leak
        this.getView().unbindElement();
        // this.getView().setBindingContext(null);
        // this._clearValueStates();

        var oVM = this.getView().getModel("viewModel");
        if (sMode === "edit") {
          // oVM.setProperty("/mode", "edit");
          oVM.setProperty("/mode", "view");
          // oVM.setProperty("/editMode", false);

          //   this.getView().getModel("viewModel").setProperty("/mode", "edit");
          //   this.getView().getModel("viewModel").setProperty("/editMode", false);
          // } else {
          //   this.getView().getModel("viewModel").setProperty("/mode", "create");
          //   this.getView().getModel("viewModel").setProperty("/editMode", true);
          this.getView().bindElement({
            path: sPath,
            // model: "employeeModel",
          });
          // console.log("Binding context:", this.getView().getBindingContext("employeeModel"));
          console.log("Binding context:", this.getView().getBindingContext());
        } else {
          oVM.setProperty("/mode", "create");
          // New:OData creation logic using createEntry
          var oModel = this.getOwnerComponent().getModel();
          var oContext = oModel.createEntry("/Zemployee_tableSet");
          this.getView().setBindingContext(oContext);

          /* old code- Handled creation by binding to root "/"
          this.onReset();
          // this.getView().unbindElement();
          // this.getView().bindElement({ path: "/", model: "employeeModel" })
          this.getView().bindElement({ path: "/" });
          */
        }
      },
      _clearValueStates: function () {
        var aIds = [
          "employeeId",
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
            name: "com.test.manageemployees.fragment.DeptValueHelpDialog",
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
          // var oModel = this.getView().getModel("employeeModel");
          var oModel = this.getView().getModel();
          // var oContext = this.getView().getBindingContext("employeeModel");
          var oContext = this.getView().getBindingContext();
          // var sPath = oContext ? "department" : "/department";
          var sPath = oContext ? "Department" : "/Department";
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
        var oModel = this.getView().getModel();
        var oContext = this.getView().getBindingContext();

        // NEW: If we have a creation context, we should clear it correctly
        if (oContext) {
          oModel.setProperty("Empid", "", oContext);
          oModel.setProperty("Firstname", "", oContext);
          oModel.setProperty("Middlename", "", oContext);
          oModel.setProperty("Lastname", "", oContext);
          oModel.setProperty("Emailid", "", oContext);
          oModel.setProperty("Phonenumber", "", oContext);
          oModel.setProperty("Department", "", oContext);
          oModel.setProperty("Startdate", "", oContext);
          oModel.setProperty("Manager", "", oContext);
        }
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
              oRouter.navTo("RouteEmpList");
            }
          }.bind(this),
        });
      },
      onEditPress: function () {
        var oVM = this.getView().getModel("viewModel");
        var sCurrentMode = oVM.getProperty("/mode");

        if (sCurrentMode === "view") {
          oVM.setProperty("/mode", "edit");
        } else if (sCurrentMode === "edit") {
          this.onSubmit();
        }
      },
      onManagerChange: function (oEvent) {
        var oCombo = oEvent.getSource();
        var sValue = oCombo.getValue();
        var sKey = oCombo.getSelectedKey();

        // var oModel = this.getView().getModel("employeeModel");
        var oModel = this.getView().getModel();
        // var oContext = this.getView().getBindingContext("employeeModel");
        var oContext = this.getView().getBindingContext();
        var sPath = oContext ? "Manager" : "/Manager";

        /* OLD CODE - used invalid property 'managerId'
        var sPath = oContext ? "managerId" : "/managerId";
        */

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
        oModel.setProperty(sPath, oMatch.name, oContext);
        oCombo.setValueState(ValueState.None);

        /* OLD CODE - used oMatch.id which is numeric, but backend likely wants name
        oModel.setProperty(sPath, oMatch.id, oContext);
        */
      },
      onDelete: function () {
        var oModel = this.getView().getModel();
        var oContext = this.getView().getBindingContext();
        var sPath = oContext.getPath();
        var oRouter = this.getOwnerComponent().getRouter();
        sap.m.MessageBox.confirm("Permanently delete this employee record?", {
          title: "Confirm Deletion",
          actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
          emphasizedAction: sap.m.MessageBox.Action.OK,
          onClose: function (sAction) {
            if (sAction === sap.m.MessageBox.Action.OK) {
              // Trigger the OData Delete
              oModel.remove(sPath, {
                success: function () {
                  sap.m.MessageToast.show("Employee deleted successfully");
                  // Navigate back to the list view
                  oRouter.navTo("RouteEmpList");
                },
                error: function (oError) {
                  sap.m.MessageBox.error(
                    "Error deleting employee. Please try again.",
                  );
                },
              });
            }
          }.bind(this),
        });
      },
      onSubmit: function () {
        var sMode = this.getView().getModel("viewModel").getProperty("/mode");
        var bValid = true;
        var aFields = [
          { id: "employeeId", msg: "Employee Id is required" },
          { id: "firstName", msg: "First Name is required" },
          { id: "lastName", msg: "Last Name is required" },
          { id: "emailId", msg: "Email is required" },
          { id: "department", msg: "Department is required" },
          { id: "managerSelect", msg: "Manager is required" },
        ];

        aFields.forEach(
          function (oField) {
            var oControl = this.byId(oField.id);
            // var sValue = oControl.getValue();
            // var sManagerKey = oControl.getSelectedKey();
            // var sEntry = oControl.getSelectedKey ?
            //   oControl.getSelectedKey() : oControl.getValue();
            var sEntry =
              oField.id === "managerSelect"
                ? oControl.getSelectedKey()
                : oControl.getValue();
            if (!sEntry) {
              oControl.setValueState(ValueState.Error);
              oControl.setValueStateText(oField.msg);
              bValid = false;
            } else {
              oControl.setValueState(ValueState.None);
            }
          }.bind(this),
        );

        // var oManager = this.byId("managerSelect");
        // console.log(oManager);
        // var sManagerKey = oManager.getSelectedKey();
        // if (!sManagerKey) {
        //   oManager.setValueState(ValueState.Error);
        //   oManager.setValueStateText("Please select a valid Manager");
        //   bValid = false;
        // } else {
        //   oManager.setValueState(ValueState.None);
        // }

        if (!bValid) {
          MessageToast.show("Please fill all required fields");
          return;
        }

        // var oEmpModel = this.getView().getModel("employeeModel");
        var oEmpModel = this.getView().getModel();
        var oContext = this.getView().getBindingContext();

        // New: Correctly fetch Department from context (for createEntry/Edit)
        var sDept = oEmpModel.getProperty("Department", oContext);

        /* OldCode - Fetched from root "/" which is empty in context-based binding
        var sDept = oEmpModel.getProperty("/Department");
        */

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

        // odata
        var oEmpModel = this.getView().getModel();
        // var oData = oEmpModel.getData();

        var oModel = this.getView().getModel(); // Get the default OData model

        var oModel = this.getView().getModel();
        var oContext = this.getView().getBindingContext();

        // NEW: Manually construct sanitized payload without __metadata
        var oNewEmployee = {
          Empid: oModel.getProperty("Empid", oContext), // Use value from form
          Firstname: oModel.getProperty("Firstname", oContext),
          Lastname: oModel.getProperty("Lastname", oContext),
          Middlename: oModel.getProperty("Middlename", oContext),
          Emailid: oModel.getProperty("Emailid", oContext),
          Phonenumber: oModel.getProperty("Phonenumber", oContext),
          Department: oModel.getProperty("Department", oContext),
          Startdate: oModel.getProperty("Startdate", oContext),
          Manager: oModel.getProperty("Manager", oContext),
        };

        console.log("Payload to be sent:", oNewEmployee);

        if (sMode === "create") {
          // 2. Call .create() to send a POST request to SAP
          oModel.create("/Zemployee_tableSet", oNewEmployee, {
            success: function () {
              sap.m.MessageToast.show("Employee saved to SAP table!");
              this.getOwnerComponent().getRouter().navTo("RouteEmpList");
            }.bind(this),
            error: function () {
              sap.m.MessageBox.error("SAP refused to save the data.");
            },
          });
        } else {
          // 3. For Edit mode, we call .update()
          var sPath = this.getView().getBindingContext().getPath();
          oModel.update(sPath, oNewEmployee, {
            success: function () {
              sap.m.MessageToast.show("Employee updated in SAP!");
              this.getOwnerComponent().getRouter().navTo("RouteEmpList");
            }.bind(this),
          });
        }

        this.getView().getModel("viewModel").setProperty("/mode", "view");
      },
    });
  },
);
