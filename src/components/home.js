import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const displayName = user.displayName || user.email.split('@')[0];

  return (
    <Box
      sx={{
        p: 3,
        backgroundImage: 'linear-gradient(45deg, #808080 0%, #d3d3d3 25%, #2ab39e 50%, #35495e 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh', // make the background cover the entire page
        fontFamily:"'Montserrat', sans-serif", // use the Montserrat font
      }}
    >
      <h2>Welcome, {displayName}!</h2>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent white
            }}
          >
            <CardContent>
              <Typography gutterBottom variant="h5" component="div" style={{fontFamily:"'Montserrat', sans-serif"}}>
                Data Grid
              </Typography>
              <Typography variant="body2" color="text.secondary"style={{fontFamily:"'Montserrat', sans-serif", fontSize:'17px'}}>
                Add, edit, and delete rows in the data grid. You can also import and export data in Excel format.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent white
            }}
          >
            <CardContent>
              <Typography gutterBottom variant="h5" component="div"style={{fontFamily:"'Montserrat', sans-serif"}}>
                Search Bar
              </Typography>
              <Typography variant="body2" color="text.secondary"style={{fontFamily:"'Montserrat', sans-serif",fontSize:'17px'}}>
                Use the search bar with autocomplete dropdown to easily find the data you're looking for.
              </Typography>
            </CardContent>
            
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // semi-transparent white
            }}
          >
            <CardContent>
              <Typography gutterBottom variant="h5" component="div"style={{fontFamily:"'Montserrat', sans-serif"}}>
                Database
              </Typography>
              <Typography variant="body2" color="text.secondary"style={{fontFamily:"'Montserrat', sans-serif",fontSize:'17px'}}>
                Changes you make in datagrid are reflected in the database.
              </Typography>
            </CardContent>
            
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;