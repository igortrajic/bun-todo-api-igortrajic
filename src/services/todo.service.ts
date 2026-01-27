import db from '../db';

export const TodoService = {
  getOne: (id: number) => {
    return db.query("SELECT * FROM todos WHERE id = ?").get(id);
  },

  getAll: () => {
    return db.query("SELECT * FROM todos").all();
  },

  create: (todo: any) => {
    const info = db.query(
      "INSERT INTO todos (title, content, due_date) VALUES (?, ?, ?)"
    ).run(todo.title, todo.content ?? null, todo.due_date ?? null);
    
    return { ...todo, id: info.lastInsertRowid, done: false };
  },

  update: (id: number, changes: any) => {
    db.query(
      `UPDATE todos SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        due_date = COALESCE(?, due_date),
        done = COALESCE(?, done)
      WHERE id = ?`
    ).run(
      changes.title ?? null,
      changes.content ?? null,
      changes.due_date ?? null,
      changes.done === undefined ? null : (changes.done ? 1 : 0),
      id
    );
    return db.query("SELECT * FROM todos WHERE id = ?").get(id);
  },

  delete: (id: number | null) => {
    if (id) {
      db.query(`DELETE FROM todos WHERE id = ?`).run(id);
    } else {
      db.query(`DELETE FROM todos`).run();
    }
  }
};