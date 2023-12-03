import {HelmetProvider} from 'react-helmet-async';
import {CssBaseline, ThemeProvider} from '@mui/material';
import theme from './theme';
import {useRoutes} from "react-router-dom";
import routes from './routes';

function App() {
	const content = useRoutes(routes());

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
