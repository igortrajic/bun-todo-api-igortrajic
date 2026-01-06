import { Database } from "bun:sqlite";

const db = new Database("mydb.sqlite", { create: true });

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS todos (
    id integer primary key autoincrement,
    title text not null,
    content text,
    due_date text,
    done boolean default 0
  );
`;

db.query(createTableQuery).run();

export default db;