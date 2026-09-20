import { type SQLiteDatabase } from "expo-sqlite";

export const dbName = "finanzas.db";

export async function iniciarBaseDeDatos(db: SQLiteDatabase) {
  try {
    // Habilitar configuraciones globales de SQLite en cada conexión
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);

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
            nombre TEXT NOT NULL UNIQUE,
            limite INTEGER NOT NULL DEFAULT 0,
            tipo_cuenta INTEGER NOT NULL,
            FOREIGN KEY (tipo_cuenta) REFERENCES tipo_cuenta(id) ON DELETE CASCADE
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
            tipo_movimiento INTEGER NOT NULL,
            monto REAL NOT NULL,
            concepto TEXT NOT NULL,
            fecha_hora TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE,
            FOREIGN KEY (tipo_movimiento) REFERENCES tipo_movimiento(id) ON DELETE CASCADE
        );

        -- 4. TABLA DE SUSCRIPCIONES
        CREATE TABLE IF NOT EXISTS suscripciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            costo REAL NOT NULL,
            estatus INTEGER DEFAULT 1,
            dia_cobro INTEGER NOT NULL,
            fecha_creacion TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE
        );

        -- 5. TABLA DE PAGOS NO RECURRENTES
        CREATE TABLE IF NOT EXISTS pagos_no_recurrentes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            costo REAL NOT NULL,
            estatus INTEGER DEFAULT 1,
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE
        );

        -- 6. TABLA DE DEUDAS
        CREATE TABLE IF NOT EXISTS deudas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            nombre_acreedor TEXT NOT NULL,
            duracion_meses INTEGER,
            importe_por_periodo REAL,
            importe_pagado REAL DEFAULT 0.0,
            importe_total REAL NOT NULL,
            estatus INTEGER DEFAULT 1,
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE
        );

        -- 7. TABLA DE TIPOS DE CUENTAS
        CREATE TABLE IF NOT EXISTS tipo_cuenta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_cuenta TEXT NOT NULL UNIQUE
        );

        -- 8. TABLA DE TIPOS DE MOVIMIENTOS
        CREATE TABLE IF NOT EXISTS tipo_movimiento (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo_mov TEXT NOT NULL UNIQUE
        );

        -- 9. TABLA DE CATEGORÍAS
        CREATE TABLE IF NOT EXISTS categorias(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria TEXT NOT NULL UNIQUE,
            tipo TEXT NOT NULL
        )
      `);

      await db.execAsync(`
        INSERT OR IGNORE INTO tipo_cuenta(tipo_cuenta) VALUES ('Débito'), ('Crédito'), ('Efectivo');
        INSERT OR IGNORE INTO tipo_movimiento(tipo_mov) VALUES ('Gasto'), ('Pago automático'), ('Pago adelantado'), ('Devolución'), ('Ingreso');
        INSERT OR IGNORE INTO categorias(categoria, tipo) VALUES ('Abarrotes', 'Gasto'), ('Entretenimiento', ' Gasto'), ('Servicios', 'Gasto'), ('Suscripciones', 'Gasto'), ('Bonos', 'Ingreso'), ('Inversiones', 'Ingreso'), ('Otros', 'Ingreso');
      `);
      console.log("Tipos de cuentas y movimientos iniciales registrados.");

      // Seed inicial de cuentas de pago
      await db.execAsync(`
        INSERT OR IGNORE INTO cuentas_metodos (nombre, limite, tipo_cuenta) VALUES ('Mercado Pago', '13500', 2), ('BBVA', '0', 1), ('Nu', '0', 1), ('Efectivo', '0', 3);
      `);
      console.log("Métodos de pago iniciales registrados.");

      // Actualizar la versión a 1
      currentVersion = 1;
      await db.execAsync("PRAGMA user_version = 1");
    }

    console.log("Base de datos lista y sincronizada.");
  } catch (error) {
    console.error("Error al inicializar la base de datos", error);
  }
}
