document.addEventListener("DOMContentLoaded", async () => {

    if (sessionStorage.getItem("studentLoggedIn") !== "true") {
        window.location.href = "student-login.html";
        return;
    }

    const loading = document.getElementById("loading");
    const electionList = document.getElementById("electionList");
    const emptyState = document.getElementById("emptyState");
    const bottomAction = document.getElementById("bottomAction");
    const completedCount = document.getElementById("completedCount");
    const finishBtn = document.getElementById("finishBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const API_BASE_URL = "https://university-voting-system-p4sn.onrender.com";

    let elections = [];
    let selections = {};

    try {
        selections =
            JSON.parse(
                localStorage.getItem("univoteSelections")
            ) || {};
    } catch {
        selections = {};
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/students/elections`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load elections."
            );
        }

        elections = Array.isArray(data.elections)
            ? data.elections
            : [];

    } catch (error) {

        console.error("Election loading error:", error);

        loading.style.display = "none";

        await Swal.fire({
            icon: "error",
            title: "Unable to Load Elections",
            text: "We could not connect to the voting server. Please try again.",
            confirmButtonColor: "#2563eb"
        });

        return;
    }

    loading.style.display = "none";

    const now = new Date();

    const activeElections = elections.filter(election => {

        const startValue =
            election.startDate ||
            election.start_date;

        const endValue =
            election.endDate ||
            election.end_date;

        if (!startValue || !endValue) {
            return false;
        }

        const start = new Date(startValue);
        const end = new Date(endValue);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return false;
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        return now >= start && now <= end;
    });

    if (activeElections.length === 0) {

        emptyState.style.display = "block";
        bottomAction.style.display = "none";

        return;
    }

    bottomAction.style.display = "flex";

    activeElections.forEach(election => {

        const card = document.createElement("div");

        const isCompleted =
            Boolean(
                selections[String(election.id)]
            );

        card.className = "election-card";

        if (isCompleted) {
            card.classList.add("completed");
        }

        card.innerHTML = `
            <div class="election-left">

                <div class="election-icon">
                    🗳️
                </div>

                <div class="election-info">

                    <h2>
                        ${escapeHTML(
                            election.name || "Election"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            election.description || "Election currently available."
                        )}
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

        card.addEventListener("click", () => {

            if (isCompleted) {

                Swal.fire({
                    icon: "info",
                    title: "Election Completed",
                    text: "You have already completed this election.",
                    confirmButtonColor: "#2563eb"
                });

                return;
            }

            localStorage.setItem(
                "activeElectionId",
                String(election.id)
            );

            localStorage.removeItem(
                "activeVotingPosition"
            );

            localStorage.removeItem(
                "activeCandidateId"
            );

            window.location.href = "vote.html";
        });

        electionList.appendChild(card);
    });

    updateProgress();

    finishBtn.addEventListener("click", () => {

        const completed =
            Object.keys(selections).length;

        if (completed === 0) {

            Swal.fire({
                icon: "warning",
                title: "No Election Completed",
                text: "Please complete at least one election before finishing.",
                confirmButtonColor: "#2563eb"
            });

            return;
        }

        window.location.href = "review-vote.html";
    });

    logoutBtn.addEventListener("click", () => {

        Swal.fire({
            icon: "question",
            title: "Logout?",
            text: "Are you sure you want to logout?",
            showCancelButton: true,
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true
        }).then(result => {

            if (!result.isConfirmed) {
                return;
            }

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
        });
    });

    function updateProgress() {

        completedCount.textContent =
            Object.keys(selections).length;
    }

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});