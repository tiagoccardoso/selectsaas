import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cachedSql: NeonQueryFunction<false, false> | null = null;

function getSql() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada. Configure a conexão do Neon nas variáveis de ambiente.");
  }

  if (!cachedSql) {
    cachedSql = neon(databaseUrl);
  }

  return cachedSql;
}

export async function sql<T = Record<string, unknown>[]>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T> {
  const result = await getSql()(strings, ...values);
  return result as T;
}
