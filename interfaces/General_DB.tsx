export interface MetodosPago {
  id: number;
  nombre: string;
  limite: number;
  tipo_cuenta: number;
}

export interface Saldos {
  id: number;
  cuenta_id: number;
  saldo_actual: number;
  fecha_hora: Date;
}

export interface Movimientos {
  id: number;
  cuenta_id: number;
  tipo_movimiento: number;
  monto: number;
  concepto: string;
  fecha_hora: Date;
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

export interface TipoMov {
  id: number;
  tipo_mov: string;
}

export interface TipoCuenta {
  id: number;
  tipo_cuenta: string;
}
