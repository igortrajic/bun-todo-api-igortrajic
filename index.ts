import index from './index.html'; 
import db from './db';

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
        }
    }
  },


});

console.log(`Listening on ${server.url}`);