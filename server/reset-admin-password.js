const bcrypt = require("bcryptjs");
const db = require("./database");

function resetAdminPassword() {
    const resetPassword = process.env.ADMIN_RESET_SECRET;

    if (!resetPassword) {
        return;
    }

    if (resetPassword.length < 8) {
        console.error("❌ ADMIN_RESET_SECRET must be at least 8 characters.");
        return;
    }

    const admin = db.prepare(`
        SELECT id
        FROM admin_settings
        WHERE id = 1
    `).get();

    if (!admin) {
        console.error("❌ Admin account not found.");
        return;
    }

    const passwordHash = bcrypt.hashSync(
        resetPassword,
        12
    );

    db.prepare(`
        UPDATE admin_settings
        SET password = ?, updated_at = ?
        WHERE id = 1
    `).run(
        passwordHash,
        new Date().toISOString()
    );

    console.log("✅ Admin password reset successfully.");
}

module.exports = resetAdminPassword;