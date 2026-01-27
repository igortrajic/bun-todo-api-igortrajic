import * as v from 'valibot';

export const todoSchema = v.object({
  title: v.pipe(v.string(), v.transform(s => s.trim()), v.minLength(1, "Title is required")),
  content: v.optional(v.string()),
  due_date: v.optional(v.pipe(v.string(), v.isoDate()))
});

export const updateBodySchema = v.intersect([
  v.partial(todoSchema),
  v.object({
    done: v.optional(v.boolean())
  })
]);