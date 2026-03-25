"use client";

import * as React from "react";
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
} from "lucide-react";

/* ── Metronic-style DataTable ──
 * Clean table with subtle row borders, hover states,
 * built-in search, sorting icons, and pagination
 */

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    pageSize?: number;
    toolbar?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    pageSize = 10,
    toolbar,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: { sorting, columnFilters },
        initialState: { pagination: { pageSize } },
    });

    return (
        <div className="space-y-0">
            {/* ── Toolbar ── */}
            {(searchKey || toolbar) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
                    {searchKey && (
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                onChange={(e) =>
                                    table.getColumn(searchKey)?.setFilterValue(e.target.value)
                                }
                                className="h-8 w-[240px] pl-8 text-sm"
                            />
                        </div>
                    )}
                    {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
                </div>
            )}

            {/* ── Table ── */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {table.getHeaderGroups().map((headerGroup) =>
                                headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={cn(
                                            "px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                                            header.column.getCanSort() && "cursor-pointer select-none"
                                        )}
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                            {header.column.getCanSort() && (
                                                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                                            )}
                                        </div>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-border/50 transition-colors hover:bg-accent/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-5 py-3.5 text-foreground">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-10 text-center text-muted-foreground">
                                    No results found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                    <p className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-medium text-foreground">
                            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                        </span>
                        –
                        <span className="font-medium text-foreground">
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length
                            )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {table.getFilteredRowModel().rows.length}
                        </span>
                    </p>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page numbers */}
                        {Array.from({ length: table.getPageCount() }, (_, i) => (
                            <Button
                                key={i}
                                variant={table.getState().pagination.pageIndex === i ? "default" : "ghost"}
                                size="icon"
                                className="h-7 w-7 text-xs"
                                onClick={() => table.setPageIndex(i)}
                            >
                                {i + 1}
                            </Button>
                        ))}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Helper: Sortable column header ── */
export function SortableHeader({ column, children }: { column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | "asc" | "desc" }; children: React.ReactNode }) {
    return (
        <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {children}
        </button>
    );
}
