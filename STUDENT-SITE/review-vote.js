document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       LOGIN CHECK
    ========================= */

    if (
        sessionStorage.getItem("studentLoggedIn") !== "true"
    ) {

        window.location.href =
            "student-login.html";

        return;
    }


    /* =========================
       GET STUDENT
    ========================= */

    let currentStudent = null;

    try {

        currentStudent =
            JSON.parse(
                sessionStorage.getItem(
                    "currentStudent"
                )
            );

    } catch (error) {

        currentStudent = null;

    }


    if (!currentStudent) {

        window.location.href =
            "student-login.html";

        return;
    }


    /* =========================
       ELEMENTS
    ========================= */

    const reviewList =
        document.getElementById(
            "reviewList"
        );

    const emptyReview =
        document.getElementById(
            "emptyReview"
        );

    const selectionCount =
        document.getElementById(
            "selectionCount"
        );

    const completeBtn =
        document.getElementById(
            "completeBtn"
        );


    /* =========================
       LOAD SELECTIONS
    ========================= */

    let selections =
        JSON.parse(
            localStorage.getItem(
                "univoteSelections"
            )
        ) || {};


    /*
     * Convert old array format if necessary.
     */

    if (Array.isArray(selections)) {

        const converted = {};

        selections.forEach(
            (item, index) => {

                if (!item) return;

                const position =
                    item.position ||
                    item.post ||
                    "General";

                converted[
                    `${item.electionId || "election"}-${position}-${index}`
                ] = item;

            }
        );

        selections = converted;

    }


    const selectionArray =
        Object.values(
            selections
        );


    /* =========================
       RENDER
    ========================= */

    function renderReview() {

        reviewList.innerHTML = "";


        selectionCount.textContent =
            `${selectionArray.length} ${
                selectionArray.length === 1
                    ? "selection"
                    : "selections"
            }`;


        if (
            selectionArray.length === 0
        ) {

            emptyReview.style.display =
                "block";

            completeBtn.disabled =
                true;

            return;
        }


        emptyReview.style.display =
            "none";

        completeBtn.disabled =
            false;


        selectionArray.forEach(
            (selection, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "review-item";


                const electionName =
                    selection.electionName ||
                    "Election";


                const position =
                    selection.position ||
                    selection.post ||
                    "General Election";


                const candidateName =
                    selection.candidateName ||
                    selection.name ||
                    "Selected Candidate";


                const extraInfo = [];


                if (
                    selection.department
                ) {

                    extraInfo.push(
                        selection.department
                    );

                }


                if (
                    selection.level
                ) {

                    extraInfo.push(
                        `${selection.level} Level`
                    );

                }


                item.innerHTML = `

                    <div class="review-left">

                        <div class="position-number">
                            ${index + 1}
                        </div>

                        <div>

                            <div class="review-election">
                                ${escapeHTML(
                                    electionName
                                )}
                            </div>

                            <div class="review-position">
                                ${escapeHTML(
                                    position
                                )}
                            </div>

                            <div class="review-candidate">
                                ${escapeHTML(
                                    candidateName
                                )}
                            </div>

                            ${
                                extraInfo.length
                                ? `
                                    <div class="review-meta">
                                        ${escapeHTML(
                                            extraInfo.join(" • ")
                                        )}
                                    </div>
                                  `
                                : ""
                            }

                        </div>

                    </div>


                    <span class="selected-badge">
                        SELECTED ✓
                    </span>

                `;


                reviewList.appendChild(
                    item
                );

            }
        );

    }


    renderReview();


    /* =========================
       BACK TO ELECTIONS
    ========================= */

    document
        .getElementById("backBtn")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "election.html";

            }
        );


    document
        .getElementById("backAction")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "election.html";

            }
        );


    document
        .getElementById("backToElection")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "election.html";

            }
        );


    /* =========================
       COMPLETE VOTE
    ========================= */

    completeBtn.addEventListener(
        "click",
        () => {

            if (
                selectionArray.length === 0
            ) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "No Votes Selected",

                    text:
                        "Please select your candidates before completing your vote.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;
            }


            Swal.fire({

                icon: "question",

                title:
                    "Complete Your Vote?",

                text:
                    "Once submitted, you will not be able to vote again.",

                showCancelButton:
                    true,

                confirmButtonText:
                    "Yes, Complete Vote",

                cancelButtonText:
                    "Go Back",

                confirmButtonColor:
                    "#2563eb",

                cancelButtonColor:
                    "#6b7280",

                reverseButtons:
                    true

            }).then(
                result => {

                    if (
                        result.isConfirmed
                    ) {

                        completeVote();

                    }

                }
            );

        }
    );


    /* =========================
       COMPLETE VOTE FUNCTION
    ========================= */

    function completeVote() {

        completeBtn.disabled =
            true;

        completeBtn.textContent =
            "SUBMITTING...";


        /* =========================
           LOAD STUDENTS
        ========================= */

        let students =
            JSON.parse(
                localStorage.getItem(
                    "univoteStudents"
                )
            ) || [];


        const studentIndex =
            students.findIndex(
                student =>
                    String(
                        student.matricNumber
                    )
                    .trim()
                    .toLowerCase() ===
                    String(
                        currentStudent.matricNumber
                    )
                    .trim()
                    .toLowerCase()
            );


        if (
            studentIndex === -1
        ) {

            completeBtn.disabled =
                false;

            completeBtn.textContent =
                "COMPLETE MY VOTE ✓";


            Swal.fire({

                icon: "error",

                title:
                    "Student Not Found",

                text:
                    "Your student record could not be found.",

                confirmButtonColor:
                    "#2563eb"

            });

            return;
        }


        /* =========================
           DOUBLE VOTE PROTECTION
        ========================= */

        if (
            students[
                studentIndex
            ].hasVoted === true
        ) {

            completeBtn.disabled =
                true;


            Swal.fire({

                icon: "info",

                title:
                    "Already Voted",

                text:
                    "You have already completed your vote.",

                confirmButtonColor:
                    "#2563eb"

            }).then(() => {

                window.location.href =
                    "dashboard.html";

            });

            return;
        }


        /* =========================
           LOAD BALLOTS
        ========================= */

        let ballots =
            JSON.parse(
                localStorage.getItem(
                    "univoteBallots"
                )
            ) || [];


        /* =========================
           EXTRA DUPLICATE CHECK
        ========================= */

        const existingBallot =
            ballots.find(
                ballot =>
                    String(
                        ballot.matricNumber
                    )
                    .trim()
                    .toLowerCase() ===
                    String(
                        currentStudent.matricNumber
                    )
                    .trim()
                    .toLowerCase()
            );


        if (
            existingBallot
        ) {

            Swal.fire({

                icon: "info",

                title:
                    "Vote Already Recorded",

                text:
                    "A vote already exists for this student.",

                confirmButtonColor:
                    "#2563eb"

            }).then(() => {

                window.location.href =
                    "dashboard.html";

            });

            return;
        }


        /* =========================
           CREATE BALLOT
        ========================= */

        const submittedAt =
            new Date().toISOString();


        const ballot = {

            ballotId:
                "BALLOT-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase(),

            studentId:
                currentStudent.id || "",

            studentName:
                currentStudent.name || "",

            matricNumber:
                currentStudent.matricNumber || "",

            level:
                currentStudent.level || "",

            department:
                currentStudent.department || "",

            selections:
                selectionArray.map(
                    selection => ({

                        electionId:
                            selection.electionId,

                        electionName:
                            selection.electionName,

                        position:
                            selection.position ||
                            selection.post ||
                            "",

                        candidateId:
                            selection.candidateId,

                        candidateName:
                            selection.candidateName,

                        department:
                            selection.department ||
                            "",

                        level:
                            selection.level ||
                            ""

                    })
                ),

            submittedAt:
                submittedAt

        };


        /* =========================
           SAVE BALLOT
        ========================= */

        ballots.push(
            ballot
        );


        localStorage.setItem(
            "univoteBallots",
            JSON.stringify(
                ballots
            )
        );


        /* =========================
           MARK STUDENT VOTED
        ========================= */

        students[
            studentIndex
        ].hasVoted = true;


        students[
            studentIndex
        ].votedAt =
            submittedAt;


        students[
            studentIndex
        ].lastBallotId =
            ballot.ballotId;


        localStorage.setItem(
            "univoteStudents",
            JSON.stringify(
                students
            )
        );


        /* =========================
           UPDATE CURRENT SESSION
        ========================= */

        currentStudent.hasVoted =
            true;


        currentStudent.votedAt =
            submittedAt;


        currentStudent.lastBallotId =
            ballot.ballotId;


        sessionStorage.setItem(
            "currentStudent",
            JSON.stringify(
                currentStudent
            )
        );


        /* =========================
           CLEAR ALL SELECTIONS
        ========================= */

        localStorage.removeItem(
            "univoteSelections"
        );

        localStorage.removeItem(
            "selectedCandidates"
        );

        localStorage.removeItem(
            "votingSelections"
        );

        localStorage.removeItem(
            "voteSelections"
        );

        localStorage.removeItem(
            "activeElectionId"
        );

        localStorage.removeItem(
            "activeVotingPosition"
        );


        /* =========================
           APPRECIATION POPUP
        ========================= */

        Swal.fire({

            icon:
                "success",

            title:
                "Thank You! 🎉",

            text:
                "Your vote has been successfully submitted. We appreciate your participation in UniVote.",

            showConfirmButton:
                false,

            timer:
                3000,

            timerProgressBar:
                true,

            allowOutsideClick:
                false,

            allowEscapeKey:
                false

        }).then(() => {

            window.location.href =
                "dashboard.html";

        });


        /*
         * Safety redirect in case the
         * popup timer callback is interrupted.
         */

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 3300);

    }


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(value) {

        return String(value || "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

});