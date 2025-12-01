import React, { useState } from 'react';
import { FileUploaderProps } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { Button } from '@/components/ui/button';
import { Upload, X, FileIcon } from 'lucide-react';
import { toast } from 'sonner';

export const DynamicFileUploader: React.FC<FileUploaderProps> = ({
  accept,
  multiple = false,
  maxSize = 10, // 10MB default
  maxFiles,
  onUpload,
  onRemove,
  files: externalFiles,
  showPreview = true,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(
    baseProps,
    'transition-base'
  );

  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const files = externalFiles || internalFiles;

  if (baseProps.hidden) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (baseProps.disabled) return;

    const selectedFiles = Array.from(e.target.files || []);

    // Validate file size
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSize}MB limit`);
        return false;
      }
      return true;
    });

    // Validate max files
    if (maxFiles && files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = multiple ? [...files, ...validFiles] : validFiles;

    if (!externalFiles) {
      setInternalFiles(newFiles);
    }

    if (onUpload) {
      await onUpload(validFiles);
    }

    e.target.value = '';
  };

  const handleRemove = (file: File, index: number) => {
    if (baseProps.disabled) return;

    const newFiles = files.filter((_, i) => i !== index);
    
    if (!externalFiles) {
      setInternalFiles(newFiles);
    }

    if (onRemove) {
      onRemove(file);
    }
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className={className} style={style}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={baseProps.disabled}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {multiple ? 'Upload Files' : 'Upload File'}
          </Button>
          <input
            id="file-upload"
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            className="hidden"
            disabled={baseProps.disabled}
          />
          <span className="text-sm text-muted-foreground">
            Max {maxSize}MB {maxFiles ? `• Up to ${maxFiles} files` : ''}
          </span>
        </div>

        {showPreview && files.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => {
              const preview = getFilePreview(file);
              return (
                <div
                  key={index}
                  className="relative group border rounded-lg p-2 hover:border-primary transition-base"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-muted rounded">
                      <FileIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <p className="mt-2 text-xs truncate text-center">{file.name}</p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-base h-6 w-6 p-0"
                    onClick={() => handleRemove(file, index)}
                    disabled={baseProps.disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
