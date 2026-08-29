document.addEventListener("DOMContentLoaded", () => {

```
const form =
    document.getElementById("verifyPasswordForm");

const codeInput =
    document.getElementById("verificationCode");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

const codeError =
    document.getElementById("codeError");

const passwordError =
    document.getElementById("passwordError");

const message =
    document.getElementById("message");

const verifyBtn =
    document.getElementById("verifyBtn");


/* =========================================
   GET SAVED ADMIN EMAIL
========================================= */

const email =
    sessionStorage.getItem(
        "adminResetEmail"
    );


if (!email) {

    if (message) {

        message.textContent =
            "Your password reset session has expired. Please start again.";

        message.className =
            "message error";

    }

    if (verifyBtn) {

        verifyBtn.disabled = true;

    }

    return;

}


/* =========================================
   ONLY ALLOW NUMBERS
========================================= */

if (codeInput) {

    codeInput.addEventListener(
        "input",
        () => {

            codeInput.value =
                codeInput.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

        }
    );

}


/* =========================================
   CLEAR ERRORS
========================================= */

function clearErrors() {

    if (codeError) {

        codeError.textContent = "";

    }

    if (passwordError) {

        passwordError.textContent = "";

    }

    if (message) {

        message.textContent = "";

        message.className =
            "message";

    }

}


/* =========================================
   FORM SUBMIT
========================================= */

if (!form) {

    console.error(
        "Password verification form not found."
    );

    return;

}


form.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearErrors();


        const code =
            codeInput
                ? codeInput.value.trim()
                : "";

        const newPassword =
            newPasswordInput
                ? newPasswordInput.value
                : "";

        const confirmPassword =
            confirmPasswordInput
                ? confirmPasswordInput.value
                : "";


        /* =====================================
           VALIDATION
        ===================================== */

        let valid = true;


        if (!/^\d{4}$/.test(code)) {

            if (codeError) {

                codeError.textContent =
                    "Enter the 4-digit verification code.";

            }

            valid = false;

        }


        if (newPassword.length < 8) {

            if (passwordError) {

                passwordError.textContent =
                    "New password must be at least 8 characters.";

            }

            valid = false;

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            if (passwordError) {

                passwordError.textContent =
                    "New passwords do not match.";

            }

            valid = false;

        }


        if (!valid) {

            return;

        }


        /* =====================================
           LOADING
        ===================================== */

        if (verifyBtn) {

            verifyBtn.disabled = true;

            verifyBtn.textContent =
                "Resetting Password...";

        }


        try {

            const response =
                await fetch(
                    "/api/admin/reset-password",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email,
                                code,
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
                    "Unable to reset password."
                );

            }


            /* =================================
               REMOVE RESET SESSION
            ================================= */

            sessionStorage.removeItem(
                "adminResetEmail"
            );


            sessionStorage.removeItem(
                "adminLoggedIn"
            );


            sessionStorage.removeItem(
                "adminUsername"
            );


            sessionStorage.removeItem(
                "adminName"
            );


            /* =================================
               SUCCESS
            ================================= */

            if (message) {

                message.textContent =
                    "Password reset successfully. Redirecting to login...";

                message.className =
                    "message success";

            }


            if (verifyBtn) {

                verifyBtn.textContent =
                    "Password Reset ✓";

            }


            /* =================================
               REDIRECT
            ================================= */

            setTimeout(() => {

                window.location.href =
                    "admin-login.html";

            }, 1200);


        } catch (error) {

            console.error(
                "Admin password reset error:",
                error
            );


            if (message) {

                message.textContent =
                    error.message ||
                    "Unable to reset password.";

                message.className =
                    "message error";

            }


            if (verifyBtn) {

                verifyBtn.disabled = false;

                verifyBtn.textContent =
                    "Verify & Reset Password";

            }

        }

    }
);
```

});
