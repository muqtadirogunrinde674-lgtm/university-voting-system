document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       AUTH CHECK
    ========================================================= */

    const loggedIn =
        sessionStorage.getItem("studentLoggedIn");

    if (loggedIn !== "true") {

        window.location.href =
            "student-login.html";

        return;
    }


    /* =========================================================
       GET REAL STUDENT DETAILS
    ========================================================= */

    const studentName =
        sessionStorage.getItem("studentName") ||
        "Student";

    const studentMatric =
        sessionStorage.getItem("studentMatric") ||
        "N/A";

    const studentEmail =
        sessionStorage.getItem("studentEmail") ||
        "";

    const studentLevel =
        sessionStorage.getItem("studentLevel") ||
        "";

    const studentDepartment =
        sessionStorage.getItem("studentDepartment") ||
        "";


    /* =========================================================
       UPDATE STUDENT NAME
    ========================================================= */

    const nameElements =
        document.querySelectorAll(
            "#studentName, .student-name, [data-student-name]"
        );

    nameElements.forEach(element => {

        element.textContent =
            studentName;

    });


    /* =========================================================
       UPDATE MATRIC NUMBER
    ========================================================= */

    const matricElements =
        document.querySelectorAll(
            "#studentMatric, .student-matric, [data-student-matric]"
        );

    matricElements.forEach(element => {

        element.textContent =
            studentMatric;

    });


    /* =========================================================
       UPDATE EMAIL
    ========================================================= */

    const emailElements =
        document.querySelectorAll(
            "#studentEmail, .student-email, [data-student-email]"
        );

    emailElements.forEach(element => {

        element.textContent =
            studentEmail;

    });


    /* =========================================================
       UPDATE LEVEL
    ========================================================= */

    const levelElements =
        document.querySelectorAll(
            "#studentLevel, .student-level, [data-student-level]"
        );

    levelElements.forEach(element => {

        element.textContent =
            studentLevel;

    });


    /* =========================================================
       UPDATE DEPARTMENT
    ========================================================= */

    const departmentElements =
        document.querySelectorAll(
            "#studentDepartment, .student-department, [data-student-department]"
        );

    departmentElements.forEach(element => {

        element.textContent =
            studentDepartment;

    });


    /* =========================================================
       WELCOME MESSAGE
    ========================================================= */

    const welcomeElements =
        document.querySelectorAll(
            "#welcomeStudent, .welcome-student, [data-welcome-student]"
        );

    welcomeElements.forEach(element => {

        element.textContent =
            `Welcome back, ${studentName} 👋`;

    });


    /* =========================================================
       AVATAR INITIAL
    ========================================================= */

    const avatarElements =
        document.querySelectorAll(
            "#studentAvatar, .student-avatar, .avatar"
        );

    const initial =
        studentName
            .trim()
            .charAt(0)
            .toUpperCase() || "S";


    avatarElements.forEach(element => {

        element.textContent =
            initial;

    });


    /* =========================================================
       LOGOUT
    ========================================================= */

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "studentLoggedIn"
                );

                sessionStorage.removeItem(
                    "studentId"
                );

                sessionStorage.removeItem(
                    "studentName"
                );

                sessionStorage.removeItem(
                    "studentMatric"
                );

                sessionStorage.removeItem(
                    "studentEmail"
                );

                sessionStorage.removeItem(
                    "studentLevel"
                );

                sessionStorage.removeItem(
                    "studentDepartment"
                );

                sessionStorage.removeItem(
                    "studentHasVoted"
                );

                sessionStorage.removeItem(
                    "studentEligible"
                );


                window.location.href =
                    "student-login.html";

            }
        );

    }


    /* =========================================================
       PREVENT BACK BUTTON AFTER LOGOUT
    ========================================================= */

    window.addEventListener("pageshow", event => {

        if (event.persisted) {

            const stillLoggedIn =
                sessionStorage.getItem(
                    "studentLoggedIn"
                );

            if (stillLoggedIn !== "true") {

                window.location.href =
                    "student-login.html";

            }

        }

    });

});