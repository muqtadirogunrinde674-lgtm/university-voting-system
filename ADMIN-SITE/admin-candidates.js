document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       ADMIN LOGIN CHECK
    =============================== */

    if (
        sessionStorage.getItem("adminLoggedIn") !== "true"
    ) {
        window.location.href = "admin-login.html";
        return;
    }


    /* ===============================
       ELEMENTS
    =============================== */

    const form =
        document.getElementById("candidateForm");

    const electionSelect =
        document.getElementById("candidateElection");

    const positionInput =
        document.getElementById("candidatePosition");

    const candidateInputs =
        document.getElementById("candidateInputs");

    const addCandidateBtn =
        document.getElementById("addCandidateBtn");

    const candidateCount =
        document.getElementById("candidateCount");

    const candidateList =
        document.getElementById("candidateList");

    const emptyState =
        document.getElementById("emptyState");

    const logoutBtn =
        document.getElementById("logoutBtn");


    /* ===============================
       LOAD DATA
    =============================== */

    let elections =
        JSON.parse(
            localStorage.getItem("univoteElections")
        ) || [];


    let candidates =
        JSON.parse(
            localStorage.getItem("univoteCandidates")
        ) || [];


    /* ===============================
       LOAD ELECTIONS
    =============================== */

    function loadElections() {

        electionSelect.innerHTML = `
            <option value="">
                Select Election
            </option>
        `;


        elections.forEach(election => {

            const option =
                document.createElement("option");

            option.value =
                election.id;

            option.textContent =
                `${election.personName || election.name || "Election"} — ${election.level || ""} — ${election.department || ""}`;

            electionSelect.appendChild(option);

        });

    }


    /* ===============================
       ADD FIRST CANDIDATE
    =============================== */

    addCandidateRow();


    /* ===============================
       ADD CANDIDATE BUTTON
    =============================== */

    addCandidateBtn.addEventListener(
        "click",
        () => {

            addCandidateRow();

        }
    );


    /* ===============================
       CREATE CANDIDATE ROW
    =============================== */

    function addCandidateRow() {

        const row =
            document.createElement("div");

        row.className =
            "candidate-row";


        row.innerHTML = `

            <div class="candidate-number">
                Candidate
            </div>

            <button
                type="button"
                class="remove-candidate"
                title="Remove candidate"
            >
                ×
            </button>


            <div class="candidate-fields">

                <div class="candidate-field">

                    <label>
                        Candidate Name
                    </label>

                    <input
                        type="text"
                        class="candidate-name"
                        placeholder="Full name"
                        required
                    >

                </div>


                <div class="candidate-field">

                    <label>
                        Level
                    </label>

                    <input
                        type="text"
                        class="candidate-level"
                        placeholder="e.g. 300 Level"
                        required
                    >

                </div>


                <div class="candidate-field">

                    <label>
                        Department
                    </label>

                    <input
                        type="text"
                        class="candidate-department"
                        placeholder="Department"
                        required
                    >

                </div>

            </div>


            <div class="candidate-field photo-field">

                <label>
                    Candidate Photo (Optional)
                </label>

                <input
                    type="file"
                    class="candidate-photo"
                    accept="image/*"
                >

            </div>

        `;


        candidateInputs.appendChild(row);


        updateCandidateNumbers();

    }


    /* ===============================
       REMOVE CANDIDATE
    =============================== */

    candidateInputs.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "remove-candidate"
                )
            ) {

                const rows =
                    candidateInputs.querySelectorAll(
                        ".candidate-row"
                    );


                /* Keep at least one row */

                if (rows.length === 1) {

                    Swal.fire({

                        icon: "info",

                        title: "At Least One Candidate",

                        text:
                            "You need at least one candidate.",

                        confirmButtonColor:
                            "#2563eb"

                    });

                    return;
                }


                event.target
                    .closest(".candidate-row")
                    .remove();


                updateCandidateNumbers();

            }

        }
    );


    /* ===============================
       UPDATE NUMBERS
    =============================== */

    function updateCandidateNumbers() {

        const rows =
            candidateInputs.querySelectorAll(
                ".candidate-row"
            );


        rows.forEach(
            (row, index) => {

                row.querySelector(
                    ".candidate-number"
                ).textContent =
                    `Candidate ${index + 1}`;

            }
        );


        const count =
            rows.length;


        candidateCount.textContent =
            `${count} Candidate${count === 1 ? "" : "s"}`;

    }


    /* ===============================
       SAVE ALL CANDIDATES
    =============================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const electionId =
                electionSelect.value;


            const position =
                positionInput.value.trim();


            if (
                !electionId ||
                !position
            ) {

                Swal.fire({

                    icon: "warning",

                    title: "Incomplete Information",

                    text:
                        "Please select an election and enter the position.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            const rows =
                candidateInputs.querySelectorAll(
                    ".candidate-row"
                );


            const newCandidates = [];


            /* ===============================
               COLLECT CANDIDATES
            =============================== */

            for (
                const row of rows
            ) {

                const name =
                    row.querySelector(
                        ".candidate-name"
                    ).value.trim();


                const level =
                    row.querySelector(
                        ".candidate-level"
                    ).value.trim();


                const department =
                    row.querySelector(
                        ".candidate-department"
                    ).value.trim();


                const photoInput =
                    row.querySelector(
                        ".candidate-photo"
                    );


                if (
                    !name ||
                    !level ||
                    !department
                ) {

                    Swal.fire({

                        icon: "warning",

                        title:
                            "Incomplete Candidate",

                        text:
                            "Please complete every candidate's name, level and department.",

                        confirmButtonColor:
                            "#2563eb"

                    });

                    return;

                }


                let photo = "";


                if (
                    photoInput.files &&
                    photoInput.files[0]
                ) {

                    photo =
                        await readFile(
                            photoInput.files[0]
                        );

                }


                const election =
                    elections.find(
                        item =>
                            String(item.id) ===
                            String(electionId)
                    );


                newCandidates.push({

                    id:
                        "CAN-" +
                        Date.now() +
                        "-" +
                        Math.random()
                            .toString(36)
                            .substring(2, 8),

                    name:
                        name,

                    candidateName:
                        name,

                    level:
                        level,

                    department:
                        department,

                    electionId:
                        electionId,

                    electionName:
                        election
                            ? (
                                election.personName ||
                                election.name ||
                                "Election"
                            )
                            : "",

                    position:
                        position,

                    positionName:
                        position,

                    photo:
                        photo

                });

            }


            /* ===============================
               SAVE
            =============================== */

            candidates.push(
                ...newCandidates
            );


            localStorage.setItem(
                "univoteCandidates",
                JSON.stringify(candidates)
            );


            /* RESET */

            form.reset();

            candidateInputs.innerHTML = "";

            addCandidateRow();


            renderCandidates();


            /* SUCCESS */

            Swal.fire({

                icon: "success",

                title:
                    "Candidates Added! 🎉",

                html:
                    `<strong>${newCandidates.length}</strong> candidate${newCandidates.length === 1 ? "" : "s"} added for <strong>${escapeHTML(position)}</strong>.`,

                confirmButtonColor:
                    "#2563eb"

            });

        }
    );


    /* ===============================
       READ IMAGE
    =============================== */

    function readFile(file) {

        return new Promise(
            resolve => {

                const reader =
                    new FileReader();


                reader.onload =
                    () => resolve(
                        reader.result
                    );


                reader.onerror =
                    () => resolve("");


                reader.readAsDataURL(file);

            }
        );

    }


    /* ===============================
       DISPLAY CANDIDATES
    =============================== */

    function renderCandidates() {

        candidateList.innerHTML = "";


        if (
            candidates.length === 0
        ) {

            emptyState.style.display =
                "block";

            return;

        }


        emptyState.style.display =
            "none";


        /* ===============================
           GROUP BY ELECTION + POSITION
        =============================== */

        const groups = {};


        candidates.forEach(
            candidate => {

                const electionId =
                    candidate.electionId || "unknown";


                const position =
                    candidate.position ||
                    candidate.positionName ||
                    "Unknown Position";


                const groupKey =
                    `${electionId}__${position}`;


                if (
                    !groups[groupKey]
                ) {

                    groups[groupKey] = {

                        electionName:
                            candidate.electionName ||
                            "Election",

                        position:
                            position,

                        candidates: []

                    };

                }


                groups[groupKey]
                    .candidates
                    .push(candidate);

            }
        );


        Object.values(groups)
            .reverse()
            .forEach(
                group => {

                    const groupElement =
                        document.createElement(
                            "div"
                        );


                    groupElement.className =
                        "candidate-group";


                    groupElement.innerHTML = `

                        <div class="group-header">

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        group.position
                                    )}
                                </h3>

                                <div class="group-election">
                                    ${escapeHTML(
                                        group.electionName
                                    )}
                                </div>

                            </div>

                            <span class="group-count">
                                ${group.candidates.length}
                                Candidate${group.candidates.length === 1 ? "" : "s"}
                            </span>

                        </div>


                        <div class="group-candidates"></div>

                    `;


                    const candidatesContainer =
                        groupElement.querySelector(
                            ".group-candidates"
                        );


                    group.candidates.forEach(
                        candidate => {

                            const item =
                                document.createElement(
                                    "div"
                                );


                            item.className =
                                "registered-candidate";


                            const photo =
                                candidate.photo
                                    ? `
                                        <img
                                            src="${candidate.photo}"
                                            class="registered-photo"
                                            alt="Candidate"
                                        >
                                      `
                                    : `
                                        <div class="registered-photo">
                                            👤
                                        </div>
                                      `;


                            item.innerHTML = `

                                ${photo}

                                <div class="registered-info">

                                    <h4>
                                        ${escapeHTML(
                                            candidate.name ||
                                            candidate.candidateName
                                        )}
                                    </h4>

                                    <p>
                                        ${escapeHTML(
                                            candidate.level
                                        )}
                                        •
                                        ${escapeHTML(
                                            candidate.department
                                        )}
                                    </p>

                                </div>


                                <button
                                    class="delete-btn"
                                    data-id="${candidate.id}"
                                >
                                    Delete
                                </button>

                            `;


                            candidatesContainer
                                .appendChild(item);

                        }
                    );


                    candidateList.appendChild(
                        groupElement
                    );

                }
            );

    }


    /* ===============================
       DELETE CANDIDATE
    =============================== */

    candidateList.addEventListener(
        "click",
        event => {

            if (
                !event.target.classList.contains(
                    "delete-btn"
                )
            ) {
                return;
            }


            const id =
                event.target.dataset.id;


            Swal.fire({

                title:
                    "Delete Candidate?",

                text:
                    "This candidate will be removed from the election.",

                icon:
                    "warning",

                showCancelButton:
                    true,

                confirmButtonText:
                    "Delete",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#dc2626"

            }).then(
                result => {

                    if (
                        result.isConfirmed
                    ) {

                        candidates =
                            candidates.filter(
                                candidate =>
                                    String(
                                        candidate.id
                                    ) !==
                                    String(id)
                            );


                        localStorage.setItem(
                            "univoteCandidates",
                            JSON.stringify(
                                candidates
                            )
                        );


                        renderCandidates();


                        Swal.fire({

                            icon:
                                "success",

                            title:
                                "Deleted",

                            text:
                                "Candidate removed successfully.",

                            timer:
                                1400,

                            showConfirmButton:
                                false

                        });

                    }

                }
            );

        }
    );


    /* ===============================
       LOGOUT
    =============================== */

    logoutBtn.addEventListener(
        "click",
        () => {

            Swal.fire({

                title:
                    "Logout?",

                text:
                    "Are you sure you want to logout?",

                icon:
                    "question",

                showCancelButton:
                    true,

                confirmButtonText:
                    "Logout",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#dc2626"

            }).then(
                result => {

                    if (
                        result.isConfirmed
                    ) {

                        sessionStorage.clear();

                        window.location.href =
                            "admin-login.html";

                    }

                }
            );

        }
    );


    /* ===============================
       ESCAPE HTML
    =============================== */

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


    /* ===============================
       INITIALIZE
    =============================== */

    loadElections();

    renderCandidates();

});