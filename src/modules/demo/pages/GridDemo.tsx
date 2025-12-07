import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicGrid } from '@/modules/shared/components/DynamicGrid';
import { GridColumn, GridBulkAction, GridPaginationConfig } from '@/types/component.types';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Mail, Eye } from 'lucide-react';
import { toast } from 'sonner';

// Mock data generator
const generateMockData = (page: number, pageSize: number) => {
  const statuses = ['active', 'inactive', 'pending', 'suspended'];
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  const roles = ['Admin', 'Manager', 'Developer', 'Designer', 'Analyst'];
  
  const data = [];
  const startIndex = (page - 1) * pageSize;
  
  for (let i = 0; i < pageSize; i++) {
    const index = startIndex + i + 1;
    data.push({
      id: index,
      name: `User ${index}`,
      email: `user${index}@example.com`,
      department: departments[index % departments.length],
      role: roles[index % roles.length],
      status: statuses[index % statuses.length],
      salary: Math.floor(Math.random() * 100000) + 50000,
      joinDate: new Date(2020 + (index % 5), index % 12, (index % 28) + 1).toISOString().split('T')[0],
      projects: Math.floor(Math.random() * 20) + 1,
      performance: Math.floor(Math.random() * 100),
      notes: `Additional notes for user ${index}. This contains detailed information about their work history and achievements.`,
    });
  }
  
  return data;
};

const TOTAL_ITEMS = 500;

