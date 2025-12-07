import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Upload, FileSpreadsheet, FileText, ChevronDown, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GridColumn } from '@/types/component.types';

export type ExportFormat = 'csv' | 'json' | 'excel';

export interface GridImportExportProps {
  columns: GridColumn[];
  data: any[];
  onImport?: (data: any[], columns?: GridColumn[]) => void;
  onExport?: (format: ExportFormat, selectedColumns: string[], data: any[]) => void;
  onColumnsReorder?: (columns: GridColumn[]) => void;
  enableImport?: boolean;
  enableExport?: boolean;
  enableColumnConfig?: boolean;
  fileName?: string;
}

export interface ColumnConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: GridColumn[];
  onColumnsChange: (columns: GridColumn[]) => void;
  onExport: (format: ExportFormat, selectedColumns: string[]) => void;
}

// Utility functions for export
const convertToCSV = (data: any[], columns: GridColumn[], selectedKeys: string[]): string => {
  const filteredColumns = columns.filter(col => selectedKeys.includes(col.key));
  const headers = filteredColumns.map(col => col.title).join(',');
  const rows = data.map(row =>
    filteredColumns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    }).join(',')
  );
  return [headers, ...rows].join('\n');
};

const convertToJSON = (data: any[], columns: GridColumn[], selectedKeys: string[]): string => {
  const filteredData = data.map(row => {
    const filtered: Record<string, any> = {};
    selectedKeys.forEach(key => {
      filtered[key] = row[key];
    });
    return filtered;
  });
  return JSON.stringify(filteredData, null, 2);
};

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parse CSV to data array
const parseCSV = (csvContent: string): { data: any[]; headers: string[] } => {
  const lines = csvContent.trim().split('\n');
  if (lines.length === 0) return { data: [], headers: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return { data, headers };
};

// Column Config Modal with drag and drop
export const ColumnConfigModal: React.FC<ColumnConfigModalProps> = ({
  open,
  onOpenChange,
  columns,
  onColumnsChange,
  onExport,
}) => {
  const { t } = useTranslation();
  const [localColumns, setLocalColumns] = useState<GridColumn[]>(columns);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(columns.map(c => c.key))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  React.useEffect(() => {
    setLocalColumns(columns);
    setSelectedColumns(new Set(columns.map(c => c.key)));
  }, [columns, open]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...localColumns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);
    setLocalColumns(newColumns);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const toggleColumn = (key: string) => {
    const newSelected = new Set(selectedColumns);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedColumns(newSelected);
  };

  const selectAll = () => {
    setSelectedColumns(new Set(localColumns.map(c => c.key)));
  };

  const deselectAll = () => {
    setSelectedColumns(new Set());
  };

  const handleApply = () => {
    onColumnsChange(localColumns);
    onOpenChange(false);
  };

  const handleExport = () => {
    onExport(exportFormat, Array.from(selectedColumns));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('grid.columnConfig.title', 'Column Configuration')}</DialogTitle>
          <DialogDescription>
            {t('grid.columnConfig.description', 'Drag to reorder columns, select columns to export')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {t('grid.selectAll', 'Select all')}
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                {t('grid.deselectAll', 'Deselect all')}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg max-h-[300px] overflow-auto">
            {localColumns.map((column, index) => (
              <div
                key={column.key}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 border-b last:border-b-0 cursor-move hover:bg-muted/50 transition-colors ${
                  draggedIndex === index ? 'bg-primary/10' : ''
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Checkbox
                  checked={selectedColumns.has(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                />
                <span className="flex-1 text-sm">{column.title}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>{t('grid.exportFormat', 'Export Format')}</Label>
            <div className="flex gap-2">
              {(['csv', 'json'] as ExportFormat[]).map((format) => (
                <Button
                  key={format}
                  variant={exportFormat === format ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExportFormat(format)}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleApply}>
            {t('grid.applyOrder', 'Apply Order')}
          </Button>
          <Button onClick={handleExport} disabled={selectedColumns.size === 0}>
            <Download className="h-4 w-4 mr-2" />
            {t('grid.exportSelected', 'Export Selected')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Import Modal
export interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => void;
  columns: GridColumn[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onOpenChange,
  onImport,
  columns,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          setPreviewData(Array.isArray(jsonData) ? jsonData.slice(0, 5) : []);
        } else if (file.name.endsWith('.csv')) {
          const { data } = parseCSV(content);
          setPreviewData(data.slice(0, 5));
        } else {
          setError(t('grid.import.unsupportedFormat', 'Unsupported file format'));
        }
      } catch (err) {
        setError(t('grid.import.parseError', 'Failed to parse file'));
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        let data: any[] = [];
        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          const result = parseCSV(content);
          data = result.data;
        }
        onImport(Array.isArray(data) ? data : []);
        onOpenChange(false);
        setPreviewData([]);
        setFileName('');
      } catch (err) {
        setError(t('grid.import.importError', 'Failed to import data'));
      }
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    onOpenChange(false);
    setPreviewData([]);
    setFileName('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('grid.import.title', 'Import Data')}</DialogTitle>
          <DialogDescription>
            {t('grid.import.description', 'Upload a CSV or JSON file to import data')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('grid.import.selectFile', 'Select File')}
            </Button>
            {fileName && (
              <p className="mt-2 text-sm text-muted-foreground">{fileName}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {previewData.length > 0 && (
            <div className="space-y-2">
              <Label>{t('grid.import.preview', 'Preview (first 5 rows)')}</Label>
              <div className="border rounded-lg overflow-auto max-h-[200px]">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(previewData[0]).map(key => (
                        <th key={key} className="px-2 py-1 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-2 py-1 truncate max-w-[100px]">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={handleImport} disabled={previewData.length === 0}>
            {t('grid.import.import', 'Import')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main GridImportExport Component
export const GridImportExport: React.FC<GridImportExportProps> = ({
  columns,
  data,
  onImport,
  onExport,
  onColumnsReorder,
  enableImport = true,
  enableExport = true,
  enableColumnConfig = true,
  fileName = 'export',
}) => {
  const { t } = useTranslation();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const handleQuickExport = (format: ExportFormat) => {
    const allColumnKeys = columns.map(c => c.key);
    
    if (onExport) {
      onExport(format, allColumnKeys, data);
      return;
    }

    // Default export behavior
    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(data, columns, allColumnKeys);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        break;
      case 'json':
        content = convertToJSON(data, columns, allColumnKeys);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
        break;
      default:
        return;
    }

    downloadFile(content, `${fileName}.${extension}`, mimeType);
  };

  const handleConfigExport = (format: ExportFormat, selectedColumns: string[]) => {
    if (onExport) {
      onExport(format, selectedColumns, data);
      return;
    }

    let content: string;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = convertToCSV(data, columns, selectedColumns);
        mimeType = 'text/csv;charset=utf-8;';
        extension = 'csv';
        break;
      case 'json':
        content = convertToJSON(data, columns, selectedColumns);
        mimeType = 'application/json;charset=utf-8;';
        extension = 'json';
        break;
      default:
        return;
    }

    downloadFile(content, `${fileName}.${extension}`, mimeType);
  };

  const handleImport = (importedData: any[]) => {
    onImport?.(importedData);
  };

  const handleColumnsChange = (newColumns: GridColumn[]) => {
    onColumnsReorder?.(newColumns);
  };

  return (
    <div className="flex items-center gap-2">
      {enableImport && onImport && (
        <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          {t('grid.import.button', 'Import')}
        </Button>
      )}

      {enableExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('grid.export', 'Export')}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleQuickExport('csv')}>
              <FileText className="h-4 w-4 mr-2" />
              {t('grid.exportCSV', 'Export as CSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleQuickExport('json')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {t('grid.exportJSON', 'Export as JSON')}
            </DropdownMenuItem>
            {enableColumnConfig && (
              <DropdownMenuItem onClick={() => setConfigModalOpen(true)}>
                <GripVertical className="h-4 w-4 mr-2" />
                {t('grid.configureExport', 'Configure & Export...')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {enableImport && onImport && (
        <ImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          onImport={handleImport}
          columns={columns}
        />
      )}

      {enableColumnConfig && (
        <ColumnConfigModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          columns={columns}
          onColumnsChange={handleColumnsChange}
          onExport={handleConfigExport}
        />
      )}
    </div>
  );
};
