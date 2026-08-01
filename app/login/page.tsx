"use client";

import { signIn } from "next-auth/react";
import { Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-8">
      <Card style={{ maxWidth: 380, width: "100%" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Zaloguj się
        </Title>
        <Paragraph type="secondary" style={{ textAlign: "center" }}>
          Ta sekcja wymaga logowania.
        </Paragraph>
        <Button
          type="primary"
          block
          size="large"
          style={{ background: "#5865F2", borderColor: "#5865F2" }}
          onClick={() => signIn("discord", { callbackUrl: "/" })}
        >
          Zaloguj przez Discord
        </Button>
      </Card>
    </main>
  );
}