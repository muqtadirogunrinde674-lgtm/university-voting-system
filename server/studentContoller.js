const bcrypt = require("bcryptjs");
const db = require("./database");

function registerStudent(req, res) {
    try {
        const {
            name,
            matricNumber,
            email,
            password,
            level,
            department
        } = req.body;

        if (!name || !matricNumber || !email || !password || !level || !department) {
            return res.status(400).json({
                success: false,
                message: "Full name, matric number, email, password, level and department are required."
            });
        }

        if (String(password).length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });
        }

        const cleanName = String(name).trim();
        const cleanMatric = String(matricNumber).trim().toUpperCase();
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanLevel = String(level).trim();
        const cleanDepartment = String(department).trim();

        const matricExists = db.prepare(`
            SELECT id
            FROM students
            WHERE matric_number = ?
        `).get(cleanMatric);

        if (matricExists) {
            return res.status(409).json({
                success: false,
                message: "A student with this matric number already exists."
            });
        }

        const emailExists = db.prepare(`
            SELECT id
            FROM students
            WHERE email = ?
        `).get(cleanEmail);

        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        const passwordHash = bcrypt.hashSync(String(password), 12);

        const result = db.prepare(`
            INSERT INTO students (
                name,
                matric_number,
                email,
                password,
                level,
                department,
                has_voted,
                is_registered,
                registered_at,
                is_eligible
            )
            VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?, 0)
        `).run(
            cleanName,
            cleanMatric,
            cleanEmail,
            passwordHash,
            cleanLevel,
            cleanDepartment,
            new Date().toISOString()
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful. Your account is waiting for administrator approval.",
            student: {
                id: result.lastInsertRowid,
                name: cleanName,
                matricNumber: cleanMatric,
                email: cleanEmail,
                level: cleanLevel,
                department: cleanDepartment,
                isRegistered: true,
                isEligible: false,
                hasVoted: false
            }
        });

    } catch (error) {
        console.error("Student registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create student account."
        });
    }
}

function loginStudent(req, res) {
    try {
        const {
            matricNumber,
            password
        } = req.body;

        if (!matricNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Matric number and password are required."
            });
        }

        const cleanMatric = String(matricNumber)
            .trim()
            .toUpperCase();

        const student = db.prepare(`
            SELECT *
            FROM students
            WHERE matric_number = ?
        `).get(cleanMatric);

        if (!student || !student.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid matric number or password."
            });
        }

        const passwordMatch = bcrypt.compareSync(
            String(password),
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid matric number or password."
            });
        }

        if (Number(student.is_eligible ?? 0) !== 1) {
            return res.status(403).json({
                success: false,
                message: "Your account has been created successfully, but an administrator must approve you before you can vote."
            });
        }

        return res.json({
            success: true,
            message: "Login successful.",
            student: {
                id: student.id,
                name: student.name,
                matricNumber: student.matric_number,
                email: student.email,
                level: student.level,
                department: student.department,
                hasVoted: Number(student.has_voted) === 1,
                isEligible: Number(student.is_eligible) === 1,
                isRegistered: Number(student.is_registered) === 1
            }
        });

    } catch (error) {
        console.error("Student login error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to login."
        });
    }
}

function resetStudentPassword(req, res) {
    try {
        const {
            matricNumber,
            email,
            newPassword
        } = req.body;

        if (!matricNumber || !email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Matric number, email and new password are required."
            });
        }

        if (String(newPassword).length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters."
            });
        }

        const cleanMatric = String(matricNumber)
            .trim()
            .toUpperCase();

        const cleanEmail = String(email)
            .trim()
            .toLowerCase();

        const student = db.prepare(`
            SELECT *
            FROM students
            WHERE matric_number = ?
            AND email = ?
        `).get(
            cleanMatric,
            cleanEmail
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Matric number and email do not match our records."
            });
        }

        if (Number(student.is_registered ?? 0) !== 1) {
            return res.status(400).json({
                success: false,
                message: "This student account has not been registered yet."
            });
        }

        const passwordHash = bcrypt.hashSync(
            String(newPassword),
            12
        );

        db.prepare(`
            UPDATE students
            SET password = ?
            WHERE id = ?
        `).run(
            passwordHash,
            student.id
        );

        return res.json({
            success: true,
            message: "Password reset successfully."
        });

    } catch (error) {
        console.error("Reset student password error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reset password."
        });
    }
}

function getStudents(req, res) {
    try {
        const students = db.prepare(`
            SELECT
                id,
                name,
                matric_number,
                email,
                level,
                department,
                has_voted,
                voted_at,
                created_at,
                is_eligible,
                is_registered,
                registered_at
            FROM students
            ORDER BY id DESC
        `).all();

        return res.json({
            success: true,
            students
        });

    } catch (error) {
        console.error("Get students error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load students."
        });
    }
}

