
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar, useGridApiContext, GridCellEditStopReasons, GridCellModes} from '@mui/x-data-grid';
import { Button } from '@mui/material';
import 'C:/Users/eren.buldum/ilsdatamanagementapp/src/tailwind.css';
import 'C:/Users/eren.buldum/ilsdatamanagementapp/src/styles.css';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Cancel';

const DataTable = (params) => {
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  
 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (filterValue = '') => {
    try {
      const response = await axios.get('http://localhost:5000/get_data_from_database', {
        params: { filter: filterValue },
        withCredentials: true
      });
      const rowsWithIds = response.data.map(row => ({ id: row.part_number, ...row }));
      setData(rowsWithIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

//Code to make cells editable with one click
const [cellModesModel, setCellModesModel] = React.useState({});

  const handleCellClick = React.useCallback((params, event) => {
    if (!params.isEditable) {
      return;
    }

    // Ignore portal
    if (event.target.nodeType === 1 && !event.currentTarget.contains(event.target)) {
      return;
    }

    setCellModesModel((prevModel) => {
      return {
        // Revert the mode of the other cells from other rows
        ...Object.keys(prevModel).reduce(
          (acc, id) => ({
            ...acc,
            [id]: Object.keys(prevModel[id]).reduce(
              (acc2, field) => ({
                ...acc2,
                [field]: { mode: GridCellModes.View },
              }),
              {},
            ),
          }),
          {},
        ),
        [params.id]: {
          // Revert the mode of other cells in the same row
          ...Object.keys(prevModel[params.id] || {}).reduce(
            (acc, field) => ({ ...acc, [field]: { mode: GridCellModes.View } }),
            {},
          ),
          [params.field]: { mode: GridCellModes.Edit },
        },
      };
    });
  }, []);

  const handleCellModesModelChange = React.useCallback((newModel) => {
    setCellModesModel(newModel);
  }, []);
//Code to make cells editable with one click ends here


//Here is the code to change the value of cells under the Failure_Rate_Type column according to the value of the MTBF_Value column:
const processRowUpdate = (updatedRow, originalRow) => {
  if ('mtbf_value' in updatedRow) {
    updatedRow.failure_rate_type = updatedRow.mtbf_value ? 'Specified, MTBF' : 'Calculated';
  }

  if (JSON.stringify(updatedRow) !== JSON.stringify(originalRow)) {
    updateRow(updatedRow);
  }

  return updatedRow;
};

  //Purpose of EditTextArea is to make the cell editable with a pop-up window
  //This is a custom component for the DataGrid
  //It is used in the renderEditCell property of the column definition
  
  function EditTextarea(props) {
    const { id, field, value, colDef, hasFocus } = props;
    const [valueState, setValueState] = React.useState(value);
    const [anchorEl, setAnchorEl] = React.useState();
    const [inputRef, setInputRef] = React.useState(null);
    const apiRef = useGridApiContext();
  
    React.useLayoutEffect(() => {
      if (hasFocus && inputRef) {
        inputRef.focus();
      }
    }, [hasFocus, inputRef]);
    
    const handleRef = React.useCallback((el) => {
      setAnchorEl(el);
    }, []);
  
    const handleChange = React.useCallback(
      (event) => {
        const newValue = event.target.value;
        setValueState(newValue);
        apiRef.current.setEditCellValue(
          { id, field, value: newValue, debounceMs: 200 },
          event,
        );
      },
      [apiRef, field, id],
    );
  
    return (
      <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
        <div
          ref={handleRef}
          style={{
            height: 1,
            width: colDef.computedWidth,
            display: 'block',
            position: 'absolute',
            top: 0,
          }}
        />

        {anchorEl && (
          // This part is for the pop-up window (Popper component)
          <Popper open anchorEl={anchorEl} placement="bottom-start">
            <Paper elevation={1} sx={{ p: 1, minWidth: colDef.computedWidth }}>
              <InputBase
                multiline
                rows={4}
                value={valueState}
                sx={{ textarea: { resize: 'both' }, width: '100%' }}
                onChange={handleChange}
                inputRef={(ref) => setInputRef(ref)}
              />
            </Paper>
          </Popper>
        )}
      </div>
    );
  }
  //multilineColumn is used for the columns that have multiline text
  const multilineColumn = {
    type: 'string',
    renderEditCell: (params) => <EditTextarea {...params} />,
  };


  const addRow = () => {
    const newRow = {
      id: rowCount,
      part_name: '',
      part_number: '',
      bilgem_part_number: '', // Corrected field name
      manufacturer: '', // Corrected field name
      datasheet: '',
      description: '',
      stock_information: '', // Corrected field name
      category: '',
      subcategory: '',
      subcategory_type: '', // Corrected field name
      mtbf_value: '', // Corrected field name
      condition_environment_info: '',
      condition_confidence_level: '',
      condition_temperature_value: '',
      finishing_material: '',
      mtbf: '', // Corrected field name
      failure_rate: '',
      failure_rate_type: '',
      failure_mode: '',
      failure_cause: '',
      failure_mode_ratio: '',
      related_documents: '',
    };
  
    console.log('New row:', newRow);
    setData((prevData) => [...prevData, newRow]);
    setRowCount((prevCount) => prevCount + 1); // Increment the counter
  };
  const saveRow = (row) => {
    console.log('Saving row', row);
    
    // Validation of all of the fields are filled
    if (
        (row.id === null || row.id === undefined) ||
        !row.part_name ||
        !row.part_number ||
        !row.bilgem_part_number || 
        !row.manufacturer || 
        !(row.datasheet instanceof File) || 
        !row.description ||
        !row.stock_information || 
        !row.category ||
        !row.subcategory ||
        !row.subcategory_type || 
        !row.mtbf_value || 
        !row.condition_environment_info ||
        !row.condition_confidence_level ||
        !row.condition_temperature_value ||
        !row.finishing_material ||
        !row.mtbf || 
        !row.failure_rate ||
        !row.failure_rate_type ||
        !row.failure_mode ||
        !row.failure_cause ||
        !row.failure_mode_ratio ||
        !(row.related_documents instanceof File) 
    ) {
        alert('Please fill all of the fields!');
        return;
    }

    const formData = new FormData();
    for (const key in row) {
        if (key === 'datasheet' || key === 'related_documents') {
            formData.append(key, row[key]);
        } else {
            formData.append(key, row[key]);
        }
    }

    fetch('http://localhost:5000/add_row', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert('Failed to save row:' + data.error);
            } else {
                alert('Row saved successfully!');
                return fetch('http://localhost:5000/get_data_from_database');
            }
        })
        .then((response) => response.json())
        .then((data) => {
            // Update your state with the new data
            this.setState({ data: data });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
};
  const deleteRow= (row) => {
    fetch('http://localhost:5000/delete_row', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ part_number: row.id}),
    })
    .then((response) => response.json())
    .then(data => {
      if (data.success) {
        alert('Row deleted successfully!');
        setData(data.filter((r) => r.id !== row.id));
      } else {
        console.error('Failed to delete row:', data.error);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const updateRow = (row) => {
    const formData = new FormData();
    for (const key in row) {
      if (key === 'datasheet' || key === 'related_documents') {
        formData.append(key, row[key]);
      } else {
        formData.append(key, row[key]);
      }
    }
  
    fetch('http://localhost:5000/update_row', {
      method: 'PUT',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert('Failed to update row:' + data.error);
        } else {
          alert('Row updated successfully!');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
      
const handleFileChange = (event, params, field) => {
  event.persist();
  const file = event.target.files[0];
  console.log('File changed:', file);

  // Update the row data with the file object
  params.api.updateRows([{ id: params.id, [field]: file }]);
};
  const columnGroupingModel = [
    {
      groupId:'Part Identification',
      headerAlign:'center',
      
      description:'',
      children:[{field:'part_name'},
      {field:'part_number'},
      {field:'bilgem_part_number'},
      {field:'manufacturer'},
      {field:'datasheet'},
      {field:'description'},
      {field:'stock_information'}
    ]
    },
    {
      groupId:'Part Categorization',
      headerAlign:'center',
      description:'',
      children:[{field:'category'},
      {field:'subcategory'},
      {field:'subcategory_type'},
      {field:'remarks'}
      
    ]
    },
    {
      groupId:'Manufacturer Information',
      headerAlign:'center',
      description:'',
      children:[{field:'mtbf_value'},
      {field:'condition_environment_info'},
      {field:'condition_confidence_level'},
      {field:'condition_temperature_value'},
      {field:'finishing_material'}
      
    ]
    },
    {
      groupId:'Reliability Parameters',
      headerAlign:'center',
      description:'',
      children:[{field:'mtbf'},
      {field:'failure_rate'},
      {field:'failure_rate_type'},
      
      
    ]
    },
    {
      groupId:'Failure Information',
      headerAlign:'center',
      description:'',
      children:[{field:'failure_mode'},
      {field:'failure_cause'},
      {field:'failure_mode_ratio'},
      {field:'related_documents'},
      
      
    ]
    },
    {
      groupId:'Action Buttons',
      headerAlign:'center',
      description:'',
      children:[{field:'save'},
      {field:'delete'},
    ]
    }
  ]

  const columns = [
        
        { field: 'part_name', headerName: 'Part Name', width: 150,headerAlign:'center', editable:true, description:''},
        { field: 'part_number', headerName: 'Part Number', width: 150,headerAlign:'center', editable:true },
        { field: 'bilgem_part_number', headerName: 'BILGEM Part Number', width: 180,headerAlign:'center', editable:true },
        { field: 'manufacturer', headerName: 'Manufacturer', width: 150,headerAlign:'center', editable:true },
        {
          field: 'datasheet',
          headerName: 'Datasheet',
          width: 150,
          headerAlign: 'center',
          renderCell: (params) => {
            return (
              <input
                type="file"
                onChange={(event) => handleFileChange(event, params, 'datasheet')}
                name="datasheet"
                accept=".pdf, .doc, .docx, .xls, .xlsx, .csv"
                required
              />
            );
          },
        },


        {
          field: 'description',
          headerName: 'Description',
          description: '',
          width: 150,
          headerAlign: 'center',
          editable:true,
        },
        
        { field: 'stock_information',
         headerName: 'Stock Information',
          width: 180,
          headerAlign:'center',
          editable:true },
      
        {
          field: 'category',
          headerName: 'Category',
          width: 200,
          headerAlign: 'center',
          type:'singleSelect',
          valueOptions: ['Resistor','Capacitor','Switching Device','Connection','Inductor','Miscellaneous','Integrated Circuit','Semiconductor','Optical Device','Relay','Rotating Device','Software','Mechanical Part'],
          editable:true,
          
          renderCell: ({ value }) => (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>{value}</div>
              <ArrowDropDownIcon />
            </Box>
          ),
      },
        {
          field: 'subcategory',
          headerName: 'Subcategory',
          width: 200,
          headerAlign: 'center',
          editable:true,
          type: 'singleSelect',
          valueOptions: ({row}) => {
            
            
            if (!row) {
              return [];
            }
            const subcategoryOptions = {
              'Resistor': ['Accurate, WW (RB, RBR)', 'Carbon, Var NonWW (RV)', 'Chassis Mount, WW Power (RE, RER)','Composition (RC, RCR)','Film (RL, RLR, RN, RNR, RM)','Film, Power (RD)','Film, Var NonWW (RVC)','General','Glass Glazed, Var','Lead Mount, WW Power (RW, RWR)','Lead Screw, Var WW (RT, RTR)','Network Film (RZ)','Organic Solid, Var','Power, Var WW (RP)','Precision, Var NonWW (RQ)','Precision, Var WW (RR)','Semiprec, Var WW (RA, RK)','Surface Mount','Thermistor (RTH)','Trimmer, Var NonWW (RJ, RJR)'],
              'Capacitor': ['Air Trimmer, Variable (CT)', 'Button Mica (CB)', 'Ceramic, Variable (CV)','Chassis Mount, Elec, Alum (CU, CUR)','Chip, Ceramic (CDR)','Chip, Elec (CWR)','Chip, Silicon','Feed Through, Paper (CZ, CZR)','General Ceramic (CK, CKR)','Glass (CY, CYR)','Lead Mount, Elec, Alum (CE)','Metallized Paper-Plastic (CH, CHR)','Mica (CM, CMR)','MOS','Nonsolid, Elec, Tant (CL, CLR, CRL)','Other, Variable','Paper (CA, CP)','Paper-Plastic (CQ, CQR, CPV)','Piston, Variable (PC)','Plastic (CFR)','Solid, Elec, Tant (CSR)','Super Metallized Plastic (CRH)','Temp Compensat, Ceramic (CC, CCR)','Vacuum, Variable or Fixed (CG)'],
              'Switching Device': ['Basic Sensitive', 'Circuit Breaker', 'Keyboard','Other','Rocker or Slide','Rotary','Thumbwheel','Toggle or Pushbutton'],
              'Connection': ['Board with Plated Thru Holes', 'General', 'IC Socket','Other Connection','PCB Edge','SMT Interconnect Assy'],
              'Inductor': ['Chip', 'Coil', 'Transformer'],
              'Miscellaneous': ['Antenna, Loop', 'Antenna, Telescopic', 'Battery','Ceramic Resonator','Computer Subsystem','Crystal Resonator','Delay Line','Display','Electric Bell','Electric Cable','Ferrite Device, Microwave','Filter','Fuse','Gas Discharge Tube','Gyroscope','Heater','Incandescent Lamp','Laser','LCD','Load, Dummy or Microwave','Loudspeaker','Meter','Microphone','Microwave Element','Neon Lamp','Oscillator','Piezoelectric Sensor / Transducer','Power Module or Supply','Quartz Crystal','Quartz Filter','RF or Microwave Passive Device','Surge Arrestor','Termination','Thermal Sensitive Component','Thermal-Electric Cooler','Tube','Vibrator'],
              'Integrated Circuit': ['Bubble Memory', 'Custom', 'EEPROM','GaAs Digital','GaAs MMIC','Linear','Logic, CGA or ASIC','Memory','Microprocessor','PAL, PLA','SAW - Surface Acoustic Wave','VHSIC/VLSI CMOS'],
              'Semiconductor': ['Alphanumeric Display', 'Diode', 'GaAs FET','HBT','Microwave Diode','Microwave Power Transistor','Microwave Transistor','Si FET','Thyristor','Transistor','Unijunction Transistor'],
              'Optical Device': ['Amplifier', 'Coupler / Splitter', 'Detector, Isolator, Emitter','Dispersion Compensating Module','Fiber Optic Item','Laser Diode','Laser Module','Modulator','Optical Switch','Optical Wavelength Locker','Other Optical Module or Device','Power Coupler / Divider (Tap)','Receiver Module','Transceiver','Transponder','Wavelength Division Multiplexer'],
              'Relay': ['Automotive', 'Contactor', 'Dry Circuit','Electronic Time Delay, Non-Thermal','General Purpose','High Speed','High Voltage','Latching','Low Power','Medium Power','Mercury','Polarized','Reed, Dual In Line','Sensitive','Solid State, Time Delay','Thermal, Bimetal'],
              'Rotating Device': ['Motor', 'Other'],
              'Software': ['217Plus Software', 'PRISM Software', 'RADC Toolkit Software'],
              'Mechanical Part': ['Bearing', 'Belt Drive', 'Brake Friction Lining','Brush','Casing','Chain Drive','Clutch Friction Lining','Cylinder Wall','Electric Motor Base','Electric Motor Winding','Filter','Fluid Conductors','Fluid Driver','Gear','Metal Compressor Diaphragm','Miscellaneous','Piston/Cyliner','Poppet','Rubber Compressor Diaphragm','Seal, Dynamic Spring','Seal, Mechanical','Seal, Static, Gasket','Sensor/Transducer','Shaft','Sliding Action Valve, Spool','Solenoid','Spline','Spring','Stator Housing','Threaded Fastener'],
        };
            
            
            return subcategoryOptions[row.category] || [];

      
          },
        
          renderCell: ({ value }) => (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>{value}</div>
              <ArrowDropDownIcon />
            </Box>
          ),
        },
    
        { field: 'subcategory_type', headerName: 'Subcategory Type', width: 180 ,headerAlign:'center', editable:true},
        { field: 'remarks', headerName: 'Remarks', width: 150,headerAlign:'center', editable:true },



        { field: 'mtbf_value', headerName: 'MTBF Value', width: 150,headerAlign:'center',editable:true},

        {
          field: 'condition_environment_info',
        
          headerName: 'Condition Environment Info',
          width: 250,
          headerAlign: 'center',
          type:'singleSelect',
          valueOptions:[
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
          ],
          editable:true,
          renderCell: ({ value }) => (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>{value}</div>
              <ArrowDropDownIcon />
            </Box>
          ),
          
        },
        
        
        
        { field: 'condition_confidence_level', headerName: 'Condition Confidence Level', width: 220 ,headerAlign:'center', editable:true},
        { field: 'condition_temperature_value', headerName: 'Condition Temperature Value', width: 240,headerAlign:'center', editable:true },
        { field: 'finishing_material', headerName: 'Finishing Material', width: 180,headerAlign:'center', editable:true },
      
      
        { field: 'mtbf', headerName: 'MTBF', width: 120 ,headerAlign:'center', editable:true},
        { field: 'failure_rate', headerName: 'Failure Rate', width: 150 ,headerAlign:'center', editable:true},
        { field: 'failure_rate_type', headerName: 'Failure Rate Type', width: 180 ,headerAlign:'center',editable:false},
      
      
        { field: 'failure_mode', headerName: 'Failure Mode', width: 120 ,headerAlign:'center', editable:true, ...multilineColumn },
        { field: 'failure_cause', headerName: 'Failure Cause', width: 150 ,headerAlign:'center', editable:true},
        { field: 'failure_mode_ratio', headerName: 'Failure Mode Ratio', width: 180 ,headerAlign:'center', editable:true, ...multilineColumn},
        {
          field: 'related_documents',
          headerName: 'Related Documents',
          width: 150,
          headerAlign: 'center',
          renderCell: (params) => {
            return (
              <input
                type="file"
                onChange={(event) => handleFileChange(event, params, 'related_documents')}
                name="related_documents"
                accept=".pdf, .doc, .docx, .xls, .xlsx, .csv"
                required
              />
            );
          },
        },
      {
        field: 'save',
        headerName: 'Save',
        description:'Please only click this button after filling all of the fields and adding a new row!',
        headerAlign: 'center',
        fontFamily:"'Montserrat', sans-serif",
        sortable: false,
        width: 150,
        renderCell: (params) => (
        
          
          <Button
            variant="contained"w
            color="primary"
            size="small"
            
            onClick={() => saveRow(params.row)}
           
          style={{color:'white',backgroundColor:'purple',fontFamily:"'Montserrat', sans-serif", margin:'auto'}}
          >
          <SaveIcon />
          
          </Button>
       
        ),
        
      },
      {
        field:'delete',
        headerName:'Delete',
        description:'Please only click this button if you wanna delete the row!',
        headerAlign:'center',
        sortable:false,
        width:150,
        renderCell: (params) => (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => deleteRow(params.row)}
            style={{color:'white',backgroundColor:'purple',fontFamily:"'Montserrat', sans-serif", margin:'auto'}}
          >
            <DeleteIcon />
          </Button>
        )
      }
    
    // Add other column groups in a similar structure
  ];

  return (
  
    <div>
      <Button variant="contained" onClick={addRow} style={{color:'white',backgroundColor:'purple',fontFamily:"'Montserrat', sans-serif", position: 'relative', left: '6px'}} >
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
          onCellEditStop={(params, event) => {
            if (params.reason !== GridCellEditStopReasons.enterKeyDown) {
              return;
            }
            if (isKeyboardEvent(event) && !event.ctrlKey && !event.metaKey) {
              event.defaultMuiPrevented = true;
            }
          }}
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          processRowUpdate={processRowUpdate}
          rows={data}         
          rowHeight={40}
          checkboxSelection
          pageSizeOptions={[5, 10, 20, 50, 100]}
          disableRowSelectionOnClick
          autoPageSize
          experimentalFeatures={{ columnGrouping: true }}
          columnGroupingModel={columnGroupingModel}
          filterMode="server" // Enable filtering mode
          showCellVerticalBorder // Show vertical borders for cells
          
        
          sx={{
            
            '&  .MuiDataGrid-columnSeparator': {
              color:'#724585', // Change this to your desired color
              visibility:'visible',
              height:1,
              
            },
            '& .MuiDataGrid-toolbarContainer button': {
              color:'purple',


            },
            '& .MuiDataGrid-toolbarContainer input': {
            
            
            },
          }}
          
        
        />
       
      </div>
    </div>
  
  );
  
};

export default DataTable;