const PDFDocument = require('pdfkit');

/**
 * Generates a professional financial report PDF
 * @param {Object} data - { stats, history }
 * @param {Stream} res - Express response stream
 */
exports.generatePDFReport = (data, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe the PDF into the response
  doc.pipe(res);

  // --- Header ---
  doc
    .fillColor('#5D0E12')
    .fontSize(24)
    .text('PAYFILE', 50, 45, { underline: true })
    .fillColor('#444444')
    .fontSize(10)
    .text('Admin Commission Report', 200, 50, { align: 'right' })
    .text(`Date: ${new Date().toLocaleDateString()}`, 200, 65, { align: 'right' })
    .moveDown();

  // Draw a horizontal line
  doc.moveTo(50, 85).lineTo(550, 85).stroke('#eeeeee');

  // --- Summary Statistics ---
  doc.moveDown(2);
  doc.fillColor('#000000').fontSize(16).text('Executive Summary', { underline: true });
  doc.moveDown();

  const stats = data.stats;
  const statsPos = doc.y;

  // Draw Stats Grid
  const drawStat = (label, value, x, y) => {
    doc.fontSize(10).fillColor('#777777').text(label, x, y);
    doc.fontSize(14).fillColor('#a855f7').text(value, x, y + 15);
  };

  drawStat('Total Registered Users', stats.totalUsers.toString(), 50, statsPos);
  drawStat('Completed Sales', stats.totalSales.toString(), 200, statsPos);
  
  drawStat('BTC Revenue', `${stats.totalBtcRevenue} BTC`, 50, statsPos + 40);
  drawStat('BTC Commissions', `${stats.totalBtcCommission} BTC`, 200, statsPos + 40);

  drawStat('USDT Revenue', `${stats.totalUsdtRevenue} USDT`, 50, statsPos + 80);
  drawStat('USDT Commissions', `${stats.totalUsdtCommission} USDT`, 200, statsPos + 80);

  doc.moveDown(8);

  // --- Transaction Ledger ---
  doc.fillColor('#000000').fontSize(16).text('Detailed Transaction Ledger', { underline: true });
  doc.moveDown();

  // Table Header
  const tableTop = doc.y;
  const itemHeight = 30;
  
  doc.rect(50, tableTop, 500, 20).fill('#f9f9f9');
  doc.fillColor('#777777').fontSize(10);
  doc.text('Date', 60, tableTop + 5);
  doc.text('Token ID', 130, tableTop + 5);
  doc.text('Network', 210, tableTop + 5);
  doc.text('Seller', 280, tableTop + 5);
  doc.text('Price', 400, tableTop + 5);
  doc.text('Commission', 480, tableTop + 5);

  // Table Content
  let y = tableTop + 25;
  doc.fillColor('#444444');

  data.history.forEach((item, index) => {
    // Add new page if needed
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    const date = new Date(item.date).toLocaleDateString();
    const sellerName = item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : 'System';
    
    doc.fontSize(8);
    doc.text(date, 60, y);
    doc.text(item.tokenId, 130, y);
    doc.text(item.network || 'Mainnet', 210, y);
    doc.text(sellerName.substring(0, 20), 280, y);
    doc.text(`${item.price} ${item.currency}`, 400, y);
    doc.fillColor('#5D0E12').text(`${item.commission} ${item.currency}`, 480, y).fillColor('#444444');

    // Separator line
    doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke('#f1f1f1');
    y += 20;
  });

  // Footer
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor('#aaaaaa').text(
      `Page ${i + 1} of ${range.count} - Confidential PayFile Admin Data`,
      50,
      800,
      { align: 'center' }
    );
  }

  // Finalize
  doc.end();
};
