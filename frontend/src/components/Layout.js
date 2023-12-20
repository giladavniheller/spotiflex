import { styled } from "@mui/material";
import MenuBar from "./MenuBar";

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
		<MenuBar/>
		{/*<Sidebar/>*/}

	</DashboardLayoutRoot>
);

export default Layout;