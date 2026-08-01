"use client";

import { useState } from "react";
import { Layout, Menu, Switch } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Header: AntHeader } = Layout;

export default function Header() {
  const pathname = usePathname();

  // Tymczasowy stan lokalny - w kroku "Discord login" zastąpimy to
  // prawdziwą sesją z next-auth (useSession()).
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Tymczasowy lokalny stan dark mode - w kolejnym kroku spinamy
  // to z AntD ConfigProvider (theme.darkAlgorithm), żeby faktycznie
  // przełączało kolory całej aplikacji.
  const [isDark, setIsDark] = useState(false);

  const items: MenuProps["items"] = [
    { key: "/", label: <Link href="/">Home</Link> },
    {
      key: "contests",
      label: "Konkursy",
      children: [
        { key: "/contests/poker-nk", label: <Link href="/contests/poker-nk">Poker NK</Link> },
      ],
    },
    {
      key: "auth",
      icon: <UserOutlined />,
      label: isLoggedIn ? "Konto" : "Zaloguj",
      // Menu bez href renderuje się jako rozwijany dropdown zamiast linku
      children: isLoggedIn
        ? [
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Wyloguj",
              onClick: () => setIsLoggedIn(false),
            },
          ]
        : [
            {
              key: "login",
              icon: <LoginOutlined />,
              label: "Zaloguj",
              onClick: () => setIsLoggedIn(true),
            },
          ],
    },
  ];

  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
        height: 64,
        lineHeight: "64px",
        paddingInline: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          color: "white",
          fontWeight: 700,
          fontSize: 20,
          marginRight: 40,
          letterSpacing: 0.5,
        }}
      >
        Foe
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[pathname]}
        items={items}
        style={{
          flex: 1,
          minWidth: 0,
          lineHeight: "62px",
          borderBottom: "none",
        }}
      />
      <Switch
        checked={isDark}
        onChange={setIsDark}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        style={{ marginLeft: 16 }}
      />
    </AntHeader>
  );
}