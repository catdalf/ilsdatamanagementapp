import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import GetAppIcon from '@mui/icons-material/GetApp';

function ExcelToDataGrid() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Prepare columns list from headers
      const cols = data[0].map((field) => ({
        field: field,
        headerName: field,
        width: 150,
      }));

      // Prepare rows
      const rows = data.slice(1).map((row, index) => {
        let rowData = {};
        row.forEach((value, index) => {
          if (cols[index]) {
            // If the cell is empty, set the value to a default value
            rowData[cols[index].field] = value !== undefined ? value : 'N/A';
          }
        });
        return { id: index, ...rowData };
      });

      setColumns(cols);
      setRows(rows);
    };
    reader.readAsBinaryString(file);
  };
  const exportToExcel = (data, filename, columnWidth) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = Array(columnWidth).fill().map(() => ({wch: 20}));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  }
  const exportFMECAStudies = () => {
    const filteredData = rows.map(row => ({
      'Part Number': row.part_number,
      'BILGEM Part Number': row.bilgem_part_number,
      'Description': row.description,
      'Failure Mode': row.failure_mode,
      'Failure Cause': row.failure_cause,
      'Finishing Material': row.finishing_material,
      'Failure Mode Ratio': row.failure_mode_ratio,
      'Failure Rate': row.failure_rate
    }));
    exportToExcel(filteredData, "FMECA_Studies.xlsx",8);
  }
  const exportMTBFCalculations = () => {
    const filteredData = rows.map(row => ({
      'Level': '', 
      'Identifier': '', 
      'Name': row.part_name,
      'Part Number': row.part_number,
      'Quantity': '',
      'Manufacturer': row.manufacturer,
      'Category': row.category,
      'Subcategory': row.subcategory,
      'Remarks': row.remarks,
      'Description': row.description,
      'MTBF Specified': row.mtbf_value,
      'Failure Rate Type': row.failure_rate_type,
      'Part Classification': 'General',
      'Part': '', 
      'Model': ''
    }));
    exportToExcel(filteredData, "MTBF_Calculations.xlsx",15);
  }

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Button
        variant="contained"
        component="label"
        style={{ marginBottom: '10px' }}
      >
        Upload File
        <input type="file" hidden onChange={handleFileUpload} />
      </Button>
      <Button 
        startIcon={<GetAppIcon />} 
        onClick={exportFMECAStudies} 
        style={{ marginBottom: '10px', fontSize: '0.8rem' }}
      >
        Export for FMECA Studies
      </Button>
      <Button 
        startIcon={<GetAppIcon />} 
        onClick={exportMTBFCalculations} 
        style={{ marginBottom: '10px', fontSize: '0.8rem' }}
      >
        Export for MTBF Calculations
      </Button>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}

export default ExcelToDataGrid;