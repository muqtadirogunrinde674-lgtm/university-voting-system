document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("resetPasswordForm");

    const matricInput =
        document.getElementById("matricNumber");

    const emailInput =
        document.getElementById("email");

    const newPasswordInput =
        document.getElementById("newPassword");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const resetBtn =
        document.getElementById("resetBtn");

    const message =
        document.getElementById("message");


    /* =========================================================
       SHOW MESSAGE
    ========================================================= */

    function showMessage(text, type = "error") {

        if (!message) return;

        message.textContent = text;

        message.className =
            `message ${type}`;

    }


    /* =========================================================
       PASSWORD SHOW / HIDE
    ========================================================= */

    document
        .querySelectorAll(".password-toggle")
        .forEach(button => {

            button.addEventListener("click", () => {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(targetId);

                if (!input) return;


                if (input.type === "password") {

                    input.type = "text";

                    button.textContent =
                        "Hide";

                } else {

                    input.type = "password";

                    button.textContent =
                        "Show";

                }

            });

        });


    /* =========================================================
       RESET PASSWORD
    ========================================================= */

    if (!form) return;


    form.addEventListener("submit", async event => {

        event.preventDefault();


        const matricNumber =
            matricInput.value.trim();

        const email =
            emailInput.value.trim();

        const newPassword =
            newPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        /* =====================================================
           VALIDATION
        ===================================================== */

        if (
            !matricNumber ||
            !email ||
            !newPassword ||
            !confirmPassword
        ) {

            showMessage(
                "Please complete all fields."
            );

            return;
        }


        if (newPassword.length < 8) {

            showMessage(
                "New password must be at least 8 characters."
            );

            return;
        }


        if (newPassword !== confirmPassword) {

            showMessage(
                "New passwords do not match."
            );

            return;
        }


        /* =====================================================
           DISABLE BUTTON
        ===================================================== */

        if (resetBtn) {

            resetBtn.disabled = true;

            resetBtn.textContent =
                "Resetting Password...";

        }


        try {

            const response =
                await fetch(
                    "/api/students/reset-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            matricNumber,

                            email,

                            newPassword

                        })

                    }
                );


            const data =
                await response.json();


            /* =================================================
               ERROR
            ================================================= */

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to reset password."
                );

            }


            /* =================================================
               SUCCESS
            ================================================= */

            showMessage(
                "Password reset successfully!",
                "success"
            );


            if (typeof Swal !== "undefined") {

                await Swal.fire({

                    icon: "success",

                    title: "Password Reset",

                    text:
                        "Your password has been changed successfully. You can now log in with your new password.",

                    confirmButtonText:
                        "Go to Login",

                    confirmButtonColor:
                        "#2563eb"

                });

            }


            /* =================================================
               CLEAR FORM
            ================================================= */

            form.reset();


            /* =================================================
               GO BACK TO LOGIN
            ================================================= */

            window.location.href =
                "student.html";


        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            if (resetBtn) {

                resetBtn.disabled = false;

                resetBtn.textContent =
                    "Reset Password";

            }

        }

    });

});