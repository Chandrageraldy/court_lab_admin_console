import { ArrowLeft, ArrowRight } from "lucide-react";
import DefaultButton from "./DefaultButton";
import DefaultDropdown from "./DefaultDropdown";
import type { Table } from "@tanstack/react-table";

interface DefaultPaginatorProps<T> {
  table: Table<T>;
  pageSizeOptions?: number[];
}

const DefaultPaginator = <T,>({
  table,
  pageSizeOptions = [10, 20, 50],
}: DefaultPaginatorProps<T>) => {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const total = table.getFilteredRowModel().rows.length;
  const start = total === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between p-5">
      {/* Left Side - Page Information */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="text-black font-bold">
          Result {start} - {end} of {total}
        </span>
        <DefaultDropdown
          value={String(pageSize)}
          onChange={(val) => table.setPageSize(Number(val))}
          options={pageSizeOptions.map((size) => ({
            label: String(size),
            value: String(size),
          }))}
        />
      </div>

      {/* Right Side - Pagination Controls */}
      <div className="flex items-center gap-4">
        {/* Previous Button */}
        <DefaultButton
          variant="secondary"
          handleClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </DefaultButton>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {table.getPageCount() > 0 && (
            <>
              <DefaultButton
                variant="secondary"
                handleClick={() => table.setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                1
              </DefaultButton>

              {pageIndex > 2 && <span className="px-2">...</span>}

              {Array.from({ length: table.getPageCount() }, (_, i) => i + 1)
                .slice(
                  Math.max(1, pageIndex),
                  Math.min(table.getPageCount() - 1, pageIndex + 2),
                )
                .map((page) => (
                  <DefaultButton
                    key={page}
                    variant="secondary"
                    handleClick={() => table.setPageIndex(page - 1)}
                    disabled={pageIndex === page - 1}
                  >
                    {page}
                  </DefaultButton>
                ))}

              {pageIndex < table.getPageCount() - 3 && (
                <span className="px-2">...</span>
              )}

              {table.getPageCount() > 1 && (
                <DefaultButton
                  variant="secondary"
                  handleClick={() =>
                    table.setPageIndex(table.getPageCount() - 1)
                  }
                  disabled={pageIndex === table.getPageCount() - 1}
                >
                  {table.getPageCount()}
                </DefaultButton>
              )}
            </>
          )}
        </div>

        {/* Next Button */}
        <DefaultButton
          variant="secondary"
          handleClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </DefaultButton>
      </div>
    </div>
  );
};

export default DefaultPaginator;
