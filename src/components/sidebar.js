import React from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';




const Sidebar = ({ handleSidebarItemClick }) => {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (isOpen) => () => {
    setOpen(isOpen);
  };

  const handleItemClick = (page) => {
    handleSidebarItemClick(page);
    setOpen(false);
  };

  return (
    <div>
      <IconButton onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
      >
        <div
          style={{
            backgroundColor: 'black', // Set background color here
            width: '350px', // Set width of the Drawer
            height: '100%', // Set height of the Drawer
          }}
        >
          <button 
          onClick={() => handleItemClick('Home')}
          className="w-full py-2 text-white hover:text-white hover:bg-customBlue"
          >
            Home
          </button>
          <button 
          onClick={() => handleItemClick('Data Table')}
          className="w-full py-2 text-white hover:text-white hover:bg-customBlue"
          >
            Data Table
          </button>
          <button
          onClick={() => handleItemClick('Import')}
          className="w-full py-2 text-white hover:text-white hover:bg-customBlue"
          >
            Import
          </button>

        </div>
      </Drawer>
    </div>
  );
};

export default Sidebar;



