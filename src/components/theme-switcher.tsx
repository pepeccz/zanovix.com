
"use client";

import * as React from "react";
import { Moon } from "lucide-react"; // Eliminamos la importación de Sun ya que no lo usamos
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  // Versión simplificada para evitar problemas de hidratación
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {}}
      aria-label="Theme switcher (disabled)"
    >
      <Moon className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );
}
