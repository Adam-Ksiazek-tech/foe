"use client";

import { Layout, Menu, Switch } from "antd";
import { UserOutlined, LoginOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "../theme-context";

const { Header: AntHeader } = Layout;

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const { isDark, toggleDark } = useTheme();

  const items: MenuProps["items"] = [
    { key: "/", label: <Link href="/">Home</Link> },
    // "Konkursy" widoczne w menu tylko dla zalogowanych - trasa jest
    // dodatkowo zabezpieczona przez middleware.ts, więc to podwójna warstwa:
    // UX (nie kuś linkiem, który i tak odbije) + realna ochrona.
    ...(isLoggedIn
      ? [
          {
            key: "contests",
            label: "Konkursy",
            children: [
              { key: "/contests/poker-nk", label: <Link href="/contests/poker-nk">Poker NK</Link> },
            ],
          },
        ]
      : []),
    {
      key: "auth",
      icon: <UserOutlined />,
      label: isLoggedIn ? session.user?.name ?? "Konto" : "Zaloguj",
      // Menu bez href renderuje się jako rozwijany dropdown zamiast linku
      children: isLoggedIn
        ? [
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Wyloguj",
              onClick: () => signOut({ callbackUrl: "/" }),
            },
          ]
        : [
            {
              key: "login",
              icon: <LoginOutlined />,
              label: "Zaloguj",
              onClick: () => signIn("discord", { callbackUrl: "/" }),
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
        onChange={toggleDark}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        style={{ marginLeft: 16 }}
      />
    </AntHeader>
  );
}