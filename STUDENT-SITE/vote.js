document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       LOGIN CHECK
    ========================= */

    if (
        sessionStorage.getItem("studentLoggedIn") !== "true"
    ) {
        window.location.href = "student-login.html";
        return;
    }


    /* =========================
       ELEMENTS
    ========================= */

    const electionTitle =
        document.getElementById("electionTitle");

    const electionDescription =
        document.getElementById("electionDescription");

    const positionsContainer =
        document.getElementById("positionsContainer");

    const emptyState =
        document.getElementById("emptyState");

    const selectedCount =
        document.getElementById("selectedCount");

    const continueBtn =
        document.getElementById("continueBtn");

    const backElectionBtn =
        document.getElementById("backElectionBtn");

    const emptyBackBtn =
        document.getElementById("emptyBackBtn");


    /* =========================
       GET ACTIVE ELECTION
    ========================= */

    const activeElectionId =
        localStorage.getItem("activeElectionId");


    if (!activeElectionId) {

        window.location.href =
            "election.html";

        return;
    }


    /* =========================
       LOAD DATA
    ========================= */

    const elections =
        JSON.parse(
            localStorage.getItem("univoteElections")
        ) || [];

    const candidates =
        JSON.parse(
            localStorage.getItem("univoteCandidates")
        ) || [];


    const election =
        elections.find(
            item =>
                String(item.id) ===
                String(activeElectionId)
        );


    if (!election) {

        Swal.fire({
            icon: "error",
            title: "Election Not Found",
            text: "This election could not be found.",
            confirmButtonColor: "#2563eb"
        }).then(() => {

            window.location.href =
                "election.html";

        });

        return;
    }


    /* =========================
       DISPLAY ELECTION
    ========================= */

    electionTitle.textContent =
        election.name || "Election";

    electionDescription.textContent =
        election.description ||
        "Select your preferred candidate.";


    /* =========================
       GET CANDIDATES
    ========================= */

    const electionCandidates =
        candidates.filter(
            candidate =>
                String(candidate.electionId) ===
                String(election.id)
        );


    if (electionCandidates.length === 0) {

        emptyState.style.display =
            "block";

        continueBtn.disabled = true;

        return;
    }


    /* =========================
       LOAD EXISTING SELECTIONS
    ========================= */

    let selections =
        JSON.parse(
            localStorage.getItem("univoteSelections")
        ) || {};


    /*
     * Older versions may have stored an array.
     * Convert it safely if necessary.
     */

    if (Array.isArray(selections)) {

        const converted = {};

        selections.forEach(item => {

            if (!item) return;

            const position =
                item.position ||
                item.post ||
                item.positionName ||
                "General";

            converted[
                `${item.electionId || election.id}-${position}`
            ] = item;

        });

        selections = converted;

    }


    /* =========================
       GROUP CANDIDATES BY POSITION
    ========================= */

    const positions = {};


    electionCandidates.forEach(candidate => {

        const position =
            candidate.position ||
            candidate.post ||
            candidate.positionName ||
            candidate.office ||
            "General Election";


        if (!positions[position]) {
            positions[position] = [];
        }


        positions[position].push(candidate);

    });


    /* =========================
       RENDER POSITIONS
    ========================= */

    Object.keys(positions).forEach(position => {

        const positionCard =
            document.createElement("div");

        positionCard.className =
            "position-card";


        const header =
            document.createElement("div");

        header.className =
            "position-header";


        header.innerHTML = `

            <h2>
                ${escapeHTML(position)}
            </h2>

            <p>
                Choose one candidate
            </p>

        `;


        const candidateList =
            document.createElement("div");

        candidateList.className =
            "candidate-list";


        positions[position].forEach(candidate => {

            const candidateId =
                candidate.id ||
                candidate.candidateId ||
                candidate._id;


            const selectionKey =
                `${election.id}-${position}`;


            const existingSelection =
                selections[selectionKey];


            const candidateCard =
                document.createElement("div");

            candidateCard.className =
                "candidate-card";


            if (
                existingSelection &&
                String(existingSelection.candidateId) ===
                String(candidateId)
            ) {

                candidateCard.classList.add(
                    "selected"
                );

            }


            const candidateName =
                candidate.name ||
                candidate.candidateName ||
                "Unnamed Candidate";


            const department =
                candidate.department ||
                candidate.faculty ||
                "";


            candidateCard.innerHTML = `

                <div class="radio"></div>

                <div class="candidate-info">

                    <h3>
                        ${escapeHTML(candidateName)}
                    </h3>

                    ${
                        department
                        ? `
                            <p>
                                ${escapeHTML(department)}
                            </p>
                          `
                        : ""
                    }

                </div>

            `;


            candidateCard.addEventListener(
                "click",
                () => {

                    selections[selectionKey] = {

                        electionId:
                            election.id,

                        electionName:
                            election.name ||
                            "Election",

                        position:
                            position,

                        candidateId:
                            candidateId,

                        candidateName:
                            candidateName,

                        department:
                            department,

                        level:
                            candidate.level ||
                            ""

                    };


                    localStorage.setItem(
                        "univoteSelections",
                        JSON.stringify(
                            selections
                        )
                    );


                    /*
                     * Refresh the cards in this position.
                     */

                    candidateList
                        .querySelectorAll(
                            ".candidate-card"
                        )
                        .forEach(card => {

                            card.classList.remove(
                                "selected"
                            );

                        });


                    candidateCard.classList.add(
                        "selected"
                    );


                    updateCount();

                }
            );


            candidateList.appendChild(
                candidateCard
            );

        });


        positionCard.appendChild(
            header
        );

        positionCard.appendChild(
            candidateList
        );

        positionsContainer.appendChild(
            positionCard
        );

    });


    updateCount();


    /* =========================
       UPDATE COUNT
    ========================= */

    function updateCount() {

        const electionSelections =
            Object.values(
                selections
            ).filter(
                selection =>
                    String(
                        selection.electionId
                    ) ===
                    String(
                        election.id
                    )
            );


        selectedCount.textContent =
            electionSelections.length;

    }


    /* =========================
       CONTINUE VOTING
    ========================= */

    continueBtn.addEventListener(
        "click",
        () => {

            const electionSelections =
                Object.values(
                    selections
                ).filter(
                    selection =>
                        String(
                            selection.electionId
                        ) ===
                        String(
                            election.id
                        )
                );


            if (
                electionSelections.length === 0
            ) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "No Candidate Selected",

                    text:
                        "Please select at least one candidate before continuing.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;
            }


            /*
             * Return to the election list.
             * The selections remain saved.
             */

            window.location.href =
                "election.html";

        }
    );


    /* =========================
       BACK TO ELECTIONS
    ========================= */

    backElectionBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "election.html";

        }
    );


    emptyBackBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "election.html";

        }
    );


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});