/**
 * Core UI component library barrel (Story 1.6).
 *
 * The single import surface every feature epic uses:
 *   import { Button, StatusPill, Card } from '@/components/ui';
 *
 * All components are presentational and label-agnostic (text arrives via
 * props/children) — the one exception is `StatusPill`, whose bilingual label
 * map (`status-labels`) is a documented Story-1.7 i18n stopgap.
 */

export { Button, focusRing } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export {
  Input,
  FieldLabel,
  FieldMessage,
  controlBase,
  controlError,
  controlDefaultBorder,
  inputHeight,
} from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';

export { FileUploadZone } from './FileUploadZone';
export type { FileUploadZoneProps, UploadPhase } from './FileUploadZone';

export { Card } from './Card';
export type { CardProps } from './Card';

export { StatusPill } from './StatusPill';
export type { StatusPillProps } from './StatusPill';

export { Table } from './Table';
export type { TableProps, TableColumn, TablePagination } from './Table';

export { Dialog } from './Dialog';
export type { DialogProps } from './Dialog';

export { Toast } from './Toast';
export type { ToastProps, ToastVariant } from './Toast';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { AnnouncementBanner } from './AnnouncementBanner';
export type { AnnouncementBannerProps, BannerVariant } from './AnnouncementBanner';

export { SkipLink } from './SkipLink';
export type { SkipLinkProps } from './SkipLink';

export { statusLabels, statusToken, isStatusKey } from './status-labels';
export type { StatusKey, StatusLang, StatusTokenName } from './status-labels';

export { cx } from './cx';
export type { ClassValue } from './cx';
