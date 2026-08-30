export function formatearTexto(texto: string): string {
  if (!texto) return "";

  const textoLimpio = texto.replace(/_/g, " ").toLowerCase();
  return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
}

export function formatearMoneda(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
}

export function formatearFecha(
  fecha: Date | string | null | undefined,
): string {
  if (!fecha) return "--/--/--";

  // Si es un string (como los que regresa SQLite), creamos el objeto Date
  const dateObj = typeof fecha === "string" ? new Date(fecha) : fecha;

  // Validar si es una fecha real/válida en JS
  if (isNaN(dateObj.getTime())) {
    return "--/--/--";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(dateObj);
}
