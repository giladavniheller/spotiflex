import {HelmetProvider} from 'react-helmet-async';
import {CssBaseline, ThemeProvider} from '@mui/material';
import theme from './theme';
import {useRoutes} from "react-router-dom";
import routes from './routes';
import { useAuth } from './components/AuthProvider';

function App() {
  const { user } = useAuth();
  const isLoggedIn = user !== null;
  const content = useRoutes(routes(isLoggedIn));

  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline>
          {content}
        </CssBaseline>
      </ThemeProvider>
    </HelmetProvider>
    );
}

export default App;
