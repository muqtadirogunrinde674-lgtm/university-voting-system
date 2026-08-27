document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "/api/admin";

    const form = document.getElementById("settingsForm");

    const usernameInput =
        document.getElementById("adminUsername");

    const displayNameInput =
        document.getElementById("adminName");

    const currentPasswordInput =
        document.getElementById("currentPassword");

    const newPasswordInput =
        document.getElementById("newPassword");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const message =
        document.getElementById("message");

    const logoutBtn =
        document.getElementById("logoutBtn");


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(text, type = "error") {

        if (!message) return;

        message.textContent = text;
        message.className = `message ${type}`;

    }


    /* =====================================================
       LOAD CURRENT ADMIN SETTINGS
    ===================================================== */

    async function loadSettings() {

        try {

            const response =
                await fetch(
                    `${API_BASE}/settings`
                );

            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load settings."
                );

            }


            if (usernameInput) {

                usernameInput.value =
                    data.admin.username || "";

            }


            if (displayNameInput) {

                displayNameInput.value =
                    data.admin.displayName || "";

            }


        } catch (error) {

            console.error(
                "Load settings error:",
                error
            );

            showMessage(
                "Unable to load admin settings."
            );

        }

    }


    /* =====================================================
       SAVE SETTINGS
    ===================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const username =
                    usernameInput.value.trim();

                const displayName =
                    displayNameInput.value.trim();

                const currentPassword =
                    currentPasswordInput.value;

                const newPassword =
                    newPasswordInput.value;

                const confirmPassword =
                    confirmPasswordInput.value;


                /* ================================
                   VALIDATION
                ================================= */

                if (
                    !username ||
                    !displayName ||
                    !currentPassword
                ) {

                    showMessage(
                        "Username, admin name and current password are required."
                    );

                    return;
                }


                if (newPassword) {

                    if (newPassword.length < 8) {

                        showMessage(
                            "New password must be at least 8 characters."
                        );

                        return;
                    }


                    if (
                        newPassword !==
                        confirmPassword
                    ) {

                        showMessage(
                            "New passwords do not match."
                        );

                        return;
                    }

                }


                const saveBtn =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (saveBtn) {

                    saveBtn.disabled = true;
                    saveBtn.textContent =
                        "Saving...";

                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE}/settings`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    username,

                                    displayName,

                                    currentPassword,

                                    newPassword

                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(
                            data.message ||
                            "Unable to update settings."
                        );

                    }


                    /* =================================
                       SAVE UPDATED ADMIN DETAILS
                       LOCALLY FOR THE UI
                    ================================= */

                    localStorage.setItem(
                        "univoteAdminAccount",
                        JSON.stringify({

                            username:
                                data.admin.username,

                            name:
                                data.admin.displayName

                        })
                    );


                    sessionStorage.setItem(
                        "adminUsername",
                        data.admin.username
                    );


                    sessionStorage.setItem(
                        "adminName",
                        data.admin.displayName
                    );


                    showMessage(
                        "Settings updated successfully.",
                        "success"
                    );


                    currentPasswordInput.value = "";
                    newPasswordInput.value = "";
                    confirmPasswordInput.value = "";


                    /*
                    If the username or password changed,
                    log the admin out so the next login uses
                    the newly saved credentials.
                    */

                    setTimeout(() => {

                        sessionStorage.removeItem(
                            "adminLoggedIn"
                        );

                        window.location.href =
                            "admin-login.html";

                    }, 1200);


                } catch (error) {

                    console.error(
                        "Save settings error:",
                        error
                    );

                    showMessage(
                        error.message ||
                        "Unable to update settings."
                    );

                } finally {

                    if (saveBtn) {

                        saveBtn.disabled = false;
                        saveBtn.textContent =
                            "Save Changes";

                    }

                }

            }
        );

    }


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    document
        .querySelectorAll(".password-toggle")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;

                    const input =
                        document.getElementById(
                            targetId
                        );

                    if (!input) return;


                    if (
                        input.type === "password"
                    ) {

                        input.type = "text";
                        button.textContent =
                            "Hide";

                    } else {

                        input.type = "password";
                        button.textContent =
                            "Show";

                    }

                }
            );

        });


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "adminLoggedIn"
                );

                sessionStorage.removeItem(
                    "adminUsername"
                );

                sessionStorage.removeItem(
                    "adminName"
                );

                window.location.href =
                    "admin-login.html";

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadSettings();

});