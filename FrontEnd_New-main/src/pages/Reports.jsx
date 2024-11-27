import React from 'react';
import BasicBars from '../components/Barchart';
import BasicPie from '../components/Piechart';
import '../css/report-styles.css'

function Report() {
    return (
    <div className="report">
      <div className="graph-container">
        <div className="graph">
          <BasicBars />
        </div>
        <div className="graph">
          <BasicPie />
        </div>
      </div>
      {/* Add other graphs here */}
    </div>
  );
}

export default Report;
