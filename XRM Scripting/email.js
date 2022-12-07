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
        SUBJECT: "subject",
        DESCRIPTION: "description"
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

    approvalStatusOnChange: function (executionContext, formContext = null) {
        if (!formContext) {
            formContext = executionContext.getFormContext();
        }
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

    eyeCheckRequiredOnChange: function (executionContext, formContext = null) {
        if (formContext === null) {
            formContext = executionContext.getFormContext();
        }
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
            // DO NOT disable the approval status field
            // if (control.getName() !== HRMGMT.JScripts.Email.constants.APPROVAL_STATUS) {
            control.setDisabled(true);
            // }
        });
    },

    sendForApprovalClick: function (formContext) {
        console.log("Button clicked : sendForApprovalClick");

        // Send email to approver
        var approverEmail = formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).getValue();
        if (approverEmail) {
            // Make approval status waiting
            formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).setValue(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS_CODES.Waiting);

            // Make a POST call to https://prod-146.westus.logic.azure.com:443/workflows/c19b3c30081044d7a3114eee2de488b3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2WPJj4ENgzgTNAEH34ny8BCCQu_OYpxfCvcMvRYLM3g with required data
            var subject = formContext.getAttribute(HRMGMT.JScripts.Email.constants.SUBJECT).getValue();
            var description = formContext.getAttribute(HRMGMT.JScripts.Email.constants.DESCRIPTION).getValue();
            var data = {
                "email": approverEmail,
                "recalled": "no",
                "id": formContext.data.entity.getId().replace("{", "").replace("}", ""),
                "subject": subject || "Approval request",
                "description": description || "Please take a look at this email and approve or cancel it as you see fit."
            };
            var request = new XMLHttpRequest();
            request.open("POST", "https://prod-77.westus.logic.azure.com:443/workflows/232a4bb50f484ba4b6ae50ca9dd02e6b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bG8UbBEIMwhzYhK_dZt2x5wkI9yM8XJAFaas_wXXLs0", true);
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    var json = JSON.parse(request.responseText);
                    console.log(json);
                }
            };
            request.send(JSON.stringify(data));

            HRMGMT.JScripts.Email.approvalStatusOnChange(null, formContext);
        }
        else {
            Xrm.Navigation.openAlertDialog({
                text: "Approver email is required."
            });
            return;
        }
    },
    recallClick: function (formContext) {
        console.log("Button clicked : recallClick");
        // Set “Approval Status” as ‘Blank’
        formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).setValue(null);

        // Send email to approver
        var approverEmail = formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVER_EMAIL).getValue();
        if (approverEmail) {
            // Make approval status blank
            formContext.getAttribute(HRMGMT.JScripts.Email.constants.APPROVAL_STATUS).setValue(null);

            // Make a POST call to https://prod-146.westus.logic.azure.com:443/workflows/c19b3c30081044d7a3114eee2de488b3/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2WPJj4ENgzgTNAEH34ny8BCCQu_OYpxfCvcMvRYLM3g with required data
            var subject = formContext.getAttribute(HRMGMT.JScripts.Email.constants.SUBJECT).getValue();
            var description = formContext.getAttribute(HRMGMT.JScripts.Email.constants.DESCRIPTION).getValue();
            var data = {
                "email": approverEmail,
                "recalled": "yes",
                "id": formContext.data.entity.getId().replace("{", "").replace("}", ""),
                "subject": subject + " - Recalled" || "Approval request - Recalled",
                "description": "Please ignore the previous email. This email is to inform you that the request has been recalled. Sorry for the inconvenience."
            };
            var request = new XMLHttpRequest();
            request.open("POST", "https://prod-77.westus.logic.azure.com:443/workflows/232a4bb50f484ba4b6ae50ca9dd02e6b/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=bG8UbBEIMwhzYhK_dZt2x5wkI9yM8XJAFaas_wXXLs0", true);
            request.setRequestHeader("Content-Type", "application/json");
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    var json = JSON.parse(request.responseText);
                    console.log(json);
                }
            };
            request.send(JSON.stringify(data));

            HRMGMT.JScripts.Email.approvalStatusOnChange(null, formContext);
        }
        else {
            Xrm.Navigation.openAlertDialog({
                text: "Approver email is required."
            });
            return;
        }




        HRMGMT.JScripts.Email.approvalStatusOnChange(null, formContext);

    },
    optInApprovalClick: function (formContext) {
        console.log("Button clicked : optInApprovalClick");
        // Make eye check required field yes
        formContext.getAttribute(HRMGMT.JScripts.Email.constants.EyeCheckRequired).setValue(true);
        // Refresh the form
        HRMGMT.JScripts.Email.eyeCheckRequiredOnChange(null, formContext);
    }

};