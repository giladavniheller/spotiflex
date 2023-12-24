import { AppBar, Button, IconButton, Toolbar, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import Stack from "@mui/material/Stack";
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { logOut } from "../helpers/generalHelpers";

const MenuBar = () => {
	const theme = useTheme();

	return (
		<Box sx={{
			flexGrow: 1,
			width: '100%',
			borderBottom: '2px solid rgba(0, 0, 0, 0.2)',
		}}>
			<AppBar position="static">
				<Toolbar sx={{justifyContent: 'space-between'}}>
					<Stack direction={'row'}>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="menu"
							sx={{mr: 2}}
						>
							<MenuIcon/>
						</IconButton>
						<Button
							variant="outlined"
							sx={{
								color: 'black',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.1)'
								}
							}}
							onClick={() => {
								// TODO: add actual logic somehow to sign out of spotify account
								window.location.href = 'http://localhost:3000/Home'
							}}
							startIcon={<HomeIcon sx={{color: 'black'}}/>}
						>
							Home
						</Button>
						<Button
							variant="outlined"
							sx={{
								color: 'black',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.1)'
								}
							}}
							startIcon={<ColorLensIcon sx={{color: 'black'}}/>}
							onClick={() => {
								// TODO: add actual logic somehow to sign out of spotify account.
								// TODO: Might also need to clear local storage for various items.
								window.location.href = 'http://localhost:3000/Color-picker'
							}}
						>
							Color Tool
						</Button>
					</Stack>
					<Button
						sx={{
							backgroundColor: theme.palette.primary.main,
							border: '1.5px solid black',
							'&:hover': {
								backgroundColor: 'white'
							}
						}}
						onClick={() => {
							logOut();
						}}
					>
						<b style={{color: 'black'}}>Log Out</b>
					</Button>
				</Toolbar>
			</AppBar>
		</Box>
	);
}

export default MenuBar;