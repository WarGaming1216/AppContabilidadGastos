import { type SQLiteDatabase } from "expo-sqlite";

export const dbName = "finanzas.db";

export async function iniciarBaseDeDatos(db: SQLiteDatabase) {
  try {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        -- 1. CATÁLOGO DE MÉTODOS DE PAGO / CUENTAS
        CREATE TABLE IF NOT EXISTS cuentas_metodos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE -- 'Mercado Pago', 'BBVA', 'Efectivo'
        );

        -- 2. HISTORIAL DE SALDOS (Para BBVA y Efectivo)
        -- En lugar de registrar gastos, registras: "A las 3:00 PM mi saldo es $5,000"
        CREATE TABLE IF NOT EXISTS historial_saldos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            saldo_actual REAL NOT NULL,
            fecha_hora TEXT DEFAULT (datetime('now', 'localtime')), -- Almacena YYYY-MM-DD HH:MM:SS
            FOREIGN KEY (cuenta_id) REFERENCES cuentas_metodos(id) ON DELETE CASCADE
        );

        -- 3. TABLA DE MOVIMIENTOS DETALLADOS (Principalmente para Mercado Pago / Crédito)
        CREATE TABLE IF NOT EXISTS movimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cuenta_id INTEGER NOT NULL,
            tipo_movimiento TEXT NOT NULL, -- 'GASTO', 'PAGO_ADELANTADO', 'PAGO_AUTOMATICO', 'DEVOLUCION', 'INGRESO'
            monto REAL NOT NULL,
            concepto TEXT NOT NULL,
            fecha_hora TEXT DEFAULT (datetime('now', 'localtime')), -- Incluye hora exacta
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

    // Alimentar métodos por defecto si está vacía
    const metodosExistentes = await db.getAllAsync(
      "SELECT id FROM cuentas_metodos LIMIT 1",
    );
    if (metodosExistentes.length === 0) {
      await db.execAsync(`
        INSERT INTO cuentas_metodos (nombre) VALUES ('Mercado Pago'), ('BBVA'), ('Efectivo');
      `);
      console.log("Métodos de pago iniciales registrados.");
    }

    console.log("Base de datos adaptada al flujo de saldos y transacciones.");
  } catch (error) {
    console.error("Error al inicializar la base de datos", error);
  }
}
