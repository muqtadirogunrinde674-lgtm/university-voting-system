document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL =
        "https://university-voting-system-p4sn.onrender.com";

    const form =
        document.getElementById("electionForm");

    const electionName =
        document.getElementById("electionName");

    const startDate =
        document.getElementById("startDate");

    const startTime =
        document.getElementById("startTime");

    const endDate =
        document.getElementById("endDate");

    const endTime =
        document.getElementById("endTime");

    const electionList =
        document.getElementById("electionList");

    const emptyState =
        document.getElementById("emptyState");

    const electionCount =
        document.getElementById("electionCount");

    const backBtn =
        document.getElementById("backBtn");

    let elections = [];


    /* =========================
       LOAD ELECTIONS
    ========================= */

    async function loadElections() {

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/admin/elections`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to load elections."
                );
            }

            elections = Array.isArray(data.elections)
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
                title: "Unable to Load Elections",
                text:
                    error.message ||
                    "Could not connect to the voting server.",
                confirmButtonColor: "#2563eb"
            });

        }

    }


    /* =========================
       CREATE ELECTION
    ========================= */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                electionName.value.trim();

            const start =
                startDate.value;

            const startClock =
                startTime.value;

            const end =
                endDate.value;

            const endClock =
                endTime.value;


            /* =========================
               REQUIRED FIELDS
            ========================= */

            if (
                !name ||
                !start ||
                !startClock ||
                !end ||
                !endClock
            ) {

                Swal.fire({
                    icon: "warning",
                    title: "Missing Information",
                    text:
                        "Election name, start date, start time, end date and end time are required.",
                    confirmButtonColor: "#2563eb"
                });

                return;
            }


            /* =========================
               BUILD FULL DATETIME
            ========================= */

            const startDateTime =
                new Date(
                    `${start}T${startClock}`
                );

            const endDateTime =
                new Date(
                    `${end}T${endClock}`
                );


            if (
                isNaN(startDateTime.getTime()) ||
                isNaN(endDateTime.getTime())
            ) {

                Swal.fire({
                    icon: "error",
                    title: "Invalid Date or Time",
                    text:
                        "Please enter valid start and end dates and times.",
                    confirmButtonColor: "#2563eb"
                });

                return;
            }


            /* =========================
               CHECK END
            ========================= */

            if (endDateTime <= startDateTime) {

                Swal.fire({
                    icon: "error",
                    title: "Invalid Election Time",
                    text:
                        "The end date and time must be after the start date and time.",
                    confirmButtonColor: "#2563eb"
                });

                return;
            }


            /* =========================
               DUPLICATE CHECK
            ========================= */

            const duplicate =
                elections.some((election) => {

                    return String(
                        election.name || ""
                    )
                        .trim()
                        .toLowerCase() ===
                        name.toLowerCase();

                });


            if (duplicate) {

                Swal.fire({
                    icon: "warning",
                    title: "Election Already Exists",
                    text:
                        "An election with this name already exists.",
                    confirmButtonColor: "#2563eb"
                });

                return;
            }


            const createButton =
                form.querySelector(".create-btn");


            if (createButton) {

                createButton.disabled = true;

                createButton.textContent =
                    "CREATING...";

            }


            try {

                console.log(
                    "CREATE ELECTION:",
                    {
                        name,
                        startDate: start,
                        startTime: startClock,
                        endDate: end,
                        endTime: endClock
                    }
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/elections`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                startDate: start,

                                startTime:
                                    startClock,

                                endDate: end,

                                endTime:
                                    endClock

                            })
                        }
                    );


                const responseText =
                    await response.text();


                let data;


                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch {

                    console.error(
                        "Invalid server response:",
                        responseText
                    );

                    throw new Error(
                        `Server returned an invalid response (${response.status}).`
                    );

                }


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        `Election creation failed (${response.status}).`
                    );

                }


                form.reset();


                await loadElections();


                Swal.fire({
                    icon: "success",
                    title:
                        "Election Created Successfully!",
                    text:
                        `${name} has been added to the system.`,
                    confirmButtonColor: "#2563eb"
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
                    confirmButtonColor: "#2563eb"
                });


            } finally {

                if (createButton) {

                    createButton.disabled =
                        false;

                    createButton.textContent =
                        "CREATE ELECTION";

                }

            }

        }
    );


    /* =========================
       RENDER ELECTIONS
    ========================= */

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
            .forEach((election) => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "election-card";


                const status =
                    getElectionStatus(
                        election
                    );


                const startDateValue =
                    election.startDate ||
                    election.start_date;

                const startTimeValue =
                    election.startTime ||
                    election.start_time ||
                    "";

                const endDateValue =
                    election.endDate ||
                    election.end_date;

                const endTimeValue =
                    election.endTime ||
                    election.end_time ||
                    "";


                card.innerHTML = `

                    <div class="election-info">

                        <h3>
                            ${escapeHTML(
                                election.name
                            )}
                        </h3>

                        <p>
                            ${formatDate(
                                startDateValue
                            )}

                            ${formatTime(
                                startTimeValue
                            )}

                            —

                            ${formatDate(
                                endDateValue
                            )}

                            ${formatTime(
                                endTimeValue
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
                                election.id ||
                                election.electionId
                            )}"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                `;


                electionList.appendChild(
                    card
                );

            });

    }


    /* =========================
       DELETE ELECTION
    ========================= */

    electionList.addEventListener(
        "click",
        async (event) => {

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
                    (item) => {

                        return String(
                            item.id ||
                            item.electionId
                        ) ===
                        String(
                            electionId
                        );

                    }
                );


            if (!election) {

                Swal.fire({
                    icon: "error",
                    title: "Election Not Found",
                    text:
                        "This election could not be found.",
                    confirmButtonColor:
                        "#2563eb"
                });

                return;
            }


            const result =
                await Swal.fire({

                    icon: "warning",

                    title:
                        "Delete Election?",

                    html: `
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

                });


            if (!result.isConfirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/admin/elections/${encodeURIComponent(
                            electionId
                        )}`,
                        {
                            method: "DELETE",

                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                const responseText =
                    await response.text();


                let data;


                try {

                    data =
                        JSON.parse(
                            responseText
                        );

                } catch {

                    throw new Error(
                        `Server returned an invalid response (${response.status}).`
                    );

                }


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
                    timer: 1500,
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


    /* =========================
       ELECTION STATUS
    ========================= */

    function getElectionStatus(
        election
    ) {

        const startDateValue =
            election.startDate ||
            election.start_date;

        const startTimeValue =
            election.startTime ||
            election.start_time ||
            "00:00";

        const endDateValue =
            election.endDate ||
            election.end_date;

        const endTimeValue =
            election.endTime ||
            election.end_time ||
            "23:59";


        const start =
            new Date(
                `${startDateValue}T${startTimeValue}`
            );

        const end =
            new Date(
                `${endDateValue}T${endTimeValue}`
            );


        const now =
            new Date();


        if (now < start) {

            return {
                text: "UPCOMING",
                className:
                    "status-upcoming"
            };

        }


        if (
            now >= start &&
            now <= end
        ) {

            return {
                text: "ACTIVE",
                className:
                    "status-active"
            };

        }


        return {
            text: "ENDED",
            className:
                "status-ended"
        };

    }


    /* =========================
       FORMAT DATE
    ========================= */

    function formatDate(
        date
    ) {

        if (!date) {
            return "";
        }


        const parts =
            String(date).split("-");


        if (parts.length !== 3) {
            return date;
        }


        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    /* =========================
       FORMAT TIME
    ========================= */

    function formatTime(
        time
    ) {

        if (!time) {
            return "";
        }


        const parts =
            String(time).split(":");


        if (parts.length < 2) {
            return time;
        }


        let hour =
            parseInt(
                parts[0],
                10
            );

        const minute =
            parts[1];


        const suffix =
            hour >= 12
                ? "PM"
                : "AM";


        hour =
            hour % 12 || 12;


        return `${hour}:${minute} ${suffix}`;

    }


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(
        value
    ) {

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


    /* =========================
       BACK BUTTON
    ========================= */

    if (backBtn) {

        backBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "admin-dashboard.html";

            }
        );

    }


    /* =========================
       START
    ========================= */

    loadElections();

});