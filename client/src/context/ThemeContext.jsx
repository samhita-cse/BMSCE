import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "studyflow-theme";
const PREMIUM_STORAGE_KEY = "studyflow-premium-demo";

const THEMES = [
  {
    id: "dark",
    name: "Midnight Focus",
    premium: false,
    colorScheme: "dark",
    colors: {
      bg: "#101418",
      panel: "#181d23",
      panelStrong: "#202730",
      bgSoft: "#141920",
      text: "#f3f4f6",
      muted: "#a1a1aa",
      line: "#2e3742",
      accent: "#60a5fa",
      accentStrong: "#3b82f6",
      accentWarm: "#93c5fd"
    }
  },
  {
    id: "light",
    name: "Paper Light",
    premium: false,
    colorScheme: "light",
    colors: {
      bg: "#f5f5f5",
      panel: "#ffffff",
      panelStrong: "#f8fafc",
      bgSoft: "#f8fafc",
      text: "#111827",
      muted: "#6b7280",
      line: "#d1d5db",
      accent: "#2563eb",
      accentStrong: "#1d4ed8",
      accentWarm: "#93c5fd"
    }
  },
  {
    id: "forest",
    name: "Forest Notes",
    premium: false,
    colorScheme: "dark",
    colors: {
      bg: "#0f1714",
      panel: "#17211d",
      panelStrong: "#203028",
      bgSoft: "#111b17",
      text: "#eefaf2",
      muted: "#9bb5a5",
      line: "#30433a",
      accent: "#6fd39c",
      accentStrong: "#43b778",
      accentWarm: "#b8efc9"
    }
  },
  {
    id: "sunset-premium",
    name: "Sunset Premium",
    premium: true,
    colorScheme: "dark",
    colors: {
      bg: "#1a1020",
      panel: "#24152d",
      panelStrong: "#301c3b",
      bgSoft: "#211328",
      text: "#fff1f6",
      muted: "#d6b6c3",
      line: "#4b2c57",
      accent: "#ff8a65",
      accentStrong: "#ff7043",
      accentWarm: "#ffd166"
    }
  },
  {
    id: "aurora-premium",
    name: "Aurora Premium",
    premium: true,
    colorScheme: "dark",
    colors: {
      bg: "#09151c",
      panel: "#10212a",
      panelStrong: "#16303b",
      bgSoft: "#0d1a22",
      text: "#ecfbff",
      muted: "#9ec2cb",
      line: "#264653",
      accent: "#58d6ff",
      accentStrong: "#26b2e3",
      accentWarm: "#7ef7c5"
    }
  },
  {
    id: "rose-premium",
    name: "Rose Premium",
    premium: true,
    colorScheme: "light",
    colors: {
      bg: "#fff7fb",
      panel: "#ffffff",
      panelStrong: "#fff1f7",
      bgSoft: "#fff4f8",
      text: "#3d2230",
      muted: "#8b6476",
      line: "#efcfde",
      accent: "#e75480",
      accentStrong: "#d6336c",
      accentWarm: "#f7a9c4"
    }
  }
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || "dark");
  const [hasPremium, setHasPremium] = useState(() => {
    return localStorage.getItem(PREMIUM_STORAGE_KEY) === "true";
  });

  const currentTheme = useMemo(() => {
    return THEMES.find((item) => item.id === theme) || THEMES[0];
  }, [theme]);

  useEffect(() => {
    const nextTheme = THEMES.find((item) => item.id === theme) || THEMES[0];
    const root = document.documentElement;

    root.dataset.theme = nextTheme.id;
    root.style.colorScheme = nextTheme.colorScheme;
    root.style.setProperty("--bg", nextTheme.colors.bg);
    root.style.setProperty("--panel", nextTheme.colors.panel);
    root.style.setProperty("--panel-strong", nextTheme.colors.panelStrong);
    root.style.setProperty("--bg-soft", nextTheme.colors.bgSoft);
    root.style.setProperty("--text", nextTheme.colors.text);
    root.style.setProperty("--muted", nextTheme.colors.muted);
    root.style.setProperty("--line", nextTheme.colors.line);
    root.style.setProperty("--accent", nextTheme.colors.accent);
    root.style.setProperty("--accent-strong", nextTheme.colors.accentStrong);
    root.style.setProperty("--accent-warm", nextTheme.colors.accentWarm);
    localStorage.setItem(STORAGE_KEY, nextTheme.id);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(PREMIUM_STORAGE_KEY, String(hasPremium));
  }, [hasPremium]);

  const selectTheme = (themeId) => {
    const selectedTheme = THEMES.find((item) => item.id === themeId);
    if (!selectedTheme) {
      return false;
    }

    if (selectedTheme.premium && !hasPremium) {
      return false;
    }

    setTheme(themeId);
    return true;
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const unlockPremiumDemo = () => {
    setHasPremium(true);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        hasPremium,
        selectTheme,
        theme,
        themes: THEMES,
        toggleTheme,
        unlockPremiumDemo
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
