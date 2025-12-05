import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Download,
  Filter,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Select,
  Skeleton,
} from "../components/UI";
import { api } from "../services/api";
import { AuditLog } from "../types";
import { Pagination } from "../components/Pagination";
import { usePagination, useDebounce } from "../hooks/useAsync";
import { TableSkeleton, ErrorState } from "../components/Loading";
import { exportAuditLogs } from "../utils/export";
import { useToast } from "../components/Toast";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { showToast } = useToast();

  // Debounced search
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        setError("Failed to fetch audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    let filtered = logs.filter(
      (log) =>
        log.action.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (log.user?.email &&
          log.user.email
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        log.resource.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    return filtered;
  }, [logs, debouncedSearch, statusFilter]);

  // Pagination
  const pagination = usePagination<AuditLog>(filteredLogs, { pageSize: 20 });

  // Export handlers
  const handleExportCSV = () => {
    exportAuditLogs(filteredLogs).toCSV();
    showToast("Success", "Export started", "success");
  };

  const handleExportPDF = () => {
    exportAuditLogs(filteredLogs).toPDF();
  };

  if (error && !loading) {
    return (
      <ErrorState
        title="Failed to load audit logs"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">
            Track system activities and security events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="w-4 h-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Printer className="w-4 h-4 mr-1" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by action, user, or resource..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton rows={10} columns={6} />
            ) : (
              <tbody className="divide-y divide-gray-100">
                {pagination.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {debouncedSearch || statusFilter !== "all"
                        ? "No logs match your search criteria"
                        : "No audit logs yet"}
                    </td>
                  </tr>
                ) : (
                  pagination.items.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {log.user ? (
                          <>
                            <div className="font-medium text-gray-900">
                              {log.user.firstName} {log.user.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.user.email}
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500 italic">
                            Unknown User
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {log.ipAddress || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            log.status === "success" ? "success" : "danger"
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            )}
          </table>

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="border-t border-gray-200">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                pageSize={pagination.pageSize}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                pageSizeOptions={[20, 50, 100]}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;
