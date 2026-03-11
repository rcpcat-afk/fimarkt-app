import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { Colors } from "../../constants";

export { Colors };

interface InputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  icon?: string;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words";
}

export const AuthInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  icon,
  error,
  autoCapitalize = "none",
}: InputProps) => {
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      <View
        style={[
          inputStyles.wrap,
          focused && inputStyles.focused,
          !!error && inputStyles.errored,
        ]}
      >
        {icon && <Text style={inputStyles.icon}>{icon}</Text>}
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.text3}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPw}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPw(!showPw)}
            style={inputStyles.eye}
          >
            <Text>{showPw ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={inputStyles.error}>{error}</Text>}
    </View>
  );
};

const inputStyles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: Colors.text2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  focused: { borderColor: Colors.accent },
  errored: { borderColor: Colors.red },
  icon: { paddingHorizontal: 14, fontSize: 16 },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    paddingVertical: 13,
    paddingLeft: 4,
  },
  eye: { paddingHorizontal: 14 },
  error: { fontSize: 11, color: Colors.red, marginTop: 4 },
});

interface BtnProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  style?: ViewStyle;
  loading?: boolean;
}

export const AuthButton = ({
  title,
  onPress,
  variant = "primary",
  style,
  loading,
}: BtnProps) => {
  return (
    <TouchableOpacity
      style={[btnStyles.base, btnStyles[variant], style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <Text
        style={[
          btnStyles.text,
          variant === "primary" && btnStyles.primaryText,
          variant === "ghost" && btnStyles.ghostText,
        ]}
      >
        {loading ? "Yükleniyor..." : title}
      </Text>
    </TouchableOpacity>
  );
};

const btnStyles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: Colors.accent },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  text: { fontSize: 15, fontWeight: "600", color: Colors.text },
  primaryText: { color: "#fff" },
  ghostText: { color: Colors.text2, fontSize: 13 },
});

export const PasswordStrength = ({ password }: { password: string }) => {
  const getScore = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };
  const score = getScore();
  const labels = ["", "Zayıf", "Orta", "Güçlü", "Çok Güçlü"];
  const colors = ["", Colors.red, Colors.yellow, Colors.green, Colors.green];
  if (!password) return null;
  return (
    <View style={pwStyles.container}>
      <View style={pwStyles.bars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              pwStyles.bar,
              i <= score && { backgroundColor: colors[score] },
            ]}
          />
        ))}
      </View>
      <Text style={[pwStyles.label, { color: colors[score] }]}>
        {labels[score]}
      </Text>
    </View>
  );
};

const pwStyles = StyleSheet.create({
  container: { marginBottom: 8 },
  bars: { flexDirection: "row", gap: 4, marginBottom: 4 },
  bar: { flex: 1, height: 3, borderRadius: 99, backgroundColor: Colors.border },
  label: { fontSize: 11 },
});

export const Divider = ({ text = "veya" }: { text?: string }) => (
  <View style={divStyles.container}>
    <View style={divStyles.line} />
    <Text style={divStyles.text}>{text}</Text>
    <View style={divStyles.line} />
  </View>
);

const divStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  text: { fontSize: 12, color: Colors.text3, marginHorizontal: 12 },
});
