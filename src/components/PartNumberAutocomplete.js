import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const PartNumberAutocomplete = ({ value, onChange }) => {
  const [partNumbers, setPartNumbers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/get_part_numbers')
      .then((response) => response.json())
      .then((data) => setPartNumbers(data));
  }, []);

  return (
    <Autocomplete
      id="part-number-autocomplete"
      options={partNumbers}
      value={value}
      onChange={(event, newValue) => {
        onChange(newValue);
      }}
      renderInput={(params) => <TextField {...params} label="Part Number" />}
    />
  );
};

export default PartNumberAutocomplete;