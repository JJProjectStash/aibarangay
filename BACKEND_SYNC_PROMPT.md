# Backend Sync Prompt - Performance & UX Improvements

## Overview

This document outlines the backend API changes needed to support the new frontend features implemented for performance and UX improvements.

**Last Updated:** December 5, 2025  
**Status:** ✅ All frontend features implemented and verified

---

## 1. Bulk Status Update Endpoints

### Complaints Bulk Update

The frontend now supports bulk status updates for complaints. Currently using individual API calls in parallel.

**Recommended Backend Enhancement:**

```javascript
// POST /api/complaints/bulk-status
// Request Body:
{
  "ids": ["complaint_id_1", "complaint_id_2", ...],
  "status": "resolved" | "pending" | "investigating" | "rejected",
  "note": "Optional resolution note"
}

// Response:
{
  "success": true,
  "updated": 5,
  "failed": 0,
  "results": [
    { "id": "complaint_id_1", "success": true },
    { "id": "complaint_id_2", "success": true }
  ]
}
```

### Services Bulk Update

```javascript
// POST /api/services/bulk-status
// Request Body:
{
  "ids": ["service_id_1", "service_id_2", ...],
  "status": "approved" | "rejected" | "borrowed" | "returned",
  "note": "Optional note"
}
```

---

## 2. Server-Side Pagination (Optional but Recommended)

Currently using client-side pagination. For large datasets, consider adding server-side pagination:

### Complaints List

```javascript
// GET /api/complaints?page=1&limit=10&status=pending&search=keyword
// Response:
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "pageSize": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Services List

```javascript
// GET /api/services?page=1&limit=10&status=all&type=Equipment&search=keyword
```

### Audit Logs

```javascript
// GET /api/audit-logs?page=1&limit=25&action=login&startDate=2024-01-01&endDate=2024-01-31
```

---

## 3. Export Endpoints (Optional)

If server-side export is preferred over client-side:

```javascript
// GET /api/complaints/export?format=csv&status=all&startDate=2024-01-01
// GET /api/complaints/export?format=pdf&ids=id1,id2,id3

// GET /api/services/export?format=csv
// GET /api/audit-logs/export?format=csv
// GET /api/users/export?format=csv
```

---

## 4. Current Frontend Implementation Notes

### What's Already Working (Client-Side)

- ✅ Pagination: Uses `usePagination<T>` hook for client-side pagination with type safety
- ✅ Search/Filter: Debounced search with 300ms delay
- ✅ Bulk Actions: Uses `Promise.all` with existing individual update endpoints
- ✅ Export: Client-side CSV/PDF generation using browser APIs

### API Calls Currently Used

```javascript
// Complaints
api.getComplaints(user); // GET all complaints
api.updateComplaintStatus(id, status, note); // PATCH individual complaint

// Services
api.getServices(user); // GET all services
api.updateServiceStatus(id, status, note); // PATCH individual service

// Audit Logs
api.getAuditLogs(); // GET all audit logs
```

---

## 5. Priority Recommendations

### High Priority (Performance Impact)

1. **Bulk Status Update Endpoints** - Reduces N API calls to 1 for bulk operations
2. **Server-Side Pagination for Audit Logs** - Audit logs can grow very large

### Medium Priority (Nice to Have)

3. **Server-Side Pagination for Complaints/Services** - When data exceeds ~500 items
4. **Search Endpoint with Filters** - Reduces data transfer

### Low Priority (Future Enhancement)

5. **Server-Side Export** - For very large datasets (>10,000 rows)

---

## 6. No Breaking Changes Required

The current implementation is backward compatible. All new features work with existing API endpoints. The suggested changes are optimizations for better performance at scale.

---

## 7. Files Modified in Frontend

### New Components

- `components/ErrorBoundary.tsx` - Error boundary with fallback UI (uses `react-error-boundary` library)
- `components/Pagination.tsx` - Pagination component with page size selector
- `components/LazyImage.tsx` - Lazy loading images with Intersection Observer
- `components/Loading.tsx` - Loading states, skeletons, empty/error states
- `components/SearchFilter.tsx` - Search and filter components with debounce
- `components/BulkActions.tsx` - Bulk selection hook and action components

### New Utilities

- `hooks/useAsync.ts` - `useAsync<T>`, `usePagination<T>`, `useDebounce<T>` hooks
- `hooks/index.ts` - Hook exports
- `utils/export.ts` - CSV/PDF export utilities

### Modified Pages

- `pages/Complaints.tsx` - Added pagination, bulk actions, export
- `pages/Services.tsx` - Added pagination, bulk actions, export
- `pages/AdminAuditLogs.tsx` - Added pagination, export
- `pages/Help.tsx` - Fixed component key props

### Modified Config

- `App.tsx` - Added ErrorBoundary wrapper
- `tsconfig.json` - Updated target to ES2020, useDefineForClassFields to false

### New Dependencies

- `react-error-boundary` - Error boundary library

---

## 8. Verification Checklist

All items have been verified:

- [x] Build compiles without errors (`npm run build` passes)
- [x] No TypeScript errors in any files
- [x] Pagination uses correct hook methods (`items`, `setPage`, `setPageSize`)
- [x] Bulk selection uses correct methods (`toggleSelection`, `clearSelection`)
- [x] Export functions work for CSV and PDF
- [x] Error boundaries wrap main application
- [x] Loading states show during data fetching
- [x] All components properly typed with generics

- `react-error-boundary` - For error boundary functionality
