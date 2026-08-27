document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "/api/students";

    const modal = document.getElementById("studentModal");
    const form = document.getElementById("studentForm");
    const table = document.getElementById("studentsTable");
    const emptyState = document.getElementById("emptyState");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    let students = [];


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================
       LOAD STUDENTS
    ========================= */

    async function loadStudents() {

        try {

            const response = await fetch(API_URL);

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message || "Unable to load students."
                );

            }

            students =
                Array.isArray(data.students)
                    ? data.students
                    : [];

            renderStudents();

        } catch (error) {

            console.error(
                "Load students error:",
                error
            );

            Swal.fire({

                icon: "error",

                title: "Unable to Load Students",

                text:
                    "Make sure the UniVote backend is running.",

                confirmButtonColor: "#2563eb"

            });

        }

    }


    /* =========================
       UPDATE STATS
    ========================= */

    function updateStats() {

        const total =
            students.length;


        const eligible =
            students.filter(student =>
                Number(student.is_eligible ?? 1) === 1
            ).length;


        const voted =
            students.filter(student =>
                Number(student.has_voted) === 1
            ).length;


        const remaining =
            students.filter(student =>
                Number(student.is_eligible ?? 1) === 1 &&
                Number(student.has_voted) !== 1
            ).length;


        document.getElementById(
            "totalStudents"
        ).textContent = total;


        document.getElementById(
            "eligibleStudents"
        ).textContent = eligible;


        document.getElementById(
            "votedStudents"
        ).textContent = voted;


        document.getElementById(
            "remainingStudents"
        ).textContent = remaining;

    }


    /* =========================
       RENDER STUDENTS
    ========================= */

    function renderStudents() {

        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const filter =
            statusFilter.value;


        const filtered =
            students.filter(student => {

                const name =
                    String(
                        student.name || ""
                    ).toLowerCase();


                const matric =
                    String(
                        student.matric_number || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    matric.includes(search);


                const eligible =
                    Number(
                        student.is_eligible ?? 1
                    ) === 1;


                const voted =
                    Number(
                        student.has_voted
                    ) === 1;


                let matchesFilter = true;


                if (filter === "eligible") {

                    matchesFilter =
                        eligible;

                }


                if (filter === "not-eligible") {

                    matchesFilter =
                        !eligible;

                }


                if (filter === "voted") {

                    matchesFilter =
                        voted;

                }


                if (filter === "not-voted") {

                    matchesFilter =
                        !voted;

                }


                return (
                    matchesSearch &&
                    matchesFilter
                );

            });


        table.innerHTML = "";


        if (!filtered.length) {

            emptyState.style.display =
                "block";

            updateStats();

            return;

        }


        emptyState.style.display =
            "none";


        filtered.forEach(student => {

            const row =
                document.createElement("tr");


            const eligible =
                Number(
                    student.is_eligible ?? 1
                ) === 1;


            const voted =
                Number(
                    student.has_voted
                ) === 1;


            row.innerHTML = `

                <td>

                    <div class="student-name">

                        ${escapeHTML(
                            student.name
                        )}

                    </div>

                </td>


                <td>

                    <span class="matric">

                        ${escapeHTML(
                            student.matric_number
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHTML(
                        student.level || "—"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        student.department || "—"
                    )}

                </td>


                <td>

                    ${
                        eligible

                        ? `
                            <span class="badge eligible">
                                ELIGIBLE
                            </span>
                          `

                        : `
                            <span class="badge not-eligible">
                                NOT ELIGIBLE
                            </span>
                          `
                    }

                </td>


                <td>

                    ${
                        voted

                        ? `
                            <span class="badge voted">
                                ✓ VOTED
                            </span>
                          `

                        : `
                            <span class="badge not-voted">
                                NOT VOTED
                            </span>
                          `
                    }

                </td>


                <td>

                    <button
                        class="action-btn"
                        data-action="edit"
                        data-id="${student.id}"
                    >
                        Edit
                    </button>


                    <button
                        class="action-btn delete-btn"
                        data-action="delete"
                        data-id="${student.id}"
                    >
                        Delete
                    </button>

                </td>

            `;


            table.appendChild(row);

        });


        updateStats();

    }


    /* =========================
       OPEN ADD STUDENT
    ========================= */

    document
        .getElementById("addStudentBtn")
        .addEventListener(
            "click",
            () => {

                form.reset();


                document.getElementById(
                    "studentId"
                ).value = "";


                document.getElementById(
                    "eligible"
                ).checked = true;


                document.getElementById(
                    "modalTitle"
                ).textContent =
                    "Add Student";


                modal.classList.add(
                    "show"
                );

            }
        );


    /* =========================
       CLOSE MODAL
    ========================= */

    function closeModal() {

        modal.classList.remove(
            "show"
        );

    }


    document
        .getElementById("closeModal")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById("cancelBtn")
        .addEventListener(
            "click",
            closeModal
        );


    /* =========================
       SAVE STUDENT
    ========================= */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const id =
                document.getElementById(
                    "studentId"
                ).value;


            const name =
                document.getElementById(
                    "studentName"
                ).value.trim();


            const matricNumber =
                document.getElementById(
                    "matricNumber"
                ).value.trim();


            const level =
                document.getElementById(
                    "studentLevel"
                ).value.trim();


            const department =
                document.getElementById(
                    "studentDepartment"
                ).value.trim();


            const eligible =
                document.getElementById(
                    "eligible"
                ).checked;


            if (
                !name ||
                !matricNumber ||
                !level ||
                !department
            ) {

                Swal.fire({

                    icon: "warning",

                    title:
                        "Incomplete Information",

                    text:
                        "Please complete all required fields.",

                    confirmButtonColor:
                        "#2563eb"

                });

                return;

            }


            const payload = {

                name:
                    name,

                matricNumber:
                    matricNumber,

                level:
                    level,

                department:
                    department,

                eligible:
                    eligible

            };


            try {

                let response;


                if (id) {

                    response =
                        await fetch(
                            `${API_URL}/${id}`,
                            {

                                method:
                                    "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )

                            }
                        );

                }

                else {

                    response =
                        await fetch(
                            API_URL,
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )

                            }
                        );

                }


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to save student."
                    );

                }


                closeModal();


                await loadStudents();


                Swal.fire({

                    icon:
                        "success",

                    title:
                        id
                            ? "Student Updated"
                            : "Student Added",

                    text:
                        data.message,

                    timer:
                        1600,

                    showConfirmButton:
                        false

                });

            }

            catch (error) {

                console.error(
                    "Save student error:",
                    error
                );


                Swal.fire({

                    icon:
                        "error",

                    title:
                        "Unable to Save Student",

                    text:
                        error.message,

                    confirmButtonColor:
                        "#2563eb"

                });

            }

        }
    );


    /* =========================
       TABLE ACTIONS
    ========================= */

    table.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );


            if (!button) return;


            const id =
                button.dataset.id;


            const action =
                button.dataset.action;


            if (action === "edit") {

                editStudent(id);

            }


            if (action === "delete") {

                deleteStudent(id);

            }

        }
    );


    /* =========================
       EDIT STUDENT
    ========================= */

    function editStudent(id) {

        const student =
            students.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!student) return;


        document.getElementById(
            "studentId"
        ).value =
            student.id;


        document.getElementById(
            "studentName"
        ).value =
            student.name || "";


        document.getElementById(
            "matricNumber"
        ).value =
            student.matric_number || "";


        document.getElementById(
            "studentLevel"
        ).value =
            student.level || "";


        document.getElementById(
            "studentDepartment"
        ).value =
            student.department || "";


        document.getElementById(
            "eligible"
        ).checked =
            Number(
                student.is_eligible ?? 1
            ) === 1;


        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Student";


        modal.classList.add(
            "show"
        );

    }


    /* =========================
       DELETE STUDENT
    ========================= */

    async function deleteStudent(id) {

        const student =
            students.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (!student) return;


        const result =
            await Swal.fire({

                icon:
                    "warning",

                title:
                    "Delete Student?",

                text:
                    `${student.name} will be permanently removed from the database.`,

                showCancelButton:
                    true,

                confirmButtonText:
                    "Yes, Delete",

                cancelButtonText:
                    "Cancel",

                confirmButtonColor:
                    "#dc2626"

            });


        if (!result.isConfirmed)
            return;


        try {

            const response =
                await fetch(
                    `${API_URL}/${id}`,
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
                    "Unable to delete student."
                );

            }


            await loadStudents();


            Swal.fire({

                icon:
                    "success",

                title:
                    "Student Removed",

                text:
                    data.message,

                timer:
                    1200,

                showConfirmButton:
                    false

            });

        }

        catch (error) {

            console.error(
                "Delete student error:",
                error
            );


            Swal.fire({

                icon:
                    "error",

                title:
                    "Unable to Delete Student",

                text:
                    error.message,

                confirmButtonColor:
                    "#2563eb"

            });

        }

    }


    /* =========================
       SEARCH
    ========================= */

    searchInput.addEventListener(
        "input",
        renderStudents
    );


    /* =========================
       FILTER
    ========================= */

    statusFilter.addEventListener(
        "change",
        renderStudents
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

                    icon:
                        "question",

                    title:
                        "Logout?",

                    text:
                        "Are you sure you want to logout?",

                    showCancelButton:
                        true,

                    confirmButtonText:
                        "Logout",

                    cancelButtonText:
                        "Cancel",

                    confirmButtonColor:
                        "#dc2626"

                }).then(result => {

                    if (
                        result.isConfirmed
                    ) {

                        sessionStorage.removeItem(
                            "adminLoggedIn"
                        );


                        window.location.href =
                            "admin-login.html";

                    }

                });

            }
        );


    /* =========================
       INITIAL LOAD
    ========================= */

    loadStudents();

});