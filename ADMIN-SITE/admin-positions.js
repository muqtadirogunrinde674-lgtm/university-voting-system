document.addEventListener("DOMContentLoaded", () => {

    // ======================================
    // ADMIN ACCESS
    // ======================================

    if (
        sessionStorage.getItem("adminLoggedIn") !== "true"
    ) {
        window.location.href = "admin-login.html";
        return;
    }


    // ======================================
    // ELECTIONS
    // ======================================

    const elections =
        JSON.parse(
            localStorage.getItem("univoteElections")
        ) || [];


    // ======================================
    // POSITIONS
    // ======================================

    let positions =
        JSON.parse(
            localStorage.getItem("univotePositions")
        ) || [

            {
                id: 1,
                name: "President",
                description:
                    "Leads the Student Union Government and represents the student body.",
                electionId: 1,
                maxWinners: 1
            },

            {
                id: 2,
                name: "Vice President",
                description:
                    "Assists the President and supports student representation.",
                electionId: 1,
                maxWinners: 1
            },

            {
                id: 3,
                name: "Secretary General",
                description:
                    "Responsible for official records and administrative communication.",
                electionId: 1,
                maxWinners: 1
            },

            {
                id: 4,
                name: "Treasurer",
                description:
                    "Oversees financial records and student union funds.",
                electionId: 1,
                maxWinners: 1
            }

        ];


    savePositions();

    populateElectionFilter();

    renderPositions(positions);

    updateStats();


    // ======================================
    // ELEMENTS
    // ======================================

    const addBtn =
        document.getElementById(
            "addPositionBtn"
        );

    const searchInput =
        document.getElementById(
            "searchPosition"
        );

    const electionFilter =
        document.getElementById(
            "electionFilter"
        );

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    // ======================================
    // FILTERS
    // ======================================

    searchInput.addEventListener(
        "input",
        filterPositions
    );

    electionFilter.addEventListener(
        "change",
        filterPositions
    );


    function filterPositions() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();

        const electionValue =
            electionFilter.value;


        const filtered =
            positions.filter(position => {

                const matchesSearch =
                    position.name
                        .toLowerCase()
                        .includes(search) ||

                    position.description
                        .toLowerCase()
                        .includes(search);


                const matchesElection =
                    electionValue === "all" ||
                    String(position.electionId) ===
                    electionValue;


                return (
                    matchesSearch &&
                    matchesElection
                );

            });


        renderPositions(filtered);

    }


    // ======================================
    // ADD POSITION
    // ======================================

    addBtn.addEventListener(
        "click",
        addPosition
    );


    function addPosition() {

        if (elections.length === 0) {

            Swal.fire({

                icon: "warning",

                title: "No Election Available",

                text:
                    "Create an election before creating positions.",

                confirmButtonColor:
                    "#1746a2"

            });

            return;

        }


        const electionOptions =
            elections.map(
                election =>

                    `<option value="${election.id}">
                        ${escapeHTML(election.name)}
                    </option>`

            ).join("");


        Swal.fire({

            title: "Add Position",

            html: `

                <input
                    id="positionName"
                    class="swal2-input"
                    placeholder="Position Name"
                >

                <textarea
                    id="positionDescription"
                    class="swal2-textarea"
                    placeholder="Position Description"
                ></textarea>

                <select
                    id="positionElection"
                    class="swal2-select"
                >

                    ${electionOptions}

                </select>

                <input
                    id="maxWinners"
                    class="swal2-input"
                    type="number"
                    min="1"
                    value="1"
                    placeholder="Number of winners"
                >

            `,

            showCancelButton: true,

            confirmButtonText:
                "Add Position",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#1746a2",

            preConfirm: () => {

                const name =
                    document.getElementById(
                        "positionName"
                    ).value.trim();


                const description =
                    document.getElementById(
                        "positionDescription"
                    ).value.trim();


                const electionId =
                    Number(
                        document.getElementById(
                            "positionElection"
                        ).value
                    );


                const maxWinners =
                    Number(
                        document.getElementById(
                            "maxWinners"
                        ).value
                    );


                if (
                    !name ||
                    !description ||
                    !electionId ||
                    !maxWinners ||
                    maxWinners < 1
                ) {

                    Swal.showValidationMessage(
                        "Please complete all fields correctly."
                    );

                    return false;

                }


                const duplicate =
                    positions.some(
                        position =>
                            position.electionId ===
                            electionId &&
                            position.name
                                .toLowerCase() ===
                            name.toLowerCase()
                    );


                if (duplicate) {

                    Swal.showValidationMessage(
                        "This position already exists in this election."
                    );

                    return false;

                }


                return {
                    name,
                    description,
                    electionId,
                    maxWinners
                };

            }

        }).then(result => {

            if (!result.isConfirmed) return;


            positions.push({

                id: Date.now(),

                name:
                    result.value.name,

                description:
                    result.value.description,

                electionId:
                    result.value.electionId,

                maxWinners:
                    result.value.maxWinners

            });


            savePositions();

            renderPositions(positions);

            updateStats();


            Swal.fire({

                icon: "success",

                title: "Position Added! 📋",

                text:
                    "The position has been created successfully.",

                confirmButtonColor:
                    "#1746a2"

            });

        });

    }


    // ======================================
    // RENDER
    // ======================================

    function renderPositions(list) {

        const container =
            document.getElementById(
                "positionList"
            );

        const empty =
            document.getElementById(
                "emptyState"
            );


        container.innerHTML = "";


        if (list.length === 0) {

            empty.classList.add("show");

            return;

        }


        empty.classList.remove("show");


        list.forEach((position, index) => {

            const election =
                elections.find(
                    election =>
                        election.id ===
                        position.electionId
                );


            const candidateCount =
                getCandidateCount(
                    position
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "position-card";


            card.innerHTML = `

                <div class="position-top">

                    <div class="position-number">
                        ${String(index + 1).padStart(2, "0")}
                    </div>

                </div>


                <h3>
                    ${escapeHTML(position.name)}
                </h3>


                <p class="position-description">
                    ${escapeHTML(position.description)}
                </p>


                <span class="election-tag">
                    🗳️
                    ${
                        election
                            ? escapeHTML(election.name)
                            : "Unknown Election"
                    }
                </span>


                <div class="position-info">

                    <div class="info-box">

                        <span>
                            Candidates
                        </span>

                        <strong>
                            ${candidateCount}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>
                            Winners
                        </span>

                        <strong>
                            ${position.maxWinners}
                        </strong>

                    </div>

                </div>


                <div class="position-footer">

                    <button
                        class="action-btn edit-btn"
                        data-id="${position.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="action-btn delete-btn"
                        data-id="${position.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            container.appendChild(card);

        });


        attachEvents();

    }


    // ======================================
    // CANDIDATE COUNT
    // ======================================

    function getCandidateCount(position) {

        const candidates =
            JSON.parse(
                localStorage.getItem(
                    "univoteCandidates"
                )
            ) || [];


        return candidates.filter(
            candidate =>
                candidate.position ===
                position.name &&

                candidate.electionId ===
                position.electionId
        ).length;

    }


    // ======================================
    // EDIT
    // ======================================

    function editPosition(id) {

        const position =
            positions.find(
                item => item.id === id
            );


        if (!position) return;


        Swal.fire({

            title: "Edit Position",

            html: `

                <input
                    id="editPositionName"
                    class="swal2-input"
                    value="${escapeAttribute(position.name)}"
                >

                <textarea
                    id="editPositionDescription"
                    class="swal2-textarea"
                >${escapeHTML(position.description)}</textarea>

                <input
                    id="editMaxWinners"
                    class="swal2-input"
                    type="number"
                    min="1"
                    value="${position.maxWinners}"
                >

            `,

            showCancelButton: true,

            confirmButtonText:
                "Save Changes",

            confirmButtonColor:
                "#1746a2",

            preConfirm: () => {

                const name =
                    document.getElementById(
                        "editPositionName"
                    ).value.trim();


                const description =
                    document.getElementById(
                        "editPositionDescription"
                    ).value.trim();


                const maxWinners =
                    Number(
                        document.getElementById(
                            "editMaxWinners"
                        ).value
                    );


                if (
                    !name ||
                    !description ||
                    !maxWinners ||
                    maxWinners < 1
                ) {

                    Swal.showValidationMessage(
                        "Please complete all fields correctly."
                    );

                    return false;

                }


                return {
                    name,
                    description,
                    maxWinners
                };

            }

        }).then(result => {

            if (!result.isConfirmed) return;


            const oldName =
                position.name;


            Object.assign(
                position,
                result.value
            );


            /*
             * Update existing candidates
             * that used the old position name.
             */

            const candidates =
                JSON.parse(
                    localStorage.getItem(
                        "univoteCandidates"
                    )
                ) || [];


            candidates.forEach(candidate => {

                if (
                    candidate.position ===
                    oldName &&

                    candidate.electionId ===
                    position.electionId
                ) {

                    candidate.position =
                        position.name;

                }

            });


            localStorage.setItem(
                "univoteCandidates",
                JSON.stringify(candidates)
            );


            savePositions();

            renderPositions(positions);

            updateStats();


            Swal.fire({

                icon: "success",

                title:
                    "Position Updated",

                confirmButtonColor:
                    "#1746a2"

            });

        });

    }


    // ======================================
    // DELETE
    // ======================================

    function deletePosition(id) {

        const position =
            positions.find(
                item => item.id === id
            );


        if (!position) return;


        const candidateCount =
            getCandidateCount(position);


        Swal.fire({

            title:
                "Delete Position?",

            text:
                candidateCount > 0

                    ? `This position currently has ${candidateCount} candidate(s).`

                    : "This position will be removed.",

            icon:
                "warning",

            showCancelButton:
                true,

            confirmButtonText:
                "Yes, Delete",

            cancelButtonText:
                "Cancel",

            confirmButtonColor:
                "#dc2626",

            cancelButtonColor:
                "#6b7280"

        }).then(result => {

            if (!result.isConfirmed) return;


            positions =
                positions.filter(
                    item =>
                        item.id !== id
                );


            savePositions();

            renderPositions(positions);

            updateStats();


            Swal.fire({

                icon:
                    "success",

                title:
                    "Position Deleted",

                confirmButtonColor:
                    "#1746a2"

            });

        });

    }


    // ======================================
    // EVENTS
    // ======================================

    function attachEvents() {

        document
            .querySelectorAll(".edit-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        editPosition(
                            Number(
                                button.dataset.id
                            )
                        );

                    }
                );

            });


        document
            .querySelectorAll(".delete-btn")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deletePosition(
                            Number(
                                button.dataset.id
                            )
                        );

                    }
                );

            });

    }


    // ======================================
    // FILTER OPTIONS
    // ======================================

    function populateElectionFilter() {

        electionFilter.innerHTML = `

            <option value="all">
                All Elections
            </option>

        `;


        elections.forEach(election => {

            electionFilter.innerHTML += `

                <option value="${election.id}">
                    ${escapeHTML(election.name)}
                </option>

            `;

        });

    }


    // ======================================
    // STATS
    // ======================================

    function updateStats() {

        const candidates =
            JSON.parse(
                localStorage.getItem(
                    "univoteCandidates"
                )
            ) || [];


        document.getElementById(
            "totalPositions"
        ).textContent =
            positions.length;


        document.getElementById(
            "electionPositions"
        ).textContent =
            new Set(
                positions.map(
                    position =>
                        position.electionId
                )
            ).size;


        document.getElementById(
            "assignedCandidates"
        ).textContent =
            candidates.length;


        const topPosition =
            positions.length
                ? positions[0].name
                : "—";


        document.getElementById(
            "topPosition"
        ).textContent =
            topPosition;

    }


    // ======================================
    // SAVE
    // ======================================

    function savePositions() {

        localStorage.setItem(
            "univotePositions",
            JSON.stringify(positions)
        );

    }


    // ======================================
    // LOGOUT
    // ======================================

    logoutBtn.addEventListener(
        "click",
        () => {

            Swal.fire({

                title: "Logout?",

                text:
                    "Are you sure you want to leave the admin panel?",

                icon: "question",

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

            }).then(result => {

                if (result.isConfirmed) {

                    sessionStorage.removeItem(
                        "adminLoggedIn"
                    );

                    sessionStorage.removeItem(
                        "adminUsername"
                    );

                    window.location.href =
                        "admin-login.html";

                }

            });

        }
    );


    // ======================================
    // SECURITY HELPERS
    // ======================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }

});