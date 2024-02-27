import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';
import { GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, GridToolbarColumnsButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';


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

  return (
    <GridToolbarContainer>
      <div>
      <GridToolbarColumnsButton/>
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      </div>
      <Autocomplete
        forcePopupIcon={false}
        options={options}
        onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
            props.onFilterChange([newInputValue]); // pass an array to the search function
  }}
  
  renderInput={(params) => (
    <TextField 
      {...params} 
      label="Search" 
      variant="outlined" 
      sx={{ 
        width: '300px', // adjust this value to change the width
        '& .MuiOutlinedInput-root': {
          borderRadius: '25px', // make the corners rounded
          borderColor: '#ddd', // change the border color
        },
        '& .MuiOutlinedInput-input': {
          paddingLeft: '5px', // add some padding to the left of the text
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