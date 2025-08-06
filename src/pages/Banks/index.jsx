import * as React from 'react';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { banksOperations, banksSelectors } from '../../redux/banks';
import AddBankModal from '../Modal';
import BankDetailsModal from '../../components/BankDetailsModal';
import BanksStatistics from '../../components/BanksStatistics';
import FileManager from '../../components/FileManager';
import './style.css';

import {
  DeleteIcon,
  AddCircleOutlineIcon
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { generateBanksComparison, savePDF } from '../../utils/pdf-utils';

function Banks() {
  const intl = useIntl();
  const banks = useSelector(banksSelectors.getAllBanks);
  const isLoading = useSelector(banksSelectors.getLoading);
  const error = useSelector(banksSelectors.getError);
  const dispatch = useDispatch();

  const [showModal, setShowModal] = React.useState(false);
  const [selectedBank, setSelectedBank] = React.useState(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showFileManager, setShowFileManager] = React.useState(false);

  useEffect(() => {
    dispatch(banksOperations.fetchBanks());
  }, [dispatch]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenDetailsModal = (bank) => {
    setSelectedBank(bank);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBank(null);
  };

  const handleDeleteBank = (bankId) => {
    if (window.confirm(intl.formatMessage({ id: 'banks.deleteConfirm' }))) {
      dispatch(banksOperations.deleteBank(bankId));
    }
  };

  const handleOpenFileManager = () => {
    setShowFileManager(true);
  };

  const handleCloseFileManager = () => {
    setShowFileManager(false);
  };

  const handleImportBanks = (importedBanks) => {
    // Add imported banks to the store
    importedBanks.forEach(bank => {
      dispatch(banksOperations.addNewBank(bank));
    });
  };

  // Create PDF comparison of all banks
  const handleExportBanksPDF = () => {
    if (banks.length === 0) {
      alert('No banks to export');
      return;
    }

    const doc = generateBanksComparison(banks);
    savePDF(doc, `banks-comparison-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="banks-container">
        <div className="banks-content">
          <div className="banks-loading">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="banks-container">
      <div className="banks-content">
        <div className="banks-header">
          <h1 className="banks-title">
            {intl.formatMessage({ id: 'banks.title' })}
          </h1>
          <div className="banks-actions">
            {banks.length > 0 && (
              <>
                <button 
                  className="banks-icon-button"
                  onClick={handleExportBanksPDF}
                  data-testid="export-banks-pdf"
                  title="Export banks comparison to PDF"
                >
                  <PictureAsPdfIcon />
                </button>
                <button 
                  className="banks-icon-button"
                  onClick={handleOpenFileManager}
                  data-testid="file-manager-button"
                  title="Import/Export banks data"
                >
                  <FileDownloadIcon />
                </button>
              </>
            )}
            <button
              className="banks-button"
              onClick={handleOpenModal}
            >
              <AddCircleOutlineIcon />
              {intl.formatMessage({ id: 'banks.addBank' })}
            </button>
          </div>
        </div>

        {error && (
          <div className="banks-alert error">
            Failed to load banks: {error}
          </div>
        )}

        <div className="banks-statistics">
          <BanksStatistics />
        </div>

        {showModal && (
          <AddBankModal onCloseModal={handleCloseModal} />
        )}

        {showDetailsModal && selectedBank && (
          <BankDetailsModal
            bank={selectedBank}
            isOpen={showDetailsModal}
            onClose={handleCloseDetailsModal}
          />
        )}

        {showFileManager && (
          <FileManager
            banks={banks}
            onImportBanks={handleImportBanks}
            isOpen={showFileManager}
            onClose={handleCloseFileManager}
            title="Banks Data Manager"
          />
        )}

        {banks.length === 0 && !isLoading ? (
          <div className="banks-empty-state">
            <p className="banks-empty-text">
              {intl.formatMessage({ id: 'banks.noBanks' })}
            </p>
          </div>
        ) : (
          <div className="banks-table-container">
            <div className="banks-hint">
              <p className="banks-hint-text">
                {intl.formatMessage({ id: 'banks.clickHint' })}
              </p>
            </div>
            <table className="banks-table" aria-label="banks table">
              <thead className="banks-table-head">
                <tr>
                  <th>
                    {intl.formatMessage({ id: 'banks.tableHeaders.bankName' })}
                  </th>
                  <th>
                    {intl.formatMessage({ id: 'banks.tableHeaders.interestRate' })}
                  </th>
                  <th>
                    {intl.formatMessage({ id: 'banks.tableHeaders.maxLoan' })}
                  </th>
                  <th>
                    {intl.formatMessage({ id: 'banks.tableHeaders.minDownPayment' })}
                  </th>
                  <th>
                    {intl.formatMessage({ id: 'banks.tableHeaders.loanTerm' })}
                  </th>
                  <th>
                    {intl.formatMessage({ id: 'banks.tableHeaders.actions' })}
                  </th>
                </tr>
              </thead>
              
              <tbody className="banks-table-body">
                {banks.map(({ id, BankName, InterestRate, MaximumLoan, MinimumDownPayment, LoanTerm }) => (
                  <tr
                    key={id}
                    onClick={() => handleOpenDetailsModal({ id, BankName, InterestRate, MaximumLoan, MinimumDownPayment, LoanTerm })}
                  >
                    <td>{BankName}</td>
                    <td>{InterestRate}%</td>
                    <td>${MaximumLoan.toLocaleString()}</td>
                    <td>${MinimumDownPayment.toLocaleString()}</td>
                    <td>{LoanTerm} years</td>
                    <td>
                      <button 
                        className="banks-delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBank(id);
                        }}
                        title={intl.formatMessage({ id: 'banks.deleteTooltip' })}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Banks;