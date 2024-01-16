import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar, useGridApiContext } from '@mui/x-data-grid';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import 'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/tailwind.css';
import 'C:/Users/eren.buldum/Desktop/bilgemilsapplication/ils-data-management-app/src/styles.css';
import { v4 as uuidv4 } from 'uuid';


const FileUploadCell = ({ onChange }) => (
  <input type="file" onChange={onChange} accept=".pdf, .doc, .docx, .xls, .xlsx, .csv" required />
);

const DataTable = (params) => {
  
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get_data_from_database');
      const rowsWithIds = response.data.map(row => ({ id: row.part_number, ...row }));
      setData(rowsWithIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  const addRow = () => {
    const newRow = {
      id: uuidv4(), // Generate a unique ID for the new row
      // Define other properties for the new row here...
    };
    setData((prevData) => [...prevData, newRow]);
    setRowCount((prevCount) => prevCount + 1); // Increment the counter
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log('Selected file:', file);
    // Handle the file as needed (e.g., upload or process the file)
  };

  
  const columnGroupingModel = [
    {
      groupId:'Part Identification',
      headerAlign:'center',
      
      description:'',
      children:[{field:'part_name'},
      {field:'part_number'},
      {field:'BILGEM_Part_Number'},
      {field:'Manufacturer'},
      {field:'Datasheet'},
      {field:'Description'},
      {field:'Stock_Information'}
    ]
    },
    {
      groupId:'Part Categorization',
      headerAlign:'center',
      description:'',
      children:[{field:'Category'},
      {field:'Subcategory'},
      {field:'Subcategory_Type'},
      {field:'Remarks'}
      
    ]
    },
    {
      groupId:'Manufacturer Information',
      headerAlign:'center',
      description:'',
      children:[{field:'MTBF_Value'},
      {field:'Condition_Environment_Info'},
      {field:'Condition_Confidence_Level'},
      {field:'Condition_Temperature_Value'},
      {field:'Finishing_Material'}
      
    ]
    },
    {
      groupId:'Reliability Parameters',
      headerAlign:'center',
      description:'',
      children:[{field:'MTBF'},
      {field:'Failure_Rate'},
      {field:'Failure_Rate_Type'},
      
      
    ]
    },
    {
      groupId:'Failure Information',
      headerAlign:'center',
      description:'',
      children:[{field:'Failure_Mode'},
      {field:'Failure_Cause'},
      {field:'Failure_Mode_Ratio'},
      {field:'Related_Documents'},
      
      
    ]
    }
  ]
  

  const columns = [
    
     
        { field: 'part_name', headerName: 'Part Name', width: 150,headerAlign:'center', editable:true},
        { field: 'part_number', headerName: 'Part Number', width: 150,headerAlign:'center', editable:true },
        { field: 'BILGEM_Part_Number', headerName: 'BILGEM Part Number', width: 180,headerAlign:'center', editable:true },
        { field: 'Manufacturer', headerName: 'Manufacturer', width: 150,headerAlign:'center', editable:true },
        {
          field: 'Datasheet',
          headerName: 'Datasheet',
          width: 150,
          headerAlign: 'center',
          renderCell: (params) => <FileUploadCell onChange={handleFileChange} />,
        },


        {
          field: 'Description',
          headerName: 'Description',
          width: 150,
          headerAlign: 'center',
          editable:true,
        },
        
        { field: 'Stock_Information', headerName: 'Stock Information', width: 180,headerAlign:'center', editable:true },
      
    
    
      
        {
          field: 'Category',
          headerName: 'Category',
          width: 150,
          headerAlign: 'center',
          type:'singleSelect',
          valueOptions:'',
          renderCell: (params) => {
           // Define your category options here
            const categoryOptions = [
              'Resistor',
              'Capacitor',
              'Switching Device',
              'Connection',
              'Inductor',
              'Miscellaneous',
              'Integrated Circuit',
              'Semiconductor',
              'Optical Device',
              'Relay',
              'Rotating Device',
              'Software',
              'Mechanical Part',
            ]; // Replace with your actual categories
            
            return (
              <FormControl fullWidth>
                <InputLabel id="category-label">Select</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={params.value || ''}
                  
                  required
                >
                  {categoryOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          },
        },
        {
          field: 'Subcategory',
          headerName: 'Subcategory',
          width: 200,
          headerAlign: 'center',
          editable:true
        },
    
        { field: 'Subcategory_Type', headerName: 'Subcategory Type', width: 180 ,headerAlign:'center', editable:true},
        { field: 'Remarks', headerName: 'Remarks', width: 150,headerAlign:'center', editable:true },



        { field: 'MTBF_Value', headerName: 'MTBF Value', width: 150,headerAlign:'center' },

        {
          field: 'Condition_Environment_Info',
          headerName: 'Condition Environment Info',
          width: 220,
          headerAlign: 'center',
          type:'singleSelect',
          valueOptions:'',
          renderCell: (params) => {
            const conditionEnvironmentOptions = [
              'Ground, Benign (GB)',
              'Ground, Fixed (GF)',
              'Ground, Mobile (GM)',
              'Airborne, Inhabited Cargo (AIC)',
              'Airborne, Uninhabited Cargo (AUC)',
              'Airborne, Inhabited Fighter (AIF)',
              'Airborne, Uninhabited Fighter (AUF)',
              'Airborne, Rotary Wing (ARW)',
              'Naval, Unsheltered (NU)',
              'Naval, Sheltered (NS)',
              'Space, Flight (SF)',
              'Missile, Flight (MF)',
              'Missile, Launch (ML)',
              'Cannon, Launch (CL)',
            ];
            
            const handleSelectChange = (event) => {
              const selectedValue = event.target.value;
              // Handle the selected value as needed
              console.log('Selected value:', selectedValue);
            };
        
            return (
              <FormControl fullWidth>
                <InputLabel id="condition-environment-label">Select</InputLabel>
                <Select
                  labelId="condition-environment-label"
                  id="condition_environment_info"
                  name="condition_environment_info[]"
                  value={params.value || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <MenuItem value="">Select a condition environment</MenuItem>
                  {conditionEnvironmentOptions.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          },
        },
        
        
        
        { field: 'Condition_Confidence_Level', headerName: 'Condition Confidence Level', width: 220 ,headerAlign:'center', editable:true},
        { field: 'Condition_Temperature_Value', headerName: 'Condition Temperature Value', width: 240,headerAlign:'center', editable:true },
        { field: 'Finishing_Material', headerName: 'Finishing Material', width: 180,headerAlign:'center', editable:true },
      
      
        { field: 'MTBF', headerName: 'MTBF', width: 120 ,headerAlign:'center', editable:true},
        { field: 'Failure_Rate', headerName: 'Failure Rate', width: 150 ,headerAlign:'center', editable:true},
        { field: 'Failure_Rate_Type', headerName: 'Failure Rate Type', width: 180 ,headerAlign:'center'},
      
      
        { field: 'Failure_Mode', headerName: 'Failure Mode', width: 120 ,headerAlign:'center', editable:true},
        { field: 'Failure_Cause', headerName: 'Failure Cause', width: 150 ,headerAlign:'center', editable:true},
        { field: 'Failure_Mode_Ratio', headerName: 'Failure Mode Ratio', width: 180 ,headerAlign:'center', editable:true},
        {
        field: 'Related_Documents',
        headerName: 'Related Documents',
        width: 150,
        headerAlign: 'center',
        renderCell: (params) => <FileUploadCell onChange={handleFileChange} />,
      },
      
    // Add other column groups in a similar structure
  ];

  return (
    <div>
      <Button variant="contained" onClick={addRow}>
        Add Row
      </Button>

      <div className="h-96 w-full bg-white shadow-md rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
              showQuickFilter: true,
              },
            }}
            onCellEditCommit={(params, event) => {
              const field = params.field;
              const newValue = event.target.value;
          
              // Update the data with the new value
              const updatedData = data.map((row) => {
                if (row.id === params.id) {
                  return { ...row, [field]: newValue };
                }
                return row;
              });
          
              // Update the state with the new data
              setData(updatedData);
            }}
          rows={data}
          rowHeight={40}
          checkboxSelection
          disableSelectionOnClick
          autoPageSize
          experimentalFeatures={{ columnGrouping: true }}
          columnGroupingModel={columnGroupingModel}
          filterMode="server" // Enable filtering mode
          showCellVerticalBorder // Show vertical borders for cells
          
          sx={{
            '&  .MuiDataGrid-columnSeparator': {
              color:'gray', // Change this to your desired color
              visibility:'visible',
              height:1
          
            },
          }}
          
        />
      </div>
    </div>
  );
};

export default DataTable;