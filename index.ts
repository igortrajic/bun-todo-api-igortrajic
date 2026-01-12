import index from './index.html'; 
import db from './db';
import * as v from 'valibot'


const todoSchema = v.object({
  title: v.pipe(
    v.string(),
    v.transform(s => s.trim()),
    v.minLength(1, "Title is required")
  ),
  content: v.optional(v.string()),
  date: v.optional(v.pipe(v.string(), v.isoDate()))
});

const updateTodoSchema = v.object({
  title: v.optional(
  v.pipe(
    v.string(),
    v.transform(s => s.trim()),
    v.minLength(1, "Title is required")
  ),
),
  content: v.optional(v.string()),
  date: v.optional(v.pipe(v.string(), v.isoDate())),
  done: v.optional(v.boolean()),
  id: v.number() 
});

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/todos": {
      GET: () => {
        try {
              const todos = db.query("SELECT * FROM todos").all();
              return Response.json(todos);
            } catch (error) {
                console.error("Failed to fetch todos:", error);
                return new Response("Failed to fetch todos", { status: 500 });
            }
        },
      POST: async (req) => {
        try {
          const body = await req.json();
          const todo = v.parse(todoSchema, body);

          const info = db.query(
            "INSERT INTO todos (title, content, due_date) VALUES (?, ?, ?)"
          ).run(
            todo.title,
            todo.content ?? null,
            todo.date ?? null
          );

          return Response.json({ 
            success: true, 
            todo: { ...todo, id: info.lastInsertRowid } 
          }, { status: 201 });
        } catch (err) {
          if (err instanceof v.ValiError) {
            return Response.json(
              { success: false, error: "Invalid todo", issues: err.issues },
              { status: 400 }
            );
          }

          console.error(err);
          return Response.json(
            { success: false, error: "Server error" },
            { status: 500 }
          );
        }
      },
      PATCH: async (req) => {
        try {
          const body = await req.json();
          const todo = v.parse(updateTodoSchema, body);

          const info = db.query(
            "UPDATE todos set title = COALESCE(?,title),content = COALESCE(?,content), due_date = COALESCE(?,due_date), done = COALESCE(?,done) WHERE id = ?"
          ).run(
            todo.title ?? null,
            todo.content ?? null,
            todo.date ?? null,
            todo.done === undefined ? null : (todo.done ? 1 : 0),
            todo.id
          );
          if (info.changes === 0) {
            return Response.json(
              { success: false, error: "Todo not found" }, 
              { status: 404 }
            );
          }
          return Response.json({ success: true, todo }, { status: 200 });
        } catch (err) {
          if (err instanceof v.ValiError) {
            return Response.json(
              { success: false, error: "Invalid todo", issues: err.issues },
              { status: 400 }
            );
          }

          console.error(err);
          return Response.json(
            { success: false, error: "Server error" },
            { status: 500 }
          );
        }
      }
    }
  }
});

console.log(`Listening on ${server.url}`);