import React, { useState } from "react";
import {
  Check,
  X,
  Trash2,
  CheckSquare,
  Square,
  MinusSquare,
  MoreHorizontal,
} from "lucide-react";
import { cn, Button, Modal, ConfirmDialog } from "./UI";

/**
 * Bulk selection hook
 */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = (id: string) => selectedIds.has(id);

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;

  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < items.length;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  };

  const getSelectedItems = () =>
    items.filter((item) => selectedIds.has(item.id));

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectAll,
    getSelectedItems,
  };
}

/**
 * Checkbox for bulk selection
 */
interface BulkCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  className?: string;
}

export const BulkCheckbox: React.FC<BulkCheckboxProps> = ({
  checked,
  indeterminate,
  onChange,
  className,
}) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={cn(
      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
      checked
        ? "bg-primary-600 border-primary-600"
        : "bg-white border-gray-300 hover:border-gray-400",
      className
    )}
  >
    {indeterminate ? (
      <MinusSquare className="w-3 h-3 text-white" />
    ) : checked ? (
      <Check className="w-3 h-3 text-white" />
    ) : null}
  </button>
);

/**
 * Bulk action bar that appears when items are selected
 */
interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "primary" | "danger" | "secondary";
  onClick: () => void;
  confirmMessage?: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  actions: BulkAction[];
  isLoading?: boolean;
  className?: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
  isLoading,
  className,
}) => {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  if (selectedCount === 0) return null;

  const handleActionClick = (action: BulkAction) => {
    if (action.confirmMessage) {
      setConfirmAction(action);
    } else {
      action.onClick();
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4 duration-200",
          className
        )}
      >
        <div className="flex items-center gap-3 border-r border-gray-700 pr-4">
          <button
            onClick={onClearSelection}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">
            {selectedCount} of {totalCount} selected
          </span>
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium"
            >
              Select all
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "secondary"}
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={isLoading}
              className={cn(
                action.variant === "danger" &&
                  "bg-red-600 hover:bg-red-700 border-red-600",
                action.variant === "primary" &&
                  "bg-primary-600 hover:bg-primary-700 border-primary-600"
              )}
            >
              {action.icon}
              <span className="ml-1.5">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          confirmAction?.onClick();
          setConfirmAction(null);
        }}
        title={confirmAction?.label || "Confirm Action"}
        description={
          confirmAction?.confirmMessage ||
          "Are you sure you want to perform this action?"
        }
        confirmText="Confirm"
        variant={confirmAction?.variant === "danger" ? "danger" : "primary"}
        isLoading={isLoading}
      />
    </>
  );
};

/**
 * Bulk status update modal
 */
interface BulkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string, note?: string) => void;
  selectedCount: number;
  statusOptions: { value: string; label: string }[];
  title?: string;
  isLoading?: boolean;
}

export const BulkStatusModal: React.FC<BulkStatusModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  statusOptions,
  title = "Update Status",
  isLoading,
}) => {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (status) {
      onConfirm(status, note || undefined);
      setStatus("");
      setNote("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">
          Update status for{" "}
          <span className="font-semibold">{selectedCount}</span> selected items.
        </p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            New Status <span className="text-red-500">*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="">Select status...</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for this status change..."
            className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!status || isLoading}
            isLoading={isLoading}
          >
            Update {selectedCount} Items
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default {
  useBulkSelection,
  BulkCheckbox,
  BulkActionBar,
  BulkStatusModal,
};
