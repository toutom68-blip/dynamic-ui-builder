import React, { useState, useEffect, useRef } from 'react';
import { GridProps } from '@/types/component.types';
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
import { ArrowUpDown } from 'lucide-react';

export const DynamicGrid: React.FC<GridProps> = ({
  columns,
  data,
  loading = false,
  infiniteScroll = false,
  pageSize = 20,
  onLoadMore,
  onSort,
  onRowClick,
  striped = true,
  hoverable = true,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(baseProps, '');
  const [displayedData, setDisplayedData] = useState(data.slice(0, pageSize));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef < HTMLDivElement > (null);

  useEffect(() => {
    setDisplayedData(data.slice(0, pageSize));
  }, [data, pageSize]);

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

  if (baseProps.hidden) return null;

  const handleSort = (key: string) => {
    if (onSort && !baseProps.disabled) {
      // Toggle between asc and desc
      onSort(key, 'asc'); // Simplified, you'd track state for direction
    }
  };

  const handleRowClick = (row: any) => {
    if (onRowClick && !baseProps.disabled && hoverable) {
      onRowClick(row);
    }
  };

  return (
    <div className={className} style={style}>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  style={{ width: col.width }}
                  className={col.sortable ? 'cursor-pointer select-none' : ''}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
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
