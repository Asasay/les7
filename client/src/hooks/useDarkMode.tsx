import { useEffect, useState } from "react";

function useDarkMode() {
  const [mode, setMode] = useState<"dark" | "light">(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  useEffect(() => {
    const handleChange = (event: MediaQueryListEvent) => {
      const colorScheme = event.matches ? "dark" : "light";
      setMode(colorScheme);
    };
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handleChange);

    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handleChange);
  }, []);
  return [mode, setMode];
}

export default useDarkMode;
