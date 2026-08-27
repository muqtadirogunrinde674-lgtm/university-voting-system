document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form =
        document.getElementById("adminLoginForm");

    const usernameInput =
        document.getElementById("adminUsername");

    const passwordInput =
        document.getElementById("adminPassword");

    const loginBtn =
        document.getElementById("adminLoginBtn");

    const togglePassword =
        document.getElementById("togglePassword");

    const usernameError =
        document.getElementById("usernameError");

    const passwordError =
        document.getElementById("passwordError");

    const rememberAdmin =
        document.getElementById("rememberAdmin");


    /* =====================================================
       PASSWORD SHOW / HIDE
    ===================================================== */

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";

                togglePassword.textContent =
                    "Hide";

            } else {

                passwordInput.type = "password";

                togglePassword.textContent =
                    "Show";

            }

        });

    }


    /* =====================================================
       LOAD REMEMBERED USERNAME
    ===================================================== */

    const savedUsername =
        localStorage.getItem("univoteRememberedAdminUsername");

    if (savedUsername && usernameInput) {

        usernameInput.value = savedUsername;

        if (rememberAdmin) {
            rememberAdmin.checked = true;
        }

    }


    /* =====================================================
       CLEAR ERRORS
    ===================================================== */

    function clearErrors() {

        if (usernameError) {
            usernameError.textContent = "";
        }

        if (passwordError) {
            passwordError.textContent = "";
        }

    }


    /* =====================================================
       LOGIN
    ===================================================== */

    if (!form) {

        console.error(
            "Admin login form not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearErrors();


            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            /* =================================================
               VALIDATION
            ================================================= */

            let valid = true;


            if (!username) {

                if (usernameError) {

                    usernameError.textContent =
                        "Please enter your admin username.";

                }

                valid = false;

            }


            if (!password) {

                if (passwordError) {

                    passwordError.textContent =
                        "Please enter your password.";

                }

                valid = false;

            }


            if (!valid) {
                return;
            }


            /* =================================================
               LOADING STATE
            ================================================= */

            if (loginBtn) {

                loginBtn.disabled = true;

                loginBtn.textContent =
                    "Signing in...";

            }


            try {

                /* =============================================
                   BACKEND LOGIN
                ============================================= */

                const response =
                    await fetch(
                        "/api/admin/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                username:
                                    username,

                                password:
                                    password

                            })

                        }
                    );


                const data =
                    await response.json();


                /* =============================================
                   LOGIN FAILED
                ============================================= */

                if (
                    !response.ok ||
                    !data.success
                ) {

                    if (passwordError) {

                        passwordError.textContent =
                            data.message ||
                            "Invalid username or password.";

                    }


                    if (loginBtn) {

                        loginBtn.disabled = false;

                        loginBtn.textContent =
                            "Login to Admin Panel";

                    }

                    return;

                }


                /* =============================================
                   REMEMBER USERNAME
                ============================================= */

                if (
                    rememberAdmin &&
                    rememberAdmin.checked
                ) {

                    localStorage.setItem(
                        "univoteRememberedAdminUsername",
                        username
                    );

                } else {

                    localStorage.removeItem(
                        "univoteRememberedAdminUsername"
                    );

                }


                /* =============================================
                   SAVE ADMIN SESSION
                ============================================= */

                sessionStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );


                sessionStorage.setItem(
                    "adminUsername",
                    data.admin.username
                );


                sessionStorage.setItem(
                    "adminName",
                    data.admin.displayName ||
                    "Administrator"
                );


                /* =============================================
                   SUCCESS
                ============================================= */

                if (loginBtn) {

                    loginBtn.textContent =
                        "Login Successful ✓";

                }


                /* =============================================
                   REDIRECT
                ============================================= */

                setTimeout(() => {

                    window.location.href =
                        "admin-dashboard.html";

                }, 500);

            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                if (passwordError) {

                    passwordError.textContent =
                        "Unable to connect to the UniVote server.";

                }


                if (loginBtn) {

                    loginBtn.disabled = false;

                    loginBtn.textContent =
                        "Login to Admin Panel";

                }

            }

        }
    );

});