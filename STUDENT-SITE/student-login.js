document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const matricInput = document.getElementById("matricNumber");
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("togglePassword");
    const loginBtn = document.getElementById("loginBtn");
    const message = document.getElementById("message");

    const API_URL = "/api/students/login";


    /* =========================================================
       MESSAGE
    ========================================================= */

    function showMessage(text, type = "error") {

        if (!message) return;

        message.textContent = text;
        message.className = `message ${type}`;

    }


    /* =========================================================
       PASSWORD VISIBILITY
    ========================================================= */

    if (togglePassword) {

        togglePassword.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";
                togglePassword.textContent = "Hide";

            } else {

                passwordInput.type = "password";
                togglePassword.textContent = "Show";

            }

        });

    }


    /* =========================================================
       LOGIN
    ========================================================= */

    if (!form) {
        console.error("Student login form not found.");
        return;
    }


    form.addEventListener("submit", async event => {

        event.preventDefault();


        const matricNumber =
            matricInput.value.trim();

        const password =
            passwordInput.value;


        /* =====================================================
           VALIDATION
        ===================================================== */

        if (!matricNumber || !password) {

            showMessage(
                "Please enter your matric number and password."
            );

            return;
        }


        /* =====================================================
           DISABLE LOGIN BUTTON
        ===================================================== */

        loginBtn.disabled = true;

        loginBtn.textContent =
            "Signing in...";


        try {

            /* =================================================
               SEND LOGIN REQUEST
            ================================================= */

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            matricNumber,

                            password

                        })

                    }
                );


            let data;

            try {

                data =
                    await response.json();

            } catch {

                throw new Error(
                    "The server returned an invalid response."
                );

            }


            /* =================================================
               LOGIN FAILED
            ================================================= */

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Invalid matric number or password."
                );

            }


            /* =================================================
               GET REAL STUDENT DATA
            ================================================= */

            const student =
                data.student;


            /* =================================================
               SAVE STUDENT SESSION
            ================================================= */

            sessionStorage.setItem(
                "studentLoggedIn",
                "true"
            );


            sessionStorage.setItem(
                "studentId",
                String(student.id)
            );


            sessionStorage.setItem(
                "studentName",
                student.name || ""
            );


            sessionStorage.setItem(
                "studentMatric",
                student.matricNumber || ""
            );


            sessionStorage.setItem(
                "studentEmail",
                student.email || ""
            );


            sessionStorage.setItem(
                "studentLevel",
                student.level || ""
            );


            sessionStorage.setItem(
                "studentDepartment",
                student.department || ""
            );


            sessionStorage.setItem(
                "studentHasVoted",
                student.hasVoted ? "true" : "false"
            );


            sessionStorage.setItem(
                "studentEligible",
                student.isEligible ? "true" : "false"
            );


            /* =================================================
               SUCCESS MESSAGE
            ================================================= */

            showMessage(
                `Welcome back, ${student.name}! Redirecting...`,
                "success"
            );


            /* =================================================
               OPTIONAL SWEETALERT
            ================================================= */

            if (typeof Swal !== "undefined") {

                await Swal.fire({

                    icon: "success",

                    title:
                        `Welcome back, ${student.name}! 👋`,

                    text:
                        "Login successful.",

                    timer: 1200,

                    showConfirmButton: false

                });

            }


            /* =================================================
               REDIRECT
            ================================================= */

            window.location.href =
                "student-dashboard.html";


        } catch (error) {

            console.error(
                "Student login error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to login."
            );


            /*
            Keep the password field visible
            after an unsuccessful login.
            */

            passwordInput.value = "";

            passwordInput.focus();


        } finally {

            loginBtn.disabled = false;

            loginBtn.textContent =
                "Login";

        }

    });

});