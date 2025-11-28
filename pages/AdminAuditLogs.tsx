import React, { useEffect, useState } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from '../components/UI';
import { api } from '../services/api';
import { AuditLog } from '../types';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
        setLoading(true);
        const data = await api.getAuditLogs();
        setLogs(data);
        setLoading(false);
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
      log.action.toLowerCase().includes(search.toLowerCase()) || 
      log.user.email.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track system activities and security events</p>
        </div>
        <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
        </Button>
      </div>

      <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 pb-4">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    placeholder="Search by action, user, or resource..." 
                    className="pl-9" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                  />
              </div>
              <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" className="text-gray-500">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                 </Button>
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
                  <tbody className="divide-y divide-gray-100">
                      {loading ? (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading logs...</td></tr>
                      ) : filteredLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                  {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">{log.user.firstName} {log.user.lastName}</div>
                                  <div className="text-xs text-gray-500">{log.user.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="font-medium text-gray-700">{log.action}</span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                  {log.resource}
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-xs">
                                  {log.ipAddress}
                              </td>
                              <td className="px-6 py-4">
                                  <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                                      {log.status}
                                  </Badge>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;