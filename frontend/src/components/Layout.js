import { styled } from "@mui/material";
import MenuBar from "./MenuBar";
import Stack from "@mui/material/Stack";

const DashboardLayoutRoot = styled('div')(
	({theme}) => ({
		backgroundColor: theme.palette.background.default,
		height: '100%',
		width: '100%',
		display: 'flex',
		overflow: 'hidden',
	})
);


const Layout = ({Page}) => (
	<DashboardLayoutRoot sx={{width: '100%'}}>
		<Stack direction={'column'} sx={{width: '100%'}}>
			<MenuBar/>
			<Page></Page>
		</Stack>

		{/*<Sidebar/>*/}

	</DashboardLayoutRoot>
);

export default Layout;