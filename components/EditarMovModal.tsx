import { formatearFecha } from "@/app/constants/functions";
import { View } from "lucide-react-native";
import { Text } from "react-native";

export default function EditarMovModal(
  tipo: string,
  concepto: string,
  monto: number,
  fecha: Date,
) {
  return (
    <View>
      <View>
        <Text>{tipo}</Text>
        <Text>{concepto}</Text>
        <Text>{monto}</Text>
        <Text>{formatearFecha(fecha)}</Text>
      </View>
    </View>
  );
}
