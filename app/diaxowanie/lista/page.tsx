"use client";
// app/diaxowanie/lista/page.tsx
import { useState } from "react";

import { Modal, message, Button, Space, DatePicker, Collapse, Spin, InputNumber } from "antd";
import { App } from 'antd';

import { ReloadOutlined, FileTextOutlined, SendOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/PageHeader";
import { InvestmentsList } from "@/components/InvestmentsList";
import { useInvestments } from "@/app/hooks/useInvestments";
import { paginateArray } from "@/helpers/paginationHelpers";
import { useTheme } from "@/app/theme-context";
import { calculateLuckyDiaxWinner, getTodayAsNumber, type Participant } from "@/helpers/luckyDiaxHelper";
import dayjs from "dayjs";


const DEFAULT_PAGE_SIZE = 10;

export default function DiaxowanieLista() {
  const { isDark } = useTheme();
  const { data, loading, error, updateInvestment, deleteAllInvestments } = useInvestments();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingLuckyDiax, setIsGeneratingLuckyDiax] = useState(false);
  const [isSendingToDiscord, setIsSendingToDiscord] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredData, setFilteredData] = useState<typeof data>([]);
  const [hasFilter, setHasFilter] = useState(false);
  const [rankingPreview, setRankingPreview] = useState<string>('');
  const [showRankingPreview, setShowRankingPreview] = useState(false);
  const [skipCount, setSkipCount] = useState<number>(3);
  const [luckyDiaxResult, setLuckyDiaxResult] = useState<string>("");
  const [showLuckyDiaxPreview, setShowLuckyDiaxPreview] = useState(false);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleFilterData = () => {
    if (!startDate || !endDate) {
      message.warning('Wybierz datę początkową i końcową');
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = data.filter((inv) => {
      const invDate = new Date(inv.beautyDate);
      return invDate >= start && invDate <= end;
    });

    setFilteredData(filtered);
    setHasFilter(true);
    setCurrentPage(1);
    message.success(`Wyfiltrowano ${filtered.length} inwestycji`);
  };

  const handleClearFilter = () => {
    setFilteredData([]);
    setHasFilter(false);
    setCurrentPage(1);
  };

  const handleClearTable = () => {
    Modal.confirm({
      title: 'Wyczyść tabelę?',
      content: 'Ta operacja usunie wszystkie inwestycje. Czy na pewno?',
      okText: 'Tak, wyczyść',
      cancelText: 'Anuluj',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setIsDeleting(true);
          await deleteAllInvestments();
          setCurrentPage(1);
          handleClearFilter();
          message.success('Tabela wyczyszczona');
        } catch (err) {
          message.error('Błąd podczas czyszczenia tabeli');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Konwertuje filteredData na Participant[]
  const convertToParticipants = (): Participant[] => {
    // console.log("Struktura inv:", filteredData[0]);

    return filteredData.map((inv) => ({      
      name: inv.playerName, // Dostosuj do pola z nazwą użytkownika
      points: inv.parsedAmount, // Dostosuj do pola z punktami
    }));
  };

  // Pobiera ranking z API i wyświetla preview
  const handleGeneratePreview = async () => {
    if (!startDate || !endDate) {
      message.warning('Wybierz datę początkową i końcową');
      return;
    }

    try {
      setIsGenerating(true);
      const url = `/api/investments/export/proxy?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Błąd podczas generowania rankingu');
      }

      const blob = await response.blob();
      const text = await blob.text();
      setRankingPreview(text);
      setShowRankingPreview(true);
      message.success('Ranking wygenerowany');
    } catch (err) {
      message.error('Błąd podczas generowania rankingu');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generuje Lucky Diax z filteredData
  const handleGenerateLuckyDiax = async () => {
    if (!hasFilter || filteredData.length === 0) {
      message.warning('Najpierw wygeneruj ranking dla wybranego przedziału dat');
      return;
    }

    try {
      setIsGeneratingLuckyDiax(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const participants = convertToParticipants();
      const participantsToUse = participants.slice(skipCount);

      if (participantsToUse.length === 0) {
        message.error('Nie ma wystarczającej liczby uczestników po pominięciu');
        setIsGeneratingLuckyDiax(false);
        return;
      }

      const today = getTodayAsNumber();
      const result = calculateLuckyDiaxWinner(participantsToUse, today);

      setLuckyDiaxResult(result);
      setShowLuckyDiaxPreview(true);
      message.success('Lucky Diax wygenerowany');
    } catch (err) {
      message.error('Błąd podczas generowania Lucky Diax');
      console.error(err);
    } finally {
      setIsGeneratingLuckyDiax(false);
    }
  };

  // Wysyła Lucky Diax na Discord
  const handleSendToDiscord = async () => {
    if (!luckyDiaxResult) {
      message.warning('Najpierw wygeneruj Lucky Diax');
      return;
    }

    try {
      setIsSendingToDiscord(true);

      const response = await fetch("/api/discord/send-lucky-diax", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: luckyDiaxResult,
        }),
      });

      if (!response.ok) {
        throw new Error("Błąd podczas wysyłania na Discord");
      }

      message.success("Lucky Diax wysłany na Discord");
    } catch (err) {
      message.error("Błąd podczas wysyłania na Discord");
      console.error(err);
    } finally {
      setIsSendingToDiscord(false);
    }
  };

  const displayData = hasFilter ? filteredData : data;
  const paginatedData = paginateArray(displayData, currentPage, pageSize);

  return (
    <App>
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "24px", overflow: "hidden" }}>
      <PageHeader
        title="Diaxowanie"
        subtitle="Lista wszystkich inwestycji"
        onClearTable={handleClearTable}
        isClearing={isDeleting}
      />

      <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", borderRadius: "4px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "inherit" }}>Od daty:</label>
              <DatePicker
                value={startDate ? dayjs(startDate) : null}
                onChange={(date) => setStartDate(date ? date.format('YYYY-MM-DD') : '')}
                format="YYYY-MM-DD"
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "inherit" }}>Do daty:</label>
              <DatePicker
                value={endDate ? dayjs(endDate) : null}
                onChange={(date) => setEndDate(date ? date.format('YYYY-MM-DD') : '')}
                format="YYYY-MM-DD"
              />
            </div>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleFilterData}
            >
              Odśwież
            </Button>
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleGeneratePreview}
              loading={isGenerating}
              disabled={!startDate || !endDate}
            >
              Generuj ranking
            </Button>
            {hasFilter && (
              <Button onClick={handleClearFilter}>
                Wyczyść filtr
              </Button>
            )}
          </div>
          {hasFilter && (
            <div style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
              Filtr aktywny: {filteredData.length} inwestycji z zakresu {startDate} do {endDate}
            </div>
          )}
        </Space>
      </div>

      {/* Ranking Preview Collapse */}
      {rankingPreview && (
        <div style={{ marginBottom: "16px" }}>
          <Collapse
            items={[
              {
                key: '1',
                label: `Podgląd rankingu (${startDate} - ${endDate})`,
                children: (
                  <div
                    style={{
                      backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.02)",
                      padding: "12px",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "400px",
                      overflow: "auto",
                      color: isDark ? "rgba(255,255,255,0.85)" : "inherit",
                      lineHeight: "1.6",
                    }}
                  >
                    {rankingPreview}
                  </div>
                ),
              },
            ]}
            activeKey={showRankingPreview ? ['1'] : []}
            onChange={(keys) => setShowRankingPreview(keys.includes('1'))}
          />
        </div>
      )}

      {/* Lucky Diax Section */}
      {hasFilter && (
        <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", borderRadius: "4px" }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "inherit" }}>
                  Pomiń pierwszych N:
                </label>
                <InputNumber
                  min={0}
                  max={filteredData.length - 1}
                  value={skipCount}
                  onChange={(value) => setSkipCount(value || 0)}
                  style={{ width: "80px" }}
                />
              </div>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleGenerateLuckyDiax}
                loading={isGeneratingLuckyDiax}
              >
                Generuj Lucky Diax
              </Button>
              <Button
                icon={<SendOutlined />}
                onClick={handleSendToDiscord}
                loading={isSendingToDiscord}
                disabled={!luckyDiaxResult}
              >
                Wyślij na Discord
              </Button>
            </div>
            {luckyDiaxResult && (
              <div style={{ fontSize: "12px", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
                Liczba uczestników do wyliczenia: {filteredData.length - skipCount}
              </div>
            )}
          </Space>
        </div>
      )}

      {/* Lucky Diax Preview Collapse */}
      {luckyDiaxResult && (
        <div style={{ marginBottom: "16px" }}>
          <Collapse
            items={[
              {
                key: '1',
                label: `Podgląd Lucky Diax`,
                children: (
                  <div
                    style={{
                      backgroundColor: isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.02)",
                      padding: "12px",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      maxHeight: "400px",
                      overflow: "auto",
                      color: isDark ? "rgba(255,255,255,0.85)" : "inherit",
                      lineHeight: "1.6",
                    }}
                  >
                    {luckyDiaxResult}
                  </div>
                ),
              },
            ]}
            activeKey={showLuckyDiaxPreview ? ['1'] : []}
            onChange={(keys) => setShowLuckyDiaxPreview(keys.includes('1'))}
          />
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <InvestmentsList
          data={paginatedData}
          loading={loading}
          error={error}
          currentPage={currentPage}
          pageSize={pageSize}
          totalRecords={displayData.length}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={handlePageSizeChange}
          onUpdateInvestment={updateInvestment}
          hideTablePagination={true}
        />
      </div>

      <div style={{ marginTop: "16px", padding: "12px", borderTop: "1px solid rgba(0,0,0,0.1)", overflow: "auto" }}>
        <PaginationControls
          currentPage={currentPage}
          pageSize={pageSize}
          totalRecords={displayData.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
    </App>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

function PaginationControls({
  currentPage,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span>Rozmiar strony:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
            cursor: "pointer",
          }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div style={{ fontSize: "14px" }}>
        Razem: {totalRecords} inwestycji
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
        >
          ← Poprzednia
        </button>

        <span style={{ minWidth: "60px", textAlign: "center" }}>
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
        >
          Następna →
        </button>
      </div>
    </div>
  );
}