"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InvestmentsList } from "@/components/InvestmentsList";
import { useInvestments } from "@/app/hooks/useInvestments";
import { paginateArray } from "@/helpers/paginationHelpers";

const DEFAULT_PAGE_SIZE = 10;

export default function DiaxowanieLista() {
  const { data, loading, error, refetch } = useInvestments();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const paginatedData = paginateArray(data, currentPage, pageSize);

  return (
    <div style={{ padding: "24px" }}>
      <PageHeader
        title="Diaxowanie"
        subtitle="Lista wszystkich inwestycji"
      />

      <InvestmentsList
        data={paginatedData}
        loading={loading}
        error={error}
        currentPage={currentPage}
        pageSize={pageSize}
        totalRecords={data.length}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}