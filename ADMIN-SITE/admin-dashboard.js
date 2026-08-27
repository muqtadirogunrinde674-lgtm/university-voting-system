document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ADMIN AUTH CHECK
    ===================================================== */

    const loggedIn =
        sessionStorage.getItem("adminLoggedIn");

    if (loggedIn !== "true") {

        window.location.href =
            "admin-login.html";

        return;
    }


    /* =====================================================
       ADMIN DETAILS
    ===================================================== */

    const adminName =
        sessionStorage.getItem("adminName") ||
        "Administrator";

    const adminUsername =
        sessionStorage.getItem("adminUsername") ||
        "admin";


    /* =====================================================
       UPDATE ADMIN NAME / USERNAME IN DASHBOARD
    ===================================================== */

    const adminNameElements =
        document.querySelectorAll(
            "#adminName, .admin-name, [data-admin-name]"
        );

    adminNameElements.forEach(element => {

        element.textContent =
            adminName;

    });


    const adminUsernameElements =
        document.querySelectorAll(
            "#adminUsername, .admin-username, [data-admin-username]"
        );

    adminUsernameElements.forEach(element => {

        element.textContent =
            adminUsername;

    });


    /* =====================================================
       ADMIN INITIAL / AVATAR
    ===================================================== */

    const adminAvatarElements =
        document.querySelectorAll(
            "#adminAvatar, .admin-avatar, [data-admin-avatar]"
        );

    const initial =
        adminName
            .trim()
            .charAt(0)
            .toUpperCase() || "A";


    adminAvatarElements.forEach(element => {

        element.textContent =
            initial;

    });


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");

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

});