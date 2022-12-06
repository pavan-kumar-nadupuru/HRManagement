var HRMGMT;
if (!HRMGMT) {
    HRMGMT = {};
}

if (!HRMGMT.JScripts) {
    HRMGMT.JScripts = {};
}

HRMGMT.JScripts.Email = {
    constants: {
        APPROVAL_STATUS: "hrmgmt_approvalstatus",
        APPROVAL_STATUS_CODES: {
            "Approved": 122030001,
            "Rejected": 122030002,
            "Waiting": 122030003
        },
        EyeCheckRequired: "hrmgmt_eyecheckrequired",
        APPROVER_EMAIL: "hrmgmt_approvalemail",
    },

    onload: function (executionContext) {
        var formContext = executionContext.getFormContext();


        var approvalStatus = formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).getValue();
        if (approvalStatus && approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Waiting) {
            // Make the form read only
            HRMGMT.JScripts.Email.makeFormReadOnly(formContext);
        }

        // Make approver email readonly if 4EyeCheckRequired is ‘NO’
        if (formContext.getAttribute(HRMGMT.JScripts.Email.constants.EyeCheckRequired).getValue() === false) {
            formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
        } else {
            formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(false);
        }

        // Make approver email readonly if 4EyeCheckRequired is ‘NO’ or Approval Status is ‘Waiting’ or ‘Approved’
        if (approvalStatus && (approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Waiting || approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Approved)) {
            formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
        }

        // Add event handlers
        formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).addOnChange((executionContext) => HRMGMT.JScripts.Email.approvalStatusOnChange(executionContext));
        formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).addOnChange((executionContext) => HRMGMT.JScripts.Email.approverEmailOnChange(executionContext));
        formContext.getAttribute(HRMGMT.JScripts.Email.constants.EyeCheckRequired).addOnChange((executionContext) => HRMGMT.JScripts.Email.eyeCheckRequiredOnChange(executionContext));
    },

    approvalStatusOnChange: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var approvalStatus = formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).getValue();
        if (approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Waiting) {
            // Make the form read only
            HRMGMT.JScripts.Email.makeFormReadOnly(formContext);
        }
        var eyeCheckRequired = formContext.getAttribute(HRMGMT.JScripts.Email.constants.EyeCheckRequired).getValue();
        if (approvalStatus) {
            if (eyeCheckRequired === false || approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Waiting || approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Approved) {
                formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
            }
            else {
                formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(false);
            }
        } else {
            if (eyeCheckRequired === false) {
                formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
            } else {
                formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(false);
            }
        }
    },

    approverEmailOnChange: function (executionContext) {
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

                if (approverEmail.split("@")[1].toLowerCase() != currentDomain || approverEmail === currentEmail) {
                    // Show error message
                    Xrm.Navigation.openAlertDialog({
                        text: "Approver email should be of your current domain and should not be the current user's email address."
                    });
                    formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setValue(null);
                }
            },
            function (error) {
                Xrm.Navigation.openAlertDialog({
                    text: error.message
                });
            }
        );

    },

    eyeCheckRequiredOnChange: function (executionContext) {
        var formContext = executionContext.getFormContext();
        var eyeCheckRequired = formContext.getAttribute(HRMGMT.JScripts.Email.constants.EyeCheckRequired).getValue();
        if (eyeCheckRequired === false) {
            formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
        } else {
            formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(false);
        }
        var approvalStatus = formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).getValue();
        if (approvalStatus) {
            if (eyeCheckRequired === false || approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Waiting || approvalStatus === HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Approved) {
                formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(true);
            }
            else {
                formContext.getControl(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).setDisabled(false);
            }
        }
        // Refresh the ribbon buttons
        formContext.ui.refreshRibbon(true);
    },

    makeFormReadOnly: function (formContext) {
        // Make form read-only
        formContext.ui.controls.forEach(function (control, index) {
            control.setDisabled(true);
        });
    },

    sendForApprovalClick: function (formContext) {
        console.log("Button clicked : sendForApprovalClick");
    },
    recallClick: function (formContext) {
        console.log("Button clicked : recallClick");
    },
    optInApprovalClick: function (formContext) {
        console.log("Button clicked : optInApprovalClick");
    }

};