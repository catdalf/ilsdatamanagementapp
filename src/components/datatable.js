import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataGrid, GridToolbar, useGridApiContext, GridCellModes } from '@mui/x-data-grid';
import { Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import 'C:/Users/eren.buldum/ilsdatamanagementapp/src/tailwind.css';
import 'C:/Users/eren.buldum/ilsdatamanagementapp/src/styles.css';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Box from '@mui/material/Box';


const FileUploadCell = ({ onChange }) => (
  <input type="file" onChange={onChange} accept=".pdf, .doc, .docx, .xls, .xlsx, .csv" required />
);

const DataTable = (params) => {
  const [data, setData] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [cellModesModel, setCellModesModel] = useState({});
  
 
  
  

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
      id: rowCount,
      Category:'',
      Subcategory:'', // Generate a unique ID for the new row
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
  const handleCellClick = (params, event) => {
    if (!params.isEditable) {
      return;
    }

    setCellModesModel((prevModel) => ({
      ...prevModel,
      [params.id]: {
        ...prevModel[params.id],
        [params.field]: { mode: GridCellModes.Edit },
      },
    }));
  };





  const handleCellEditCommit = (params) => {
    const field = params.field;
    const newValue = params.value === undefined ? '' : params.value;
    const updatedData = data.map((row) => {
      if (row.id === params.id) {
        return { ...row, [field]: newValue };
      }
      return row;
    });
  
    setData(updatedData);
  };
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
        'Relay': ['Automotive', 'Contactor', 'Dry Circuit','Electronic Time Delay, Non-Thermal','General Purpose','High Speed','High Voltage','Latcinhg','Low Power','Medium Power','Mercury','Polarized','Reed, Dual In Line','Sensitive','Solid State, Time Delay','Thermal, Bimetal'],
        'Rotating Device': ['Motor', 'Other'],
        'Software': ['217Plus Software', 'PRISM Software', 'RADC Toolkit Software'],
        'Mechanical Part': ['Bearing', 'Belt Drive', 'Brake Friction Lining','Brush','Casing','Chain Drive','Clutch Friction Lining','Cylinder Wall','Electric Motor Base','Electric Motor Winding','Filter','Fluid Conductors','Fluid Driver','Gear','Metal Compressor Diaphragm','Miscellaneous','Piston/Cyliner','Poppet','Rubber Compressor Diaphragm','Seal, Dynamic Spring','Seal, Mechanical','Seal, Static, Gasket','Sensor/Transducer','Shaft','Sliding Action Valve, Spool','Solenoid','Spline','Spring','Stator Housing','Threaded Fastener'],
  }

  
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
          field: 'Subcategory',
          headerName: 'Subcategory',
          width: 200,
          headerAlign: 'center',
          editable:true,
          type: 'singleSelect',
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
    
        { field: 'Subcategory_Type', headerName: 'Subcategory Type', width: 180 ,headerAlign:'center', editable:true},
        { field: 'Remarks', headerName: 'Remarks', width: 150,headerAlign:'center', editable:true },



        { field: 'MTBF_Value', headerName: 'MTBF Value', width: 150,headerAlign:'center' },

        {
          field: 'Condition_Environment_Info',
          headerName: 'Condition Environment Info',
          width: 220,
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
          onCellClick={handleCellClick}
          onCellEditCommit={handleCellEditCommit}
          rows={data}
          rowHeight={40}
          checkboxSelection
          disableRowSelectionOnClick
          autoPageSize
          experimentalFeatures={{ columnGrouping: true }}
          columnGroupingModel={columnGroupingModel}
          filterMode="server" // Enable filtering mode
          showCellVerticalBorder // Show vertical borders for cells
          cellModesModel={cellModesModel}
          

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