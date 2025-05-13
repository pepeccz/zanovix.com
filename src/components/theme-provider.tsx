"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Simplemente pasar los props y children sin ninguna lógica adicional
  // Esto evita problemas de hidratación al no intentar renderizar diferentes cosas en el servidor y el cliente
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
