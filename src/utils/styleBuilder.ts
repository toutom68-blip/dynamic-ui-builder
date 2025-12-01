import { BaseComponentProps } from '@/types/component.types';
import { cn } from '@/lib/utils';

/**
 * Builds inline styles from component props
 */
export const buildInlineStyles = (props: BaseComponentProps): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  if (props.fontSize) styles.fontSize = props.fontSize;
  if (props.fontColor) styles.color = props.fontColor;
  if (props.fontFamily) styles.fontFamily = props.fontFamily;
  if (props.backgroundColor) styles.backgroundColor = props.backgroundColor;
  if (props.backgroundImage) {
    styles.backgroundImage = `url(${props.backgroundImage})`;
    styles.backgroundSize = 'cover';
    styles.backgroundPosition = 'center';
  }
  if (props.borderColor) styles.borderColor = props.borderColor;
  if (props.borderWidth) styles.borderWidth = props.borderWidth;
  if (props.borderRadius) styles.borderRadius = props.borderRadius;
  if (props.borderStyle) styles.borderStyle = props.borderStyle;
  if (props.padding) styles.padding = props.padding;
  if (props.margin) styles.margin = props.margin;
  if (props.width) styles.width = props.width;
  if (props.height) styles.height = props.height;

  return styles;
};

/**
 * Builds className string from component props
 */
export const buildClassNames = (props: BaseComponentProps, baseClasses: string = ''): string => {
  return cn(
    baseClasses,
    props.styleClass,
    props.hidden && 'hidden',
    props.disabled && 'opacity-50 cursor-not-allowed'
  );
};

/**
 * Combines style building utilities
 */
export const buildComponentStyles = (props: BaseComponentProps, baseClasses: string = '') => {
  return {
    style: buildInlineStyles(props),
    className: buildClassNames(props, baseClasses),
  };
};
