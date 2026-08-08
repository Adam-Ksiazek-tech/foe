"use client";

import { useState } from "react";
import { Modal, message } from "antd";
import { PageHeader } from "@/components/PageHeader";
import { InvestmentsList } from "@/components/InvestmentsList";
import { useInvestments } from "@/app/hooks/useInvestments";
import { paginateArray } from "@/helpers/paginationHelpers";

const DEFAULT_PAGE_SIZE = 10;

export default function DiaxowanieLista() {
  const { data, loading, error, updateInvestment, deleteAllInvestments } = useInvestments();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
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
          message.success('Tabela wyczyszczona');
        } catch (err) {
          message.error('Błąd podczas czyszczenia tabeli');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const paginatedData = paginateArray(data, currentPage, pageSize);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "80vh", padding: "24px", overflow: "hidden" }}>
      <PageHeader
        title="Diaxowanie"
        subtitle="Lista wszystkich inwestycji"
        onClearTable={handleClearTable}
        isClearing={isDeleting}
      />

      <div style={{ flex: 1, overflow: "auto", minHeight: 0, display: "flex", flexDirection: "column" }}>
        <InvestmentsList
          data={paginatedData}
          loading={loading}
          error={error}
          currentPage={currentPage}
          pageSize={pageSize}
          totalRecords={data.length}
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
          totalRecords={data.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
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
  const totalPages = Math.ceil(totalRecords / pageSize);

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