import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import * as XLSX from 'xlsx';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function CustomToolbar(props) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const fileInputRefMTBF = useRef(null);
  const fileInputRefFMECA = useRef(null);
  const {role} = props;

  useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    (async () => {
      const response = await axios.get('http://localhost:5000/autocomplete', {
        params: { filter: inputValue },
        withCredentials: true
      });

      if (active) {
        setOptions(response.data);
      }
    })();

    return () => {
      active = false;
    };
  }, [inputValue]);

  const exportToExcel = (data, filename, columnWidth) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = Array(columnWidth).fill().map(() => ({wch: 20}));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  }

  const handleFMECAFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Excel data:', excelData);

      const filteredData = props.data.filter(row => {
        return excelData.some(excelRow => {
          const isMatch = excelRow['MANUFACTURER_PN1'].trim() === row.part_number.trim() &&
                excelRow['BILGEM_PN'].toString().trim() === row.bilgem_part_number.replace(/"/g, '').trim() &&
                excelRow['Description'].trim() === row.description.trim();
      
          if (!isMatch) {
            console.log('Excel row:', excelRow);
            console.log('Data row:', row);
          }
      
          return isMatch;
        });
      });
      
  
      if (filteredData.length > 0) {
        let exportData = [];
        filteredData.forEach(row => {
          const failureModes = row.failure_mode.split('\n');
          const failureCauses = row.failure_cause.split('\n');
          const failureModeRatios = row.failure_mode_ratio.split('\n');
      
          failureModes.forEach((failureMode, index) => {
            exportData.push({
              'Part Number': row.part_number,
              'BILGEM Part Number': row.bilgem_part_number,
              'Description': row.description,
              'Failure Mode': failureMode,
              'Failure Cause': failureCauses[index],
              'Finishing Material': row.finishing_material,
              'Failure Mode Ratio': failureModeRatios[index],
              'Failure Rate': row.failure_rate
            });
          });
        });
        exportToExcel(exportData, "FMECA_Studies.xlsx",8);
      }
    };
    reader.readAsBinaryString(file);
    event.target.value = null;
  };

  const handleMTBFFileUpload = (event) => {
    console.log('MTBF file upload');
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = XLSX.utils.sheet_to_json(worksheet);
  
      const filteredData = props.data.filter(row => {
        return excelData.some(excelRow => {
          return excelRow['MANUFACTURER_PN1'].trim() === row.part_number.trim() &&
                 excelRow['BILGEM_PN'].toString().trim() === row.bilgem_part_number.replace(/"/g, '').trim() &&
                 excelRow['Description'].trim() === row.description.trim();
        });
      });
  
      if (filteredData.length > 0) {
        let exportData = [];
        filteredData.forEach(row => {
          const manufacturers = row.manufacturer.split('\n');
      
          manufacturers.forEach(manufacturer => {
            exportData.push({
              'Level': '', 
              'Identifier': '', 
              'Name': row.part_name,
              'Part Number': row.part_number,
              'Quantity': '',
              'Manufacturer': manufacturer,
              'Category': row.category,
              'Subcategory': row.subcategory,
              'Remarks': row.remarks,
              'Description': row.description,
              'MTBF Specified': row.mtbf_value,
              'Failure Rate Type': row.failure_rate_type,
              'Part Classification': 'General',
              'Part': '', 
              'Model': ''
            });
          });
        });
        exportToExcel(exportData, "MTBF_Calculations.xlsx",15);
      }
    };
    reader.readAsBinaryString(file);
    event.target.value=null;
  };

  const handleValidateAndExportMTBFClick = () => {
    fileInputRefMTBF.current.click();
  };
  
  const handleExportFMECAClick = () => {
    fileInputRefFMECA.current.click();
  };

  return (
    <GridToolbarContainer>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <GridToolbarColumnsButton/>
        <GridToolbarDensitySelector />
        <Button 
          startIcon={<UploadFileIcon />} 
          onClick={handleExportFMECAClick} 
          sx={{ fontSize: '0.8rem' }}
          disabled={props.role === 'casual'}
        >
          Upload BOM for Exporting FMECA Studies Excel File
        </Button>
        <input
          type="file"
          ref={fileInputRefFMECA}
          style={{ display: 'none' }}
          accept=".xlsx,.xls"
          onChange={handleFMECAFileUpload}
          disabled={props.role === 'casual'}
        />
        <Button 
          startIcon={<UploadFileIcon />} 
          onClick={handleValidateAndExportMTBFClick} 
          sx={{ fontSize: '0.8rem' }}
          disabled={props.role === 'casual'}
        >
          Upload BOM for Exporting MTBF Calculations Excel File
        </Button>
        <input
          type="file"
          ref={fileInputRefMTBF}
          style={{ display: 'none' }}
          accept=".xlsx,.xls"
          onChange={handleMTBFFileUpload}
          disabled={props.role === 'casual'}
        />
      </Box>
      <Autocomplete
        noOptionsText={`No matching values.
        Add new part number if needed.`}
        forcePopupIcon={false}
        options={options}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          props.onFilterChange([newInputValue]); 
      }}
        renderInput={(params) => (
          <TextField 
            {...params} 
            label="Search" 
            variant="outlined" 
            sx={{ 
              width: '300px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px', 
                borderColor: '#ddd', 
              },
              '& .MuiOutlinedInput-input': {
                paddingLeft: '5px', 
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </GridToolbarContainer>
  );
  }
  export default CustomToolbar;