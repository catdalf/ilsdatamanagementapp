import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';

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
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}

export default ExcelToDataGrid;