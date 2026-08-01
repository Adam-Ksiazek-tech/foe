"use client";

import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider, useTheme } from "./theme-context";

function AntdThemeBridge({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div style={{ minHeight: "100vh", background: isDark ? "#141414" : "#fff" }}>
        {children}
      </div>
    </ConfigProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AntdThemeBridge>{children}</AntdThemeBridge>
      </ThemeProvider>
    </SessionProvider>
  );
}