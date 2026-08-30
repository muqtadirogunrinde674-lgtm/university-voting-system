const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("./database");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


/* =======================================================
   ADMIN TABLE
======================================================= */

function ensureAdminTable() {

    db.prepare(`
        CREATE TABLE IF NOT EXISTS admin_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            display_name TEXT NOT NULL,
            admin_email TEXT,
            reset_code_hash TEXT,
            reset_expires_at TEXT,
            reset_attempts INTEGER NOT NULL DEFAULT 0,
            reset_requested_at TEXT,
            updated_at TEXT
        )
    `).run();


    const admin = db.prepare(`
        SELECT id
        FROM admin_settings
        WHERE id = 1
    `).get();


    if (!admin) {

        const passwordHash =
            bcrypt.hashSync("admin123", 12);


        db.prepare(`
            INSERT INTO admin_settings (
                id,
                username,
                password,
                display_name,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            1,
            "admin",
            passwordHash,
            "Admin",
            new Date().toISOString()
        );
    }
}


/* =======================================================
   ELECTION TABLE
======================================================= */

function ensureElectionTable() {

    const table = db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        AND name = 'elections'
    `).get();


    if (!table) {

        db.prepare(`
            CREATE TABLE elections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                election_id TEXT UNIQUE,
                name TEXT NOT NULL,
                start_date TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_date TEXT NOT NULL,
                end_time TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        `).run();


        return;
    }


    const columns = db.prepare(`
        PRAGMA table_info(elections)
    `).all();


    const columnNames =
        columns.map(column => column.name);


    /* =========================
       ADD ELECTION ID
    ========================= */

    if (!columnNames.includes("election_id")) {

        db.prepare(`
            ALTER TABLE elections
            ADD COLUMN election_id TEXT
        `).run();


        const oldElections = db.prepare(`
            SELECT id
            FROM elections
            WHERE election_id IS NULL
        `).all();


        const updateElectionId =
            db.prepare(`
                UPDATE elections
                SET election_id = ?
                WHERE id = ?
            `);


        const updateMany =
            db.transaction((rows) => {

                for (const election of rows) {

                    updateElectionId.run(
                        "ELEC-" +
                        election.id +
                        "-" +
                        crypto.randomBytes(3).toString("hex"),
                        election.id
                    );

                }

            });


        updateMany(oldElections);


        db.prepare(`
            CREATE UNIQUE INDEX IF NOT EXISTS
            idx_elections_election_id
            ON elections(election_id)
        `).run();

    }


    /* =========================
       ADD START TIME
    ========================= */

    if (!columnNames.includes("start_time")) {

        db.prepare(`
            ALTER TABLE elections
            ADD COLUMN start_time TEXT
        `).run();


        db.prepare(`
            UPDATE elections
            SET start_time = '00:00'
            WHERE start_time IS NULL
        `).run();

    }


    /* =========================
       ADD END TIME
    ========================= */

    if (!columnNames.includes("end_time")) {

        db.prepare(`
            ALTER TABLE elections
            ADD COLUMN end_time TEXT
        `).run();


        db.prepare(`
            UPDATE elections
            SET end_time = '23:59'
            WHERE end_time IS NULL
        `).run();

    }

}


/* =======================================================
   ADMIN LOGIN
======================================================= */

function loginAdmin(req, res) {

    try {

        ensureAdminTable();


        const {
            username,
            password
        } = req.body;


        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Username and password are required."
            });

        }


        const cleanUsername =
            String(username)
                .trim()
                .toLowerCase();


        const admin = db.prepare(`
            SELECT
                id,
                username,
                password,
                display_name
            FROM admin_settings
            WHERE username = ?
            AND id = 1
        `).get(cleanUsername);


        if (!admin) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password."
            });

        }


        if (
            !bcrypt.compareSync(
                String(password),
                admin.password
            )
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password."
            });

        }


        return res.json({
            success: true,
            message:
                "Admin login successful.",
            admin: {
                id: admin.id,
                username: admin.username,
                displayName:
                    admin.display_name
            }
        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to login as administrator."
        });

    }

}


