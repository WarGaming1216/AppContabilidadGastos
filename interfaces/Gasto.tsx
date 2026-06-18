export interface Gasto {
  id: number;
  titulo: string;
  monto: number;
  es_suscripcion: number;
  esta_activo: number;
  fecha: string;
}

export interface MetodosPago {
  id: number;
  nombre: string;
}