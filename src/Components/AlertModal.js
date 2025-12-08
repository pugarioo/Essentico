import React from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Reusable alert/confirm modal.
 *
 * Props:
 * - show: boolean (controls visibility)
 * - title: string (defaults to "Notice")
 * - message: string or React node (main content)
 * - variant: "primary" | "success" | "warning" | "danger" | "info" (button emphasis)
 * - confirmLabel: string (defaults to "OK")
 * - cancelLabel: string (defaults to "Close")
 * - onConfirm: function (if provided, shows confirm button)
 * - onCancel: function (called on close/cancel)
 * - isProcessing: boolean (disables buttons and shows "Processing...")
 */
const AlertModal = ({
  show,
  title = 'Notice',
  message = '',
  variant = 'primary',
  confirmLabel = 'OK',
  cancelLabel = 'Close',
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  const handleClose = () => {
    if (!isProcessing && onCancel) onCancel();
  };

  const handleConfirm = () => {
    if (!isProcessing && onConfirm) onConfirm();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      keyboard={!isProcessing}
    >
      <Modal.Header closeButton={!isProcessing}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {typeof message === 'string' ? <p style={{ margin: 0 }}>{message}</p> : message}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
          {cancelLabel}
        </Button>
        {onConfirm && (
          <Button variant={variant} onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : confirmLabel}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AlertModal;

