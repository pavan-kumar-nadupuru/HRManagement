var HRMGMT;
if (!HRMGMT) {
    HRMGMT = {};
}

if (!HRMGMT.Jscripts) {
    HRMGMT.Jscripts = {};
}

HRMGMT.JScripts.Email = {
    constants:{
        APPROVAL_STATUS: "hrmgmt_approvalstatus",
        APPROVAL_STATUS_CODES: {
            "Approved": 122030001,
            "Rejected": 122030002,
            "Waiting": 122030003
        },
        EyeCheckRequired: "hrmgmt_eyecheckrequired ",
        APPROVER_EMAIL: "hrmgmt_approvalemail",
    },

    onload: function(executionContext) {
        var formContext = executionContext.getFormContext();


        var approvalStatus = formContext.getAttribute(HRMGMT.JScripts.constants.APPROVAL_STATUS).getValue();
        if(approvalStatus === HRMGMT.JScripts.constants.APPROVAL_STATUS_CODES.Waiting) {
            // Make the form read only
            HRMGMT.JScripts.makeFormReadOnly(formContext);
        }


        // Make approver email readonly if 4EyeCheckRequired is ‘NO’ or Approval Status is ‘Waiting’ or ‘Approved’
        if (formContext.getAttribute(HRMGMT.JScripts.Email.constants.EyeCheckRequired).getValue() === false || approvalStatus === HRMGMT.JScripts.constants.APPROVAL_STATUS_CODES.Waiting || approvalStatus === HRMGMT.JScripts.constants.APPROVAL_STATUS_CODES.Approved) {
            formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
        }

        // Add event handlers
        formContext.getAttribute(HRMGMT.JScripts.constants.APPROVAL_STATUS).addOnChange((executionContext) => HRMGMT.JScripts.Email.approvalStatusOnChange(executionContext));
    },

    approvalStatusOnChange: function(executionContext) {
        var formContext = executionContext.getFormContext();
        var approvalStatus = formContext.getAttribute(HRMGMT.JScripts.constants.APPROVAL_STATUS).getValue();
        if(approvalStatus === HRMGMT.JScripts.constants.APPROVAL_STATUS_CODES.Waiting) {
            // Make the form read only
            HRMGMT.JScripts.makeFormReadOnly(formContext);
        }
    },

    approverEmailOnChange: function(executionContext) {
        var formContext = executionContext.getFormContext();

        var approverEmail = formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).getValue();
        // Should only be of your current domain and should not be the current user’s email address.

        // Get current user id
        var currentUserId = Xrm.Utility.getGlobalContext().userSettings.userId;
        
        // Retrieve current user details using webapi
        Xrm.WebApi.retrieveRecord("systemuser", currentUserId, "?$select=internalemailaddress").then(
            function success(result) {
                var currentEmail = result.internalemailaddress;
                var currentDomain = currentEmail.split("@")[1];
                currentDomain = currentDomain.toLowerCase();

                if(approverEmail.split("@")[1].toLowerCase() != currentDomain || approverEmail === currentEmail) {
                    // Show error message
                    Xrm.Navigation.openAlertDialog({
                        text: "Approver email should be of your current domain and should not be the current user's email address."
                    });
                    formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setValue(null);
                }
            },
            function(error) {
                Xrm.Navigation.openAlertDialog({
                    text: error.message
                });
            }
        );

    },

    makeFormReadOnly: function(formContext) {
        // Make form read-only
        formContext.ui.controls.forEach(function(control, index) {
            control.setDisabled(true);
        });
    }
    // Make the form read only if Approval Status value is waiting.

};