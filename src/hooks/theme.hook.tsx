import { createContext, useContext } from "react";

const colors = {
    background: "#1E1E20",
    surface: "#252625",
    border: "#242428",
    textPrimary: "#F5F5F7",
    textSecondary: "#9CA3AF",
    accent: "#5C2D8B",
    accentDisabled: "#3A2F52",
    checkboxBorder: "#4B4B52",
};
export type Colors = typeof colors;
interface ThemeContextValue {
  colors: Colors;
}
const ThemeContext = createContext<ThemeContextValue | null>(null);


export function ThemeProvider({ children }: { children: React.ReactNode }) {

  return <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
}


export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}