/**
 * Export utilities for CSV and PDF generation
 */

import { format } from "date-fns";

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns: {
    key: keyof T;
    header: string;
    formatter?: (value: any) => string;
  }[]
): string {
  if (data.length === 0) return "";

  // Create header row
  const headers = columns.map((col) => `"${col.header}"`).join(",");

  // Create data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        const formatted = col.formatter ? col.formatter(value) : value;
        // Escape quotes and wrap in quotes
        const escaped = String(formatted ?? "").replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
  );

  return [headers, ...rows].join("\n");
}

/**
 * Download content as a file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: {
    key: keyof T;
    header: string;
    formatter?: (value: any) => string;
  }[],
  filename: string
): void {
  const csv = convertToCSV(data, columns);
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
  downloadFile(csv, `${filename}_${timestamp}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Generate and download PDF (simple HTML-based approach)
 * For more complex PDFs, consider using libraries like jsPDF or pdfmake
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: {
    key: keyof T;
    header: string;
    formatter?: (value: any) => string;
  }[],
  title: string,
  filename: string
): void {
  const timestamp = format(new Date(), "MMMM d, yyyy h:mm a");

  // Generate HTML table
  const tableHeaders = columns.map((col) => `<th>${col.header}</th>`).join("");
  const tableRows = data
    .map(
      (item) =>
        `<tr>${columns
          .map((col) => {
            const value = item[col.key];
            const formatted = col.formatter ? col.formatter(value) : value;
            return `<td>${formatted ?? ""}</td>`;
          })
          .join("")}</tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1f2937; }
        h1 { font-size: 24px; margin-bottom: 8px; color: #111827; }
        .subtitle { font-size: 14px; color: #6b7280; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background-color: #f3f4f6; padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
        td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background-color: #f9fafb; }
        .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
        @media print {
          body { padding: 20px; }
          @page { margin: 20mm; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">Generated on ${timestamp} • Total Records: ${data.length}</p>
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <p class="footer">iBarangay Management System</p>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Pre-configured export functions for common data types
 */

// Complaints export configuration
export const exportComplaints = (complaints: any[]) => {
  const columns = [
    { key: "id" as const, header: "ID" },
    { key: "title" as const, header: "Title" },
    { key: "category" as const, header: "Category" },
    { key: "status" as const, header: "Status" },
    { key: "priority" as const, header: "Priority" },
    {
      key: "user" as const,
      header: "Submitted By",
      formatter: (user: any) =>
        user ? `${user.firstName} ${user.lastName}` : "N/A",
    },
    {
      key: "createdAt" as const,
      header: "Date Submitted",
      formatter: (date: string) =>
        date ? format(new Date(date), "MMM d, yyyy") : "N/A",
    },
    {
      key: "updatedAt" as const,
      header: "Last Updated",
      formatter: (date: string) =>
        date ? format(new Date(date), "MMM d, yyyy") : "N/A",
    },
  ];

  return {
    toCSV: () => exportToCSV(complaints, columns, "complaints"),
    toPDF: () =>
      exportToPDF(complaints, columns, "Complaints Report", "complaints"),
  };
};

// Service Requests export configuration
export const exportServices = (services: any[]) => {
  const columns = [
    { key: "id" as const, header: "ID" },
    { key: "requestType" as const, header: "Type" },
    { key: "itemName" as const, header: "Item/Facility" },
    { key: "status" as const, header: "Status" },
    { key: "purpose" as const, header: "Purpose" },
    {
      key: "user" as const,
      header: "Requested By",
      formatter: (user: any) =>
        user ? `${user.firstName} ${user.lastName}` : "N/A",
    },
    {
      key: "borrowDate" as const,
      header: "Date Needed",
      formatter: (date: string) =>
        date ? format(new Date(date), "MMM d, yyyy") : "N/A",
    },
    {
      key: "createdAt" as const,
      header: "Date Requested",
      formatter: (date: string) =>
        date ? format(new Date(date), "MMM d, yyyy") : "N/A",
    },
  ];

  return {
    toCSV: () => exportToCSV(services, columns, "service_requests"),
    toPDF: () =>
      exportToPDF(
        services,
        columns,
        "Service Requests Report",
        "service_requests"
      ),
  };
};

// Audit Logs export configuration
export const exportAuditLogs = (logs: any[]) => {
  const columns = [
    {
      key: "timestamp" as const,
      header: "Timestamp",
      formatter: (date: string) =>
        date ? format(new Date(date), "MMM d, yyyy h:mm a") : "N/A",
    },
    {
      key: "user" as const,
      header: "User",
      formatter: (user: any) =>
        user ? `${user.firstName} ${user.lastName}` : "Unknown",
    },
    { key: "action" as const, header: "Action" },
    { key: "resource" as const, header: "Resource" },
    { key: "ipAddress" as const, header: "IP Address" },
    { key: "status" as const, header: "Status" },
  ];

  return {
    toCSV: () => exportToCSV(logs, columns, "audit_logs"),
    toPDF: () => exportToPDF(logs, columns, "Audit Logs Report", "audit_logs"),
  };
};

// Users export configuration
export const exportUsers = (users: any[]) => {
  const columns = [
    { key: "id" as const, header: "ID" },
    {
      key: "firstName" as const,
      header: "Name",
      formatter: (value: any, item?: any) => {
        const user = item || { firstName: value, lastName: "" };
        return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
      },
    },
    { key: "email" as const, header: "Email" },
    { key: "role" as const, header: "Role" },
    { key: "phoneNumber" as const, header: "Phone" },
    { key: "address" as const, header: "Address" },
    {
      key: "isVerified" as const,
      header: "Verified",
      formatter: (verified: boolean) => (verified ? "Yes" : "No"),
    },
  ];

  return {
    toCSV: () => exportToCSV(users, columns as any, "users"),
    toPDF: () => exportToPDF(users, columns as any, "Users Report", "users"),
  };
};
