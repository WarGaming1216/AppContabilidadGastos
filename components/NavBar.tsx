import globalStyles from "@/constants/styles";
import { Href, usePathname, useRouter } from "expo-router";
import {
  BanknoteCheck,
  HandCoins,
  Home,
  Landmark,
  PiggyBank,
  Settings2,
} from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const obtenerColorIcono = (ruta: string) => {
    return pathname === ruta ? "#FFFFFF" : "#bfaee0";
  };

  const obtenerSeleccionado = (ruta: string) => {
    return pathname === ruta ? globalStyles.seleccionado : undefined;
  };

  const obtenerRuta = (ruta: Href) => {
    if (pathname === ruta) return;

    router.replace(ruta);
  };

  return (
    <View style={globalStyles.contenedor}>
      <TouchableOpacity
        style={globalStyles.boton_nav}
        onPress={() => obtenerRuta("/")}
      >
        <Home color={obtenerColorIcono("/")} size={24} />
        <View style={obtenerSeleccionado("/")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.boton_nav}
        onPress={() => obtenerRuta("/metodos_pago/movimientos")}
      >
        <HandCoins
          color={obtenerColorIcono("/metodos_pago/movimientos")}
          size={24}
        />
        <View style={obtenerSeleccionado("/metodos_pago/movimientos")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.boton_nav}
        onPress={() => obtenerRuta("/saldo_inicial")}
      >
        <PiggyBank color={obtenerColorIcono("/saldo_inicial")} size={24} />
        <View style={obtenerSeleccionado("/saldo_inicial")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.boton_nav}
        onPress={() => obtenerRuta("/gestionar_cuentas")}
      >
        <Landmark color={obtenerColorIcono("/gestionar_cuentas")} size={24} />
        <View style={obtenerSeleccionado("/gestionar_cuentas")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.boton_nav}
        onPress={() => obtenerRuta("/nomina")}
      >
        <BanknoteCheck color={obtenerColorIcono("/nomina")} size={24} />
        <View style={obtenerSeleccionado("/nomina")} />
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.boton_nav}
        onPress={() => obtenerRuta("/configuraciones")}
      >
        <Settings2 color={obtenerColorIcono("/configuraciones")} size={24} />
        <View style={obtenerSeleccionado("/configuraciones")} />
      </TouchableOpacity>
    </View>
  );
}
