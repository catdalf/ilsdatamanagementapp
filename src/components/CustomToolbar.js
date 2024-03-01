import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { GridToolbarContainer, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import GetAppIcon from '@mui/icons-material/GetApp';
import Box from '@mui/material/Box';
import * as XLSX from 'xlsx';

function CustomToolbar(props) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

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

  const exportFMECAStudies = () => {
    const filteredData = props.data.map(row => ({
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
    const filteredData = props.data.map(row => ({
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
    <GridToolbarContainer>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <GridToolbarColumnsButton/>
        <GridToolbarDensitySelector />
        <Button 
        startIcon={<GetAppIcon />} 
        onClick={exportFMECAStudies} 
        sx={{ fontSize: '0.8rem' }}
      >
        Export for FMECA Studies
      </Button>
      <Button 
        startIcon={<GetAppIcon />} 
        onClick={exportMTBFCalculations} 
        sx={{ fontSize: '0.8rem' }}
      >
        Export for MTBF Calculations
      </Button>
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