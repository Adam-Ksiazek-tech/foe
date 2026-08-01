"use client"

import { Button, Typography } from "antd";

const { Title } = Typography;

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Title level={2}>Foe działa 🎉</Title>
      <Button type="primary">AntD + Tailwind OK</Button>
    </main>
  );
}