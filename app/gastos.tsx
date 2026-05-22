import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
} from "react-native";

export default function Gastos() {
  const scheme = useColorScheme();

  return (
    <ScrollView style={styles.container}>
      <Text
        style={[styles.label, scheme === "dark" ? styles.dark : styles.light]}
      >
        Este es el primer input
      </Text>
      <TextInput
        style={[styles.input, scheme === "dark" ? styles.dark : styles.light]}
      ></TextInput>
      <Text
        style={[styles.label, scheme === "dark" ? styles.dark : styles.light]}
      >
        Este es el segundo input
      </Text>
      <TextInput
        style={[styles.input, scheme === "dark" ? styles.dark : styles.light]}
      ></TextInput>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
