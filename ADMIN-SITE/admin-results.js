document.addEventListener("DOMContentLoaded", () => {

    const BALLOTS_KEY = "univoteBallots";

    let ballots = [];

    const resultsContainer =
        document.getElementById(
            "resultsContainer"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const totalBallots =
        document.getElementById(
            "totalBallots"
        );

    const studentsVoted =
        document.getElementById(
            "studentsVoted"
        );

    const totalElections =
        document.getElementById(
            "totalElections"
        );

    const electionFilter =
        document.getElementById(
            "electionFilter"
        );

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    /* =========================
       LOAD BALLOTS
    ========================= */

    function loadBallots() {

        try {

            ballots =
                JSON.parse(
                    localStorage.getItem(
                        BALLOTS_KEY
                    )
                ) || [];

        } catch (error) {

            console.error(
                "Unable to load ballots:",
                error
            );

            ballots = [];

        }


        updateStats();

        populateElectionFilter();

        renderResults();

    }


    /* =========================
       STATS
    ========================= */

    function updateStats() {

        totalBallots.textContent =
            ballots.length;


        const uniqueStudents =
            new Set(
                ballots
                    .map(
                        ballot =>
                            String(
                                ballot.matricNumber ||
                                ""
                            )
                                .trim()
                                .toLowerCase()
                    )
                    .filter(Boolean)
            );


        studentsVoted.textContent =
            uniqueStudents.size;


        const elections =
            getElectionData();


        totalElections.textContent =
            elections.length;

    }


    /* =========================
       BUILD ELECTION DATA
    ========================= */

    function getElectionData() {

        const electionMap =
            new Map();


        ballots.forEach(ballot => {

            const selections =
                Array.isArray(
                    ballot.selections
                )
                    ? ballot.selections
                    : [];


            selections.forEach(selection => {

                const electionId =
                    String(
                        selection.electionId ||
                        selection.electionID ||
                        selection.electionName ||
                        "unknown-election"
                    );


                const electionName =
                    selection.electionName ||
                    selection.election ||
                    "Unknown Election";


                if (
                    !electionMap.has(
                        electionId
                    )
                ) {

                    electionMap.set(
                        electionId,
                        {
                            id: electionId,

                            name:
                                electionName,

                            candidates:
                                new Map(),

                            totalVotes: 0
                        }
                    );

                }


                const election =
                    electionMap.get(
                        electionId
                    );


                const candidateId =
                    String(
                        selection.candidateId ||
                        selection.candidateID ||
                        selection.candidateName ||
                        "unknown-candidate"
                    );


                const candidateName =
                    selection.candidateName ||
                    selection.name ||
                    "Unknown Candidate";


                if (
                    !election.candidates.has(
                        candidateId
                    )
                ) {

                    election.candidates.set(
                        candidateId,
                        {
                            id: candidateId,

                            name:
                                candidateName,

                            votes: 0
                        }
                    );

                }


                const candidate =
                    election.candidates.get(
                        candidateId
                    );


                candidate.votes++;

                election.totalVotes++;

            });

        });


        return Array.from(
            electionMap.values()
        );

    }


    /* =========================
       FILTER OPTIONS
    ========================= */

    function populateElectionFilter() {

        const oldValue =
            electionFilter.value;


        electionFilter.innerHTML = `

            <option value="all">
                All Elections
            </option>

        `;


        const elections =
            getElectionData();


        elections.forEach(election => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                election.id;


            option.textContent =
                election.name;


            electionFilter.appendChild(
                option
            );

        });


        const stillExists =
            Array.from(
                electionFilter.options
            )
                .some(
                    option =>
                        option.value ===
                        oldValue
                );


        if (stillExists) {

            electionFilter.value =
                oldValue;

        }

    }


    /* =========================
       RENDER RESULTS
    ========================= */

    function renderResults() {

        resultsContainer.innerHTML = "";


        let elections =
            getElectionData();


        const selected =
            electionFilter.value;


        if (
            selected !== "all"
        ) {

            elections =
                elections.filter(
                    election =>
                        election.id ===
                        selected
                );

        }


        if (!elections.length) {

            emptyState.style.display =
                "block";

            return;

        }


        emptyState.style.display =
            "none";


        elections.forEach(
            election => {

                renderElection(
                    election
                );

            }
        );

    }


    /* =========================
       RENDER ONE ELECTION
    ========================= */

    function renderElection(
        election
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "election-result-card";


        const candidates =
            Array.from(
                election.candidates.values()
            );


        candidates.sort(
            (a, b) =>
                b.votes - a.votes
        );


        const highestVotes =
            candidates.length
                ? candidates[0].votes
                : 0;


        card.innerHTML = `

            <div class="election-result-header">

                <div>

                    <h3>
                        ${escapeHTML(
                            election.name
                        )}
                    </h3>

                    <p>
                        Candidate vote count
                    </p>

                </div>


                <span class="total-election-votes">

                    ${election.totalVotes}
                    ${
                        election.totalVotes === 1
                            ? "Vote"
                            : "Votes"
                    }

                </span>

            </div>


            <div class="candidates-list">

            </div>

        `;


        const list =
            card.querySelector(
                ".candidates-list"
            );


        if (!candidates.length) {

            list.innerHTML = `

                <div class="candidate-result">

                    <span>
                        No candidate votes yet.
                    </span>

                </div>

            `;

        }


        candidates.forEach(
            candidate => {

                const percentage =
                    election.totalVotes > 0
                        ? (
                            candidate.votes /
                            election.totalVotes
                        ) * 100
                        : 0;


                const isLeader =
                    candidate.votes ===
                    highestVotes &&
                    highestVotes > 0;


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "candidate-result" +
                    (
                        isLeader
                            ? " winner-row"
                            : ""
                    );


                row.innerHTML = `

                    <div class="candidate-top">

                        <div class="candidate-info">

                            <div class="candidate-avatar">
                                ${getInitials(
                                    candidate.name
                                )}
                            </div>


                            <div>

                                <div class="candidate-name">

                                    ${escapeHTML(
                                        candidate.name
                                    )}

                                    ${
                                        isLeader
                                            ? `
                                                <span class="winner-badge">
                                                    LEADING
                                                </span>
                                              `
                                            : ""
                                    }

                                </div>

                            </div>

                        </div>


                        <div class="candidate-votes">

                            <strong>
                                ${candidate.votes}
                            </strong>

                            <span>
                                ${
                                    candidate.votes === 1
                                        ? "vote"
                                        : "votes"
                                }
                            </span>

                        </div>

                    </div>


                    <div class="vote-bar-area">

                        <div class="vote-bar">

                            <div
                                class="vote-bar-fill"
                                style="width: ${percentage}%"
                            ></div>

                        </div>


                        <div class="vote-percent">

                            ${percentage.toFixed(1)}%

                        </div>

                    </div>

                `;


                list.appendChild(row);

            }
        );


        resultsContainer.appendChild(
            card
        );

    }


    /* =========================
       INITIALS
    ========================= */

    function getInitials(name) {

        const words =
            String(name || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!words.length) {

            return "?";

        }


        return words
            .slice(0, 2)
            .map(
                word =>
                    word
                        .charAt(0)
                        .toUpperCase()
            )
            .join("");

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


    /* =========================
       EVENTS
    ========================= */

    electionFilter.addEventListener(
        "change",
        renderResults
    );


    refreshBtn.addEventListener(
        "click",
        loadBallots
    );


    /* =========================
       LOGOUT
    ========================= */

    document
        .getElementById("logoutBtn")
        .addEventListener(
            "click",
            () => {

                Swal.fire({

                    title: "Logout?",

                    text:
                        "You will be returned to the admin login.",

                    icon: "question",

                    showCancelButton: true,

                    confirmButtonText:
                        "Logout",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#2563eb"

                }).then(result => {

                    if (
                        result.isConfirmed
                    ) {

                        sessionStorage.removeItem(
                            "adminLoggedIn"
                        );

                        sessionStorage.removeItem(
                            "adminUser"
                        );

                        window.location.href =
                            "admin-login.html";

                    }

                });

            }
        );


    /* =========================
       START
    ========================= */

    loadBallots();

});