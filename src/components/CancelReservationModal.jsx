import React from 'react';
import { Modal } from './Modal';

export function CancelReservationModal({
  open,
  dateStr,
  onCancel,
  onConfirm
}) {
  return (
    <Modal
      open={open}
      title="Cancelar reserva"
      actions={
        <>
          <button
            onClick={onCancel}
            className="px-3 sm:px-4 py-2 bg-neutral-700 rounded-lg text-sm"
          >
            No, mantener
          </button>

          <button
            onClick={onConfirm}
            className="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-sm text-white"
          >
            Sí, cancelar
          </button>
        </>
      }
    >
      <p className="text-sm text-neutral-300">
        ¿Seguro que deseas cancelar tu reserva para el día{' '}
        <span className="font-semibold text-white">
          {dateStr ?? ''}
        </span>
        ?
      </p>
    </Modal>
  );
}
