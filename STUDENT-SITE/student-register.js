document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");

    if (!form) return;


    /* =========================================================
       INPUTS
    ========================================================= */

    const nameInput =
        document.getElementById("name");

    const matricInput =
        document.getElementById("matricNumber");

    const emailInput =
        document.getElementById("email");

    const levelInput =
        document.getElementById("level");

    const departmentInput =
        document.getElementById("department");

    const passwordInput =
        document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const registerBtn =
        document.getElementById("registerBtn");

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
       REGISTRATION
    ========================================================= */

    form.addEventListener("submit", async event => {

        event.preventDefault();


        /* =====================================================
           GET VALUES
        ===================================================== */

        const name =
            nameInput.value.trim();

        const matricNumber =
            matricInput.value.trim();

        const email =
            emailInput.value.trim();

        const level =
            levelInput.value.trim();

        const department =
            departmentInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        /* =====================================================
           VALIDATION
        ===================================================== */

        if (
            !name ||
            !matricNumber ||
            !email ||
            !level ||
            !department ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                "Please complete all required fields."
            );

            return;
        }


        if (name.length < 2) {

            showMessage(
                "Please enter your full name."
            );

            return;
        }


        if (password.length < 8) {

            showMessage(
                "Password must be at least 8 characters."
            );

            return;
        }


        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match."
            );

            return;
        }


        /* =====================================================
           BASIC EMAIL VALIDATION
        ===================================================== */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            showMessage(
                "Please enter a valid email address."
            );

            return;
        }


        /* =====================================================
           DISABLE BUTTON
        ===================================================== */

        if (registerBtn) {

            registerBtn.disabled = true;

            registerBtn.textContent =
                "Creating Account...";

        }


        showMessage(
            "Creating your student account...",
            "info"
        );


        /* =====================================================
           SEND TO BACKEND
        ===================================================== */

        try {

            const response =
               await fetch(
    "https://university-voting-system-p4sn.onrender.com/api/students/register",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name,

                            matricNumber,

                            email,

                            password,

                            level,

                            department

                        })

                    }
                );


            /* =================================================
               READ RESPONSE
            ================================================= */

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
               BACKEND ERROR
            ================================================= */

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Registration failed."
                );

            }


            /* =================================================
               SAVE STUDENT DETAILS LOCALLY
               
               This allows the next page/dashboard to
               immediately know who just registered.
            ================================================= */

            if (data.student) {

                sessionStorage.setItem(
                    "studentId",
                    data.student.id
                );

                sessionStorage.setItem(
                    "studentName",
                    data.student.name
                );

                sessionStorage.setItem(
                    "studentMatric",
                    data.student.matricNumber
                );

                sessionStorage.setItem(
                    "studentEmail",
                    data.student.email || ""
                );

                sessionStorage.setItem(
                    "studentLevel",
                    data.student.level || ""
                );

                sessionStorage.setItem(
                    "studentDepartment",
                    data.student.department || ""
                );

            }


            /* =================================================
               SUCCESS MESSAGE
            ================================================= */

            showMessage(
                "Account created successfully. Waiting for administrator approval.",
                "success"
            );


            /* =================================================
               SWEETALERT
            ================================================= */

            if (
                typeof Swal !== "undefined"
            ) {

                await Swal.fire({

                    icon: "success",

                    title:
                        "Registration Successful 🎉",

                    html:
                        `
                        <p>Your UniVote student account has been created successfully.</p>

                        <p>
                            <strong>Matric Number:</strong>
                            ${matricNumber.toUpperCase()}
                        </p>

                        <p>
                            Your account must be approved by an administrator before you can vote.
                        </p>
                        `,

                    confirmButtonText:
                        "Continue to Login",

                    confirmButtonColor:
                        "#2563eb",

                    allowOutsideClick:
                        false

                });

            }


            /* =================================================
               REDIRECT TO LOGIN
            ================================================= */

            window.location.href =
                "student-login.html";


        } catch (error) {

            console.error(
                "Student registration error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to create your account. Please try again."
            );


        } finally {

            /* =================================================
               RE-ENABLE BUTTON
            ================================================= */

            if (registerBtn) {

                registerBtn.disabled = false;

                registerBtn.textContent =
                    "Create Student Account";

            }

        }

    });

});