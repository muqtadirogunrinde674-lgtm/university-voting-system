document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("electionForm");
    const electionName = document.getElementById("electionName");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const electionList = document.getElementById("electionList");
    const emptyState = document.getElementById("emptyState");
    const electionCount = document.getElementById("electionCount");
    const backBtn = document.getElementById("backBtn");

    let elections = [];

    // ==========================================
    // LOAD ELECTIONS
    // ==========================================

    function loadElections() {
        try {
            elections =
                JSON.parse(
                    localStorage.getItem("univoteElections")
                ) || [];
        } catch (error) {
            console.error("Error loading elections:", error);
            elections = [];
        }

        renderElections();
    }

    // ==========================================
    // CREATE ELECTION
    // ==========================================

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        const name = electionName.value.trim();
        const start = startDate.value;
        const end = endDate.value;

        if (name === "") {
            Swal.fire({
                icon: "warning",
                title: "Election Name Required",
                text: "Please enter an election name.",
                confirmButtonColor: "#2563eb"
            });

            return;
        }

        if (start === "" || end === "") {
            Swal.fire({
                icon: "warning",
                title: "Dates Required",
                text: "Please select the start and end dates.",
                confirmButtonColor: "#2563eb"
            });

            return;
        }

        if (new Date(end) < new Date(start)) {
            Swal.fire({
                icon: "error",
                title: "Invalid Dates",
                text: "The end date cannot be before the start date.",
                confirmButtonColor: "#2563eb"
            });

            return;
        }

        // Check for duplicate election names
        const duplicate = elections.some(
            election =>
                election.name.toLowerCase() === name.toLowerCase()
        );

        if (duplicate) {
            Swal.fire({
                icon: "warning",
                title: "Election Already Exists",
                text: "An election with this name already exists.",
                confirmButtonColor: "#2563eb"
            });

            return;
        }

        const newElection = {
            id: "ELEC-" + Date.now(),
            name: name,
            startDate: start,
            endDate: end,
            createdAt: new Date().toISOString()
        };

        elections.push(newElection);

        saveElections();

        localStorage.setItem(
            "activeElectionId",
            newElection.id
        );

        form.reset();

        renderElections();

        Swal.fire({
            icon: "success",
            title: "Election Created Successfully! 🎉",
            text: `${name} has been added to the system.`,
            confirmButtonColor: "#2563eb"
        });
    });

    // ==========================================
    // SAVE ELECTIONS
    // ==========================================

    function saveElections() {

        localStorage.setItem(
            "univoteElections",
            JSON.stringify(elections)
        );
    }

    // ==========================================
    // RENDER ELECTIONS
    // ==========================================

    function renderElections() {

        electionList.innerHTML = "";

        electionCount.textContent = elections.length;

        if (elections.length === 0) {

            emptyState.style.display = "block";

            return;
        }

        emptyState.style.display = "none";

        elections
            .slice()
            .reverse()
            .forEach(election => {

                const card =
                    document.createElement("div");

                card.className = "election-card";

                const status =
                    getElectionStatus(
                        election.startDate,
                        election.endDate
                    );

                card.innerHTML = `
                    <div class="election-info">

                        <h3>
                            ${escapeHTML(election.name)}
                        </h3>

                        <p>
                            ${formatDate(election.startDate)}
                            —
                            ${formatDate(election.endDate)}
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
                            data-id="${escapeHTML(election.id)}"
                        >
                            🗑️ Delete
                        </button>

                    </div>
                `;

                electionList.appendChild(card);
            });
    }

    // ==========================================
    // DELETE ELECTION
    // ==========================================

    electionList.addEventListener("click", (event) => {

        const deleteButton =
            event.target.closest(".delete-btn");

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
                title: "Election Not Found",
                text: "This election could not be found.",
                confirmButtonColor: "#2563eb"
            });

            return;
        }

        Swal.fire({

            icon: "warning",

            title: "Delete Election?",

            html: `
                <p style="font-size:13px;margin-bottom:8px;">
                    You are about to delete:
                </p>

                <strong style="font-size:16px;">
                    ${escapeHTML(election.name)}
                </strong>

                <p style="font-size:11px;color:#777;margin-top:12px;">
                    This election will be removed from the election list.
                </p>
            `,

            showCancelButton: true,

            confirmButtonText: "Yes, Delete",

            cancelButtonText: "Cancel",

            confirmButtonColor: "#dc2626",

            cancelButtonColor: "#6b7280",

            reverseButtons: true

        }).then(result => {

            if (!result.isConfirmed) {
                return;
            }

            elections =
                elections.filter(
                    item =>
                        String(item.id) !==
                        String(electionId)
                );

            saveElections();

            const activeElection =
                localStorage.getItem(
                    "activeElectionId"
                );

            if (
                String(activeElection) ===
                String(electionId)
            ) {
                localStorage.removeItem(
                    "activeElectionId"
                );
            }

            renderElections();

            Swal.fire({

                icon: "success",

                title: "Election Deleted",

                text:
                    "The election has been deleted successfully.",

                timer: 1500,

                showConfirmButton: false
            });
        });
    });

    // ==========================================
    // GET ELECTION STATUS
    // ==========================================

    function getElectionStatus(start, end) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const startDate = new Date(start);
        const endDate = new Date(end);

        startDate.setHours(0, 0, 0, 0);

        endDate.setHours(
            23,
            59,
            59,
            999
        );

        if (today < startDate) {

            return {
                text: "UPCOMING",
                className: "status-upcoming"
            };
        }

        if (
            today >= startDate &&
            today <= endDate
        ) {

            return {
                text: "ACTIVE",
                className: "status-active"
            };
        }

        return {
            text: "ENDED",
            className: "status-ended"
        };
    }

    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(date) {

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

    // ==========================================
    // ESCAPE HTML
    // ==========================================

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ==========================================
    // BACK TO DASHBOARD
    // ==========================================

    if (backBtn) {

        backBtn.addEventListener("click", () => {

            window.location.href =
                "admin-dashboard.html";
        });
    }

    // ==========================================
    // START
    // ==========================================

    loadElections();

});