import jsPDF from 'jspdf';

// PDF utility functions for mortgage calculator
export const generateMortgageReport = (calculationData, bankData) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Mortgage Calculation Report', 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Bank information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Information', 20, 55);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank: ${bankData.name}`, 20, 70);
  doc.text(`Interest Rate: ${bankData.interestRate}%`, 20, 80);
  doc.text(`Maximum Loan: $${bankData.maxLoan.toLocaleString()}`, 20, 90);
  doc.text(`Minimum Down Payment: $${bankData.minDownPayment.toLocaleString()}`, 20, 100);
  doc.text(`Loan Term: ${bankData.loanTerm} years`, 20, 110);
  
  // Calculation details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculation Details', 20, 135);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Loan Amount: $${calculationData.loanAmount.toLocaleString()}`, 20, 150);
  doc.text(`Down Payment: $${calculationData.downPayment.toLocaleString()}`, 20, 160);
  doc.text(`Down Payment %: ${calculationData.downPaymentPercentage.toFixed(2)}%`, 20, 170);
  
  // Results
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Results', 20, 195);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Payment: $${calculationData.monthlyPayment.toLocaleString()}`, 20, 210);
  doc.text(`Total Payment: $${calculationData.totalPayment.toLocaleString()}`, 20, 220);
  doc.text(`Total Interest: $${calculationData.totalInterest.toLocaleString()}`, 20, 230);
  
  // Add page number
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(10);
  doc.text(`Page ${pageCount}`, 190, 280);
  
  return doc;
};

// Generate banks comparison PDF
export const generateBanksComparison = (banks) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Banks Comparison Report', 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Table headers
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Name', 20, 55);
  doc.text('Interest Rate', 70, 55);
  doc.text('Max Loan', 110, 55);
  doc.text('Min Down Payment', 150, 55);
  doc.text('Loan Term', 200, 55);
  
  // Table data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let yPosition = 70;
  banks.forEach((bank, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.text(bank.name, 20, yPosition);
    doc.text(`${bank.interestRate}%`, 70, yPosition);
    doc.text(`$${bank.maxLoan.toLocaleString()}`, 110, yPosition);
    doc.text(`$${bank.minDownPayment.toLocaleString()}`, 150, yPosition);
    doc.text(`${bank.loanTerm} years`, 200, yPosition);
    
    yPosition += 10;
  });
  
  // Add summary
  if (yPosition < 250) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, yPosition + 10);
    
    const avgInterestRate = banks.reduce((sum, bank) => sum + bank.interestRate, 0) / banks.length;
    const totalMaxLoan = banks.reduce((sum, bank) => sum + bank.maxLoan, 0);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Average Interest Rate: ${avgInterestRate.toFixed(2)}%`, 20, yPosition + 25);
    doc.text(`Total Maximum Loan Capacity: $${totalMaxLoan.toLocaleString()}`, 20, yPosition + 35);
    doc.text(`Number of Banks: ${banks.length}`, 20, yPosition + 45);
  }
  
  return doc;
};

// Generate loan analysis PDF
export const generateLoanAnalysis = (loanData) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Analysis Report', 20, 20);
  
  // Add date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
  
  // Loan details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Details', 20, 55);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Principal Amount: $${loanData.principal.toLocaleString()}`, 20, 70);
  doc.text(`Interest Rate: ${loanData.interestRate}%`, 20, 80);
  doc.text(`Loan Term: ${loanData.term} years`, 20, 90);
  doc.text(`Monthly Payment: $${loanData.monthlyPayment.toLocaleString()}`, 20, 105);
  
  // Payment breakdown
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Breakdown', 20, 130);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Payments: $${loanData.totalPayments.toLocaleString()}`, 20, 145);
  doc.text(`Total Interest: $${loanData.totalInterest.toLocaleString()}`, 20, 155);
  doc.text(`Interest Percentage: ${((loanData.totalInterest / loanData.totalPayments) * 100).toFixed(2)}%`, 20, 165);
  
  // Amortization schedule (first 12 months)
  if (loanData.amortizationSchedule) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Amortization Schedule (First 12 Months)', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Headers
    doc.setFont('helvetica', 'bold');
    doc.text('Month', 20, 40);
    doc.text('Payment', 50, 40);
    doc.text('Principal', 90, 40);
    doc.text('Interest', 130, 40);
    doc.text('Balance', 170, 40);
    
    doc.setFont('helvetica', 'normal');
    let yPos = 50;
    
    loanData.amortizationSchedule.slice(0, 12).forEach((payment, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${index + 1}`, 20, yPos);
      doc.text(`$${payment.payment.toLocaleString()}`, 50, yPos);
      doc.text(`$${payment.principal.toLocaleString()}`, 90, yPos);
      doc.text(`$${payment.interest.toLocaleString()}`, 130, yPos);
      doc.text(`$${payment.balance.toLocaleString()}`, 170, yPos);
      
      yPos += 10;
    });
  }
  
  return doc;
};

// Save PDF to file
export const savePDF = (doc, filename) => {
  doc.save(filename);
};

// Print PDF
export const printPDF = (doc) => {
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  const printWindow = window.open(pdfUrl);
  printWindow.onload = () => {
    printWindow.print();
  };
}; 