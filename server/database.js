const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "univote.db");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

console.log("✅ UniVote SQLite database connected");
console.log("📁 Database:", dbPath);


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
            `✅ Added ${column} column to ${table}`
        );

    }

}


/* =========================================================
   STUDENT ACCOUNT COLUMNS
========================================================= */

/*
   Student password.

   IMPORTANT:
   The student controller uses:
       students.password

   So this column must exist.
*/

addColumnIfMissing(
    "students",
    "password",
    "TEXT"
);


/*
   Keeps track of whether the student
   has completed registration.
*/

addColumnIfMissing(
    "students",
    "is_registered",
    "INTEGER NOT NULL DEFAULT 0"
);


/*
   Stores when the student registered.
*/

addColumnIfMissing(
    "students",
    "registered_at",
    "TEXT"
);


/*
   Controls whether the student is
   allowed to vote.

   0 = Not eligible
   1 = Eligible
*/

addColumnIfMissing(
    "students",
    "is_eligible",
    "INTEGER NOT NULL DEFAULT 0"
);


/* =========================================================
   EXPORT DATABASE
========================================================= */

module.exports = db;