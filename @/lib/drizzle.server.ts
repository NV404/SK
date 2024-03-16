import { type AnyColumn, type SQLWrapper, sql } from "drizzle-orm"

export function asc(column: SQLWrapper | AnyColumn, nullsLast: boolean = true) {
  if (nullsLast) return sql`${column} asc nulls last`

  return sql`${column} asc`
}

export function desc(
  column: SQLWrapper | AnyColumn,
  nullsLast: boolean = true,
) {
  if (nullsLast) return sql`${column} desc nulls last`

  return sql`${column} desc`
}
