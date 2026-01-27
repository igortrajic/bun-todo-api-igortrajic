import { TodoService } from './src/services/todo.service';
import * as v from 'valibot';
import { todoSchema, updateBodySchema } from './src/schemas/todo.schema';

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Prefer"
};

const parseId = (url: URL): number | null => {
  const idParam = url.searchParams.get('id');
  if (!idParam) return null;
  const numStr = idParam.startsWith('eq.') ? idParam.slice(3) : idParam;
  const parsed = parseInt(numStr, 10);
  return isNaN(parsed) ? null : parsed;
};

const server = Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    if (url.pathname === "/" || url.pathname === "/todos") {
      const id = parseId(url);

      if (method === "GET") {
        try {
          if (id) {
            const todo = TodoService.getOne(id);
            return Response.json(todo ? [todo] : [], { headers });
          }
          return Response.json(TodoService.getAll(), { headers });
        } catch (error) {
          return new Response("Failed to fetch todos", { status: 500, headers });
        }
      }

      if (method === "POST") {
        try {
          const body = await req.json();
          const validated = v.parse(todoSchema, body);
          const result = TodoService.create(validated);
          return Response.json([result], { status: 201, headers });
        } catch (err) {
          return Response.json({ error: "Invalid Input" }, { status: 400, headers });
        }
      }

      if (method === "PATCH") {
        if (!id) return new Response("Missing ID", { status: 400, headers });
        try {
          const body = await req.json();
          const changes = v.parse(updateBodySchema, body);
          const updated = TodoService.update(id, changes);
          return Response.json([updated], { status: 200, headers });
        } catch (err) {
          return new Response("Server Error", { status: 500, headers });
        }
      }

      if (method === "DELETE") {
        TodoService.delete(id);
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