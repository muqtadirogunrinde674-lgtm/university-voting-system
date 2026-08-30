document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL =
        "https://university-voting-system-p4sn.onrender.com";

    const form =
        document.getElementById("electionForm");

    const electionName =
        document.getElementById("electionName");

    const startDate =
        document.getElementById("startDate");

    const endDate =
        document.getElementById("endDate");

    const electionList =
        document.getElementById("electionList");

    const emptyState =
        document.getElementById("emptyState");

    const electionCount =
        document.getElementById("electionCount");

    const backBtn =
        document.getElementById("backBtn");

    let elections = [];


    /* =====================================================
       LOAD ELECTIONS FROM BACKEND
    ===================================================== */

    async function loadElections() {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/admin/elections`
                );

            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load elections."
                );

            }


            elections =
                Array.isArray(data.elections)
                    ? data.elections
                    : [];


            renderElections();


        } catch (error) {

            console.error(
                "Load elections error:",
                error
            );


            Swal.fire({

                icon: "error",

                title:
                    "Unable to Load Elections",

                text:
                    "Could not connect to the voting server.",

                confirmButtonColor:
                    "#2563eb"

            });

        }

    }


    /* =====================================================
       CREATE ELECTION
    ===================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                electionName.value.trim();

            const start =
                startDate.value;

            const end =
                endDate.value;


            if (!name) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "Election Name Required",

                    text:
                        "Please enter an election name.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            if (!start || !end) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "Dates Required",

                    text:
                        "Please select the start and end dates.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            if (
                new Date(end) <
                new Date(start)
            ) {

                Swal.fire({

                    icon: "error",

                    title:
                        "Invalid Dates",

                    text:
                        "The end date cannot be before the start date.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            const duplicate =
                elections.some(
                    election =>
                        String(
                            election.name || ""
                        ).toLowerCase() ===
                        name.toLowerCase()
                );


            if (duplicate) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "Election Already Exists",

                    text:
                        "An election with this name already exists.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/elections`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    startDate:
                                        start,

                                    endDate:
                                        end

                                })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to create election."
                    );

                }


                form.reset();


                await loadElections();


                Swal.fire({

                    icon: "success",

                    title:
                        "Election Created Successfully! 🎉",

                    text:
                        `${name} has been added to the system.`,

                    confirmButtonColor:
                        "#2563eb"

                });


            } catch (error) {

                console.error(
                    "Create election error:",
                    error
                );


                Swal.fire({

                    icon: "error",

                    title:
                        "Election Creation Failed",

                    text:
                        error.message ||
                        "Unable to create election.",

                    confirmButtonColor:
                        "#2563eb"

                });

            }

        }
    );


    /* =====================================================
       RENDER ELECTIONS
    ===================================================== */

    function renderElections() {

        electionList.innerHTML = "";

        electionCount.textContent =
            elections.length;


        if (elections.length === 0) {

            emptyState.style.display =
                "block";

            return;

        }


        emptyState.style.display =
            "none";


        elections
            .slice()
            .reverse()
            .forEach(
                election => {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "election-card";


                    const status =
                        getElectionStatus(
                            election.startDate ||
                            election.start_date,

                            election.endDate ||
                            election.end_date
                        );


                    card.innerHTML = `

                        <div class="election-info">

                            <h3>
                                ${escapeHTML(
                                    election.name
                                )}
                            </h3>

                            <p>
                                ${formatDate(
                                    election.startDate ||
                                    election.start_date
                                )}

                                —

                                ${formatDate(
                                    election.endDate ||
                                    election.end_date
                                )}
                            </p>

                        </div>


                        <div class="election-actions">

                            <span
                                class="election-status ${status.className}"
                            >
                                ${status.text}
                            </span>


                            <button
                                type="button"
                                class="delete-btn"
                                data-id="${escapeHTML(
                                    election.id
                                )}"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    `;


                    electionList.appendChild(
                        card
                    );

                }
            );

    }


    /* =====================================================
       DELETE ELECTION
    ===================================================== */

    electionList.addEventListener(
        "click",
        event => {

            const deleteButton =
                event.target.closest(
                    ".delete-btn"
                );


            if (!deleteButton) {
                return;
            }


            const electionId =
                deleteButton.dataset.id;


            const election =
                elections.find(
                    item =>
                        String(item.id) ===
                        String(electionId)
                );


            if (!election) {

                Swal.fire({

                    icon: "error",

                    title:
                        "Election Not Found",

                    text:
                        "This election could not be found.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            Swal.fire({

                icon: "warning",

                title:
                    "Delete Election?",

                html:
                    `
                    <p style="font-size:13px;margin-bottom:8px;">
                        You are about to delete:
                    </p>

                    <strong style="font-size:16px;">
                        ${escapeHTML(
                            election.name
                        )}
                    </strong>

                    <p style="font-size:11px;color:#777;margin-top:12px;">
                        This election will be permanently removed.
                    </p>
                    `,

                showCancelButton:
                    true,

                confirmButtonText:
                    "Yes, Delete",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#dc2626",

                cancelButtonColor:
                    "#6b7280",

                reverseButtons:
                    true

            }).then(
                async result => {

                    if (
                        !result.isConfirmed
                    ) {
                        return;
                    }


                    try {

                        const response =
                            await fetch(

                                `${API_BASE_URL}/api/admin/elections/${encodeURIComponent(
                                    electionId
                                )}`,

                                {

                                    method:
                                        "DELETE"

                                }

                            );


                        const data =
                            await response.json();


                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Unable to delete election."
                            );

                        }


                        await loadElections();


                        Swal.fire({

                            icon: "success",

                            title:
                                "Election Deleted",

                            text:
                                "The election has been deleted successfully.",

                            timer:
                                1500,

                            showConfirmButton:
                                false

                        });


                    } catch (error) {

                        console.error(
                            "Delete election error:",
                            error
                        );


                        Swal.fire({

                            icon: "error",

                            title:
                                "Delete Failed",

                            text:
                                error.message ||
                                "Unable to delete election.",

                            confirmButtonColor:
                                "#2563eb"

                        });

                    }

                }
            );

        }
    );


    /* =====================================================
       ELECTION STATUS
    ===================================================== */

    function getElectionStatus(
        start,
        end
    ) {

        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const startDate =
            new Date(start);

        const endDate =
            new Date(end);


        startDate.setHours(
            0,
            0,
            0,
            0
        );


        endDate.setHours(
            23,
            59,
            59,
            999
        );


        if (
            today < startDate
        ) {

            return {

                text:
                    "UPCOMING",

                className:
                    "status-upcoming"

            };

        }


        if (
            today >= startDate &&
            today <= endDate
        ) {

            return {

                text:
                    "ACTIVE",

                className:
                    "status-active"

            };

        }


        return {

            text:
                "ENDED",

            className:
                "status-ended"

        };

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDate(date) {

        if (!date) {
            return "";
        }


        const parts =
            String(date).split("-");


        if (
            parts.length !== 3
        ) {

            return date;

        }


        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(
            value || ""
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
       BACK TO DASHBOARD
    ===================================================== */

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-dashboard.html";

            }
        );

    }


    /* =====================================================
       START
    ===================================================== */

    loadElections();

});