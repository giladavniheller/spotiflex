import {styled} from "@mui/material";

const DashboardLayoutRoot = styled('div')(
	({theme}) => ({
		backgroundColor: theme.palette.background.default,
		height: '100%',
		width: '100%',
		display: 'flex',
		overflow: 'hidden',
	})
);


const Layout = () => (
	<DashboardLayoutRoot>
		{/*<Navbar/>*/}
		{/*<Sidebar/>*/}

	</DashboardLayoutRoot>
);

export default Layout;