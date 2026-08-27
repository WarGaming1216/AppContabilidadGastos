import MyInput from "@/components/MyInput";
import SelectorModal from "@/components/SelectorModal";
import { MetodosPago } from "@/interfaces/Gasto";
import { Text } from "@react-navigation/elements";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Trash2Icon } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { globalStyles } from "./constants/styles";

const tiposCuenta = ["Débito", "Crédito", "Efectivo"];

export default function GestionarMetodos() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [cuenta, setCuenta] = useState("");
  const [tipo, setTipo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cuentas, setCuentas] = useState<MetodosPago[]>([]);
  const [origenModal, setOrigenModal] = useState<"NUEVA" | number | null>(null);
  const [valorSeleccionado, setValorSeleccionado] = useState(
    "Selecciona un tipo de gasto",
  );
  const db = useSQLiteContext();

  const handleSeleccionarTipo = async (tipoSeleccionado: string) => {
    if (origenModal === "NUEVA") {
      // 1. Si viene del formulario "Agregar Cuenta"
      setTipo(tipoSeleccionado);
      setValorSeleccionado(tipoSeleccionado);
    } else if (typeof origenModal === "number") {
      // 2. Si viene de editar una fila existente en la tabla
      try {
        await db.runAsync("UPDATE cuentas_metodos SET tipo = ? WHERE id = ?", [
          tipoSeleccionado,
          origenModal,
        ]);
        setMensaje(`Tipo actualizado a "${tipoSeleccionado}"`);
        await cargarCuentas(); // Refresca los registros[cite: 1]
      } catch (error) {
        console.error("Error al actualizar tipo:", error);
        setMensaje("Error al actualizar el tipo de cuenta.");
      }
    }

    // Cierra el modal restableciendo el estado a null
    setOrigenModal(null);
  };

  // 1. Extraemos la función de carga para poder invocarla manualmente
  const cargarCuentas = useCallback(async () => {
    try {
      const resultMetodos = await db.getAllAsync<MetodosPago>(
        "SELECT * FROM cuentas_metodos",
      );
      setCuentas(resultMetodos);
    } catch (error) {
      console.error("Error al redefinir la lista de métodos:", error);
    }
  }, [db]);

  // Se ejecuta al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarCuentas();
    }, [cargarCuentas]),
  );

  const handleGuardar = async () => {
    if (!cuenta.trim()) {
      setMensaje("El nombre de la cuenta no puede estar vacío.");
      return;
    }

    if (!tipo.trim()) {
      setMensaje("El tipo de cuenta no puede estar vacío.");
      return;
    }

    const res = await guardarCuenta(cuenta, tipo);

    if (res && res.changes > 0) {
      setMensaje(
        `Cuenta ${cuenta} guardada con éxito (ID: ${res.lastInsertRowId})`,
      );
      setCuenta("");
      setTipo("");
      // 2. Refrescamos la lista de inmediato tras guardar
      await cargarCuentas();
    } else {
      setMensaje("Error: No se pudo guardar la cuenta.");
    }
  };

  async function guardarCuenta(cuenta: string, tipo: string) {
    try {
      const result = await db.runAsync(
        `INSERT INTO cuentas_metodos (nombre, tipo) VALUES (?, ?)`,
        [cuenta, tipo],
      );
      return result;
    } catch (error) {
      console.error("Error al insertar:", error);
      return null;
    }
  }

  async function borrarCuenta(id: number, cuenta: string) {
    Alert.alert(
      "Eliminar cuenta",
      `¿Estas seguro de querer eliminar la cuenta ${cuenta}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM cuentas_metodos WHERE id = ?", [
                id,
              ]);
              setMensaje(`Cuenta ${cuenta} eliminada con éxito.`);
              await cargarCuentas();
            } catch (error) {
              console.error("Error al eliminar la cuenta: ", error);
              setMensaje("Error. No se pudo eliminar la cuenta.");
            }
          },
        },
      ],
    );
  }

  return (
    // 3. Usamos contentContainerStyle para el contenido interno
    <>
      <ScrollView
        style={globalStyles.scrollView}
        contentContainerStyle={globalStyles.scrollContent}
      >
        <View style={globalStyles.caja}>
          <View style={{ width: "100%", marginVertical: 10 }}>
            {/* Encabezado de la tabla */}
            {cuentas && cuentas.length > 0 && (
              <View style={[globalStyles.fila, globalStyles.encabezado]}>
                <View style={globalStyles.celdaNombre}>
                  <Text
                    style={[
                      isDark ? globalStyles.dark : globalStyles.light,
                      { fontWeight: "bold" },
                    ]}
                  >
                    Cuenta
                  </Text>
                </View>
                <View style={globalStyles.celdaAcciones}>
                  <Text
                    style={[
                      isDark ? globalStyles.dark : globalStyles.light,
                      { fontWeight: "bold" },
                    ]}
                  >
                    Acción
                  </Text>
                </View>
              </View>
            )}

            {cuentas &&
              cuentas.length > 0 &&
              cuentas.map((item) => (
                <View key={item.id} style={globalStyles.fila}>
                  <View style={globalStyles.celdaNombre}>
                    <Text
                      style={isDark ? globalStyles.dark : globalStyles.light}
                    >
                      {item.nombre}
                    </Text>
                  </View>

                  <View style={globalStyles.celdaTipo}>
                    {/* Botón que asigna el ID activo para abrir el modal */}
                    <TouchableOpacity
                      style={[globalStyles.selector, globalStyles.boton_select]}
                      onPress={() => setOrigenModal(item.id)}
                    >
                      <Text style={[globalStyles.boton_text]}>
                        {item.tipo || "Tipo"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={globalStyles.celdaAcciones}
                    onPress={() => borrarCuenta(item.id, item.nombre)}
                  >
                    <Trash2Icon color={"red"} size={20} />
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        </View>

        <View style={globalStyles.caja}>
          <Text
            style={[
              globalStyles.title,
              isDark ? globalStyles.dark : globalStyles.light,
            ]}
          >
            Agregar Cuenta
          </Text>
          <Text
            style={[
              globalStyles.label,
              isDark ? globalStyles.dark : globalStyles.light,
            ]}
          >
            Nombre:
          </Text>
          <MyInput
            placeholder="Cuenta"
            value={cuenta}
            onChangeText={setCuenta}
          />
          <Text
            style={[
              globalStyles.label,
              isDark ? globalStyles.dark : globalStyles.light,
            ]}
          >
            Tipo:
          </Text>
          <View>
            <TouchableOpacity
              style={[globalStyles.selector, globalStyles.boton_select]}
              onPress={() => setOrigenModal("NUEVA")}
            >
              <Text style={[globalStyles.boton_text]}>
                {valorSeleccionado || "Selecciona un tipo de cuenta"}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={globalStyles.boton} onPress={handleGuardar}>
            <Text style={globalStyles.boton_text}>Guardar Cuenta</Text>
          </TouchableOpacity>

          {mensaje ? (
            <Text style={isDark ? globalStyles.dark : globalStyles.light}>
              {mensaje}
            </Text>
          ) : null}
        </View>
      </ScrollView>
      <SelectorModal
        visible={origenModal !== null}
        onClose={() => setOrigenModal(null)}
        titulo="Tipo de cuenta"
        opciones={tiposCuenta}
        valorSeleccionado={
          origenModal === "NUEVA"
            ? tipo
            : cuentas.find((c) => c.id === origenModal)?.tipo || ""
        }
        onSeleccionar={handleSeleccionarTipo}
        formatearOpcion="SI"
      />
    </>
  );
}
