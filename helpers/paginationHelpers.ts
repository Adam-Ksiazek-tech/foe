export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
}

/**
 * Oblicza offset dla query bazy danych
 * (przydatne jeśli zechcemy rozszerzyć GET z stronicowaniem na backendzie)
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * Paginuje array na froncie
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number
): T[] {
  const offset = calculateOffset(page, pageSize);
  return items.slice(offset, offset + pageSize);
}

/**
 * Zwraca paginację metadane
 */
export function getPaginationMeta(
  totalRecords: number,
  currentPage: number,
  pageSize: number
): { totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } {
  const totalPages = Math.ceil(totalRecords / pageSize);

  return {
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}