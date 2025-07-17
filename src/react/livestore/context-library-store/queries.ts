import { queryDb, Schema, sql } from "@livestore/livestore";
import { contextLibraryTables } from "./tables";

const LabelSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  color: Schema.String,
});

// The previous version had `Schema.JsonFromString.pipe(Schema.compose(...))` which was incorrect.
// The correct way to define a schema for a field that is a JSON string is to use a JSON-parsing
// combinator. In `effect/schema`, which LiveStore uses, this is `Schema.parseJson`.
// This function takes a target schema and produces a new schema that will parse a string
// into the target type, resolving the original TypeScript errors.
const ContextWithLabelsSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  content: Schema.String,
  tokenCount: Schema.Number,
  version: Schema.String,
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
  labels: Schema.parseJson(Schema.Array(LabelSchema)),
});

const ContextsQueryResultSchema = Schema.Array(ContextWithLabelsSchema);

export const contexts$ = queryDb({
  query: sql`
      SELECT
          c.*,
          COALESCE(
              (
                  SELECT
                      json_group_array(json_object('id', l.id, 'name', l.name, 'color', l.color))
                  FROM
                      context_labels cl
                  JOIN
                      labels l ON cl.labelId = l.id
                  WHERE
                      cl.contextId = c.id
              ),
              '[]'
          ) as labels
      FROM
          contextsLibrary c
      ORDER BY c.updatedAt DESC
  `,
  schema: ContextsQueryResultSchema,
});

export const labels$ = queryDb(() => {
  return contextLibraryTables.labels.orderBy("name", "asc");
});
