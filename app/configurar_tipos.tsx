import MyInput from "@/components/MyInput";
import globalStyles from "@/constants/styles";
import { TipoCuenta, TipoMov } from "@/interfaces/General_DB";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Check, Pencil, Plus, Trash } from "lucide-react-native";
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

export default function Settings() {
  const [tiposMov, setTiposMov] = useState<TipoMov[]>([]);
  const [tiposCuentas, setTiposCuentas] = useState<TipoCuenta[]>([]);
  const [nuevoTipoMov, setNuevoTipoMov] = useState("");
  const [nuevoTipoCuenta, setNuevoTipoCuenta] = useState("");
  const [editarTipoMov, setEditarTipoMov] = useState(false);
  const [editarTipoCuenta, setEditarTipoCuenta] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefMov = useRef<TextInput>(null);
  const [inputOffsetMovY, setInputOffsetMovY] = useState(0);
  const inputRefCuenta = useRef<TextInput>(null);
  const [inputOffsetCuentaY, setInputOffsetCuentaY] = useState(0);

  const schema = useColorScheme();
  const isDark = schema === "dark";
  const db = useSQLiteContext();

  useEffect(() => {
    const hideEvent =
      Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";

    const keyboardSubscription = Keyboard.addListener(hideEvent, () => {
      // Si el teclado se oculta por gestos, le quitamos el foco al Input
      // para que el próximo tap vuelva a disparar onFocus obligatoriamente
      if (inputRefMov.current) {
        inputRefMov.current.blur();
      }

      if (inputRefCuenta.current) {
        inputRefCuenta.current.blur();
      }
    });

    return () => {
      keyboardSubscription.remove();
    };
  }, []);

  const cargarTiposMov = useCallback(async () => {
    try {
      const response = await db.getAllAsync<TipoMov>(
        "SELECT * FROM tipo_movimiento;",
      );
      setTiposMov(response);
    } catch (error) {
      console.error(
        "Ocurió un error al buscar los tipos de movimientos: ",
        error,
      );
    }
  }, [db]);

  const cargarTiposCuentas = useCallback(async () => {
    try {
      const response = await db.getAllAsync<TipoCuenta>(
        "SELECT * FROM tipo_cuenta;",
      );
      setTiposCuentas(response);
    } catch (error) {
      console.error("Ocurrió un error al buscar los tipos de cuentas: ", error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      cargarTiposCuentas();
      cargarTiposMov();
    }, [cargarTiposCuentas, cargarTiposMov]),
  );

  async function handleAgregarNuevoTipoMov() {
    if (!nuevoTipoMov.trim()) return;
    try {
      const res = await db.runAsync(
        "INSERT INTO tipo_movimiento(tipo_mov) VALUES(?)",
        nuevoTipoMov,
      );
      if (res && res.changes > 0) {
        cargarTiposMov();
        setNuevoTipoMov("");
      }
    } catch (error) {
      console.error("Ocurrió un error al añadir tipo de movimiento: ", error);
    }
  }

  async function handleAgregarNuevoTipoCuenta() {
    if (!nuevoTipoCuenta.trim()) return;
    try {
      const res = await db.runAsync(
        "INSERT INTO tipo_cuenta(tipo_cuenta) VALUES(?)",
        nuevoTipoCuenta,
      );
      if (res && res.changes > 0) {
        cargarTiposCuentas();
        setNuevoTipoCuenta("");
      }
    } catch (error) {
      console.error("Ocurrió un error al añadir tipo de movimiento: ", error);
    }
  }

  async function handleEliminarTipo(tipo: string, tabla: number) {
    if (tabla === 0) {
      Alert.alert(
        "Eliminar gasto",
        `¿Está seguro de querer eliminar ${tipo}?`,
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
                const res = await db.runAsync(
                  "DELETE FROM tipo_movimiento WHERE tipo_mov = ?",
                  tipo,
                );
                if (res && res.changes > 0) {
                  await cargarTiposMov();
                }
              } catch (error) {
                console.error(
                  "Ocurrió un error al querer eliminar el gasto: ",
                  error,
                );
              }
            },
          },
        ],
      );
    } else {
      Alert.alert(
        "Eliminar tipo de cuenta",
        `¿Está seguro de querer eliminar el tipo ${tipo}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                const res = await db.runAsync(
                  "DELETE FROM tipo_cuenta WHERE tipo_cuenta = ?",
                  tipo,
                );
                if (res && res.changes > 0) {
                  await cargarTiposCuentas();
                }
              } catch (error) {
                console.error(
                  "Ocurrió un error al eliminar el tipo de cuenta: ",
                  error,
                );
              }
            },
          },
        ],
      );
    }
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
        <View>
          {/* TABLA 1: TIPO DE MOVIMIENTO */}
          <View
            style={globalStyles.caja}
            onLayout={(event: LayoutChangeEvent) => {
              // Guarda la posición Y de la CAJA 1 respecto al ScrollView
              const { y } = event.nativeEvent.layout;
              setInputOffsetMovY(y);
            }}
          >
            <View style={[globalStyles.fila, globalStyles.encabezado]}>
              <Text
                style={[
                  globalStyles.celdaTipo,
                  isDark ? globalStyles.dark : globalStyles.light,
                ]}
              >
                Tipo
              </Text>
              <Text
                style={[
                  globalStyles.celdaAcciones,
                  isDark ? globalStyles.dark : globalStyles.light,
                ]}
              >
                Acciones
              </Text>
            </View>

            {tiposMov && tiposMov.length > 0 ? (
              tiposMov.map((mov) => (
                <View key={mov.id} style={globalStyles.fila}>
                  {!editarTipoMov ? (
                    <Text style={[globalStyles.celdaTipo, globalStyles.dark]}>
                      {mov.tipo_mov}
                    </Text>
                  ) : (
                    <View style={globalStyles.celdaInput}>
                      <MyInput style={globalStyles.dark} value={mov.tipo_mov} />
                    </View>
                  )}
                  <View style={globalStyles.celdaAcciones}>
                    <TouchableOpacity
                      onPress={() => setEditarTipoMov(!editarTipoMov)}
                    >
                      {!editarTipoMov ? (
                        <Pencil color="white" />
                      ) : (
                        <Check color="white" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEliminarTipo(mov.tipo_mov, 0)}
                    >
                      <Trash color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={globalStyles.dark}>
                No hay tipos de movimientos registrados.
              </Text>
            )}

            <View style={globalStyles.fila}>
              <View style={globalStyles.celdaInput}>
                <MyInput
                  ref={inputRefMov}
                  placeholder="Nuevo tipo..."
                  value={nuevoTipoMov}
                  onChangeText={setNuevoTipoMov}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: inputOffsetMovY,
                        animated: true,
                      });
                    }, 150);
                  }}
                />
              </View>
              <View style={globalStyles.celdaAcciones}>
                <TouchableOpacity onPress={handleAgregarNuevoTipoMov}>
                  <Plus color="#4CAF50" size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* TABLA 2: TIPO DE CUENTA */}
          <View
            style={[[globalStyles.caja], { marginBottom: 50 }]}
            onLayout={(event: LayoutChangeEvent) => {
              const { y } = event.nativeEvent.layout;
              setInputOffsetCuentaY(y);
            }}
          >
            <View style={[globalStyles.fila, globalStyles.encabezado]}>
              <Text
                style={[
                  isDark ? globalStyles.dark : globalStyles.light,
                  globalStyles.celdaTipo,
                ]}
              >
                Tipos de cuenta
              </Text>
              <Text
                style={[
                  isDark ? globalStyles.dark : globalStyles.light,
                  globalStyles.celdaAcciones,
                ]}
              >
                Acciones
              </Text>
            </View>

            {tiposCuentas && tiposCuentas.length > 0 ? (
              tiposCuentas.map((cuenta) => (
                <View key={cuenta.id} style={globalStyles.fila}>
                  {!editarTipoCuenta ? (
                    <Text style={[globalStyles.celdaTipo, globalStyles.dark]}>
                      {cuenta.tipo_cuenta}
                    </Text>
                  ) : (
                    <View style={globalStyles.celdaInput}>
                      <MyInput
                        value={cuenta.tipo_cuenta}
                        style={globalStyles.dark}
                      />
                    </View>
                  )}
                  <View style={globalStyles.celdaAcciones}>
                    <TouchableOpacity
                      onPress={() => setEditarTipoCuenta(!editarTipoCuenta)}
                    >
                      {!editarTipoCuenta ? (
                        <Pencil color="white" />
                      ) : (
                        <Check color="white" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleEliminarTipo(cuenta.tipo_cuenta, 1)}
                    >
                      <Trash color="red" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={globalStyles.dark}>
                No hay tipos de cuentas registrados.
              </Text>
            )}

            <View style={globalStyles.fila}>
              <View style={globalStyles.celdaInput}>
                <MyInput
                  ref={inputRefCuenta}
                  placeholder="Nuevo tipo..."
                  value={nuevoTipoCuenta}
                  onChangeText={setNuevoTipoCuenta}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: inputOffsetCuentaY,
                        animated: true,
                      });
                    }, 150);
                  }}
                />
              </View>
              <View style={globalStyles.celdaAcciones}>
                <TouchableOpacity onPress={handleAgregarNuevoTipoCuenta}>
                  <Plus color="#4CAF50" size={24} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
