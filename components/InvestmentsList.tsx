"use client";

import { Table, Spin, Empty, Alert } from "antd";
import type { TableProps } from "antd";
import { Investment } from "@/app/hooks/useInvestments";
import { useTheme } from "@/app/theme-context";

interface InvestmentsListProps {
  data: Investment[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function InvestmentsList({
  data,
  loading,
  error,
  currentPage,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: InvestmentsListProps) {
  const { isDark } = useTheme();

  if (loading) {
    return <Spin size="large" style={{ display: "flex", justifyContent: "center", margin: "40px 0" }} />;
  }

  if (error) {
    return (
      <Alert
        message="Błąd podczas ładowania danych"
        description={error.message}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (totalRecords === 0) {
    return <Empty description="Brak inwestycji" />;
  }

  const columns: TableProps<Investment>["columns"] = [
    {
      title: "Gracz",
      dataIndex: "playerName",
      key: "playerName",
      width: 150,
    },
    {
      title: "Tekst",
      dataIndex: "text",
      key: "text",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Kwota",
      dataIndex: "parsedAmount",
      key: "parsedAmount",
      width: 120,
      render: (amount: number | null) =>
        amount !== null ? `${amount.toLocaleString("pl-PL")}` : "—",
    },
    {
      title: "Status",
      dataIndex: "parsedOk",
      key: "parsedOk",
      width: 100,
      render: (ok: boolean) => (ok ? "✓ OK" : "✗ Błąd"),
    },
    {
      title: "Data gry",
      dataIndex: "gameDate",
      key: "gameDate",
      width: 150,
    },
    {
      title: "Data otrzymania",
      dataIndex: "receivedAt",
      key: "receivedAt",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString("pl-PL"),
    },
  ];

  return (
    <Table<Investment>
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{
        current: currentPage,
        pageSize,
        total: totalRecords,
        onChange: onPageChange,
        onShowSizeChange: (_, size) => onPageSizeChange(size),
        showSizeChanger: true,
        pageSizeOptions: [10, 25, 50, 100],
        showTotal: (total) => `Razem: ${total} inwestycji`,
      }}
      scroll={{ x: 1200 }}
    />
  );
}