import { type SQLiteDatabase } from "expo-sqlite";

export const dbName = "finanzas.db";

export async function iniciarBaseDeDatos(db: SQLiteDatabase) {
  try {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS gastos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            monto TEXT NOT NULL,
            es_suscripcion INTEGER DEFAULT 0,
            esta_activo INTEGER DEFAULT 1,
            fecha TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos", error);
  }
}