export const GridDemo = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(TOTAL_ITEMS);

  // Columns with frozen columns
  const columns: GridColumn[] = [
    {
      key: 'id',
      title: 'ID',
      width: '80px',
      frozen: 'left',
      sortable: true,
      align: 'center',
    },
    {
      key: 'name',
      title: t('grid.name', 'Name'),
      width: '150px',
      frozen: 'left',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'email',
      title: t('grid.email', 'Email'),
      width: '220px',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'department',
      title: t('grid.department', 'Department'),
      width: '150px',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Sales', value: 'Sales' },
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' },
      ],
    },
    {
      key: 'role',
      title: t('grid.role', 'Role'),
      width: '130px',
      sortable: true,
    },
    {
      key: 'status',
      title: t('grid.status', 'Status'),
      width: '120px',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Pending', value: 'pending' },
        { label: 'Suspended', value: 'suspended' },
      ],
      render: (value: string) => {
        const colorMap: Record<string, string> = {
          active: 'bg-green-500/20 text-green-600',
          inactive: 'bg-muted text-muted-foreground',
          pending: 'bg-yellow-500/20 text-yellow-600',
          suspended: 'bg-destructive/20 text-destructive',
        };
        return (
          <Badge className={colorMap[value] || ''} variant="outline">
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'salary',
      title: t('grid.salary', 'Salary'),
      width: '120px',
      sortable: true,
      align: 'right',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'joinDate',
      title: t('grid.joinDate', 'Join Date'),
      width: '130px',
      sortable: true,
      filterable: true,
      filterType: 'date',
    },
    {
      key: 'projects',
      title: t('grid.projects', 'Projects'),
      width: '100px',
      sortable: true,
      align: 'center',
    },
    {
      key: 'performance',
      title: t('grid.performance', 'Performance'),
      width: '150px',
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-destructive'
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8">{value}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      title: t('grid.actions', 'Actions'),
      width: '100px',
      frozen: 'right',
      align: 'center',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.info(`Viewing details for ${row.name}`);
          }}
          className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  // Bulk actions
  const bulkActions: GridBulkAction[] = [
    {
      label: t('grid.export', 'Export'),
      value: 'export',
      icon: <Download className="h-4 w-4" />,
    },
    {
      label: t('grid.sendEmail', 'Send Email'),
      value: 'email',
      icon: <Mail className="h-4 w-4" />,
    },
    {
      label: t('grid.delete', 'Delete'),
      value: 'delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
    },
  ];

  // Handle bulk action
  const handleBulkAction = (action: string, rows: any[]) => {
    const names = rows.map((r) => r.name).join(', ');
    switch (action) {
      case 'export':
        toast.success(`Exporting ${rows.length} records: ${names}`);
        break;
      case 'email':
        toast.success(`Sending email to ${rows.length} users: ${names}`);
        break;
      case 'delete':
        toast.error(`Deleting ${rows.length} records: ${names}`);
        setData((prev) => prev.filter((d) => !rows.find((r) => r.id === d.id)));
        setSelectedRows([]);
        break;
    }
  };

  // Lazy loading function (mock API call)
  const loadPage = useCallback(async (page: number, size: number) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockData = generateMockData(page, size);
    return {
      data: mockData,
      totalItems: TOTAL_ITEMS,
    };
  }, []);

  // Pagination config
  const paginationConfig: GridPaginationConfig = {
    enabled: true,
    currentPage,
    totalItems,
    pageSizeOptions: [5, 10, 20, 50, 100],
    showPageInput: true,
    onPageChange: (page) => setCurrentPage(page),
    onPageSizeChange: (size) => {
      setPageSize(size);
      setCurrentPage(1);
    },
  };

  // Render expanded row content
  const renderExpandedRow = (row: any) => (
    <div className="p-4 bg-muted/30 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">
            {t('grid.contactInfo', 'Contact Information')}
          </h4>
          <p className="text-sm">{row.email}</p>
          <p className="text-sm text-muted-foreground">+1 (555) 123-{row.id.toString().padStart(4, '0')}</p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">
            {t('grid.workDetails', 'Work Details')}
          </h4>
          <p className="text-sm">{row.department} - {row.role}</p>
          <p className="text-sm text-muted-foreground">Started: {row.joinDate}</p>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">
            {t('grid.notes', 'Notes')}
          </h4>
          <p className="text-sm text-muted-foreground">{row.notes}</p>
        </div>
      </div>
    </div>
  );

  // Handle row click
  const handleRowClick = (row: any) => {
    toast.info(`Clicked on row: ${row.name}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('grid.demoTitle', 'DynamicGrid Demo')}</h1>
        <p className="text-muted-foreground">
          {t('grid.demoDescription', 'Showcasing frozen columns, expandable rows, bulk actions, and lazy loading with mock API.')}
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 space-y-2">
        <h3 className="font-medium">{t('grid.features', 'Features Demonstrated')}</h3>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>{t('grid.featureFrozen', 'Frozen columns: ID and Name (left), Actions (right)')}</li>
          <li>{t('grid.featureExpandable', 'Expandable rows: Click the expand icon to see more details')}</li>
          <li>{t('grid.featureSelection', 'Row selection with checkboxes')}</li>
          <li>{t('grid.featureBulk', 'Bulk actions: Export, Send Email, Delete')}</li>
          <li>{t('grid.featurePagination', 'Advanced pagination with page size options and page input')}</li>
          <li>{t('grid.featureLazy', 'Lazy loading: Data loaded from mock API on page change')}</li>
          <li>{t('grid.featureSorting', 'Sortable and filterable columns')}</li>
        </ul>
      </div>

      <DynamicGrid
        columns={columns}
        data={data}
        loading={loading}
        rowKey="id"
        striped
        hoverable
        stickyHeader
        showFilters
        resizableColumns
        // Selection
        selectionMode="checkbox"
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        // Expandable rows
        expandable
        renderExpandedRow={renderExpandedRow}
        // Bulk actions
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        // Row click
        onRowClick={handleRowClick}
        // Pagination
        pagination={paginationConfig}
        pageSize={pageSize}
        // Lazy loading
        lazyLoading={{
          enabled: true,
          loadPage,
        }}
        // Empty message
        emptyMessage={t('grid.noData', 'No data available')}
      />
    </div>
  );
};
