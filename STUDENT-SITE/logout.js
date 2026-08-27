// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        Swal.fire({

            title: "Logout?",

            text: "Are you sure you want to logout?",

            icon: "question",

            showCancelButton: true,

            confirmButtonText: "Logout",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#1746a2",

            cancelButtonColor: "#6b7280",

            reverseButtons: true,

            buttonsStyling: true

        }).then((result) => {

            if (result.isConfirmed) {

                // Remove student session
                sessionStorage.removeItem(
                    "studentLoggedIn"
                );

                sessionStorage.removeItem(
                    "studentMatric"
                );

                // Remove voting demo data
                sessionStorage.removeItem(
                    "voteSelections"
                );

                sessionStorage.removeItem(
                    "voteReference"
                );

                sessionStorage.removeItem(
                    "voteSubmissionTime"
                );

                // Go back to login
                window.location.href =
                    "student-login.html";

            }

        });

    });

}