const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const db = require("./database");
const resetAdminPassword = require("./reset-admin-password");
const studentRoutes = require("./studentRoutes");
const adminRoutes = require("./adminRoutes");

const app = express();
resetAdminPassword();
const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

/* =========================================================
   FRONTEND
========================================================= */

// Main project files
app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

// Admin frontend
app.use(
    "/admin-site",
    express.static(
        path.join(__dirname, "..", "admin-site")
    )
);

// Student frontend
app.use(
    "/student-site",
    express.static(
        path.join(__dirname, "..", "student-site")
    )
);

/* =========================================================
   STUDENT API
========================================================= */

app.use(
    "/api/students",
    studentRoutes
);

/* =========================================================
   ADMIN API
========================================================= */

app.use(
    "/api/admin",
    adminRoutes
);

/* =========================================================
   DATABASE TEST
========================================================= */

app.get("/api/test", (req, res) => {

    try {

        const result = db
            .prepare("SELECT 1 AS connected")
            .get();

        return res.json({

            success: true,

            message:
                "Election backend and SQLite database are connected 🚀",

            database:
                result.connected === 1
                    ? "connected"
                    : "error"

        });

    } catch (error) {

        console.error(
            "Database test error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Database connection failed."

        });

    }

});

/* =========================================================
   API 404 HANDLER
========================================================= */

app.use("/api", (req, res) => {

    return res.status(404).json({

        success: false,

        message:
            "API route not found."

    });

});

/* =========================================================
   SERVER ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {

    console.error(
        "Server error:",
        error
    );

    return res.status(500).json({

        success: false,

        message:
            "Internal server error."

    });

});

/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 UniVote backend running on http://localhost:${PORT}`
        );

    }
);