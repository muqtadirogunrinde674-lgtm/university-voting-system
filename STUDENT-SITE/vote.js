document.addEventListener("DOMContentLoaded", async () => {

    if (sessionStorage.getItem("studentLoggedIn") !== "true") {
        window.location.href = "student-login.html";
        return;
    }

    const API_BASE_URL =
        "https://university-voting-system-p4sn.onrender.com";

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


    const activeElectionId =
        localStorage.getItem("activeElectionId");


    if (!activeElectionId) {

        window.location.href =
            "election.html";

        return;
    }


    let elections = [];

    let candidates = [];


    try {

        const electionResponse =
            await fetch(
                `${API_BASE_URL}/api/students/elections`
            );


        const electionData =
            await electionResponse.json();


        if (
            !electionResponse.ok ||
            !electionData.success
        ) {

            throw new Error(
                electionData.message ||
                "Unable to load election."
            );

        }


        elections =
            Array.isArray(electionData.elections)
                ? electionData.elections
                : [];


    } catch (error) {

        console.error(
            "Election loading error:",
            error
        );


        await Swal.fire({

            icon: "error",

            title:
                "Unable to Load Election",

            text:
                error.message ||
                "Could not connect to the voting server.",

            confirmButtonColor:
                "#2563eb"

        });


        window.location.href =
            "election.html";

        return;
    }


    const election =
        elections.find(
            item =>
                String(item.id) ===
                String(activeElectionId)
        );


    if (!election) {

        await Swal.fire({

            icon: "error",

            title:
                "Election Not Found",

            text:
                "This election could not be found or is no longer available.",

            confirmButtonColor:
                "#2563eb"

        });


        window.location.href =
            "election.html";

        return;
    }


    const startValue =
        election.startDate ||
        election.start_date;


    const endValue =
        election.endDate ||
        election.end_date;


    const now =
        new Date();

    const start =
        new Date(startValue);

    const end =
        new Date(endValue);


    if (
        isNaN(start.getTime()) ||
        isNaN(end.getTime())
    ) {

        await Swal.fire({

            icon: "error",

            title:
                "Invalid Election Time",

            text:
                "The voting period for this election is invalid.",

            confirmButtonColor:
                "#2563eb"

        });


        window.location.href =
            "election.html";

        return;
    }


    if (now < start) {

        await Swal.fire({

            icon: "info",

            title:
                "Election Has Not Started",

            text:
                `Voting starts on ${formatDateTime(start)}.`,

            confirmButtonColor:
                "#2563eb"

        });


        window.location.href =
            "election.html";

        return;
    }


    if (now > end) {

        await Swal.fire({

            icon: "warning",

            title:
                "Election Expired",

            text:
                "Voting for this election has ended.",

            confirmButtonColor:
                "#2563eb"

        });


        window.location.href =
            "election.html";

        return;
    }


    electionTitle.textContent =
        election.name ||
        "Election";


    electionDescription.textContent =
        election.description ||
        `Voting closes at ${formatDateTime(end)}.`;


    try {

        const candidateResponse =
            await fetch(
                `${API_BASE_URL}/api/students/elections/${encodeURIComponent(
                    election.id
                )}/candidates`
            );


        const candidateData =
            await candidateResponse.json();


        if (
            !candidateResponse.ok ||
            !candidateData.success
        ) {

            throw new Error(
                candidateData.message ||
                "Unable to load candidates."
            );

        }


        candidates =
            Array.isArray(candidateData.candidates)
                ? candidateData.candidates
                : [];


    } catch (error) {

        console.error(
            "Candidate loading error:",
            error
        );


        await Swal.fire({

            icon: "error",

            title:
                "Unable to Load Candidates",

            text:
                error.message ||
                "Could not load candidates for this election.",

            confirmButtonColor:
                "#2563eb"

        });


        return;
    }


    const electionCandidates =
        candidates.filter(
            candidate => {

                const candidateElectionId =
                    candidate.electionId ||
                    candidate.election_id;

                return String(
                    candidateElectionId
                ) === String(election.id);

            }
        );


    if (
        electionCandidates.length === 0
    ) {

        emptyState.style.display =
            "block";

        continueBtn.disabled =
            true;

        return;
    }


    let selections = {};


    try {

        selections =
            JSON.parse(
                localStorage.getItem(
                    "univoteSelections"
                )
            ) || {};

    } catch {

        selections = {};

    }


    if (Array.isArray(selections)) {

        const converted = {};

        selections.forEach(item => {

            if (!item) {
                return;
            }

            const position =
                item.position ||
                item.post ||
                item.positionName ||
                "General";


            converted[
                `${item.electionId || election.id}-${position}`
            ] = item;

        });


        selections =
            converted;

    }


    const positions = {};


    electionCandidates.forEach(
        candidate => {

            const position =
                candidate.position ||
                candidate.post ||
                candidate.positionName ||
                candidate.office ||
                "General Election";


            if (!positions[position]) {

                positions[position] = [];

            }


            positions[position].push(
                candidate
            );

        }
    );


    Object.keys(positions).forEach(
        position => {

            const positionCard =
                document.createElement(
                    "div"
                );


            positionCard.className =
                "position-card";


            const header =
                document.createElement(
                    "div"
                );


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
                document.createElement(
                    "div"
                );


            candidateList.className =
                "candidate-list";


            positions[position].forEach(
                candidate => {

                    const candidateId =
                        candidate.id ||
                        candidate.candidateId ||
                        candidate._id;


                    const selectionKey =
                        `${election.id}-${position}`;


                    const existingSelection =
                        selections[
                            selectionKey
                        ];


                    const candidateCard =
                        document.createElement(
                            "div"
                        );


                    candidateCard.className =
                        "candidate-card";


                    if (
                        existingSelection &&
                        String(
                            existingSelection.candidateId
                        ) ===
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
                                ${escapeHTML(
                                    candidateName
                                )}
                            </h3>

                            ${
                                department
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                department
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                        </div>

                    `;


                    candidateCard.addEventListener(
                        "click",
                        () => {

                            selections[
                                selectionKey
                            ] = {

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


                            candidateList
                                .querySelectorAll(
                                    ".candidate-card"
                                )
                                .forEach(
                                    card => {

                                        card.classList.remove(
                                            "selected"
                                        );

                                    }
                                );


                            candidateCard.classList.add(
                                "selected"
                            );


                            updateCount();

                        }
                    );


                    candidateList.appendChild(
                        candidateCard
                    );

                }
            );


            positionCard.appendChild(
                header
            );


            positionCard.appendChild(
                candidateList
            );


            positionsContainer.appendChild(
                positionCard
            );

        }
    );


    updateCount();


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


            window.location.href =
                "election.html";

        }
    );


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


    function formatDateTime(date) {

        return new Date(date).toLocaleString(
            "en-NG",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );

    }


    function escapeHTML(value) {

        return String(value ?? "")
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