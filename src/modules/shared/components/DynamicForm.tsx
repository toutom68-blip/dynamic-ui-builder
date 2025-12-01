import React, { useState } from 'react';
import { DynamicFormProps, DynamicFormField } from '@/types/component.types';
import { buildComponentStyles } from '@/utils/styleBuilder';
import { DynamicInput } from './DynamicInput';
import { DynamicDropdown } from './DynamicDropdown';
import { DynamicButton } from './DynamicButton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  cancelButtonText = 'Cancel',
  layout = 'vertical',
  columns = 2,
  ...baseProps
}) => {
  const { style, className } = buildComponentStyles(baseProps, '');
  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.name] = field.defaultValue || '';
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (baseProps.hidden) return null;

  const handleChange = (fieldName: string, value: any) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (field: DynamicFormField, value: any): string | null => {
    if (!field.validation) return null;

    if (field.validation.required && !value) {
      return `${field.label || field.name} is required`;
    }

    if (field.validation.minLength && value.length < field.validation.minLength) {
      return `Minimum ${field.validation.minLength} characters required`;
    }

    if (field.validation.maxLength && value.length > field.validation.maxLength) {
      return `Maximum ${field.validation.maxLength} characters allowed`;
    }

    if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
      return `Invalid format`;
    }

    if (field.validation.custom) {
      const result = field.validation.custom(value);
      if (typeof result === 'string') return result;
      if (!result) return 'Validation failed';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (baseProps.disabled) return;

    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix validation errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      toast.success('Form submitted successfully');
    } catch (error) {
      toast.error('Failed to submit form');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: DynamicFormField) => {
    const commonProps = {
      ...field,
      value: values[field.name],
      onChange: (val: any) => handleChange(field.name, val),
      disabled: field.disabled || baseProps.disabled,
    };

    switch (field.fieldType) {
      case 'input':
        return <DynamicInput {...commonProps} />;
      
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={values[field.name]}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled || baseProps.disabled}
            className={field.styleClass}
          />
        );
      
      case 'select':
        return (
          <DynamicDropdown
            {...commonProps}
            options={field.options || []}
            placeholder={field.placeholder}
          />
        );
      
      case 'checkbox':
        return (
          <Checkbox
            checked={values[field.name]}
            onCheckedChange={(checked) => handleChange(field.name, checked)}
            disabled={field.disabled || baseProps.disabled}
          />
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={values[field.name]}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={field.disabled || baseProps.disabled}
          >
            {field.options?.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem value={opt.value.toString()} />
                <Label>{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      default:
        return <DynamicInput {...commonProps} />;
    }
  };

  const gridClass = layout === 'grid' ? `grid gap-4 md:grid-cols-${columns}` : 'space-y-4';

  return (
    <form onSubmit={handleSubmit} className={className} style={style}>
      <div className={gridClass}>
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            {field.label && (
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-sm text-destructive">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-6">
        <DynamicButton
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={baseProps.disabled}
        >
          {submitButtonText}
        </DynamicButton>
        {onCancel && (
          <DynamicButton
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={baseProps.disabled || isSubmitting}
          >
            {cancelButtonText}
          </DynamicButton>
        )}
      </div>
    </form>
  );
};
