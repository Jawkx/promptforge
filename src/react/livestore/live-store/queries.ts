import { queryDb, Schema, sql } from "@livestore/livestore";
import { tables } from "./tables";

const LabelSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  color: Schema.String,
});

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
  return tables.labels.orderBy("name", "asc");
});

export const preferences$ = queryDb(() => {
  return tables.preferences;
});
