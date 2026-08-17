"use client";

import { useState } from "react";
import { Button, Space, DatePicker, Select, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/PageHeader";
import { useInvestments } from "@/app/hooks/useInvestments";
import { useTheme } from "@/app/theme-context";
import dayjs from "dayjs";

export default function DiaxowanieInwestor() {
  const { isDark } = useTheme();
  const { data, loading, error } = useInvestments();
  const [inwestor, setInwestor] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredData, setFilteredData] = useState<typeof data>([]);
  const [hasFilter, setHasFilter] = useState(false);

  // Pobierz unikalnych graczy
  const players = Array.from(new Set(data.map(inv => inv.playerName))).sort();

  const handleFilter = () => {
    if (!inwestor || !startDate || !endDate) {
      message.warning('Wybierz inwestora oraz datę początkową i końcową');
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = data.filter((inv) => {
      const invDate = new Date(inv.beautyDate);
      return (
        inv.playerName === inwestor &&
        invDate >= start &&
        invDate <= end
      );
    });

    setFilteredData(filtered);
    setHasFilter(true);
    message.success(`Wyfiltrowano ${filtered.length} inwestycji`);
  };

  const handleClearFilter = () => {
    setFilteredData([]);
    setHasFilter(false);
    setInwestor('');
    setStartDate('');
    setEndDate('');
  };

  const totalAmount = filteredData.reduce((sum, inv) => sum + (inv.parsedAmount || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "24px", overflow: "hidden" }}>
      <PageHeader
        title="Diaxowanie"
        subtitle="Szczegóły inwestora"
      />

      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", borderRadius: "4px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "inherit" }}>Inwestor:</label>
              <Select
                placeholder="Wybierz inwestora"
                value={inwestor || undefined}
                onChange={setInwestor}
                options={players.map(p => ({ label: p, value: p }))}
                style={{ width: "200px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "inherit" }}>Od daty:</label>
              <DatePicker
                value={startDate ? dayjs(startDate) : null}
                onChange={(date) => setStartDate(date ? date.format('YYYY-MM-DD') : '')}
                format="YYYY-MM-DD"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "inherit" }}>Do daty:</label>
              <DatePicker
                value={endDate ? dayjs(endDate) : null}
                onChange={(date) => setEndDate(date ? date.format('YYYY-MM-DD') : '')}
                format="YYYY-MM-DD"
              />
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleFilter}
            >
              Odśwież
            </Button>
            {hasFilter && (
              <Button onClick={handleClearFilter}>
                Wyczyść filtr
              </Button>
            )}
          </div>
        </Space>
      </div>

      {hasFilter && (
        <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: isDark ? "rgba(33,150,243,0.1)" : "rgba(33,150,243,0.05)", borderRadius: "4px", border: "1px solid rgba(33,150,243,0.2)" }}>
          <div style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
            {inwestor}
          </div>
          <div style={{ fontSize: "14px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)", marginBottom: "8px" }}>
            Okres: {startDate} do {endDate}
          </div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#1890ff" }}>
            Razem: {totalAmount.toLocaleString('pl-PL')}
          </div>
          <div style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)", marginTop: "8px" }}>
            Inwestycji: {filteredData.length}
          </div>
        </div>
      )}

      {hasFilter && filteredData.length > 0 && (
        <div style={{ flex: 1, overflow: "auto", backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.01)", borderRadius: "4px", padding: "16px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}>
                <th style={{ textAlign: "left", padding: "8px", color: isDark ? "rgba(255,255,255,0.85)" : "inherit" }}>Data</th>
                <th style={{ textAlign: "left", padding: "8px", color: isDark ? "rgba(255,255,255,0.85)" : "inherit" }}>Tekst</th>
                <th style={{ textAlign: "right", padding: "8px", color: isDark ? "rgba(255,255,255,0.85)" : "inherit" }}>Kwota</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((inv, idx) => (
                <tr
                  key={inv.id}
                  style={{
                    borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    backgroundColor: idx % 2 === 0 ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)") : "transparent",
                  }}
                >
                  <td style={{ padding: "8px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
                    {new Date(inv.beautyDate).toLocaleDateString('pl-PL')}
                  </td>
                  <td style={{ padding: "8px" }}>{inv.text}</td>
                  <td style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                    {inv.parsedAmount ? inv.parsedAmount.toLocaleString('pl-PL') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasFilter && filteredData.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
          Brak inwestycji dla wybranego zakresu
        </div>
      )}
    </div>
  );
}