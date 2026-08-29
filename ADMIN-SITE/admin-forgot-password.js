document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById(
            "forgotPasswordForm"
        );

    const emailInput =
        document.getElementById(
            "adminEmail"
        );

    const emailError =
        document.getElementById(
            "emailError"
        );

    const message =
        document.getElementById(
            "message"
        );

    const sendCodeBtn =
        document.getElementById(
            "sendCodeBtn"
        );


    function showMessage(
        text,
        type = "error"
    ) {

        if (!message) return;

        message.textContent = text;

        message.className =
            `message ${type}`;

    }


    function clearError() {

        if (emailError) {

            emailError.textContent = "";

        }

        if (message) {

            message.textContent = "";

            message.className =
                "message";

        }

    }


    if (!form) {

        console.error(
            "Forgot password form not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            clearError();


            const email =
                emailInput
                    ? emailInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            /* =====================================
               VALIDATION
            ===================================== */

            if (!email) {

                if (emailError) {

                    emailError.textContent =
                        "Please enter your Gmail address.";

                }

                return;

            }


            if (
                !email.endsWith("@gmail.com")
            ) {

                if (emailError) {

                    emailError.textContent =
                        "Please enter a valid Gmail address.";

                }

                return;

            }


            /* =====================================
               LOADING
            ===================================== */

            if (sendCodeBtn) {

                sendCodeBtn.disabled =
                    true;

                sendCodeBtn.textContent =
                    "Sending Code...";

            }


            try {

                /* =================================
                   REQUEST PASSWORD RESET CODE
                ================================= */

                const response =
                    await fetch(
                        "/api/admin/forgot-password",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email

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
                        "Unable to send verification code."
                    );

                }


                /* =================================
                   SAVE EMAIL TEMPORARILY
                ================================= */

                sessionStorage.setItem(
                    "adminResetEmail",
                    email
                );


                /* =================================
                   SUCCESS
                ================================= */

                showMessage(
                    "Verification code sent to your Gmail.",
                    "success"
                );


                if (sendCodeBtn) {

                    sendCodeBtn.textContent =
                        "Code Sent ✓";

                }


                /* =================================
                   GO TO VERIFICATION PAGE
                ================================= */

                setTimeout(() => {

                    window.location.href =
                        "admin-verify-password.html";

                }, 800);


            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to send verification code."
                );


                if (sendCodeBtn) {

                    sendCodeBtn.disabled =
                        false;

                    sendCodeBtn.textContent =
                        "Send Verification Code";

                }

            }

        }
    );

});