function addStudent(req, res) {
    try {
        const {
            name,
            matricNumber,
            email,
            level,
            department
        } = req.body;

        if (!name || !matricNumber) {
            return res.status(400).json({
                success: false,
                message: "Student name and matric number are required."
            });
        }

        const cleanName = String(name).trim();

        const cleanMatric = String(matricNumber)
            .trim()
            .toUpperCase();

        const cleanEmail = email
            ? String(email).trim().toLowerCase()
            : null;

        const matricExists = db.prepare(`
            SELECT id
            FROM students
            WHERE matric_number = ?
        `).get(cleanMatric);

        if (matricExists) {
            return res.status(409).json({
                success: false,
                message: "This matric number already exists."
            });
        }

        if (cleanEmail) {
            const emailExists = db.prepare(`
                SELECT id
                FROM students
                WHERE email = ?
            `).get(cleanEmail);

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: "This email address is already being used."
                });
            }
        }

        const result = db.prepare(`
            INSERT INTO students (
                name,
                matric_number,
                email,
                password,
                level,
                department,
                has_voted,
                is_registered,
                registered_at,
                is_eligible
            )
            VALUES (?, ?, ?, NULL, ?, ?, 0, 0, NULL, 0)
        `).run(
            cleanName,
            cleanMatric,
            cleanEmail,
            level || null,
            department || null
        );

        return res.status(201).json({
            success: true,
            message: "Student added successfully. The student must register their account before logging in.",
            student: {
                id: result.lastInsertRowid,
                name: cleanName,
                matricNumber: cleanMatric,
                email: cleanEmail,
                level: level || null,
                department: department || null,
                isEligible: false,
                isRegistered: false,
                hasVoted: false
            }
        });

    } catch (error) {
        console.error("Add student error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to add student."
        });
    }
}

function updateStudent(req, res) {
    try {
        const { id } = req.params;

        const {
            name,
            matricNumber,
            email,
            level,
            department,
            eligible
        } = req.body;

        const student = db.prepare(`
            SELECT *
            FROM students
            WHERE id = ?
        `).get(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const cleanName = name !== undefined
            ? String(name).trim()
            : student.name;

        const cleanMatric = matricNumber !== undefined
            ? String(matricNumber).trim().toUpperCase()
            : student.matric_number;

        const cleanEmail = email !== undefined
            ? (String(email).trim().toLowerCase() || null)
            : student.email;

        let isEligible = Number(student.is_eligible ?? 0);

        if (eligible !== undefined) {
            isEligible =
                eligible === true ||
                eligible === 1 ||
                eligible === "1"
                    ? 1
                    : 0;
        }

        const matricExists = db.prepare(`
            SELECT id
            FROM students
            WHERE matric_number = ?
            AND id != ?
        `).get(
            cleanMatric,
            id
        );

        if (matricExists) {
            return res.status(409).json({
                success: false,
                message: "This matric number is already being used."
            });
        }

        if (cleanEmail) {
            const emailExists = db.prepare(`
                SELECT id
                FROM students
                WHERE email = ?
                AND id != ?
            `).get(
                cleanEmail,
                id
            );

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: "This email address is already being used."
                });
            }
        }

        db.prepare(`
            UPDATE students
            SET
                name = ?,
                matric_number = ?,
                email = ?,
                level = ?,
                department = ?,
                is_eligible = ?
            WHERE id = ?
        `).run(
            cleanName,
            cleanMatric,
            cleanEmail,
            level !== undefined ? level : student.level,
            department !== undefined ? department : student.department,
            isEligible,
            id
        );

        return res.json({
            success: true,
            message: isEligible === 1
                ? "Student is now eligible to vote."
                : "Student eligibility has been disabled."
        });

    } catch (error) {
        console.error("Update student error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update student."
        });
    }
}

function deleteStudent(req, res) {
    try {
        const { id } = req.params;

        const student = db.prepare(`
            SELECT id
            FROM students
            WHERE id = ?
        `).get(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        db.prepare(`
            DELETE FROM students
            WHERE id = ?
        `).run(id);

        return res.json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("Delete student error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete student."
        });
    }
}

function getElections(req, res) {
    try {
        const elections = db.prepare(`
            SELECT
                id,
                name,
                description,
                start_date AS startDate,
                end_date AS endDate,
                created_at AS createdAt
            FROM elections
            ORDER BY id DESC
        `).all();

        return res.json({
            success: true,
            elections
        });

    } catch (error) {
        console.error("Get elections error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to load elections."
        });
    }
}

module.exports = {
    registerStudent,
    loginStudent,
    resetStudentPassword,
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getElections
};