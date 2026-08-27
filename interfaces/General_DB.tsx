export interface MetodosPago {
  id: number;
  nombre: string;
  tipo: string;
}

export interface Saldos {
  id: number;
  cuenta_id: number;
  saldo_actual: number;
  fecha_hora: string;
}

export interface Movimientos {
  id: number;
  cuenta_id: number;
  tipo_movimiento: string;
  monto: number;
  concepto: string;
  fecha_hora: string;
}

export interface Suscripciones {
  id: number;
  nombre: string;
  costo: number;
  estatus: number;
  dia_cobro: number;
  fecha_creacion: string;
}

export interface NoRecurrentes {
  id: number;
  nombre: string;
  costo: number;
  estatus: number;
}

export interface Deudas {
  id: number;
  nombre_acreedor: string;
  duracion_meses: number;
  importe_por_periodo: number;
  importe_pagado: number;
  importe_total: number;
  estatus: number;
}
