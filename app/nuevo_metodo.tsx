import MyInput from "@/components/MyInput";
import { Text } from "@react-navigation/elements";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { ScrollView, TouchableOpacity, useColorScheme } from "react-native";
import { globalStyles } from "./constants/styles";

export default function NuevoMetodo() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [metodo, setMetodo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const db = useSQLiteContext();

  const handleGuardar = async () => {
    if (!metodo.trim()) {
      setMensaje("El nombre del método no puede estar vacio.");
      return;
    }

    const res = await guardarMetodo(metodo);

    if (res && res.changes > 0) {
      setMensaje(
        `Método ${metodo} guardado con éxito (ID: ${res.lastInsertRowId})`,
      );
      setMetodo("");
    } else {
      setMensaje("Error: No se pudo guardar el método.");
    }
  };

  async function guardarMetodo(metodo: string) {
    try {
      const result = await db.runAsync(
        `INSERT INTO cuentas_metodos (nombre) VALUES (?)`,
        [metodo],
      );
      return result; // Devuelve { lastInsertRowId: number, changes: number }
    } catch (error) {
      console.error("Error al insertar:", error);
      return null;
    }
  }

  return (
    <ScrollView style={globalStyles.container}>
      <Text
        style={[
          globalStyles.label,
          isDark ? globalStyles.dark : globalStyles.light,
        ]}
      >
        Nombre:
      </Text>
      <MyInput placeholder="Método" value={metodo} onChangeText={setMetodo} />
      <TouchableOpacity style={globalStyles.boton} onPress={handleGuardar}>
        <Text style={globalStyles.boton_text}>Guardar Método</Text>
      </TouchableOpacity>

      {mensaje ? (
        <Text style={isDark ? globalStyles.dark : globalStyles.light}>
          {mensaje}
        </Text>
      ) : null}
    </ScrollView>
  );
}
