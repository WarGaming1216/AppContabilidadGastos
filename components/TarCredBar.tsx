import { formatearMoneda } from "@/constants/functions";
import globalStyles from "@/constants/styles";
import { Text, View } from "react-native";

interface TarjetaCreditoProps {
  nombreCuenta: string;
  limite: number;
  gasto: number;
  fecha_corte: number;
}

export default function TarCredBar({
  nombreCuenta,
  limite,
  gasto,
  fecha_corte,
}: TarjetaCreditoProps) {
  const date = new Date();
  const dia: number = date.getDate();
  const disponible = Math.max(0, limite - gasto);

  const porcentajeDis = Math.min(100, Math.max(0, (disponible / limite) * 100));

  const obtenerColorBarra = () => {
    if (porcentajeDis < 15) return "#FF5252";
    if (porcentajeDis < 40) return "#FFB74D";
    return "#72C84D";
  };

  const obtenerMesCorte = () => {
    if (dia < fecha_corte) {
      return new Intl.DateTimeFormat("es-MX", { month: "short" }).format(date);
    } else {
      return new Intl.DateTimeFormat("es-MX", { month: "short" }).format(
        date.getMonth() + 1,
      );
    }
  };

  const obtenerColorCorte = () => {
    if (dia === fecha_corte) return "#FF5252";
    if (dia < fecha_corte) return "#FFB74D";
    return "#72C84D";
  };

  return (
    <View style={globalStyles.tarjetaContenedor}>
      <View style={globalStyles.encabezado_progreso}>
        <Text style={globalStyles.titulo}>{nombreCuenta}</Text>
        <Text style={[globalStyles.subtitulo, { color: obtenerColorCorte() }]}>
          {fecha_corte > 0 ? `Corte: ${fecha_corte} ${obtenerMesCorte()}` : ""}
        </Text>
      </View>

      <View>
        <Text style={[globalStyles.dark, globalStyles.label]}>
          {formatearMoneda(gasto)}
        </Text>
      </View>

      <View style={globalStyles.barraFondo}>
        <View
          style={[
            globalStyles.barraRelleno,
            {
              width: `${porcentajeDis}%`,
              backgroundColor: obtenerColorBarra(),
            },
          ]}
        />
      </View>

      <Text style={globalStyles.textoLimite}>
        {formatearMoneda(disponible)} disponible de un límite de{" "}
        {formatearMoneda(limite)}
      </Text>
    </View>
  );
}
