import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GridProps, GridColumn, GridGroupConfig, GridAggregation } from '@/types/component.types';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpDown, 
  GripVertical, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Layers 
} from 'lucide-react';

interface GroupedData {
  key: string;
  value: any;
  rows: any[];
  aggregations: Record<string, number>;
  subGroups?: GroupedData[];
}

export const DynamicGrid: React.FC<GridProps> = ({
  columns: initialColumns,
  data,
  loading = false,
  infiniteScroll = false,
  pageSize = 20,
  onLoadMore,
  onSort,
  onRowClick,
  striped = true,
  hoverable = true,
  reorderableColumns = false,
  onColumnReorder,
  groupBy = [],
  onGroupByChange,
  showGroupByPanel = false,
  collapsibleGroups = true,
  defaultExpandedGroups = [],
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(baseProps, '');
  const [columns, setColumns] = useState<GridColumn[]>(initialColumns);
  const [displayedData, setDisplayedData] = useState(data.slice(0, pageSize));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(defaultExpandedGroups));
  const [draggedColumn, setDraggedColumn] = useState<GridColumn | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [internalGroupBy, setInternalGroupBy] = useState<GridGroupConfig[]>(groupBy);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    setDisplayedData(data.slice(0, pageSize));
  }, [data, pageSize]);

  useEffect(() => {
    setInternalGroupBy(groupBy);
  }, [groupBy]);

  useEffect(() => {
    if (!infiniteScroll || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && onLoadMore) {
          setIsLoadingMore(true);
          await onLoadMore();
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [infiniteScroll, isLoadingMore, onLoadMore]);

  // Column drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, column: GridColumn) => {
    if (!reorderableColumns || column.draggable === false) return;
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', column.key);
  }, [reorderableColumns]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedColumn) return;
    setDragOverIndex(index);
  }, [draggedColumn]);

  const handleDragEnd = useCallback(() => {
    if (draggedColumn && dragOverIndex !== null) {
      const newColumns = [...columns];
      const draggedIndex = columns.findIndex(c => c.key === draggedColumn.key);
      
      if (draggedIndex !== -1 && draggedIndex !== dragOverIndex) {
        newColumns.splice(draggedIndex, 1);
        newColumns.splice(dragOverIndex, 0, draggedColumn);
        setColumns(newColumns);
        onColumnReorder?.(newColumns);
      }
    }
    setDraggedColumn(null);
    setDragOverIndex(null);
  }, [draggedColumn, dragOverIndex, columns, onColumnReorder]);

  // Group by handlers
  const handleAddGroupBy = useCallback((columnKey: string) => {
    if (internalGroupBy.some(g => g.key === columnKey)) return;
    const newGroupBy = [...internalGroupBy, { key: columnKey, direction: 'asc' as const }];
    setInternalGroupBy(newGroupBy);
    onGroupByChange?.(newGroupBy);
  }, [internalGroupBy, onGroupByChange]);

  const handleRemoveGroupBy = useCallback((columnKey: string) => {
    const newGroupBy = internalGroupBy.filter(g => g.key !== columnKey);
    setInternalGroupBy(newGroupBy);
    onGroupByChange?.(newGroupBy);
  }, [internalGroupBy, onGroupByChange]);

  const handleGroupByDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleGroupByDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const columnKey = e.dataTransfer.getData('text/plain');
    const column = columns.find(c => c.key === columnKey);
    if (column?.groupable !== false) {
      handleAddGroupBy(columnKey);
    }
  }, [columns, handleAddGroupBy]);

  // Calculate aggregations
  const calculateAggregation = useCallback((rows: any[], aggregation: GridAggregation): number => {
    const values = rows.map(r => r[aggregation.columnKey]).filter(v => typeof v === 'number');
    
    switch (aggregation.type) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'count':
        return rows.length;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
      default:
        return 0;
    }
  }, []);

  // Group data recursively
  const groupData = useCallback((
    rows: any[], 
    groupConfigs: GridGroupConfig[], 
    depth: number = 0
  ): GroupedData[] => {
    if (depth >= groupConfigs.length || groupConfigs.length === 0) {
      return [];
    }

    const currentGroup = groupConfigs[depth];
    const groups = new Map<any, any[]>();

    rows.forEach(row => {
      const value = row[currentGroup.key];
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(row);
    });

    const result: GroupedData[] = [];
    groups.forEach((groupRows, value) => {
      const aggregations: Record<string, number> = {};
      
      currentGroup.aggregations?.forEach(agg => {
        aggregations[`${agg.columnKey}_${agg.type}`] = calculateAggregation(groupRows, agg);
      });

      const groupedData: GroupedData = {
        key: `${currentGroup.key}-${value}`,
        value,
        rows: groupRows,
        aggregations,
      };

      if (depth < groupConfigs.length - 1) {
        groupedData.subGroups = groupData(groupRows, groupConfigs, depth + 1);
      }

      result.push(groupedData);
    });

    // Sort groups
    if (currentGroup.direction) {
      result.sort((a, b) => {
        if (a.value < b.value) return currentGroup.direction === 'asc' ? -1 : 1;
        if (a.value > b.value) return currentGroup.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [calculateAggregation]);

  const groupedData = useMemo(() => {
    if (internalGroupBy.length === 0) return null;
    return groupData(displayedData, internalGroupBy);
  }, [displayedData, internalGroupBy, groupData]);

  const toggleGroupExpansion = useCallback((groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  }, []);

  if (baseProps.hidden) return null;

  const handleSort = (key: string) => {
    if (onSort && !baseProps.disabled) {
      onSort(key, 'asc');
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick && !baseProps.disabled && hoverable) {
      onRowClick(row);
    }
  };

  // Render group rows recursively
  const renderGroupRows = (
    groups: GroupedData[], 
    depth: number = 0,
    parentKey: string = ''
  ): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];
    const groupConfig = internalGroupBy[depth];
    const groupColumn = columns.find(c => c.key === groupConfig?.key);

    groups.forEach((group, groupIndex) => {
      const fullKey = parentKey ? `${parentKey}-${group.key}` : group.key;
      const isExpanded = expandedGroups.has(fullKey);
      const indent = depth * 24;

      // Group header row
      rows.push(
        <TableRow 
          key={`group-${fullKey}`}
          className="bg-muted/70 hover:bg-muted font-medium"
        >
          <TableCell 
            colSpan={columns.length}
            className="py-2"
          >
            <div 
              className="flex items-center gap-2 cursor-pointer"
              style={{ paddingLeft: indent }}
              onClick={() => collapsibleGroups && toggleGroupExpansion(fullKey)}
            >
              {collapsibleGroups && (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              )}
              <span className="text-muted-foreground">
                {groupColumn?.title || groupConfig?.key}:
              </span>
              <span>{String(group.value)}</span>
              <Badge variant="secondary" className="ml-2">
                {group.rows.length} items
              </Badge>
              {Object.entries(group.aggregations).map(([key, value]) => (
                <Badge key={key} variant="outline" className="ml-1">
                  {key}: {typeof value === 'number' ? value.toFixed(2) : value}
                </Badge>
              ))}
            </div>
          </TableCell>
        </TableRow>
      );

      // Render sub-groups or rows
      if (isExpanded || !collapsibleGroups) {
        if (group.subGroups && group.subGroups.length > 0) {
          rows.push(...renderGroupRows(group.subGroups, depth + 1, fullKey));
        } else {
          group.rows.forEach((row, idx) => {
            rows.push(
              <TableRow
                key={`${fullKey}-row-${idx}`}
                className={`
                  ${striped && idx % 2 === 1 ? 'bg-muted/30' : ''}
                  ${hoverable ? 'cursor-pointer hover:bg-muted/50' : ''}
                `}
                onClick={() => handleRowClick(row)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} style={{ paddingLeft: col === columns[0] ? indent + 24 : undefined }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            );
          });
        }
      }
    });

    return rows;
  };

  return (
    <div className={className} style={style}>
      {/* Group By Panel */}
      {showGroupByPanel && (
        <div 
          className="mb-4 p-3 border border-dashed border-border rounded-lg bg-muted/30 min-h-[48px]"
          onDragOver={handleGroupByDragOver}
          onDrop={handleGroupByDrop}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {internalGroupBy.length === 0 ? 'Drag columns here to group' : 'Grouped by:'}
            </span>
            {internalGroupBy.map((group, index) => {
              const column = columns.find(c => c.key === group.key);
              return (
                <Badge 
                  key={group.key} 
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  {index > 0 && <span className="text-muted-foreground mr-1">→</span>}
                  {column?.title || group.key}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive/20"
                    onClick={() => handleRemoveGroupBy(group.key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width }}
                  draggable={reorderableColumns && col.draggable !== false}
                  onDragStart={(e) => handleDragStart(e, col)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                    ${col.sortable ? 'cursor-pointer select-none' : ''}
                    ${dragOverIndex === index ? 'bg-primary/10 border-l-2 border-primary' : ''}
                    ${draggedColumn?.key === col.key ? 'opacity-50' : ''}
                    ${reorderableColumns && col.draggable !== false ? 'cursor-grab active:cursor-grabbing' : ''}
                  `}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {reorderableColumns && col.draggable !== false && (
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    )}
                    {col.title}
                    {col.sortable && <ArrowUpDown className="h-4 w-4" />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : groupedData ? (
              renderGroupRows(groupedData)
            ) : displayedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              displayedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={`
                    ${striped && idx % 2 === 1 ? 'bg-muted/50' : ''}
                    ${hoverable ? 'cursor-pointer hover:bg-muted' : ''}
                  `}
                  onClick={() => handleRowClick(row)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {infiniteScroll && (
          <div ref={observerTarget} className="h-10 flex items-center justify-center">
            {isLoadingMore && <Skeleton className="h-4 w-32" />}
          </div>
        )}
      </div>
    </div>
  );
};
