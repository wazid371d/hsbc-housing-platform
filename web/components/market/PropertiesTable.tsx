"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { formatPrice } from "@/lib/format";
import type { MarketProperty } from "@/lib/market";

const columns: ColumnDef<MarketProperty>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "squareFootage", header: "Sq Ft" },
  { accessorKey: "bedrooms", header: "Beds" },
  { accessorKey: "bathrooms", header: "Baths" },
  { accessorKey: "yearBuilt", header: "Year" },
  { accessorKey: "schoolRating", header: "School" },
  {
    accessorKey: "price",
    header: "Price",
    cell: (info) => formatPrice(info.getValue<number>()),
  },
];

export function PropertiesTable({ data }: { data: MarketProperty[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "price", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [bedroomsFilter, setBedroomsFilter] = useState<string>("all");

  const filtered = useMemo(
    () =>
      bedroomsFilter === "all"
        ? data
        : data.filter((d) => d.bedrooms === Number(bedroomsFilter)),
    [data, bedroomsFilter]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const bedroomOptions = useMemo(
    () => Array.from(new Set(data.map((d) => d.bedrooms))).sort((a, b) => a - b),
    [data]
  );

  function exportPdf() {
    const doc = new jsPDF();
    doc.text("Property Market Data", 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["ID", "Sq Ft", "Beds", "Baths", "Year", "School", "Price"]],
      body: table.getSortedRowModel().rows.map((r) => {
        const p = r.original;
        return [p.id, p.squareFootage, p.bedrooms, p.bathrooms, p.yearBuilt, p.schoolRating, formatPrice(p.price)];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [11, 92, 171] },
    });
    doc.save("properties.pdf");
  }

  return (
    <Card>
      <CardHeader
        title="Property data"
        description={`${table.getFilteredRowModel().rows.length} of ${data.length} properties`}
        action={
          <div className="flex flex-wrap items-end gap-2">
            <Button variant="secondary" className="text-primary" onClick={() => window.open("/api/market/export/csv", "_blank")}>
              Export CSV
            </Button>
            <Button variant="secondary" className="text-primary" onClick={exportPdf}>
              Export PDF
            </Button>
          </div>
        }
      />
      <CardBody className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            id="global-filter"
            label="Search"
            placeholder="Filter all columns…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <div className="space-y-1">
            <label htmlFor="beds-filter" className="block text-sm font-medium">Bedrooms</label>
            <select
              id="beds-filter"
              value={bedroomsFilter}
              onChange={(e) => setBedroomsFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              {bedroomOptions.map((b) => (
                <option key={b} value={b}>{b} bedrooms</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-background text-left text-muted">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th key={header.id} scope="col" className="px-3 py-2 font-medium">
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          aria-label={`Sort by ${header.column.id}`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span aria-hidden="true">{sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : ""}</span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
