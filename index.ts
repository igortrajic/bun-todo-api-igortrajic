import index from './index.html'; 
import db from './db';
import * as v from 'valibot'


const todoSchema = v.object({
  title: v.pipe(
    v.string(),
    v.transform(s => s.trim()),
    v.minLength(1, "Title is required")
  ),
  description: v.optional(v.string()),
  date: v.optional(v.string())
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

          db.query(
            "INSERT INTO todos (title, content, due_date) VALUES (?, ?, ?)"
          ).run(
            todo.title,
            todo.description ?? null,
            todo.date ?? null
          );

          return Response.json({ success: true, todo }, { status: 201 });
        } catch (err) {
          if (err instanceof v.ValiError) {
            return Response.json(
              { success: false, error: "Invalid todo" },
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