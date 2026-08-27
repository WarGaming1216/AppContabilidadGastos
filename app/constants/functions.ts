export function formatearTexto(texto: string): string {
  if (!texto) return "";

  const textoLimpio = texto.replace(/_/g, " ").toLowerCase();
  return textoLimpio.charAt(0).toUpperCase() + textoLimpio.slice(1);
}
