document.addEventListener("DOMContentLoaded", async function () {

    /* =====================================================
       LOGIN CHECK
    ===================================================== */

    if (
        sessionStorage.getItem("studentLoggedIn") !== "true"
    ) {
        window.location.href = "student-login.html";
        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

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


    /* =====================================================
       API
    ===================================================== */

    const API_URL =
        "/api/students/elections";


    /* =====================================================
       LOAD COMPLETED ELECTIONS
    ===================================================== */

    let selections = {};

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


    /* =====================================================
       LOAD ELECTIONS FROM SERVER
    ===================================================== */

    async function loadElections() {

        try {

            const response =
                await fetch(API_URL, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load elections."
                );

            }


            const elections =
                Array.isArray(data.elections)
                    ? data.elections
                    : [];


            loading.style.display =
                "none";


            renderActiveElections(
                elections
            );


        } catch (error) {

            console.error(
                "Election loading error:",
                error
            );


            loading.style.display =
                "none";


            emptyState.style.display =
                "block";


            emptyState.innerHTML = `

                <div>

                    <h3>
                        Unable to Load Elections
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Please try again later."
                        )}
                    </p>

                </div>

            `;


            bottomAction.style.display =
                "none";


            Swal.fire({

                icon: "error",

                title:
                    "Unable to Load Elections",

                text:
                    error.message ||
                    "Please try again later.",

                confirmButtonColor:
                    "#2563eb"

            });

        }

    }


    /* =====================================================
       RENDER ACTIVE ELECTIONS
    ===================================================== */

    function renderActiveElections(
        elections
    ) {

        electionList.innerHTML = "";


        const now =
            new Date();


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


                    if (
                        Number.isNaN(
                            start.getTime()
                        ) ||
                        Number.isNaN(
                            end.getTime()
                        )
                    ) {

                        return false;

                    }


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


        /* =================================================
           NO ACTIVE ELECTION
        ================================================= */

        if (
            activeElections.length === 0
        ) {

            emptyState.style.display =
                "block";

            bottomAction.style.display =
                "none";

            return;

        }


        emptyState.style.display =
            "none";


        bottomAction.style.display =
            "flex";


        /* =================================================
           RENDER EACH ELECTION
        ================================================= */

        activeElections.forEach(
            election => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "election-card";


                const electionId =
                    election.id;


                const isCompleted =
                    Boolean(
                        selections[
                            electionId
                        ]
                    );


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
                                Active election
                            </p>

                        </div>

                    </div>


                    <div class="election-right">

                        <span class="status ${
                            isCompleted
                                ? "completed"
                                : "available"
                        }">

                            ${
                                isCompleted
                                    ? "✓ COMPLETED"
                                    : "VOTE NOW"
                            }

                        </span>


                        <span class="arrow">
                            →
                        </span>

                    </div>

                `;


                if (isCompleted) {

                    card.classList.add(
                        "completed"
                    );

                }


                /* =========================================
                   ELECTION CLICK
                ========================================= */

                card.addEventListener(
                    "click",
                    async function () {

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


                        /* =================================
                           SAVE ACTIVE ELECTION
                        ================================= */

                        localStorage.setItem(
                            "activeElectionId",
                            String(
                                electionId
                            )
                        );


                        localStorage.removeItem(
                            "activeVotingPosition"
                        );


                        localStorage.removeItem(
                            "activeCandidateId"
                        );


                        /* =================================
                           GO TO VOTING PAGE
                        ================================= */

                        window.location.href =
                            "vote.html";

                    }
                );


                electionList.appendChild(
                    card
                );

            }
        );


        updateProgress();

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress() {

        const count =
            Object.keys(
                selections
            ).length;


        completedCount.textContent =
            count;

    }


    /* =====================================================
       FINISH ELECTION
    ===================================================== */

    finishBtn.addEventListener(
        "click",
        function () {

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


    /* =====================================================
       LOGOUT
    ===================================================== */

    logoutBtn.addEventListener(
        "click",
        function () {

            Swal.fire({

                icon: "question",

                title:
                    "Logout?",

                text:
                    "Are you sure you want to logout?",

                showCancelButton:
                    true,

                confirmButtonText:
                    "Logout",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#dc2626",

                cancelButtonColor:
                    "#6b7280",

                reverseButtons:
                    true

            }).then(
                function (result) {

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


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

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


    /* =====================================================
       START
    ===================================================== */

    await loadElections();

});