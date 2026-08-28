import globalStyles from "@/app/constants/styles";
import React, { forwardRef } from "react";
import { TextInput, type TextInputProps, useColorScheme } from "react-native";

interface MyInputProps extends TextInputProps {
  mostrarBordeError?: boolean;
}

const MyInput = forwardRef<TextInput, MyInputProps>(
  ({ style, mostrarBordeError, ...rest }, ref) => {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    return (
      <TextInput
        ref={ref}
        style={[
          globalStyles.input,
          isDark ? globalStyles.dark : globalStyles.light,
          style,
        ]}
        // Permite que cambie el color del texto que parpadea (cursor) según el tema
        cursorColor={isDark ? "white" : "black"}
        // Permite cambiar el color del texto de ayuda (placeholder) dinámicamente
        placeholderTextColor={isDark ? "#888" : "#aaa"}
        {...rest}
      />
    );
  },
);

// Recomendado para debugging en React DevTools
MyInput.displayName = "MyInput";

export default MyInput;
