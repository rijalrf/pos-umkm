import { ReportsRepository } from './reports.repository';
import { ReportData, ReportSummaryMetrics, SalesOverTimeData, TopProductData, SalesByCashierData } from './reports.types';

export class ReportsService {
  private repository = new ReportsRepository();

  async getReportData(startDateStr?: string, endDateStr?: string): Promise<ReportData> {
    let startDate: Date | undefined;
    if (startDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
    }

    let endDate: Date | undefined;
    if (endDateStr) {
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    }

    const transactions = await this.repository.getTransactions(startDate, endDate);

    // 1. Calculate Metrics
    let totalSales = 0;
    const customerIds = new Set<string>();

    for (const tx of transactions) {
      totalSales += Number(tx.totalAmount);
      if (tx.customerId) {
        customerIds.add(tx.customerId);
      }
    }

    const transactionCount = transactions.length;
    const averageTransactionValue = transactionCount > 0 ? totalSales / transactionCount : 0;
    const uniqueCustomersCount = customerIds.size;

    const metrics: ReportSummaryMetrics = {
      totalSales,
      transactionCount,
      averageTransactionValue,
      uniqueCustomersCount,
    };

    // 2. Sales Over Time
    const salesOverTimeMap = new Map<string, { totalSales: number; transactionCount: number }>();
    
    // Process in descending order, but we'll sort them ascending later
    for (const tx of transactions) {
      // YYYY-MM-DD format using local/UTC date
      const dateStr = tx.transactionDate.toISOString().split('T')[0];
      const current = salesOverTimeMap.get(dateStr) || { totalSales: 0, transactionCount: 0 };
      
      salesOverTimeMap.set(dateStr, {
        totalSales: current.totalSales + Number(tx.totalAmount),
        transactionCount: current.transactionCount + 1,
      });
    }

    const salesOverTime: SalesOverTimeData[] = Array.from(salesOverTimeMap.entries())
      .map(([date, data]) => ({
        date,
        totalSales: data.totalSales,
        transactionCount: data.transactionCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Top Products
    const topProductsMap = new Map<string, {
      name: string;
      sku: string;
      categoryName: string;
      quantitySold: number;
      totalRevenue: number;
    }>();

    for (const tx of transactions) {
      for (const item of tx.items) {
        const prod = item.product;
        const current = topProductsMap.get(item.productId) || {
          name: prod.name,
          sku: prod.sku,
          categoryName: prod.category.name,
          quantitySold: 0,
          totalRevenue: 0,
        };

        topProductsMap.set(item.productId, {
          ...current,
          quantitySold: current.quantitySold + item.quantity,
          totalRevenue: current.totalRevenue + Number(item.subtotal),
        });
      }
    }

    const topProducts: TopProductData[] = Array.from(topProductsMap.entries())
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        sku: data.sku,
        categoryName: data.categoryName,
        quantitySold: data.quantitySold,
        totalRevenue: data.totalRevenue,
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold); // Sort descending by qty

    // 4. Sales by Cashier
    const salesByCashierMap = new Map<string, {
      fullName: string;
      username: string;
      transactionCount: number;
      totalSales: number;
    }>();

    for (const tx of transactions) {
      const cashier = tx.cashier;
      const current = salesByCashierMap.get(cashier.id) || {
        fullName: cashier.fullName,
        username: cashier.username,
        transactionCount: 0,
        totalSales: 0,
      };

      salesByCashierMap.set(cashier.id, {
        ...current,
        transactionCount: current.transactionCount + 1,
        totalSales: current.totalSales + Number(tx.totalAmount),
      });
    }

    const salesByCashier: SalesByCashierData[] = Array.from(salesByCashierMap.entries())
      .map(([cashierId, data]) => ({
        cashierId,
        fullName: data.fullName,
        username: data.username,
        transactionCount: data.transactionCount,
        totalSales: data.totalSales,
      }))
      .sort((a, b) => b.totalSales - a.totalSales); // Sort descending by totalSales

    return {
      metrics,
      salesOverTime,
      topProducts,
      salesByCashier,
    };
  }

  async getRawTransactions(startDateStr?: string, endDateStr?: string) {
    let startDate: Date | undefined;
    if (startDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
    }

    let endDate: Date | undefined;
    if (endDateStr) {
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    }

    return this.repository.getTransactions(startDate, endDate);
  }

  generateCSV(transactions: any[]): string {
    const headers = ['Kode Transaksi', 'Tanggal', 'Kasir', 'Pelanggan', 'Total (IDR)', 'Bayar (IDR)', 'Kembali (IDR)'];
    const rows = transactions.map(tx => [
      tx.transactionCode,
      tx.transactionDate.toLocaleString('id-ID'),
      tx.cashier.fullName,
      tx.customerName || 'Guest',
      Number(tx.totalAmount),
      Number(tx.cashReceived),
      Number(tx.cashReturn)
    ]);
    
    // Excel-friendly double quotes escaping
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');
    
    return csvContent;
  }

  generatePDFHtml(reportData: ReportData, startDateStr?: string, endDateStr?: string): string {
    const formatter = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });

    const topProductsHtml = reportData.topProducts.map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4;">${p.sku}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4;">${p.categoryName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4; text-align: right;">${p.quantitySold}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4; text-align: right;">${formatter.format(p.totalRevenue)}</td>
      </tr>
    `).join('');

    const salesByCashierHtml = reportData.salesByCashier.map(c => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4;">${c.fullName} (${c.username})</td>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4; text-align: right;">${c.transactionCount}</td>
        <td style="padding: 8px; border-bottom: 1px solid #E7E5E4; text-align: right;">${formatter.format(c.totalSales)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan Penjualan MarketNest</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1C1917;
            background-color: #FFFFFF;
            margin: 0;
            padding: 40px;
          }
          h1 {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            color: #C2410C;
            margin-top: 0;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 14px;
            color: #57534E;
            margin-bottom: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 32px;
          }
          .card {
            border: 1px solid #E7E5E4;
            border-radius: 8px;
            padding: 16px;
            background-color: #FFFBF5;
          }
          .card-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #57534E;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .card-value {
            font-size: 24px;
            font-weight: bold;
            color: #C2410C;
          }
          .section-title {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            color: #1C1917;
            margin-top: 32px;
            margin-bottom: 16px;
            border-bottom: 2px solid #D6D3D1;
            padding-bottom: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background-color: #FFFBF5;
            text-align: left;
            padding: 8px;
            font-weight: 600;
            font-size: 12px;
            color: #57534E;
            border-bottom: 1px solid #D6D3D1;
          }
          td {
            padding: 8px;
            font-size: 14px;
          }
          .no-print {
            margin-bottom: 20px;
            padding: 12px;
            background-color: #FDF6EC;
            border: 1px solid #D4A373;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .btn-print {
            background-color: #C2410C;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
          }
          @media print {
            .no-print {
              display: none;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span>Laporan siap dicetak. Tekan tombol cetak untuk menyimpan sebagai PDF.</span>
          <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
        </div>
        
        <h1>Laporan Penjualan</h1>
        <div class="subtitle">
          Periode: ${startDateStr || 'Awal'} s/d ${endDateStr || 'Akhir'} &bull; Dicetak pada: ${new Date().toLocaleString('id-ID')}
        </div>
        
        <div class="grid">
          <div class="card">
            <div class="card-title">Total Pendapatan</div>
            <div class="card-value">${formatter.format(reportData.metrics.totalSales)}</div>
          </div>
          <div class="card">
            <div class="card-title">Total Transaksi</div>
            <div class="card-value">${reportData.metrics.transactionCount}</div>
          </div>
          <div class="card">
            <div class="card-title">Rata-rata Transaksi</div>
            <div class="card-value">${formatter.format(reportData.metrics.averageTransactionValue)}</div>
          </div>
          <div class="card">
            <div class="card-title">Pelanggan Unik</div>
            <div class="card-value">${reportData.metrics.uniqueCustomersCount}</div>
          </div>
        </div>
        
        <div class="section-title">Produk Terlaris</div>
        <table>
          <thead>
            <tr>
              <th>Nama Produk</th>
              <th>SKU</th>
              <th>Kategori</th>
              <th style="text-align: right;">Jumlah Terjual</th>
              <th style="text-align: right;">Total Pendapatan</th>
            </tr>
          </thead>
          <tbody>
            ${topProductsHtml || '<tr><td colspan="5" style="text-align: center; padding: 12px; color: #57534E;">Tidak ada data</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-title">Penjualan per Kasir</div>
        <table>
          <thead>
            <tr>
              <th>Nama Kasir</th>
              <th style="text-align: right;">Total Transaksi</th>
              <th style="text-align: right;">Total Penjualan</th>
            </tr>
          </thead>
          <tbody>
            ${salesByCashierHtml || '<tr><td colspan="3" style="text-align: center; padding: 12px; color: #57534E;">Tidak ada data</td></tr>'}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}
