import MyInput from "@/components/MyInput";
import SelectorModal from "@/components/SelectorModal";
import { MetodosPago, TipoCuenta } from "@/interfaces/General_DB";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Trash2Icon } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import globalStyles from "../constants/styles";

export default function GestionarMetodos() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [cuenta, setCuenta] = useState("");
  const [limite, setLimite] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cuentas, setCuentas] = useState<MetodosPago[]>([]);

  const [origenModal, setOrigenModal] = useState<"NUEVA" | number | null>(null);

  // 1. Referencias para el ScrollView y para el Input
  const scrollViewRef = useRef<ScrollView>(null);
  const inputNombreRef = useRef<TextInput>(null);
  const [inputOffsetNombreY, setInputOffsetNombreY] = useState(0);
  const inputLimiteRef = useRef<TextInput>(null);
  const [inputOffsetLimiteY, setInputOffsetLimiteY] = useState(0);
  const db = useSQLiteContext();

  // Guardamos el ID numérico del tipo seleccionado para el formulario nuevo
  const [tipoIdSeleccionado, setTipoIdSeleccionado] = useState<number | null>(
    null,
  );

  // Guardamos la lista de la BD: TipoCuenta[] ({ id, tipo_cuenta })
  const [tiposDB, setTiposDB] = useState<TipoCuenta[]>([]);

  // Helper: Busca la etiqueta de texto según el ID numérico
  const obtenerNombreTipo = (id: number) => {
    const encontrado = tiposDB.find((t) => t.id === id);
    return encontrado ? encontrado.tipo_cuenta : "Sin Tipo";
  };

  // Carga los tipos de cuenta desde SQLite
  const cargarTipos = useCallback(async () => {
    try {
      const result = await db.getAllAsync<TipoCuenta>(
        "SELECT * FROM tipo_cuenta",
      );
      setTiposDB(result);
    } catch (error) {
      console.error("Error al obtener tipos de cuentas: ", error);
    }
  }, [db]);

  const handleSeleccionarTipo = async (nombreTexto: string) => {
    // Buscamos el objeto de la BD que coincide con el texto seleccionado en el modal
    const tipoEncontrado = tiposDB.find((t) => t.tipo_cuenta === nombreTexto);
    if (!tipoEncontrado) return;

    if (origenModal === "NUEVA") {
      // 1. Guardamos solo el ID numérico para la nueva cuenta
      setTipoIdSeleccionado(tipoEncontrado.id);
    } else if (typeof origenModal === "number") {
      // 2. Guardamos el ID numérico en la base de datos al editar la fila
      try {
        await db.runAsync(
          "UPDATE cuentas_metodos SET tipo_cuenta = ? WHERE id = ?",
          [tipoEncontrado.id, origenModal],
        );
        setMensaje(`Tipo actualizado a "${tipoEncontrado.tipo_cuenta}"`);
        await cargarCuentas();
      } catch (error) {
        console.error("Error al actualizar tipo:", error);
      }
    }

    setOrigenModal(null);
  };

  // Opciones en texto extraídas dinámicamente de la BD para el SelectorModal
  const opcionesModalTextos = tiposDB.map((t) => t.tipo_cuenta);

  // 2. Listener global para capturar cuándo el teclado se oculta por GESTOS de Android
  useEffect(() => {
    const hideEvent =
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

    const keyboardSubscription = Keyboard.addListener(hideEvent, () => {
      // Si el teclado se oculta por gestos, le quitamos el foco al Input
      // para que el próximo tap vuelva a disparar onFocus obligatoriamente
      if (inputNombreRef.current) {
        inputNombreRef.current.blur();
      }

      if (inputLimiteRef.current) {
        inputLimiteRef.current.blur();
      }
    });

    return () => {
      keyboardSubscription.remove();
    };
  }, []);

  // 1. Extraemos la función de carga para poder invocarla manualmente
  const cargarCuentas = useCallback(async () => {
    try {
      const resultMetodos = await db.getAllAsync<MetodosPago>(
        "SELECT * FROM cuentas_metodos",
      );
      setCuentas(resultMetodos);
    } catch (error) {
      console.error("Error al redefinir la lista de métodos: ", error);
    }
  }, [db]);

  // Se ejecuta al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      cargarCuentas();
      cargarTipos();
    }, [cargarCuentas, cargarTipos]),
  );

  const handleGuardar = async () => {
    if (!cuenta.trim()) {
      setMensaje("El nombre de la cuenta no puede estar vacío.");
      return;
    }

    if (!tipoIdSeleccionado) {
      setMensaje("Debes seleccionar un tipo de cuenta.");
      return;
    }

    if (tipoIdSeleccionado === 2 && !limite.trim()) {
      setMensaje("Ingresa un límite válido para la cuenta de Cŕedito.");
      return;
    }

    const res = await guardarCuenta(cuenta, limite, tipoIdSeleccionado);

    if (res && res.changes > 0) {
      setMensaje(`Cuenta ${cuenta} guardada con éxito`);
      setCuenta("");
      setTipoIdSeleccionado(null);
      setLimite("");
      await cargarCuentas();
    } else {
      setMensaje("Error: No se pudo guardar la cuenta.");
    }
  };

  async function guardarCuenta(
    cuentaNombre: string,
    limite: string,
    idTipo: number,
  ) {
    try {
      return await db.runAsync(
        `INSERT INTO cuentas_metodos (nombre, limite, tipo_cuenta) VALUES (?, ?, ?)`,
        [cuentaNombre, limite, idTipo],
      );
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={globalStyles.scrollView}
        contentContainerStyle={globalStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* TABLA DE CUENTAS */}
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
                <View style={globalStyles.celdaTipo}>
                  <Text
                    style={[
                      isDark ? globalStyles.dark : globalStyles.light,
                      { fontWeight: "bold" },
                    ]}
                  >
                    Tipo
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
                  <Text
                    style={[
                      globalStyles.celdaNombre,
                      isDark ? globalStyles.dark : globalStyles.light,
                    ]}
                  >
                    {item.nombre}
                  </Text>

                  {/* Se mapea el ID numérico que viene de cuentas_metodos a su texto legible */}
                  <TouchableOpacity
                    style={[
                      globalStyles.celdaTipo,
                      globalStyles.selector,
                      globalStyles.boton_select,
                    ]}
                    onPress={() => setOrigenModal(item.id)}
                  >
                    <Text style={globalStyles.boton_nav_text}>
                      {obtenerNombreTipo(item.tipo_cuenta)}
                    </Text>
                  </TouchableOpacity>
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

        <View
          style={globalStyles.caja}
          onLayout={(event: LayoutChangeEvent) => {
            const { y } = event.nativeEvent.layout;
            setInputOffsetNombreY(y);
            setInputOffsetLimiteY(y);
          }}
        >
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
            ref={inputNombreRef}
            placeholder="Cuenta"
            value={cuenta}
            onChangeText={setCuenta}
            onFocus={() => {
              setTimeout(() => {
                // scrollViewRef.current?.scrollToEnd({ animated: true });
                scrollViewRef.current?.scrollTo({
                  y: inputOffsetNombreY,
                  animated: true,
                });
              }, 150);
            }}
          />
          {tipoIdSeleccionado === 2 && (
            <View>
              <Text
                style={[
                  globalStyles.label,
                  isDark ? globalStyles.dark : globalStyles.light,
                ]}
              >
                Limite:
              </Text>
              <MyInput
                ref={inputLimiteRef}
                placeholder="Límite de la cuenta"
                value={limite}
                onChangeText={(texto) => {
                  const textoLimpio = texto.replace(/[^0-9.]/g, "");
                  setLimite(textoLimpio);
                }}
                keyboardType="numeric"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({
                      y: inputOffsetLimiteY,
                      animated: true,
                    });
                  }, 150);
                }}
              ></MyInput>
            </View>
          )}
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
              <Text style={globalStyles.boton_nav_text}>
                {tipoIdSeleccionado
                  ? obtenerNombreTipo(tipoIdSeleccionado)
                  : "Selecciona un tipo de cuenta"}
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
        opciones={opcionesModalTextos}
        valorSeleccionado={
          origenModal === "NUEVA"
            ? tipoIdSeleccionado
              ? obtenerNombreTipo(tipoIdSeleccionado)
              : ""
            : obtenerNombreTipo(
                cuentas.find((c) => c.id === origenModal)?.tipo_cuenta || 0,
              )
        }
        onSeleccionar={handleSeleccionarTipo}
        formatearOpcion="SI"
      />
    </KeyboardAvoidingView>
  );
}
