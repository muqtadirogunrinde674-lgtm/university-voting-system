document.addEventListener("DOMContentLoaded", () => {

    const BALLOTS_KEY = "univoteBallots";

    let ballots = [];


    /* =========================
       ELEMENTS
    ========================= */

    const tableBody =
        document.getElementById(
            "ballotsTableBody"
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

    const latestVote =
        document.getElementById(
            "latestVote"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const electionFilter =
        document.getElementById(
            "electionFilter"
        );

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );


    /* MODAL */

    const modal =
        document.getElementById(
            "ballotModal"
        );

    const closeModal =
        document.getElementById(
            "closeModal"
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
                "Could not load ballots:",
                error
            );

            ballots = [];

        }


        /*
         * Newest submitted ballot first.
         */

        ballots.sort(
            (a, b) =>
                new Date(
                    b.submittedAt || 0
                ) -
                new Date(
                    a.submittedAt || 0
                )
        );


        updateStats();

        populateElectionFilter();

        renderBallots();

    }


    /* =========================
       STATS
    ========================= */

    function updateStats() {

        totalBallots.textContent =
            ballots.length;


        const uniqueStudents =
            new Set(
                ballots.map(
                    ballot =>
                        String(
                            ballot.matricNumber || ""
                        )
                            .trim()
                            .toLowerCase()
                )
            );


        studentsVoted.textContent =
            uniqueStudents.size;


        if (ballots.length) {

            const latest =
                new Date(
                    ballots[0].submittedAt
                );


            latestVote.textContent =
                formatDate(latest);

        } else {

            latestVote.textContent =
                "—";

        }

    }


    /* =========================
       ELECTION FILTER
    ========================= */

    function populateElectionFilter() {

        const currentValue =
            electionFilter.value;


        electionFilter.innerHTML = `

            <option value="all">
                All Elections
            </option>

        `;


        const elections =
            new Map();


        ballots.forEach(ballot => {

            (ballot.selections || [])
                .forEach(selection => {

                    const id =
                        selection.electionId ||
                        selection.electionName;


                    const name =
                        selection.electionName ||
                        "Election";


                    if (id && !elections.has(id)) {

                        elections.set(
                            id,
                            name
                        );

                    }

                });

        });


        elections.forEach(
            (name, id) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value = id;

                option.textContent =
                    name;


                electionFilter.appendChild(
                    option
                );

            }
        );


        if (
            [...electionFilter.options]
                .some(
                    option =>
                        option.value ===
                        currentValue
                )
        ) {

            electionFilter.value =
                currentValue;

        }

    }


    /* =========================
       FILTER BALLOTS
    ========================= */

    function getFilteredBallots() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedElection =
            electionFilter.value;


        return ballots.filter(
            ballot => {

                const studentName =
                    String(
                        ballot.studentName || ""
                    ).toLowerCase();


                const matric =
                    String(
                        ballot.matricNumber || ""
                    ).toLowerCase();


                const department =
                    String(
                        ballot.department || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    studentName.includes(search) ||
                    matric.includes(search) ||
                    department.includes(search);


                if (!matchesSearch) {

                    return false;

                }


                if (
                    selectedElection ===
                    "all"
                ) {

                    return true;

                }


                return (
                    ballot.selections ||
                    []
                ).some(
                    selection =>
                        String(
                            selection.electionId
                        ) ===
                        String(
                            selectedElection
                        )
                );

            }
        );

    }


    /* =========================
       RENDER TABLE
    ========================= */

    function renderBallots() {

        const filtered =
            getFilteredBallots();


        tableBody.innerHTML = "";


        if (!filtered.length) {

            emptyState.style.display =
                "block";

            return;

        }


        emptyState.style.display =
            "none";


        filtered.forEach(
            (ballot, index) => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const selectionCount =
                    Array.isArray(
                        ballot.selections
                    )
                        ? ballot.selections.length
                        : 0;


                row.innerHTML = `

                    <td>
                        ${index + 1}
                    </td>


                    <td>

                        <div class="student-cell">

                            <strong>
                                ${escapeHTML(
                                    ballot.studentName ||
                                    "Unknown Student"
                                )}
                            </strong>

                            <small>
                                Voter
                            </small>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(
                            ballot.matricNumber ||
                            "—"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            ballot.department ||
                            "—"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            ballot.level ||
                            "—"
                        )}
                    </td>


                    <td>

                        <span class="selection-count">
                            ${selectionCount}
                            ${
                                selectionCount === 1
                                    ? "Selection"
                                    : "Selections"
                            }
                        </span>

                    </td>


                    <td>
                        ${formatDate(
                            new Date(
                                ballot.submittedAt
                            )
                        )}
                    </td>


                    <td>

                        <button
                            class="view-btn"
                            data-ballot-id="${escapeHTML(
                                ballot.ballotId
                            )}"
                        >
                            View Ballot
                        </button>

                    </td>

                `;


                tableBody.appendChild(row);

            }
        );


        document
            .querySelectorAll(
                ".view-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openBallot(
                            button.dataset.ballotId
                        );

                    }
                );

            });

    }


    /* =========================
       OPEN BALLOT
    ========================= */

    function openBallot(ballotId) {

        const ballot =
            ballots.find(
                item =>
                    String(
                        item.ballotId
                    ) ===
                    String(ballotId)
            );


        if (!ballot) {

            Swal.fire({

                icon: "error",

                title: "Ballot Not Found",

                text:
                    "This ballot could not be found.",

                confirmButtonColor:
                    "#2563eb"

            });

            return;

        }


        document.getElementById(
            "modalStudentName"
        ).textContent =
            ballot.studentName ||
            "Unknown Student";


        document.getElementById(
            "modalStudentMatric"
        ).textContent =
            ballot.matricNumber ||
            "—";


        document.getElementById(
            "modalDepartment"
        ).textContent =
            ballot.department ||
            "—";


        document.getElementById(
            "modalLevel"
        ).textContent =
            ballot.level ||
            "—";


        document.getElementById(
            "modalSubmitted"
        ).textContent =
            formatDate(
                new Date(
                    ballot.submittedAt
                )
            );


        document.getElementById(
            "modalBallotId"
        ).textContent =
            ballot.ballotId ||
            "—";


        const selectionsBox =
            document.getElementById(
                "modalSelections"
            );


        selectionsBox.innerHTML = "";


        const selections =
            Array.isArray(
                ballot.selections
            )
                ? ballot.selections
                : [];


        if (!selections.length) {

            selectionsBox.innerHTML = `

                <div class="modal-selection">

                    <div>

                        <div class="modal-candidate">
                            No selections recorded
                        </div>

                    </div>

                </div>

            `;

        } else {

            selections.forEach(
                selection => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "modal-selection";


                    item.innerHTML = `

                        <div>

                            <div class="modal-election">
                                ${escapeHTML(
                                    selection.electionName ||
                                    "Election"
                                )}
                            </div>

                            <div class="modal-candidate">
                                ${escapeHTML(
                                    selection.candidateName ||
                                    "Unknown Candidate"
                                )}
                            </div>

                        </div>


                        <div class="selected-mark">
                            ✓
                        </div>

                    `;


                    selectionsBox.appendChild(
                        item
                    );

                }
            );

        }


        modal.classList.add("show");

    }


    /* =========================
       CLOSE MODAL
    ========================= */

    closeModal.addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "show"
            );

        }
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =========================
       SEARCH
    ========================= */

    searchInput.addEventListener(
        "input",
        renderBallots
    );


    electionFilter.addEventListener(
        "change",
        renderBallots
    );


    /* =========================
       REFRESH
    ========================= */

    refreshBtn.addEventListener(
        "click",
        () => {

            loadBallots();

        }
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
       DATE FORMAT
    ========================= */

    function formatDate(date) {

        if (
            !date ||
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }


        return date.toLocaleString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =========================
       START
    ========================= */

    loadBallots();

});