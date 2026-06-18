import { StyleSheet } from "react-native";

export const globalStyles = StyleSheet.create({
  container: { padding: 20 },
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
  dark: {
    color: "white",
    borderColor: "#ccc",
  },
  light: {
    color: "#000",
    borderColor: "#000",
  },
  boton: {
    margin: 20,
    backgroundColor: "blue",
    borderRadius: 10,
    padding: 10,
  },
  boton_text: {
    color: "white",
    textAlign: "center",
    textTransform: "uppercase",
  },
  boton_select: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "black",
    borderRadius: 10,
    padding: 10,
  },

  // Estos son del model para seleccionar el Gasto
  selector: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "white",
  },
  placeholder: {
    color: "#999",
  },
  textoSeleccionado: {
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  opcion: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  opcionSeleccionada: {
    backgroundColor: "#e3f2fd",
  },
  textoOpcion: {
    fontSize: 16,
    color: "#333",
  },
  textoOpcionSeleccionada: {
    color: "#1976d2",
    fontWeight: "500",
  },
  botonCerrar: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  textoCerrar: {
    color: "#1976d2",
    fontSize: 16,
    fontWeight: "600",
  },
});
