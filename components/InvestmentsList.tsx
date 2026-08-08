"use client";

import { Table, Spin, Empty, Alert, InputNumber, Button, Space, message } from "antd";
import type { TableProps } from "antd";
import { Investment } from "@/app/hooks/useInvestments";
import { useTheme } from "@/app/theme-context";
import { useState } from "react";

interface InvestmentsListProps {
  data: Investment[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onUpdateInvestment: (id: string, parsedAmount: number | null) => Promise<void>;
  hideTablePagination?: boolean;
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
  onUpdateInvestment,
  hideTablePagination = false,
}: InvestmentsListProps) {
  const { isDark } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleEdit = (id: string, currentValue: number | null) => {
    setEditingId(id);
    setEditingValue(currentValue);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue(null);
  };

  const handleSave = async (id: string) => {
    try {
      setIsSaving(true);
      await onUpdateInvestment(id, editingValue);
      message.success('Kwota zaktualizowana');
      setEditingId(null);
      setEditingValue(null);
    } catch (err) {
      message.error('Błąd podczas aktualizacji');
    } finally {
      setIsSaving(false);
    }
  };

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
      width: 150,
      render: (amount: number | null, record: Investment) => {
        if (editingId === record.id) {
          return (
            <Space>
              <InputNumber
                value={editingValue}
                onChange={(val) => setEditingValue(val)}
                autoFocus
              />
              <Button
                type="primary"
                size="small"
                onClick={() => handleSave(record.id)}
                loading={isSaving}
              >
                OK
              </Button>
              <Button size="small" onClick={handleCancel}>
                Anuluj
              </Button>
            </Space>
          );
        }
        return (
          <div
            onClick={() => handleEdit(record.id, amount)}
            style={{ cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            {amount !== null ? `${amount.toLocaleString("pl-PL")}` : "—"}
          </div>
        );
      },
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
      title: "BeautyDate",
      dataIndex: "beautyDate",
      key: "beautyDate",
      width: 180,
      render: (date: string) => new Date(date).toLocaleString("pl-PL"),
    },
  ];

  return (
    <Table<Investment>
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={hideTablePagination ? false :{
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