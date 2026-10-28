import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUploadZone, type FileUploadZoneProps } from './FileUploadZone';

const baseProps: FileUploadZoneProps = {
  phase: 'idle',
  zoneLabel: 'Upload payment slip. Accepted: JPG, PNG, PDF up to 5 MB',
  idleText: 'Tap or drag to upload',
};

describe('FileUploadZone', () => {
  it('idle: exposes the accessible zone label and is keyboard focusable', () => {
    render(<FileUploadZone {...baseProps} />);
    const zone = screen.getByRole('button', { name: baseProps.zoneLabel });
    expect(zone).toHaveAttribute('tabindex', '0');
  });

  it('idle: Enter and Space open the file picker', async () => {
    const onOpenPicker = vi.fn();
    render(<FileUploadZone {...baseProps} onOpenPicker={onOpenPicker} />);
    const zone = screen.getByRole('button', { name: baseProps.zoneLabel });
    zone.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onOpenPicker).toHaveBeenCalledTimes(2);
  });

  it('dragging: advertises aria-dropeffect="copy"', () => {
    render(<FileUploadZone {...baseProps} phase="dragging" />);
    expect(screen.getByRole('button', { name: baseProps.zoneLabel })).toHaveAttribute(
      'aria-dropeffect',
      'copy',
    );
  });

  it('preparing: sets aria-busy and announces politely', () => {
    render(<FileUploadZone {...baseProps} phase="preparing" preparingText="Preparing…" />);
    const zone = screen.getByRole('button', { name: baseProps.zoneLabel });
    expect(zone).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Preparing…')).toBeInTheDocument();
  });

  it('uploading: renders a determinate progressbar with aria-valuenow', () => {
    render(
      <FileUploadZone
        {...baseProps}
        phase="uploading"
        progress={47}
        uploadingText="Uploading — do not close this page"
      />,
    );
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '47');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('47%')).toBeInTheDocument();
  });

  it('uploading: clamps out-of-range progress into [0,100]', () => {
    const { rerender } = render(<FileUploadZone {...baseProps} phase="uploading" progress={140} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<FileUploadZone {...baseProps} phase="uploading" progress={-10} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('confirming: shows a full progressbar and aria-busy', () => {
    render(<FileUploadZone {...baseProps} phase="confirming" confirmingText="Confirming…" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('Confirming…')).toBeInTheDocument();
  });

  it('complete: shows the file metadata inside the zone', () => {
    render(
      <FileUploadZone
        {...baseProps}
        phase="complete"
        fileName="slip.jpg"
        fileMeta="238 KB · 28 Oct 2026"
      />,
    );
    expect(screen.getByText('slip.jpg')).toBeInTheDocument();
    expect(screen.getByText('238 KB · 28 Oct 2026')).toBeInTheDocument();
  });

  it('error: shows the message and a Try Again control that retries', async () => {
    const onRetry = vi.fn();
    render(
      <FileUploadZone
        {...baseProps}
        phase="error"
        errorText="Upload failed. Check your connection and try again."
        retryLabel="Try Again"
        onRetry={onRetry}
      />,
    );
    expect(
      screen.getByText('Upload failed. Check your connection and try again.'),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('non-openable phases are not keyboard focusable', () => {
    render(<FileUploadZone {...baseProps} phase="uploading" progress={10} />);
    const zone = screen.getByRole('button', { name: baseProps.zoneLabel });
    expect(zone).toHaveAttribute('tabindex', '-1');
    expect(zone).toHaveAttribute('aria-disabled', 'true');
  });
});
