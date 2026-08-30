const express = require("express");

const {
    loginAdmin,
    getAdminSettings,
    updateAdminSettings,
    forgotAdminPassword,
    resetAdminPassword,
    createElection,
    getElections,
    deleteElection
} = require("./adminController");

const router = express.Router();


/* =======================================================
   ADMIN LOGIN
   POST /api/admin/login
======================================================= */

router.post(
    "/login",
    loginAdmin
);


/* =======================================================
   GET ADMIN SETTINGS
   GET /api/admin/settings
======================================================= */

router.get(
    "/settings",
    getAdminSettings
);


/* =======================================================
   UPDATE ADMIN SETTINGS
   PUT /api/admin/settings
======================================================= */

router.put(
    "/settings",
    updateAdminSettings
);


/* =======================================================
   FORGOT ADMIN PASSWORD
   POST /api/admin/forgot-password
======================================================= */

router.post(
    "/forgot-password",
    forgotAdminPassword
);


/* =======================================================
   RESET ADMIN PASSWORD
   POST /api/admin/reset-password
======================================================= */

router.post(
    "/reset-password",
    resetAdminPassword
);


/* =======================================================
   CREATE ELECTION
   POST /api/admin/elections
======================================================= */

router.post(
    "/elections",
    createElection
);


/* =======================================================
   GET ALL ELECTIONS
   GET /api/admin/elections
======================================================= */

router.get(
    "/elections",
    getElections
);


/* =======================================================
   DELETE ELECTION
   DELETE /api/admin/elections/:id
======================================================= */

router.delete(
    "/elections/:id",
    deleteElection
);


module.exports = router;