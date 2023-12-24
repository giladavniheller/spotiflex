import { createTheme } from '@mui/material/styles';

const theme = createTheme({
	palette: {
		primary: {
			main: '#1ED760',
			darkGreen: '#1DB954',
			white: '#FFFFFF',
			black: '#191414',
			grey: '#888',
			red: '#f13951'
		},
		background: {
			default: '#FFFFFF',
			raised: '#F5F5F5'
		}
	}
})

export default theme;