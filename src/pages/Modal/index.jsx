import * as React from 'react';
import NewBankCard from '../../components/BankCard/index';
import Portal from '../../components/Portal';
import './style.css';

function AddBankModal({ onCloseModal }) {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    onCloseModal();
  };

  return (
    <Portal>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Add New Bank</h2>
            <button className="modal-close-button" onClick={handleClose}>
              ×
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-content">
              <NewBankCard onCloseModal={handleClose} />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export default AddBankModal;