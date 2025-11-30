export interface BaseComponentProps {
  // Visibility
  hidden?: boolean;
  disabled?: boolean;
  
  // Styling
  fontSize?: string;
  fontColor?: string;
  fontFamily?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  
  // Border
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // Spacing
  padding?: string;
  margin?: string;
  
  // Layout
  width?: string;
  height?: string;
  
  // Custom
  styleClass?: string;
  content?: string;
  htmlContent?: string;
  
  // Events
  onClick?: () => void;
  onChange?: (value: any) => void;
}

export interface LayoutProps extends BaseComponentProps {
  children?: React.ReactNode;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  name?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps extends BaseComponentProps {
  options: DropdownOption[];
  value?: string | number | (string | number)[];
  multiSelect?: boolean;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
}

export interface GridColumn {
  key: string;
  title: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface GridProps extends BaseComponentProps {
  columns: GridColumn[];
  data: any[];
  loading?: boolean;
  infiniteScroll?: boolean;
  pageSize?: number;
  onLoadMore?: () => Promise<void>;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: any) => void;
  striped?: boolean;
  hoverable?: boolean;
}

export interface FileUploaderProps extends BaseComponentProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  onUpload?: (files: File[]) => Promise<void>;
  onRemove?: (file: File) => void;
  files?: File[];
  showPreview?: boolean;
}

export interface ImageProps extends BaseComponentProps {
  src: string;
  alt: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  editable?: boolean;
  onEdit?: (editedImage: string) => void;
  aspectRatio?: string;
}

export interface MenuItemConfig {
  label: string;
  value: string;
  icon?: React.ReactNode;
  image?: string;
  children?: MenuItemConfig[];
  disabled?: boolean;
  onClick?: () => void;
}

export interface SubMenuProps extends BaseComponentProps {
  items: MenuItemConfig[];
  orientation?: 'vertical' | 'horizontal';
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface DynamicFormField extends BaseComponentProps {
  fieldType: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date';
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => boolean | string;
  };
  options?: DropdownOption[]; // for select, radio
  defaultValue?: any;
}

export interface DynamicFormProps extends BaseComponentProps {
  fields: DynamicFormField[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number; // for grid layout
}
