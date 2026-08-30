const express = require("express");

const router = express.Router();

const {
    registerStudent,
    loginStudent,
    getStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    resetStudentPassword,
    getElections
} = require("./studentContoller");


/* =========================================================
   STUDENT AUTHENTICATION
========================================================= */

router.post(
    "/register",
    registerStudent
);

router.post(
    "/login",
    loginStudent
);

router.post(
    "/reset-password",
    resetStudentPassword
);


/* =========================================================
   STUDENT ELECTIONS
========================================================= */

router.get(
    "/elections",
    getElections
);


/* =========================================================
   ADMIN / STUDENT MANAGEMENT
========================================================= */

router.get(
    "/",
    getStudents
);

router.post(
    "/",
    addStudent
);

router.put(
    "/:id",
    updateStudent
);

router.delete(
    "/:id",
    deleteStudent
);


module.exports = router;