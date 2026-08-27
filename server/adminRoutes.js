const express = require("express");

const {
    loginAdmin,
    getAdminSettings,
    updateAdminSettings
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


module.exports = router;