const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "univote.db");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

console.log("UniVote SQLite database connected");
console.log("Database:", dbPath);


/* =========================================================
   CREATE DATABASE TABLES
========================================================= */

db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        matric_number TEXT NOT NULL UNIQUE,
        email TEXT UNIQUE,
        password TEXT,
        level TEXT,
        department TEXT,
        has_voted INTEGER DEFAULT 0,
        voted_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_registered INTEGER NOT NULL DEFAULT 0,
        registered_at TEXT,
        is_eligible INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS elections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        election_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        department TEXT,
        level TEXT,
        photo TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (election_id)
            REFERENCES elections(id)
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        election_id INTEGER NOT NULL,
        candidate_id INTEGER NOT NULL,
        submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id)
            REFERENCES students(id)
            ON DELETE CASCADE,

        FOREIGN KEY (election_id)
            REFERENCES elections(id)
            ON DELETE CASCADE,

        FOREIGN KEY (candidate_id)
            REFERENCES candidates(id)
            ON DELETE CASCADE
    );

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
    );
`);

console.log("UniVote database tables created successfully");


/* =========================================================
   DATABASE MIGRATION
========================================================= */

function addColumnIfMissing(table, column, definition) {

    const columns = db
        .prepare(`PRAGMA table_info(${table})`)
        .all();

    const exists = columns.some(
        item => item.name === column
    );

    if (!exists) {

        db.exec(`
            ALTER TABLE ${table}
            ADD COLUMN ${column} ${definition}
        `);

        console.log(
            `Added ${column} column to ${table}`
        );
    }
}


/* =========================================================
   STUDENT MIGRATIONS
========================================================= */

addColumnIfMissing(
    "students",
    "password",
    "TEXT"
);

addColumnIfMissing(
    "students",
    "is_registered",
    "INTEGER NOT NULL DEFAULT 0"
);

addColumnIfMissing(
    "students",
    "registered_at",
    "TEXT"
);

addColumnIfMissing(
    "students",
    "is_eligible",
    "INTEGER NOT NULL DEFAULT 0"
);


/* =========================================================
   ADMIN RESET MIGRATIONS
========================================================= */

addColumnIfMissing(
    "admin_settings",
    "admin_email",
    "TEXT"
);

addColumnIfMissing(
    "admin_settings",
    "reset_code_hash",
    "TEXT"
);

addColumnIfMissing(
    "admin_settings",
    "reset_expires_at",
    "TEXT"
);

addColumnIfMissing(
    "admin_settings",
    "reset_attempts",
    "INTEGER NOT NULL DEFAULT 0"
);

addColumnIfMissing(
    "admin_settings",
    "reset_requested_at",
    "TEXT"
);

addColumnIfMissing(
    "admin_settings",
    "updated_at",
    "TEXT"
);


/* =========================================================
   EXPORT DATABASE
========================================================= */

module.exports = db;