/* =======================================================
   GET ADMIN SETTINGS
======================================================= */

function getAdminSettings(req, res) {

    try {

        ensureAdminTable();


        const admin = db.prepare(`
            SELECT
                id,
                username,
                display_name,
                updated_at
            FROM admin_settings
            WHERE id = 1
        `).get();


        return res.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                displayName:
                    admin.display_name,
                updatedAt:
                    admin.updated_at
            }
        });


    } catch (error) {

        console.error(
            "Get admin settings error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to load admin settings."
        });

    }

}


/* =======================================================
   UPDATE ADMIN SETTINGS
======================================================= */

function updateAdminSettings(req, res) {

    try {

        ensureAdminTable();


        const {
            username,
            currentPassword,
            newPassword,
            displayName
        } = req.body;


        if (
            !username ||
            !currentPassword ||
            !displayName
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Username, current password and display name are required."
            });

        }


        const admin = db.prepare(`
            SELECT *
            FROM admin_settings
            WHERE id = 1
        `).get();


        if (!admin) {

            return res.status(404).json({
                success: false,
                message:
                    "Admin account not found."
            });

        }


        if (
            !bcrypt.compareSync(
                String(currentPassword),
                admin.password
            )
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Current password is incorrect."
            });

        }


        const cleanUsername =
            String(username)
                .trim()
                .toLowerCase();


        const cleanDisplayName =
            String(displayName).trim();


        let passwordHash =
            admin.password;


        if (newPassword) {

            if (
                String(newPassword).length < 8
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "New password must be at least 8 characters."
                });

            }


            passwordHash =
                bcrypt.hashSync(
                    String(newPassword),
                    12
                );

        }


        db.prepare(`
            UPDATE admin_settings
            SET
                username = ?,
                password = ?,
                display_name = ?,
                updated_at = ?
            WHERE id = 1
        `).run(
            cleanUsername,
            passwordHash,
            cleanDisplayName,
            new Date().toISOString()
        );


        return res.json({
            success: true,
            message:
                "Admin settings updated successfully.",
            admin: {
                username:
                    cleanUsername,
                displayName:
                    cleanDisplayName
            }
        });


    } catch (error) {

        console.error(
            "Update settings error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to update admin settings."
        });

    }

}


/* =======================================================
   FORGOT ADMIN PASSWORD
======================================================= */

async function forgotAdminPassword(req, res) {

    try {

        ensureAdminTable();


        const { email } = req.body;


        if (!email) {

            return res.status(400).json({
                success: false,
                message:
                    "Gmail address is required."
            });

        }


        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        if (
            !cleanEmail.endsWith("@gmail.com")
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid Gmail address."
            });

        }


        const admin = db.prepare(`
            SELECT
                id,
                username,
                admin_email
            FROM admin_settings
            WHERE id = 1
        `).get();


        if (!admin) {

            return res.status(404).json({
                success: false,
                message:
                    "Admin account not found."
            });

        }


        if (!admin.admin_email) {

            db.prepare(`
                UPDATE admin_settings
                SET admin_email = ?
                WHERE id = 1
            `).run(cleanEmail);

        } else if (
            admin.admin_email !== cleanEmail
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "That Gmail address is not registered for the admin account."
            });

        }


        const code =
            crypto.randomInt(
                1000,
                10000
            ).toString();


        const codeHash =
            crypto
                .createHash("sha256")
                .update(code)
                .digest("hex");


        const expiresAt =
            new Date(
                Date.now() +
                10 * 60 * 1000
            ).toISOString();


        db.prepare(`
            UPDATE admin_settings
            SET
                reset_code_hash = ?,
                reset_expires_at = ?,
                reset_attempts = 0,
                reset_requested_at = ?
            WHERE id = 1
        `).run(
            codeHash,
            expiresAt,
            new Date().toISOString()
        );


        await transporter.sendMail({

            from:
                process.env.SMTP_USER,

            to:
                cleanEmail,

            subject:
                "UniVote Admin Password Reset Code",

            text:
                `Your UniVote admin password reset code is ${code}.

This code expires in 10 minutes.

If you did not request this reset, ignore this email.`

        });


        return res.json({
            success: true,
            message:
                "Verification code sent to your Gmail."
        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to send verification code."
        });

    }

}


