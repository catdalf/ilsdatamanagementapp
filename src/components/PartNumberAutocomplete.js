import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const PartNumberAutocomplete = ({ value, onChange, isNew }) => {
  const [partNumbers, setPartNumbers] = useState([]);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    fetch('http://localhost:5000/get_part_numbers')
      .then(response => response.json())
      .then(data => setPartNumbers(data))
      .catch(error => console.error('Error:', error));
  }, []);

  if (isNew) {
    return (
      <Autocomplete
        options={partNumbers}
        freeSolo
        value={value || ''}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          onChange(newValue);
        }}
        renderInput={(params) => (
          <TextField 
            {...params} 
            variant="standard" 
            InputProps={{ 
              ...params.InputProps, 
              style: { 
                border: 'none', 
                width: '100%', 
                boxSizing: 'border-box',
                margin: '40px 70px 40px 0px', // Adjust this margin value as needed
              } 
            }} 
            onBlur={() => onChange(inputValue)}
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <li {...props} style={{ width: '100%' }}>{option}</li>
        )}
        componentsProps={{
          paper: {
            sx: {
              width: '300px', // Adjust this width as needed
            },
          },
        }}
      />
    );
  } else {
    return value;
  }
};

export default PartNumberAutocomplete;