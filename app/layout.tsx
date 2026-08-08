import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Header from "../components/Header";
import Providers from "./providers";
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
        <Providers>
          <AntdRegistry>
            <Header />
            {children}
          </AntdRegistry>
        </Providers>
      </body>
    </html>
  );
}