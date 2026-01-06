import index from './index.html'; 
import db from './db';

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
    "/todos": {
        GET: () => {
      const todos = db.query("SELECT * FROM todos").all();
      return Response.json(todos);
    }
    }
  },


});

console.log(`Listening on ${server.url}`);