/* =======================================================
   RESET ADMIN PASSWORD
======================================================= */

async function resetAdminPassword(req, res) {

    try {

        ensureAdminTable();


        const {
            email,
            code,
            newPassword
        } = req.body;


        if (
            !email ||
            !code ||
            !newPassword
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Email, verification code and new password are required."
            });

        }


        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();


        const cleanCode =
            String(code).trim();


        if (
            !cleanEmail.endsWith("@gmail.com")
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid Gmail address."
            });

        }


        if (!/^\d{4}$/.test(cleanCode)) {

            return res.status(400).json({
                success: false,
                message:
                    "Verification code must contain 4 digits."
            });

        }


        if (
            String(newPassword).length < 8
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 8 characters."
            });

        }


        const admin = db.prepare(`
            SELECT *
            FROM admin_settings
            WHERE id = 1
        `).get();


        if (!admin) {

            return res.status(404).json({
                success: false,
                message:
                    "Admin account not found."
            });

        }


        if (
            !admin.admin_email ||
            admin.admin_email !== cleanEmail
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid password reset request."
            });

        }


        if (
            Number(admin.reset_attempts || 0) >= 5
        ) {

            return res.status(429).json({
                success: false,
                message:
                    "Too many incorrect attempts. Please request a new code."
            });

        }


        if (
            !admin.reset_code_hash ||
            !admin.reset_expires_at
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "No active verification code. Please request a new one."
            });

        }


        if (
            new Date(
                admin.reset_expires_at
            ).getTime() < Date.now()
        ) {

            db.prepare(`
                UPDATE admin_settings
                SET
                    reset_code_hash = NULL,
                    reset_expires_at = NULL,
                    reset_attempts = 0
                WHERE id = 1
            `).run();


            return res.status(400).json({
                success: false,
                message:
                    "Verification code has expired. Please request a new one."
            });

        }


        const submittedHash =
            crypto
                .createHash("sha256")
                .update(cleanCode)
                .digest("hex");


        if (
            submittedHash !==
            admin.reset_code_hash
        ) {

            db.prepare(`
                UPDATE admin_settings
                SET reset_attempts =
                    reset_attempts + 1
                WHERE id = 1
            `).run();


            return res.status(401).json({
                success: false,
                message:
                    "Incorrect verification code."
            });

        }


        const passwordHash =
            bcrypt.hashSync(
                String(newPassword),
                12
            );


        db.prepare(`
            UPDATE admin_settings
            SET
                password = ?,
                reset_code_hash = NULL,
                reset_expires_at = NULL,
                reset_attempts = 0,
                reset_requested_at = NULL,
                updated_at = ?
            WHERE id = 1
        `).run(
            passwordHash,
            new Date().toISOString()
        );


        return res.json({
            success: true,
            message:
                "Admin password reset successfully."
        });


    } catch (error) {

        console.error(
            "Reset admin password error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Unable to reset admin password."
        });

    }

}


/* =======================================================
   CREATE ELECTION
======================================================= */

