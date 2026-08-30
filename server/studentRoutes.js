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
    getElections,
    getElection
} = require("./studentContoller");


/* =========================================================
   STUDENT AUTHENTICATION
========================================================= */


/*
   Student creates their account
   POST /api/students/register
*/
router.post(
    "/register",
    registerStudent
);


/*
   Student login
   POST /api/students/login
*/
router.post(
    "/login",
    loginStudent
);


/*
   Student password reset
   POST /api/students/reset-password
*/
router.post(
    "/reset-password",
    resetStudentPassword
);


/* =========================================================
   ELECTIONS
========================================================= */


/*
   Get all available elections
   GET /api/students/elections
*/
router.get(
    "/elections",
    getElections
);


/*
   Get a single election
   GET /api/students/elections/:id
*/
router.get(
    "/elections/:id",
    getElection
);


/* =========================================================
   ADMIN / STUDENT MANAGEMENT
========================================================= */


/*
   Get all students
   GET /api/students
*/
router.get(
    "/",
    getStudents
);


/*
   Manual student creation
   POST /api/students

   Kept as an optional admin function.
*/
router.post(
    "/",
    addStudent
);


/*
   Update student / eligibility
   PUT /api/students/:id

   Example:
   {
       "eligible": true
   }

   makes the student eligible to vote.
*/
router.put(
    "/:id",
    updateStudent
);


/*
   Delete student
   DELETE /api/students/:id
*/
router.delete(
    "/:id",
    deleteStudent
);


module.exports = router;