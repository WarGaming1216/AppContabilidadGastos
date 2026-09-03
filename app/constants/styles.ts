import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
    marginBottom: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  caja: {
    margin: 10,
    padding: 10,
    borderStyle: "solid",
    borderColor: "#1F2E70",
    borderRadius: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 30,
    textAlign: "center",
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 15,
    borderRadius: 5,
  },
  date: {
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderStyle: "solid",
    borderColor: "rgba(143, 99, 225, 0.40)",
    alignItems: "center",
  },
  dark: {
    color: "white",
    borderColor: "rgba(143, 99, 225, 0.40)",
  },
  light: {
    color: "#000",
    borderColor: "#000",
  },
  boton: {
    margin: 20,
    backgroundColor: "#72C84D",
    borderRadius: 10,
    padding: 10,
  },
  boton_navegacion: {
    margin: 20,
    backgroundColor: "#9063E1",
    borderRadius: 10,
    padding: 10,
  },
  boton_text: {
    color: "#16235C",
    textAlign: "center",
    textTransform: "uppercase",
  },
  boton_nav_text: {
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
  },
  boton_select: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#111A44",
    borderRadius: 10,
    padding: 10,
  },
  fila_general: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginHorizontal: 15,
  },
  // Diseños de las tablas
  fila: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#5a5a5a",
  },
  celdaNombre: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  celdaTipo: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  tipo_texto: {
    textTransform: "capitalize",
  },
  celdaAcciones: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    flexDirection: "row",
    gap: 10,
    marginRight: 20,
  },
  encabezado: {
    backgroundColor: "#2a2a2a",
    borderBottomWidth: 2,
    borderBottomColor: "#666",
    textAlign: "center",
    textAlignVertical: "center",
  },
  // Modal de Selección
  selector: {
    borderWidth: 1,
    borderColor: "rgba(143, 99, 225, 0.40)",
    borderRadius: 8,
    padding: 12,
  },
  placeholder: {
    color: "#999",
  },
  textoSeleccionado: {
    color: "#111A44",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentDark: {
    backgroundColor: "#1F2E70",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalContentLight: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTituloDark: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#ffffff",
  },
  modalTituloLight: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#ffffff",
  },
  opcion: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  opcionSeleccionada: {
    borderRadius: 5,
    backgroundColor: "#9191a7",
  },
  textoOpcionDark: {
    fontSize: 16,
    color: "#ffffff",
  },
  textoOpcionLight: {
    fontSize: 16,
    color: "#111A44",
  },
  textoOpcionSeleccionada: {
    color: "#16235C",
    fontWeight: "500",
  },
  botonCerrar: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  textoCerrar: {
    color: "#9063E1",
    fontSize: 16,
    fontWeight: "600",
  },
  // Paginado
  vista_pag: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
  },
  boton_pag: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 20,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#9063E1",
    boxShadow: "3px 4px 0px #9063E1",
    borderBottomRightRadius: 8,
  },
  pag_seleccionado: {
    backgroundColor: "#9191a7",
  },
});

export default globalStyles;