function createElection(req, res) {

    try {

        ensureElectionTable();


        const {
            name,
            startDate,
            startTime,
            endDate,
            endTime
        } = req.body || {};


        console.log(
            "CREATE ELECTION REQUEST:",
            {
                name,
                startDate,
                startTime,
                endDate,
                endTime
            }
        );


        /* =========================
           REQUIRED FIELDS
        ========================= */

        if (
            !name ||
            !startDate ||
            !startTime ||
            !endDate ||
            !endTime
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Election name, start date, start time, end date and end time are required."
            });

        }


        const cleanName =
            String(name).trim();

        const cleanStartDate =
            String(startDate).trim();

        const cleanStartTime =
            String(startTime).trim();

        const cleanEndDate =
            String(endDate).trim();

        const cleanEndTime =
            String(endTime).trim();


        /* =========================
           VALIDATE DATE/TIME
        ========================= */

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                cleanStartDate
            ) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(
                cleanEndDate
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid election date."
            });

        }


        if (
            !/^\d{2}:\d{2}$/.test(
                cleanStartTime
            ) ||
            !/^\d{2}:\d{2}$/.test(
                cleanEndTime
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid election time."
            });

        }


        const start =
            new Date(
                `${cleanStartDate}T${cleanStartTime}`
            );


        const end =
            new Date(
                `${cleanEndDate}T${cleanEndTime}`
            );


        if (
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid election date or time."
            });

        }


        if (end <= start) {

            return res.status(400).json({
                success: false,
                message:
                    "The end date and time must be after the start date and time."
            });

        }


        /* =========================
           DUPLICATE CHECK
        ========================= */

        const existing =
            db.prepare(`
                SELECT id
                FROM elections
                WHERE LOWER(name) = LOWER(?)
            `).get(cleanName);


        if (existing) {

            return res.status(409).json({
                success: false,
                message:
                    "An election with this name already exists."
            });

        }


        /* =========================
           CREATE ID
        ========================= */

        const electionId =
            "ELEC-" +
            Date.now() +
            "-" +
            crypto.randomBytes(3).toString("hex");


        const createdAt =
            new Date().toISOString();


        /* =========================
           INSERT
        ========================= */

        const result =
            db.prepare(`
                INSERT INTO elections (
                    election_id,
                    name,
                    start_date,
                    start_time,
                    end_date,
                    end_time,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                electionId,
                cleanName,
                cleanStartDate,
                cleanStartTime,
                cleanEndDate,
                cleanEndTime,
                createdAt
            );


        /* =========================
           GET CREATED ELECTION
        ========================= */

        const election =
            db.prepare(`
                SELECT
                    id,
                    election_id AS electionId,
                    name,
                    start_date AS startDate,
                    start_time AS startTime,
                    end_date AS endDate,
                    end_time AS endTime,
                    created_at AS createdAt
                FROM elections
                WHERE id = ?
            `).get(
                result.lastInsertRowid
            );


        console.log(
            "ELECTION CREATED:",
            election
        );


        return res.status(201).json({

            success: true,

            message:
                "Election created successfully.",

            election

        });


    } catch (error) {

        console.error(
            "CREATE ELECTION DATABASE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create election.",

            error:
                error.message

        });

    }

}


/* =======================================================
   GET ELECTIONS
======================================================= */

function getElections(req, res) {

    try {

        ensureElectionTable();


        const elections =
            db.prepare(`
                SELECT
                    id,
                    election_id AS electionId,
                    name,
                    start_date AS startDate,
                    start_time AS startTime,
                    end_date AS endDate,
                    end_time AS endTime,
                    created_at AS createdAt
                FROM elections
                ORDER BY id DESC
            `).all();


        return res.json({

            success: true,

            elections

        });


    } catch (error) {

        console.error(
            "Get elections error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load elections."

        });

    }

}


/* =======================================================
   DELETE ELECTION
======================================================= */

function deleteElection(req, res) {

    try {

        ensureElectionTable();


        const electionId =
            String(
                req.params.id || ""
            ).trim();


        if (!electionId) {

            return res.status(400).json({
                success: false,
                message:
                    "Election ID is required."
            });

        }


        /*
         * The frontend may send either the
         * database numeric ID or election_id.
         */

        const election =
            db.prepare(`
                SELECT
                    id,
                    election_id AS electionId,
                    name
                FROM elections
                WHERE id = ?
                OR election_id = ?
            `).get(
                electionId,
                electionId
            );


        if (!election) {

            return res.status(404).json({
                success: false,
                message:
                    "Election not found."
            });

        }


        db.prepare(`
            DELETE FROM elections
            WHERE id = ?
        `).run(
            election.id
        );


        return res.json({

            success: true,

            message:
                "Election deleted successfully.",

            election

        });


    } catch (error) {

        console.error(
            "Delete election error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to delete election."

        });

    }

}


/* =======================================================
   EXPORTS
======================================================= */

module.exports = {

    loginAdmin,

    getAdminSettings,

    updateAdminSettings,

    forgotAdminPassword,

    resetAdminPassword,

    createElection,

    getElections,

    deleteElection

};