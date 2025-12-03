import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GridProps, GridColumn, GridFilterValue, GridSortState } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  ArrowUpDown, ArrowUp, ArrowDown, Filter, X, GripVertical, Search,
  ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export const DynamicGrid: React.FC<GridProps> = ({
  columns: initialColumns, data: initialData, loading = false, infiniteScroll = false,
  pageSize: initialPageSize = 20, onLoadMore, onSort, onFilter, onRowClick, onColumnResize,
  striped = true, hoverable = true, resizableColumns = true, showFilters = true,
  stickyHeader = true, emptyMessage, selectedRows = [], onSelectionChange, selectable = false,
  selectionMode = 'checkbox', expandable = false, renderExpandedRow, bulkActions = [],
  onBulkAction, pagination, lazyLoading, rowKey, getRowId, ...baseProps
}) => {
  const { t } = useTranslation();
  const { style, className } = buildComponentStyles(baseProps, '');
  
  const [columns, setColumns] = useState<GridColumn[]>(initialColumns);
  const [data, setData] = useState(initialData);
  const [pageSize, setPageSize] = useState(pagination?.pageSizeOptions?.[0] || initialPageSize);
  const [currentPage, setCurrentPage] = useState(pagination?.currentPage || 1);
  const [totalItems, setTotalItems] = useState(pagination?.totalItems || initialData.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortState, setSortState] = useState<GridSortState | null>(null);
  const [filters, setFilters] = useState<GridFilterValue[]>([]);
  const [activeFilterColumn, setActiveFilterColumn] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [pageInput, setPageInput] = useState('');
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const getUniqueRowId = useCallback((row: any, index: number): string => {
    if (getRowId) return getRowId(row, index);
    if (rowKey) return typeof rowKey === 'function' ? rowKey(row) : String(row[rowKey]);
    return String(index);
  }, [getRowId, rowKey]);

  const { leftFrozenColumns, rightFrozenColumns, regularColumns } = useMemo(() => ({
    leftFrozenColumns: columns.filter(col => col.frozen === 'left'),
    rightFrozenColumns: columns.filter(col => col.frozen === 'right'),
    regularColumns: columns.filter(col => !col.frozen),
  }), [columns]);

  useEffect(() => {
    const widths: Record<string, number> = {};
    initialColumns.forEach(col => { widths[col.key] = parseInt(col.width || '150', 10) || 150; });
    setColumnWidths(widths);
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    setData(initialData);
    if (!pagination && !lazyLoading) setTotalItems(initialData.length);
  }, [initialData, pagination, lazyLoading]);

  useEffect(() => {
    if (lazyLoading?.enabled) {
      const loadData = async () => {
        setIsLoadingMore(true);
        try {
          const result = await lazyLoading.loadPage(currentPage, pageSize);
          setData(result.data);
          setTotalItems(result.totalItems);
        } catch (error) { console.error('Failed to load data:', error); }
        finally { setIsLoadingMore(false); }
      };
      loadData();
    }
  }, [lazyLoading, currentPage, pageSize]);

  const processedData = useMemo(() => {
    if (lazyLoading?.enabled) return data;
    let result = [...data];
    if (filters.length > 0) {
      result = result.filter(row => filters.every(filter => {
        const value = row[filter.key], filterValue = filter.value;
        if (filterValue === null || filterValue === '' || filterValue === undefined) return true;
        const stringValue = String(value).toLowerCase(), stringFilterValue = String(filterValue).toLowerCase();
        switch (filter.operator) {
          case 'equals': return stringValue === stringFilterValue;
          case 'contains': return stringValue.includes(stringFilterValue);
          case 'startsWith': return stringValue.startsWith(stringFilterValue);
          case 'endsWith': return stringValue.endsWith(stringFilterValue);
          case 'gt': return Number(value) > Number(filterValue);
          case 'lt': return Number(value) < Number(filterValue);
          case 'gte': return Number(value) >= Number(filterValue);
          case 'lte': return Number(value) <= Number(filterValue);
          default: return stringValue.includes(stringFilterValue);
        }
      }));
    }
    if (sortState) {
      result.sort((a, b) => {
        const aValue = a[sortState.key], bValue = b[sortState.key];
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        const comparison = typeof aValue === 'number' && typeof bValue === 'number' ? aValue - bValue : String(aValue).localeCompare(String(bValue));
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }
    return result;
  }, [data, filters, sortState, lazyLoading]);

  const displayedData = useMemo(() => {
    if (lazyLoading?.enabled || pagination?.enabled) return processedData;
    if (infiniteScroll) return processedData.slice(0, currentPage * pageSize);
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, infiniteScroll, lazyLoading, pagination]);

  const totalPages = useMemo(() => Math.ceil((lazyLoading?.enabled || pagination?.enabled ? totalItems : processedData.length) / pageSize), [totalItems, processedData.length, pageSize, lazyLoading, pagination]);

  useEffect(() => {
    if (!infiniteScroll || !observerTarget.current) return;
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !isLoadingMore && onLoadMore) { setIsLoadingMore(true); await onLoadMore(); setIsLoadingMore(false); }
    }, { threshold: 0.1 });
    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [infiniteScroll, isLoadingMore, onLoadMore]);

  const handleResizeStart = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault(); e.stopPropagation();
    setResizingColumn(columnKey); setStartX(e.clientX); setStartWidth(columnWidths[columnKey] || 150);
  }, [columnWidths]);

  useEffect(() => {
    if (!resizingColumn) return;
    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX, col = columns.find(c => c.key === resizingColumn);
      const minWidth = col?.minWidth ? parseInt(col.minWidth, 10) : 50, maxWidth = col?.maxWidth ? parseInt(col.maxWidth, 10) : 500;
      setColumnWidths(prev => ({ ...prev, [resizingColumn]: Math.min(maxWidth, Math.max(minWidth, startWidth + diff)) }));
    };
    const handleMouseUp = () => { if (resizingColumn && onColumnResize) onColumnResize(resizingColumn, columnWidths[resizingColumn]); setResizingColumn(null); };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [resizingColumn, startX, startWidth, columns, columnWidths, onColumnResize]);

  const handleSort = useCallback((key: string) => {
    if (baseProps.disabled) return;
    const newDirection = sortState?.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
    setSortState({ key, direction: newDirection }); onSort?.(key, newDirection);
  }, [sortState, onSort, baseProps.disabled]);

  const handleFilterChange = useCallback((key: string, value: string | number | boolean | null, operator: GridFilterValue['operator'] = 'contains') => {
    setFilters(prev => {
      if (value === null || value === '' || value === undefined) return prev.filter(f => f.key !== key);
      const existing = prev.findIndex(f => f.key === key);
      if (existing >= 0) { const updated = [...prev]; updated[existing] = { key, value, operator }; return updated; }
      return [...prev, { key, value, operator }];
    });
  }, []);

  useEffect(() => { onFilter?.(filters); }, [filters, onFilter]);

  const clearFilter = useCallback((key: string) => setFilters(prev => prev.filter(f => f.key !== key)), []);
  const clearAllFilters = useCallback(() => setFilters([]), []);

  const handleSelectAll = useCallback((checked: boolean) => { onSelectionChange?.(checked ? [...displayedData] : []); }, [displayedData, onSelectionChange]);

  const handleSelectRow = useCallback((row: any, checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(checked ? [...selectedRows, row] : selectedRows.filter(r => getUniqueRowId(r, 0) !== getUniqueRowId(row, 0)));
  }, [selectedRows, onSelectionChange, getUniqueRowId]);

  const isRowSelected = useCallback((row: any, index: number) => {
    const rowId = getUniqueRowId(row, index);
    return selectedRows.some((r, i) => getUniqueRowId(r, i) === rowId);
  }, [selectedRows, getUniqueRowId]);

  const handleRowClick = useCallback((row: any, index: number, e: React.MouseEvent) => {
    if (baseProps.disabled) return;
    if (selectionMode === 'click' && selectable && onSelectionChange) handleSelectRow(row, !isRowSelected(row, index));
    if (onRowClick && hoverable) onRowClick(row);
  }, [baseProps.disabled, selectionMode, selectable, onSelectionChange, isRowSelected, handleSelectRow, onRowClick, hoverable]);

  const toggleRowExpand = useCallback((rowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => { const newSet = new Set(prev); newSet.has(rowId) ? newSet.delete(rowId) : newSet.add(rowId); return newSet; });
  }, []);

  const handlePageChange = useCallback((page: number) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); pagination?.onPageChange?.(page); }, [totalPages, pagination]);
  const handlePageSizeChange = useCallback((newSize: string) => { setPageSize(parseInt(newSize, 10)); setCurrentPage(1); pagination?.onPageSizeChange?.(parseInt(newSize, 10)); }, [pagination]);
  const handlePageInputSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); const page = parseInt(pageInput, 10); if (!isNaN(page) && page >= 1 && page <= totalPages) handlePageChange(page); setPageInput(''); }, [pageInput, totalPages, handlePageChange]);
  const handleBulkAction = useCallback((action: string) => { if (onBulkAction && selectedRows.length > 0) onBulkAction(action, selectedRows); }, [onBulkAction, selectedRows]);

  if (baseProps.hidden) return null;

  const renderFilterInput = (col: GridColumn) => {
    const currentFilter = filters.find(f => f.key === col.key), filterType = col.filterType || 'text';
    if (filterType === 'select' && col.filterOptions) {
      return (<Select value={currentFilter?.value?.toString() || ''} onValueChange={(value) => handleFilterChange(col.key, value, 'equals')}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('grid.selectFilter', 'Filter...')} /></SelectTrigger><SelectContent className="bg-popover z-50"><SelectItem value="">{t('grid.all', 'All')}</SelectItem>{col.filterOptions.map((opt) => (<SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>))}</SelectContent></Select>);
    }
    if (filterType === 'boolean') {
      return (<Select value={currentFilter?.value?.toString() || ''} onValueChange={(value) => handleFilterChange(col.key, value === '' ? null : value === 'true', 'equals')}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('grid.selectFilter', 'Filter...')} /></SelectTrigger><SelectContent className="bg-popover z-50"><SelectItem value="">{t('grid.all', 'All')}</SelectItem><SelectItem value="true">{t('common.yes', 'Yes')}</SelectItem><SelectItem value="false">{t('common.no', 'No')}</SelectItem></SelectContent></Select>);
    }
    return (<div className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" /><Input type={filterType === 'number' ? 'number' : 'text'} placeholder={t('grid.search', 'Search...')} value={currentFilter?.value?.toString() || ''} onChange={(e) => handleFilterChange(col.key, e.target.value, filterType === 'number' ? 'equals' : 'contains')} className="h-8 pl-7 text-xs" /></div>);
  };

  const getSortIcon = (columnKey: string) => sortState?.key !== columnKey ? <ArrowUpDown className="h-3.5 w-3.5 opacity-50" /> : sortState.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />;
  const hasActiveFilter = (columnKey: string) => filters.some(f => f.key === columnKey && f.value !== null && f.value !== '');

  const getLeftFrozenPosition = (index: number) => {
    let position = selectable && selectionMode === 'checkbox' ? 40 : 0;
    if (expandable) position += 40;
    for (let i = 0; i < index; i++) position += columnWidths[leftFrozenColumns[i].key] || 150;
    return position;
  };
  const getRightFrozenPosition = (index: number) => {
    let position = 0;
    for (let i = rightFrozenColumns.length - 1; i > index; i--) position += columnWidths[rightFrozenColumns[i].key] || 150;
    return position;
  };

  const renderColumnHeader = (col: GridColumn, frozenStyle?: React.CSSProperties) => (
    <TableHead key={col.key} style={{ width: columnWidths[col.key] || 150, minWidth: col.minWidth || '50px', maxWidth: col.maxWidth || '500px', ...frozenStyle }} className={cn('relative group', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right', frozenStyle && 'sticky z-20 bg-background')}>
      <div className="flex flex-col gap-1">
        <div className={cn('flex items-center gap-1', col.sortable && 'cursor-pointer select-none hover:text-primary', col.align === 'center' && 'justify-center', col.align === 'right' && 'justify-end')} onClick={() => col.sortable && handleSort(col.key)}>
          <span className="truncate">{col.title}</span>
          {col.sortable && getSortIcon(col.key)}
          {showFilters && col.filterable && (
            <Popover open={activeFilterColumn === col.key} onOpenChange={(open) => setActiveFilterColumn(open ? col.key : null)}>
              <PopoverTrigger asChild><button onClick={(e) => e.stopPropagation()} className={cn('p-0.5 rounded hover:bg-muted', hasActiveFilter(col.key) && 'text-primary')}><Filter className="h-3.5 w-3.5" /></button></PopoverTrigger>
              <PopoverContent className="w-56 p-2 bg-popover z-50" align="start"><div className="space-y-2"><p className="text-xs font-medium">{t('grid.filterBy', 'Filter by')} {col.title}</p>{renderFilterInput(col)}{hasActiveFilter(col.key) && (<Button variant="ghost" size="sm" onClick={() => clearFilter(col.key)} className="w-full h-7 text-xs">{t('grid.clearFilter', 'Clear filter')}</Button>)}</div></PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      {resizableColumns && col.resizable !== false && (<div className={cn('absolute right-0 top-0 bottom-0 w-1 cursor-col-resize', 'opacity-0 group-hover:opacity-100 hover:bg-primary/50 transition-opacity', resizingColumn === col.key && 'opacity-100 bg-primary')} onMouseDown={(e) => handleResizeStart(e, col.key)}><GripVertical className="h-full w-3 text-muted-foreground" /></div>)}
    </TableHead>
  );

  const renderColumnCell = (col: GridColumn, row: any, frozenStyle?: React.CSSProperties) => (
    <TableCell key={col.key} className={cn(col.align === 'center' && 'text-center', col.align === 'right' && 'text-right', frozenStyle && 'sticky z-10 bg-inherit')} style={{ width: columnWidths[col.key], maxWidth: columnWidths[col.key], ...frozenStyle }}>
      <div className="truncate">{col.render ? col.render(row[col.key], row) : row[col.key]}</div>
    </TableCell>
  );

  return (
    <div className={cn('w-full', className)} style={style}>
      {selectedRows.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-primary/10 rounded-md border border-primary/20">
          <span className="text-sm font-medium">{selectedRows.length} {t('grid.selected', 'selected')}</span>
          <div className="flex gap-2 ml-auto">
            {bulkActions.map((action) => (<Button key={action.value} variant={action.variant === 'destructive' ? 'destructive' : 'outline'} size="sm" onClick={() => handleBulkAction(action.value)}>{action.icon}{action.label}</Button>))}
            <Button variant="ghost" size="sm" onClick={() => onSelectionChange?.([])}>{t('grid.clearSelection', 'Clear selection')}</Button>
          </div>
        </div>
      )}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 p-2 bg-muted/50 rounded-md">
          <span className="text-xs text-muted-foreground">{t('grid.activeFilters', 'Active filters')}:</span>
          {filters.map((filter) => { const col = columns.find(c => c.key === filter.key); return (<div key={filter.key} className="flex items-center gap-1 px-2 py-1 bg-background rounded text-xs border"><span className="font-medium">{col?.title}</span><span className="text-muted-foreground">: {String(filter.value)}</span><button onClick={() => clearFilter(filter.key)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button></div>); })}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 text-xs">{t('grid.clearAll', 'Clear all')}</Button>
        </div>
      )}
      <div ref={tableRef} className={cn('rounded-md border overflow-auto', resizingColumn && 'select-none cursor-col-resize')}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 z-20 bg-background')}>
            <TableRow>
              {expandable && <TableHead className="w-[40px] sticky left-0 z-20 bg-background"><span className="sr-only">{t('grid.expand', 'Expand')}</span></TableHead>}
              {selectable && selectionMode === 'checkbox' && (<TableHead className="w-[40px] sticky z-20 bg-background" style={{ left: expandable ? 40 : 0 }}><Checkbox checked={selectedRows.length === displayedData.length && displayedData.length > 0} onCheckedChange={handleSelectAll} /></TableHead>)}
              {leftFrozenColumns.map((col, idx) => renderColumnHeader(col, { left: getLeftFrozenPosition(idx) }))}
              {regularColumns.map((col) => renderColumnHeader(col))}
              {rightFrozenColumns.map((col, idx) => renderColumnHeader(col, { right: getRightFrozenPosition(idx) }))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(loading || isLoadingMore) && displayedData.length === 0 ? Array.from({ length: 5 }).map((_, idx) => (<TableRow key={idx}>{expandable && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}{selectable && selectionMode === 'checkbox' && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}{columns.map((col) => (<TableCell key={col.key}><Skeleton className="h-4 w-full" /></TableCell>))}</TableRow>))
            : displayedData.length === 0 ? (<TableRow><TableCell colSpan={columns.length + (selectable && selectionMode === 'checkbox' ? 1 : 0) + (expandable ? 1 : 0)} className="text-center py-8 text-muted-foreground">{emptyMessage || t('grid.noData', 'No data available')}</TableCell></TableRow>)
            : displayedData.map((row, idx) => {
                const rowId = getUniqueRowId(row, idx), isExpanded = expandedRows.has(rowId), isSelected = isRowSelected(row, idx);
                return (
                  <React.Fragment key={rowId}>
                    <TableRow className={cn(striped && idx % 2 === 1 && 'bg-muted/50', hoverable && 'cursor-pointer hover:bg-muted', isSelected && 'bg-primary/10')} onClick={(e) => handleRowClick(row, idx, e)}>
                      {expandable && (<TableCell className="sticky left-0 z-10 bg-inherit" onClick={(e) => toggleRowExpand(rowId, e)}><button className="p-1 hover:bg-muted rounded">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button></TableCell>)}
                      {selectable && selectionMode === 'checkbox' && (<TableCell className="sticky z-10 bg-inherit" style={{ left: expandable ? 40 : 0 }} onClick={(e) => e.stopPropagation()}><Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)} /></TableCell>)}
                      {leftFrozenColumns.map((col, colIdx) => renderColumnCell(col, row, { left: getLeftFrozenPosition(colIdx) }))}
                      {regularColumns.map((col) => renderColumnCell(col, row))}
                      {rightFrozenColumns.map((col, colIdx) => renderColumnCell(col, row, { right: getRightFrozenPosition(colIdx) }))}
                    </TableRow>
                    {expandable && isExpanded && renderExpandedRow && (<TableRow className="bg-muted/30"><TableCell colSpan={columns.length + (selectable && selectionMode === 'checkbox' ? 1 : 0) + 1} className="p-4">{renderExpandedRow(row)}</TableCell></TableRow>)}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
        {infiniteScroll && (<div ref={observerTarget} className="h-10 flex items-center justify-center">{isLoadingMore && <Skeleton className="h-4 w-32" />}</div>)}
      </div>
      {(pagination?.enabled || (!infiniteScroll && totalPages > 1)) && (
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('grid.rowsPerPage', 'Rows per page')}:</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}><SelectTrigger className="w-[70px] h-8"><SelectValue /></SelectTrigger><SelectContent className="bg-popover">{(pagination?.pageSizeOptions || [10, 20, 50, 100]).map((size) => (<SelectItem key={size} value={String(size)}>{size}</SelectItem>))}</SelectContent></Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('grid.page', 'Page')} {currentPage} {t('grid.of', 'of')} {totalPages}</span>
            {pagination?.showPageInput && (<form onSubmit={handlePageInputSubmit} className="flex items-center gap-1"><Input type="number" min={1} max={totalPages} value={pageInput} onChange={(e) => setPageInput(e.target.value)} placeholder={t('grid.goTo', 'Go to')} className="w-16 h-8 text-xs" /><Button type="submit" variant="outline" size="sm" className="h-8">{t('grid.go', 'Go')}</Button></form>)}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
            <div className="flex items-center gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pageNum: number; if (totalPages <= 5) pageNum = i + 1; else if (currentPage <= 3) pageNum = i + 1; else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i; else pageNum = currentPage - 2 + i; return (<Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => handlePageChange(pageNum)} className="h-8 w-8 p-0">{pageNum}</Button>); })}</div>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8 p-0"><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">{t('grid.showing', 'Showing')} {displayedData.length} {t('grid.of', 'of')} {lazyLoading?.enabled || pagination?.enabled ? totalItems : processedData.length} {t('grid.results', 'results')}{filters.length > 0 && ` (${t('grid.filtered', 'filtered')})`}</div>
    </div>
  );
};
