import db from "./db";

export function seedTodos() {
  const insertTodo = db.query(`
    INSERT INTO todos (title, content, due_date, done)
    VALUES (?, ?, ?, ?)
  `);

  insertTodo.run(
    "Acheter des courses",
    "Lait, œufs, pain, fruits",
    "2026-01-10",
    0
  );

  insertTodo.run(
    "Finir le rapport",
    "Finaliser et envoyer au manager",
    "2026-01-12",
    0
  );

  insertTodo.run(
    "Faire du sport",
    "30 minutes de cardio",
    "2026-01-07",
    1
  );

  insertTodo.run(
    "Lire un livre",
    "Lire 50 pages",
    null,
    0
  );

  console.log("✅ Données insérées avec succès");
}

seedTodos();