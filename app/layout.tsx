import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Header from "./components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foe",
  description: "Foe app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>
        <AntdRegistry>
          <Header />
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}