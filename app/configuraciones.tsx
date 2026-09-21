import MyInput from "@/components/MyInput";
import globalStyles from "@/constants/styles";
import { Categorias, TipoCuenta, TipoMov } from "@/interfaces/General_DB";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Check, Pencil, Plus, Trash, X } from "lucide-react-native";
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
  const [pagSelec, setPagSelec] = useState(0);

  const [tiposMov, setTiposMov] = useState<TipoMov[]>([]);
  const [tiposCuentas, setTiposCuentas] = useState<TipoCuenta[]>([]);

  const [categoriaG, setCategoriaG] = useState<Categorias[]>([]);
  const [categoriaI, setCategoriaI] = useState<Categorias[]>([]);

  const [nuevoTipoMov, setNuevoTipoMov] = useState("");
  const [nuevoTipoCuenta, setNuevoTipoCuenta] = useState("");
  const [tipoMovEditandoId, setTipoMovEditandoId] = useState<number | null>(
    null,
  );
  const [textoMovEditando, setTextoMovEditando] = useState("");
  const [tipoCuentaEditandoId, setTipoCuentaEditandoId] = useState<
    number | null
  >(null);
  const [textoCuentaEditando, setTextoCuentaEditando] = useState("");

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRefMov = useRef<TextInput>(null);
  const [inputOffsetMovY, setInputOffsetMovY] = useState(0);
  const inputRefCuenta = useRef<TextInput>(null);
  const [inputOffsetCuentaY, setInputOffsetCuentaY] = useState(0);

  const schema = useColorScheme();
  const isDark = schema === "dark";
  const db = useSQLiteContext();

  function CambiarPagina(nuevo: number) {
    setPagSelec(nuevo);
  }

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

  const cargarCategorias = useCallback(async () => {
    try {
      const responseG = await db.getAllAsync<Categorias>(
        "SELECT * FROM categorias WHERE tipo = 'Gasto';",
      );
      setCategoriaG(responseG);
      const responseI = await db.getAllAsync<Categorias>(
        "SELECT * FROM categorias WHERE tipo = 'Ingreso';",
      );
      setCategoriaI(responseI);
    } catch (error) {
      console.error("Ocurrió un error al buscar las categorías: ", error);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      cargarTiposCuentas();
      cargarTiposMov();
      cargarCategorias();
    }, [cargarTiposCuentas, cargarTiposMov, cargarCategorias]),
  );

  async function handleGuardarEdicionTipoMov(id: number) {
    if (!textoMovEditando.trim()) return;

    Keyboard.dismiss();

    try {
      const res = await db.runAsync(
        "UPDATE tipo_movimiento SET tipo_mov = ? WHERE id = ?",
        [textoMovEditando.trim(), id],
      );

      if (res && res.changes > 0) {
        await cargarTiposMov();
        setTipoMovEditandoId(null); // Sale del modo edición
        setTextoMovEditando("");
      }
    } catch (error) {
      console.error("Error al actualizar el tipo de movimiento: ", error);
    }
  }

  async function handleGuardarEdicionTipoCuenta(id: number) {
    if (!textoCuentaEditando.trim()) return;

    Keyboard.dismiss();

    try {
      const res = await db.runAsync(
        "UPDATE tipo_cuenta SET tipo_cuenta = ? WHERE id = ?",
        [textoCuentaEditando.trim(), id],
      );

      if (res && res.changes > 0) {
        await cargarTiposCuentas();
        setTipoCuentaEditandoId(null);
        setTextoCuentaEditando("");
      }
    } catch (error) {
      console.error("", error);
    }
  }

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
        <View style={globalStyles.vista_pag}>
          <TouchableOpacity
            style={[
              globalStyles.boton_pag,
              pagSelec === 0 ? globalStyles.pag_seleccionado : undefined,
            ]}
            onPress={() => CambiarPagina(0)}
          >
            <Text style={isDark ? globalStyles.dark : globalStyles.light}>
              Gastos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.boton_pag,
              pagSelec === 1 ? globalStyles.pag_seleccionado : undefined,
            ]}
            onPress={() => CambiarPagina(1)}
          >
            <Text style={isDark ? globalStyles.dark : globalStyles.light}>
              Cuentas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              globalStyles.boton_pag,
              pagSelec === 2 ? globalStyles.pag_seleccionado : undefined,
            ]}
            onPress={() => CambiarPagina(2)}
          >
            <Text style={globalStyles.dark}>Categorías</Text>
          </TouchableOpacity>
        </View>
        <View>
          {pagSelec === 0 ? (
            // {/* TABLA 1: TIPO DE MOVIMIENTO */}
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
                tiposMov.map((mov) => {
                  const estaEditandoEstaFila = tipoMovEditandoId === mov.id;

                  return (
                    <View key={mov.id} style={globalStyles.fila}>
                      {!estaEditandoEstaFila ? (
                        <Text
                          style={[globalStyles.celdaTipo, globalStyles.dark]}
                        >
                          {mov.tipo_mov}
                        </Text>
                      ) : (
                        <View style={globalStyles.celdaInput}>
                          <MyInput
                            style={globalStyles.dark}
                            value={textoMovEditando}
                            onChangeText={setTextoMovEditando}
                          />
                        </View>
                      )}

                      <View style={globalStyles.celdaAcciones}>
                        <TouchableOpacity
                          onPress={() => {
                            if (estaEditandoEstaFila) {
                              // Si ya está editando esta fila, guarda los cambios
                              handleGuardarEdicionTipoMov(mov.id);
                            } else {
                              // Activa el modo edición SOLO para este ID y precarga el texto actual
                              setTipoMovEditandoId(mov.id);
                              setTextoMovEditando(mov.tipo_mov);
                            }
                          }}
                        >
                          {!estaEditandoEstaFila ? (
                            <Pencil color="white" />
                          ) : (
                            <Check color="#4CAF50" />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            if (estaEditandoEstaFila) {
                              // Cancelar edición si presiona eliminar/cancelar durante la edición
                              setTipoMovEditandoId(null);
                              setTextoMovEditando("");
                              Keyboard.dismiss();
                            } else {
                              handleEliminarTipo(mov.tipo_mov, 0);
                            }
                          }}
                        >
                          {!estaEditandoEstaFila ? (
                            <Trash color="red" />
                          ) : (
                            <X color="red" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
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
          ) : pagSelec === 1 ? (
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
                tiposCuentas.map((cuenta) => {
                  const estaEditandoEstaFila =
                    tipoCuentaEditandoId === cuenta.id;
                  return (
                    <View key={cuenta.id} style={globalStyles.fila}>
                      {!estaEditandoEstaFila ? (
                        <Text
                          style={[globalStyles.celdaTipo, globalStyles.dark]}
                        >
                          {cuenta.tipo_cuenta}
                        </Text>
                      ) : (
                        <View style={globalStyles.celdaInput}>
                          <MyInput
                            style={globalStyles.dark}
                            value={textoCuentaEditando}
                            onChangeText={setTextoCuentaEditando}
                          />
                        </View>
                      )}
                      <View style={globalStyles.celdaAcciones}>
                        <TouchableOpacity
                          onPress={() => {
                            if (estaEditandoEstaFila) {
                              // Si ya está editando esta fila, guarda los cambios
                              handleGuardarEdicionTipoCuenta(cuenta.id);
                            } else {
                              // Activa el modo edición SOLO para este ID y precarga el texto actual
                              setTipoCuentaEditandoId(cuenta.id);
                              setTextoCuentaEditando(cuenta.tipo_cuenta);
                            }
                          }}
                        >
                          {!estaEditandoEstaFila ? (
                            <Pencil color="white" />
                          ) : (
                            <Check color="#4CAF50" />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            if (estaEditandoEstaFila) {
                              // Cancelar edición si presiona eliminar/cancelar durante la edición
                              setTipoCuentaEditandoId(null);
                              setTextoCuentaEditando("");
                              Keyboard.dismiss();
                            } else {
                              handleEliminarTipo(cuenta.tipo_cuenta, 0);
                            }
                          }}
                        >
                          {!estaEditandoEstaFila ? (
                            <Trash color="red" />
                          ) : (
                            <X color="red" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
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
          ) : pagSelec === 2 ? (
            <View style={globalStyles.caja}>
              <Text style={[globalStyles.dark, globalStyles.label]}>
                Gastos
              </Text>
              <View style={[globalStyles.encabezado, globalStyles.fila]}>
                <Text style={[globalStyles.celdaNombre, globalStyles.dark]}>
                  Nombre
                </Text>
                <Text style={[globalStyles.celdaAcciones, globalStyles.dark]}>
                  Acciones
                </Text>
              </View>
              {categoriaG.map((categoria) => (
                <View key={categoria.id} style={globalStyles.fila}>
                  <Text style={[globalStyles.dark, globalStyles.celdaNombre]}>
                    {categoria.categoria}
                  </Text>
                  <View style={globalStyles.celdaAcciones}>
                    <Pencil color={"white"} />
                    <Trash color={"red"} />
                  </View>
                </View>
              ))}
              <Text style={[globalStyles.dark, globalStyles.label]}>
                Ingresos
              </Text>
              <View style={[globalStyles.encabezado, globalStyles.fila]}>
                <Text style={[globalStyles.celdaNombre, globalStyles.dark]}>
                  Nombre
                </Text>
                <Text style={[globalStyles.celdaAcciones, globalStyles.dark]}>
                  Acciones
                </Text>
              </View>
              {categoriaI.map((categoria) => (
                <View key={categoria.id} style={globalStyles.fila}>
                  <Text style={[globalStyles.dark, globalStyles.celdaNombre]}>
                    {categoria.categoria}
                  </Text>
                  <View style={globalStyles.celdaAcciones}>
                    <Pencil color={"white"} />
                    <Trash color={"red"} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View>
              <Text style={globalStyles.dark}>
                Ocurrió un error en el páginado de este módulo, intenta cambiar
                entre módulos para solucionarlo.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
