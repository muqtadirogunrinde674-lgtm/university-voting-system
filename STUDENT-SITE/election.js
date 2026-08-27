document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       LOGIN CHECK
    =============================== */

    if (
        sessionStorage.getItem("studentLoggedIn") !== "true"
    ) {
        window.location.href = "student-login.html";
        return;
    }


    /* ===============================
       ELEMENTS
    =============================== */

    const loading =
        document.getElementById("loading");

    const electionList =
        document.getElementById("electionList");

    const emptyState =
        document.getElementById("emptyState");

    const bottomAction =
        document.getElementById("bottomAction");

    const completedCount =
        document.getElementById("completedCount");

    const finishBtn =
        document.getElementById("finishBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");


    /* ===============================
       LOAD DATA
    =============================== */

    let elections = [];
    let candidates = [];
    let selections = {};

    try {

        elections =
            JSON.parse(
                localStorage.getItem(
                    "univoteElections"
                )
            ) || [];

    } catch (error) {

        console.error(
            "Could not load elections:",
            error
        );

        elections = [];

    }


    try {

        candidates =
            JSON.parse(
                localStorage.getItem(
                    "univoteCandidates"
                )
            ) || [];

    } catch (error) {

        console.error(
            "Could not load candidates:",
            error
        );

        candidates = [];

    }


    try {

        selections =
            JSON.parse(
                localStorage.getItem(
                    "univoteSelections"
                )
            ) || {};

    } catch (error) {

        console.error(
            "Could not load selections:",
            error
        );

        selections = {};

    }


    loading.style.display = "none";


    /* ===============================
       FIND ACTIVE ELECTIONS
    =============================== */

    const now = new Date();


    const activeElections =
        elections.filter(
            election => {

                if (
                    !election.startDate ||
                    !election.endDate
                ) {
                    return false;
                }


                const start =
                    new Date(
                        election.startDate
                    );

                const end =
                    new Date(
                        election.endDate
                    );


                start.setHours(
                    0,
                    0,
                    0,
                    0
                );


                end.setHours(
                    23,
                    59,
                    59,
                    999
                );


                return (
                    now >= start &&
                    now <= end
                );

            }
        );


    /* ===============================
       NO ACTIVE ELECTION
    =============================== */

    if (
        activeElections.length === 0
    ) {

        emptyState.style.display = "block";

        bottomAction.style.display = "none";

        return;

    }


    /* ===============================
       SHOW BOTTOM ACTION
    =============================== */

    bottomAction.style.display = "flex";


    /* ===============================
       RENDER ELECTIONS
    =============================== */

    activeElections.forEach(
        election => {

            const card =
                document.createElement(
                    "div"
                );


            /* --------------------------------
               GET CANDIDATES FOR THIS ELECTION
            -------------------------------- */

            const electionCandidates =
                candidates.filter(
                    candidate => {

                        const candidateElectionId =
                            candidate.electionId ??
                            candidate.electionID ??
                            candidate.election_id;

                        return (
                            String(
                                candidateElectionId
                            ) ===
                            String(
                                election.id
                            )
                        );

                    }
                );


            /* --------------------------------
               CHECK IF STUDENT ALREADY VOTED
            -------------------------------- */

            const isCompleted =
                Boolean(
                    selections[
                        election.id
                    ]
                );


            card.className =
                "election-card";


            if (isCompleted) {

                card.classList.add(
                    "completed"
                );

            }


            card.innerHTML = `

                <div class="election-left">

                    <div class="election-icon">
                        🗳️
                    </div>


                    <div class="election-info">

                        <h2>
                            ${escapeHTML(
                                election.name ||
                                "Election"
                            )}
                        </h2>


                        <p>

                            ${electionCandidates.length}

                            candidate${
                                electionCandidates.length === 1
                                    ? ""
                                    : "s"
                            }

                            available

                        </p>

                    </div>

                </div>


                <div class="election-right">

                    <span class="status ${
                        isCompleted
                            ? "completed"
                            : electionCandidates.length > 0
                                ? "available"
                                : "empty"
                    }">

                        ${
                            isCompleted
                                ? "✓ COMPLETED"
                                : electionCandidates.length > 0
                                    ? "VOTE NOW"
                                    : "NO CANDIDATES"
                        }

                    </span>


                    <span class="arrow">
                        →
                    </span>

                </div>

            `;


            /* ===============================
               ELECTION CLICK
            =============================== */

            card.addEventListener(
                "click",
                () => {

                    /* -------------------------
                       NO CANDIDATES
                    ------------------------- */

                    if (
                        electionCandidates.length === 0
                    ) {

                        Swal.fire({

                            icon: "info",

                            title:
                                "No Candidates Available",

                            text:
                                "There are currently no candidates available for this election.",

                            confirmButtonColor:
                                "#2563eb"

                        });

                        return;

                    }


                    /* -------------------------
                       ALREADY COMPLETED
                    ------------------------- */

                    if (isCompleted) {

                        Swal.fire({

                            icon: "info",

                            title:
                                "Election Completed",

                            text:
                                "You have already completed this election.",

                            confirmButtonColor:
                                "#2563eb"

                        });

                        return;

                    }


                    /* -------------------------
                       SAVE ACTIVE ELECTION
                    ------------------------- */

                    localStorage.setItem(
                        "activeElectionId",
                        String(
                            election.id
                        )
                    );


                    /* -------------------------
                       CLEAR OLD POSITION
                    ------------------------- */

                    localStorage.removeItem(
                        "activeVotingPosition"
                    );


                    /* -------------------------
                       CLEAR OLD CANDIDATE
                       SELECTION FOR CURRENT
                       VOTING SESSION
                    ------------------------- */

                    localStorage.removeItem(
                        "activeCandidateId"
                    );


                    /* -------------------------
                       GO TO VOTING PAGE
                    ------------------------- */

                    window.location.href =
                        "vote.html";

                }
            );


            electionList.appendChild(
                card
            );

        }
    );


    /* ===============================
       UPDATE PROGRESS
    =============================== */

    updateProgress();


    /* ===============================
       FINISH ELECTION
    =============================== */

    finishBtn.addEventListener(
        "click",
        () => {

            const completed =
                Object.keys(
                    selections
                ).length;


            if (
                completed === 0
            ) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "No Election Completed",

                    text:
                        "Please complete at least one election before finishing.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            window.location.href =
                "review-vote.html";

        }
    );


    /* ===============================
       UPDATE PROGRESS
    =============================== */

    function updateProgress() {

        const count =
            Object.keys(
                selections
            ).length;


        completedCount.textContent =
            count;

    }


    /* ===============================
       LOGOUT
    =============================== */

    logoutBtn.addEventListener(
        "click",
        () => {

            Swal.fire({

                icon: "question",

                title:
                    "Logout?",

                text:
                    "Are you sure you want to logout?",

                showCancelButton: true,

                confirmButtonText:
                    "Logout",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#dc2626",

                cancelButtonColor:
                    "#6b7280",

                reverseButtons: true

            }).then(
                result => {

                    if (
                        result.isConfirmed
                    ) {

                        sessionStorage.removeItem(
                            "studentLoggedIn"
                        );

                        sessionStorage.removeItem(
                            "studentUsername"
                        );

                        localStorage.removeItem(
                            "univoteSelections"
                        );

                        localStorage.removeItem(
                            "activeElectionId"
                        );

                        localStorage.removeItem(
                            "activeVotingPosition"
                        );

                        localStorage.removeItem(
                            "activeCandidateId"
                        );

                        window.location.href =
                            "student-login.html";

                    }

                }
            );

        }
    );


    /* ===============================
       ESCAPE HTML
    =============================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
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