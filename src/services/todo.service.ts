import db from '../db';
import * as v from 'valibot';
import { todoSchema,updateBodySchema } from '../schemas/todo.schema';
export type Todo = v.InferOutput<typeof todoSchema>;
export type UpdateTodo = v.InferOutput<typeof updateBodySchema>;

export const TodoService = {
  getOne: (id: number) => {
    return db.query("SELECT * FROM todos WHERE id = ?").get(id);
  },

  getAll: () => {
    return db.query("SELECT * FROM todos").all();
  },

  create: (todo: Todo) => {
    return db.query(
      "INSERT INTO todos (title, content, due_date) VALUES (?, ?, ?) RETURNING *"
    ).get(todo.title, todo.content ?? null, todo.due_date ?? null);
  },

  update: (id: number, changes: UpdateTodo) => {
    return db.query(
      `UPDATE todos SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        due_date = COALESCE(?, due_date),
        done = COALESCE(?, done)
      WHERE id = ?
      RETURNING *`
    ).get(
      changes.title ?? null,
      changes.content ?? null,
      changes.due_date ?? null,
      changes.done === undefined ? null : (changes.done ? 1 : 0),
      id
    );
  },

  delete: (id: number | null) => {
    if (id) {
      db.query(`DELETE FROM todos WHERE id = ?`).run(id);
    } else {
      db.query(`DELETE FROM todos`).run();
    }
  }
};