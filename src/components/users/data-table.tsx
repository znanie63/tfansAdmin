import { useRef, useCallback, useEffect } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onLoadMore,
  hasMore,
  loading,
}: DataTableProps<TData, TValue>) {
  const observerRef = useRef<IntersectionObserver>();
  const lastRowRef = useRef<HTMLTableRowElement>(null);

  const lastRowCallback = useCallback((node: HTMLTableRowElement | null) => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, onLoadMore]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={`header-${headerGroup.id}`}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={`head-${header.id}`}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={`row-${row.id}`}
                  ref={index === table.getRowModel().rows.length - 1 ? lastRowRef : undefined}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={`cell-${cell.id}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <Button onClick={onLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}