import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { useAuth } from "../components/AuthProvider";
import { Typography } from "@mui/material";


const CallbackPage = () => {
  const { login, logout } = useAuth();

  useEffect(() => {
    const currentUrl = window.location;
    if (!currentUrl) {
      return;
    }

    // Get the code from the callback if it exists
    const urlParams = new URLSearchParams(currentUrl.search);
    const code = urlParams.get('code');

    if (code) {
      fetch(`/login?${urlParams}`)
        .then((res) => {
          if (res.status == 200) {
            login(code);
          } else {
            logout();
          }
        })
        .catch((err) => {
          console.log(err);
        })
      // then fetch to backend,
      // exchange code with backend, wait for code to validate
      // then it will repose with jwt, set the jwt login(jwt)
    }
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center',
      height: '100%',
      widht: '100%',
      justifyContent: 'center',
    }}>
      <CircularProgress />
    </Box>
  );
};

export default CallbackPage;
