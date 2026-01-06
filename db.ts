import { Database } from "bun:sqlite";

export function setupDatabase(): Database {
  const dbPath = process.env.DB_PATH || "mydb.sqlite";
  try {
    const db = new Database(dbPath, { create: true });

    const createTableQuery = `
      create table if not exists todos (
        id integer primary key autoincrement,
        title text not null,
        content text,
        due_date text,
        done boolean default 0
      );
    `;

    db.query(createTableQuery).run();
    console.log(`Database initialized at ${dbPath}`);
    return db;
  } catch (error) {
    console.error(`Failed to initialize database at ${dbPath}:`, error);
    process.exit(1);
  }
}

const db = setupDatabase();

export default db;