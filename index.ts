import db from './db';
import * as v from 'valibot';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Prefer"
};

const todoSchema = v.object({
  title: v.pipe(v.string(), v.transform(s => s.trim()), v.minLength(1, "Title is required")),
  content: v.optional(v.string()),
  due_date: v.optional(v.pipe(v.string(), v.isoDate()))
});

const updateBodySchema = v.intersect([
  v.partial(todoSchema),
  v.object({
    done: v.optional(v.boolean())
  })
]);

const parseId = (url: URL): number | null => {
  const idParam = url.searchParams.get('id');
  if (!idParam) return null;
  
  if (idParam.startsWith('eq.')) {
    const numStr = idParam.slice(3); 
    const parsed = parseInt(numStr, 10);
    return isNaN(parsed) ? null : parsed;
  }
  
  const parsed = parseInt(idParam, 10);
  return isNaN(parsed) ? null : parsed;
};


const server = Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    if (url.pathname === "/" || url.pathname === "/todos") {
      const id = parseId(url)


      if (method === "GET") {
        try {
          if(id){
          const todo = db.query("SELECT * FROM todos WHERE id = ?").get(id);
          return Response.json(todo ? [todo] : [], { headers });
          } else {
              const todos = db.query("SELECT * FROM todos").all();
              return Response.json(todos, { headers });
          }
        } catch (error) {
          return new Response("Failed to fetch todos", { status: 500, headers });
        }
      }

      if (method === "POST") {
        try {
          const body = await req.json();
          const todo = v.parse(todoSchema, body);
          const info = db.query(
            "INSERT INTO todos (title, content, due_date) VALUES (?, ?, ?)"
          ).run(todo.title, todo.content ?? null, todo.due_date ?? null);
          return Response.json(
            [{ ...todo, id: info.lastInsertRowid, done: false }], 
            { status: 201, headers }
          );
        } catch (err) {
          return Response.json({ error: "Invalid Input" }, { status: 400, headers });
        }
      }

      if (method === "PATCH") {
        if (!id) return new Response("Missing ID", { status: 400, headers });

        try {
          const body = await req.json();
          const changes = v.parse(updateBodySchema, body);

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

          const updatedTodo = db.query("SELECT * FROM todos WHERE id = ?").get(id);
          return Response.json([updatedTodo], { status: 200, headers });
        } catch (err) {
          return new Response("Server Error", { status: 500, headers });
        }
      }

      if (method === "DELETE") {

        if (id) {
          db.query(`DELETE FROM todos WHERE id = ?`).run(id);
        } else {
          db.query(`DELETE FROM todos`).run();
        }
        return new Response(null, { status: 204, headers });
      }

      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }
    }

    return new Response("Not Found", { status: 404, headers });
  }
});

console.log(`Listening on ${server.url}`);