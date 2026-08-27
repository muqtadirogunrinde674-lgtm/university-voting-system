const bcrypt = require("bcryptjs");
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
=========================================================
*/


/* =======================================================
   ENSURE ADMIN TABLE EXISTS
======================================================= */

function ensureAdminTable() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS admin_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            display_name TEXT NOT NULL,
            updated_at TEXT
        )
    `).run();


    const admin = db.prepare(`
        SELECT id
        FROM admin_settings
        WHERE id = 1
    `).get();


    /*
    Default account:
    Username: admin
    Password: admin123
    Display name: Admin
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
            VALUES (1, ?, ?, ?, ?)
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
                message: "Username and password are required."
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
                message: "Invalid username or password."
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
                message: "Invalid username or password."
            });

        }


        return res.json({

            success: true,

            message: "Admin login successful.",

            admin: {
                id: admin.id,
                username: admin.username,
                displayName: admin.display_name
            }

        });


    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to login as administrator."
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
                displayName: admin.display_name,
                updatedAt: admin.updated_at
            }

        });


    } catch (error) {

        console.error(
            "Get admin settings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load admin settings."
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


        if (!username || !currentPassword || !displayName) {

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
                message: "Admin account not found."
            });

        }


        /*
        Verify current password before allowing
        any account changes.
        */

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


        if (!cleanUsername || !cleanDisplayName) {

            return res.status(400).json({

                success: false,

                message:
                    "Username and display name cannot be empty."

            });

        }


        /*
        Prevent duplicate username.
        */

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


        /*
        If a new password was supplied,
        hash it before saving.
        Otherwise keep the old password.
        */

        let passwordHash = admin.password;


        if (newPassword) {

            if (String(newPassword).length < 8) {

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
            "Update admin settings error:",
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
   EXPORTS
======================================================= */

module.exports = {

    loginAdmin,

    getAdminSettings,

    updateAdminSettings

};