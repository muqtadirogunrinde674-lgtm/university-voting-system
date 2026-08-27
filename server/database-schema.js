const db = require("./database");

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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
`);

console.log("✅ UniVote database tables created successfully");