const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("./database");


/*
=========================================================
ADMIN CONTROLLER
Handles:
- Admin login
- Admin settings
- Username changes
- Password changes
- Admin display name
- Admin forgot password
- 4-digit email verification
=========================================================
*/


/* =======================================================
   EMAIL TRANSPORTER
======================================================= */

const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }

});


/* =======================================================
   ENSURE ADMIN TABLE
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


    /*
    Create default admin only if one does not exist.
    */

    if (!admin) {

        const passwordHash = bcrypt.hashSync(
            "admin123",
            12
        );

        db.prepare(`
            INSERT INTO admin_settings (
                id,
                username,
                password,
                display_name,
                updated_at
            )
            VALUES (
                1,
                ?,
                ?,
                ?,
                ?
            )
        `).run(
            "admin",
            passwordHash,
            "Admin",
            new Date().toISOString()
        );

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


        const passwordCorrect =
            bcrypt.compareSync(
                String(password),
                admin.password
            );


        if (!passwordCorrect) {

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

                id:
                    admin.id,

                username:
                    admin.username,

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

                id:
                    admin.id,

                username:
                    admin.username,

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


        const passwordCorrect =
            bcrypt.compareSync(
                String(currentPassword),
                admin.password
            );


        if (!passwordCorrect) {

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
            String(displayName)
                .trim();


        if (
            !cleanUsername ||
            !cleanDisplayName
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Username and display name cannot be empty."

            });

        }


        const usernameExists = db.prepare(`
            SELECT id
            FROM admin_settings
            WHERE username = ?
            AND id != 1
        `).get(cleanUsername);


        if (usernameExists) {

            return res.status(409).json({

                success: false,

                message:
                    "That username is already in use."

            });

        }


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
   FORGOT PASSWORD
   Sends a random 4-digit code to admin Gmail.
======================================================= */

async function forgotAdminPassword(req, res) {

    try {

        ensureAdminTable();


        const {
            email
        } = req.body;


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


        /*
        The first time the reset system is used,
        save the supplied Gmail address.

        After that, only the saved admin Gmail
        can request a reset.
        */

        if (!admin.admin_email) {

            db.prepare(`
                UPDATE admin_settings
                SET admin_email = ?
                WHERE id = 1
            `).run(cleanEmail);

        }

        else if (
            admin.admin_email !== cleanEmail
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "That Gmail address is not registered for the admin account."

            });

        }


        /*
        Generate a random 4-digit code.
        */

        const code =
            crypto
                .randomInt(
                    1000,
                    10000
                )
                .toString();


        /*
        Hash the code before storing it.
        */

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


        /*
        Send email.
        */

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
            String(code)
                .trim();


        if (
            !cleanEmail.endsWith("@gmail.com")
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid Gmail address."

            });

        }


        if (
            !/^\d{4}$/.test(cleanCode)
        ) {

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


        /*
        Maximum of 5 verification attempts.
        */

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
            new Date(admin.reset_expires_at)
                .getTime() <
            Date.now()
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


        const codeCorrect =
            submittedHash ===
            admin.reset_code_hash;


        if (!codeCorrect) {

            db.prepare(`
                UPDATE admin_settings

                SET
                    reset_attempts =
                        reset_attempts + 1

                WHERE id = 1
            `).run();


            return res.status(401).json({

                success: false,

                message:
                    "Incorrect verification code."

            });

        }


        /*
        Hash and save the new password.
        */

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
   EXPORTS
======================================================= */

module.exports = {

    loginAdmin,

    getAdminSettings,

    updateAdminSettings,

    forgotAdminPassword,

    resetAdminPassword

};