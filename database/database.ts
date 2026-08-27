import { type SQLiteDatabase } from "expo-sqlite";

export const dbName = "finanzas.db";

export async function iniciarBaseDeDatos(db: SQLiteDatabase) {
  try {
    // Habilitar configuraciones globales de SQLite en cada conexión
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

    // 1. Obtener la versión actual almacenada en la base de datos
    const result = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    );
    let currentVersion = result?.user_version ?? 0;

    console.log(`Versión actual de la BD: ${currentVersion}`);

    // =========================================================================
    // VERSIÓN 1: Esquema Base Completo
    // =========================================================================
    if (currentVersion === 0) {
      await db.execAsync(`
        -- 1. CATÁLOGO DE MÉTODOS DE PAGO / CUENTAS
        CREATE TABLE IF NOT EXISTS cuentas_metodos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE
        );

        -- 2. HISTORIAL DE SALDOS
        CREATE TABLE IF NOT EXISTS historial_saldos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            saldo_actual REAL NOT NULL,
            fecha_hora TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE
        );

        -- 3. TABLA DE MOVIMIENTOS DETALLADOS
        CREATE TABLE IF NOT EXISTS movimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            tipo_movimiento TEXT NOT NULL,
            monto REAL NOT NULL,
            concepto TEXT NOT NULL,
            fecha_hora TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE
        );

        -- 4. TABLA DE SUSCRIPCIONES
        CREATE TABLE IF NOT EXISTS suscripciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            costo REAL NOT NULL,
            estatus INTEGER DEFAULT 1,
            dia_cobro INTEGER NOT NULL,
            fecha_creacion TEXT DEFAULT (datetime('now', 'localtime'))
        );

        -- 5. TABLA DE PAGOS NO RECURRENTES
        CREATE TABLE IF NOT EXISTS pagos_no_recurrentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            costo REAL NOT NULL,
            estatus INTEGER DEFAULT 1
        );

        -- 6. TABLA DE DEUDAS
        CREATE TABLE IF NOT EXISTS deudas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre_acreedor TEXT NOT NULL,
            duracion_meses INTEGER,
            importe_por_periodo REAL,
            importe_pagado REAL DEFAULT 0.0,
            importe_total REAL NOT NULL,
            estatus INTEGER DEFAULT 1
        );
      `);

      // Seed inicial de cuentas de pago
      await db.execAsync(`
        INSERT OR IGNORE INTO cuentas_metodos (nombre) VALUES ('Mercado Pago'), ('BBVA'), ('Efectivo');
      `);
      console.log("Métodos de pago iniciales registrados.");

      // Actualizar la versión a 1
      currentVersion = 1;
      await db.execAsync("PRAGMA user_version = 1");
    }

    // =========================================================================
    // VERSIÓN 2: Ejemplo de migración futura
    // =========================================================================

    if (currentVersion === 1) {
      await db.execAsync(`
        ALTER TABLE cuentas_metodos ADD COLUMN tipo TEXT NOT NULL DEFAULT 'DEBITO';
      `);

      currentVersion = 2;
      await db.execAsync("PRAGMA user_version = 2");
      console.log("Base de datos migrada a la Versión 2.");
    }

    if (currentVersion === 2) {
      await db.execAsync(`
        ALTER TABLE cuentas_metodos ALTER COLUMN tipo TEXT NOT NULL DEFAULT 'Débito';
      `);

      currentVersion = 3;
      await db.execAsync("PRAGMA user_version = 3");
      console.log("Base de datos migrada a la Versión 3.");
    }

    console.log("Base de datos lista y sincronizada.");
  } catch (error) {
    console.error("Error al inicializar la base de datos", error);
  }
}
