// ==========================================
// VOTE SUCCESS PAGE
// ==========================================


// ==========================================
// CHECK IF VOTE WAS ACTUALLY SUBMITTED
// ==========================================

const voteSubmitted =
    sessionStorage.getItem("voteSubmitted");

if (voteSubmitted !== "true") {

    Swal.fire({

        icon: "warning",

        title: "No Submitted Vote",

        text: "You have not submitted a vote yet.",

        confirmButtonColor: "#1746a2",

        allowOutsideClick: false

    }).then(() => {

        window.location.href =
            "vote.html";

    });

}


// ==========================================
// GET VOTE REFERENCE
// ==========================================

const voteReference =
    sessionStorage.getItem("voteReference");

const referenceElement =
    document.getElementById("voteReference");


if (voteReference) {

    referenceElement.textContent =
        voteReference;

} else {

    referenceElement.textContent =
        "UV-2026-UNKNOWN";

}


// ==========================================
// GET SUBMISSION TIME
// ==========================================

const savedTime =
    sessionStorage.getItem(
        "voteSubmissionTime"
    );

const submissionElement =
    document.getElementById(
        "submissionTime"
    );


if (savedTime) {

    const date =
        new Date(savedTime);

    const formattedDate =
        date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

    const formattedTime =
        date.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    submissionElement.textContent =
        `${formattedDate}, ${formattedTime}`;

} else {

    submissionElement.textContent =
        "Not available";

}


// ==========================================
// PRINT CONFIRMATION
// ==========================================

document
    .getElementById("printReceiptBtn")
    .addEventListener("click", () => {

        window.print();

    });