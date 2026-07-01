import React from 'react';
import { SalesOverTimeData, TopProductData } from './reports.service';

interface ChartsProps {
  salesData: SalesOverTimeData[];
  topProducts: TopProductData[];
}

export const ReportsCharts: React.FC<ChartsProps> = ({ salesData, topProducts }) => {
  // --- 1. Area Chart: Sales Over Time ---
  const renderSalesChart = () => {
    if (salesData.length === 0) {
      return (
        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
          Tidak ada data penjualan untuk periode ini
        </div>
      );
    }

    const svgWidth = 600;
    const svgHeight = 250;
    const padding = { top: 20, right: 30, bottom: 40, left: 60 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const maxSales = Math.max(...salesData.map(d => d.totalSales), 1000);

    // Generate points
    const points = salesData.map((d, index) => {
      const x = padding.left + (index / Math.max(salesData.length - 1, 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.totalSales / maxSales) * chartHeight;
      return { x, y, date: d.date, value: d.totalSales };
    });

    // Build SVG path
    let pathD = '';
    let areaD = '';

    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
      areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
    }

    // Grid lines (y-axis)
    const yTicks = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div style={{ width: '100%' }}>
        <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', color: '#1C1917', marginBottom: '16px' }}>Tren Penjualan (IDR)</h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {/* Grid lines & Y Labels */}
          {yTicks.map((tick, i) => {
            const y = padding.top + chartHeight - tick * chartHeight;
            const val = tick * maxSales;
            const formatted = new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val);
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#E7E5E4" strokeWidth="1" strokeDasharray="4 4" />
                <text x={padding.left - 8} y={y + 4} fill="#57534E" fontSize="10" textAnchor="end" fontFamily="Inter">
                  {formatted}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="rgba(194, 65, 12, 0.08)" />}

          {/* Line Path */}
          {pathD && <path d={pathD} fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="chart-point-group">
              <circle cx={p.x} cy={p.y} r="4" fill="#C2410C" stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Simple title tooltip for accessibility */}
              <title>{`${p.date}: Rp ${new Intl.NumberFormat('id-ID').format(p.value)}`}</title>
            </g>
          ))}

          {/* X Axis Date Labels */}
          {points.map((p, i) => {
            // Show only a subset of dates to avoid cluttering
            const showLabel = points.length <= 7 || i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2);
            if (!showLabel) return null;
            
            // Format to DD/MM
            const dateParts = p.date.split('-');
            const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : p.date;

            return (
              <text key={i} x={p.x} y={svgHeight - 15} fill="#57534E" fontSize="10" textAnchor="middle" fontFamily="Inter">
                {displayDate}
              </text>
            );
          })}

          {/* Axis lines */}
          <line x1={padding.left} y1={padding.top + chartHeight} x2={svgWidth - padding.right} y2={padding.top + chartHeight} stroke="#D6D3D1" strokeWidth="1.5" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#D6D3D1" strokeWidth="1.5" />
        </svg>
      </div>
    );
  };

  // --- 2. Bar Chart: Top Products ---
  const renderTopProductsChart = () => {
    const limitProducts = topProducts.slice(0, 5);

    if (limitProducts.length === 0) {
      return (
        <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
          Tidak ada data produk untuk periode ini
        </div>
      );
    }

    const svgWidth = 600;
    const rowHeight = 40;
    const padding = { top: 10, right: 40, bottom: 20, left: 140 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const svgHeight = limitProducts.length * rowHeight + padding.top + padding.bottom;

    const maxQty = Math.max(...limitProducts.map(p => p.quantitySold), 1);

    return (
      <div style={{ width: '100%' }}>
        <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', color: '#1C1917', marginBottom: '16px' }}>Top 5 Produk Terlaris (Unit)</h4>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {limitProducts.map((p, index) => {
            const y = padding.top + index * rowHeight;
            const barW = (p.quantitySold / maxQty) * chartWidth;
            
            return (
              <g key={p.productId}>
                {/* Product Name Label */}
                <text x={padding.left - 12} y={y + 22} fill="#1C1917" fontSize="12" textAnchor="end" fontFamily="Inter" fontWeight="500">
                  {p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name}
                </text>

                {/* Background Bar */}
                <rect x={padding.left} y={y + 8} width={chartWidth} height="20" fill="#FFFBF5" stroke="#E7E5E4" strokeWidth="1" rx="2" />

                {/* Filled Bar */}
                <rect x={padding.left} y={y + 8} width={barW} height="20" fill="#D4A373" stroke="#C2410C" strokeWidth="1" rx="2" />

                {/* Qty Label inside or next to the bar */}
                <text x={padding.left + barW + 8} y={y + 22} fill="#365314" fontSize="12" fontWeight="bold" fontFamily="Inter">
                  {p.quantitySold} pcs
                </text>
              </g>
            );
          })}

          {/* Y Axis line */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={svgHeight - padding.bottom} stroke="#D6D3D1" strokeWidth="1.5" />
        </svg>
      </div>
    );
  };

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '8px', padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        <div>
          {renderSalesChart()}
        </div>
        <div>
          {renderTopProductsChart()}
        </div>
      </div>
    </div>
  );
};
