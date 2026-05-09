import * as duckdb from '@duckdb/duckdb-wasm';

let db: duckdb.AsyncDuckDB | null = null;
let initPromise: Promise<duckdb.AsyncDuckDB> | null = null;

export async function getDB(): Promise<duckdb.AsyncDuckDB> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const CDN_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(CDN_BUNDLES);

    // Fetch the worker script and create a same-origin Blob URL to bypass
    // cross-origin Worker restrictions in sandboxed/credentialless environments.
    const workerText = await fetch(bundle.mainWorker!).then((r) => r.text());
    const workerBlob = new Blob([workerText], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    const logger = new duckdb.VoidLogger();
    const instance = new duckdb.AsyncDuckDB(logger, worker);
    await instance.instantiate(bundle.mainModule, bundle.pthreadWorker);
    db = instance;
    return db;
  })();

  return initPromise;
}

export async function query<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const instance = await getDB();
  const conn = await instance.connect();
  try {
    const result = await conn.query(sql);
    return result.toArray().map((row) => row.toJSON() as T);
  } finally {
    await conn.close();
  }
}

export async function exec(sql: string): Promise<void> {
  const instance = await getDB();
  const conn = await instance.connect();
  try {
    await conn.query(sql);
  } finally {
    await conn.close();
  }
}

/** Escape a string value for safe embedding in DuckDB SQL literals. */
export function esc(value: unknown): string {
  return String(value ?? '').replace(/'/g, "''");
}
