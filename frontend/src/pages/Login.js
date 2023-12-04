import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Stack from "@mui/material/Stack";
import {Chip, useTheme} from "@mui/material";


const Login = () => {
	const theme = useTheme();
	const handleSubmit = (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		console.log({
			email: data.get('email'),
			password: data.get('password'),
		});
	};

  const login = () => {

  };

	return (
		<Container component="main">
			<CssBaseline/>
			<Box
				sx={{
					marginTop: 8,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Stack direction={'row'} sx={{padding: '5px', alignItems: 'center', borderBottom: '2px solid black'}}
							 spacing={3}>
					<Avatar sx={{width: '15vh', height: '15vh', bgcolor: 'primary.main'}}>
						<MusicNoteIcon sx={{width: '10vh', height: '10vh'}}/>
					</Avatar>
					<Typography sx={{fontSize: '15vh'}}>
						SpotiFlex
					</Typography>
				</Stack>
				<Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
					<Stack direction={'column'} sx={{alignItems: 'center'}}>

						<Typography sx={{fontSize: '2.5vh', textAlign: 'center', paddingTop: '1vh'}}>
							Welcome to SpotiFlex, the internet's best free tool for flexible Spotify features! Please click below to
							authenticate your Spotify credentials and get started!
						</Typography>

						<Chip
							variant="outlined"
							sx={{
								marginTop: '50px',
								transform: 'scale(1.5)',
								'&:hover': {
									transform: 'scale(1.6)',
								},
								transition: 'transform 0.3s ease-in-out',
								width: '230px',
								height: '35px',
								color: 'black',
								border: '1px solid black',
								backgroundColor: theme.palette.primary.main,
								fontWeight: 'bold',
								cursor: 'pointer'
							}}
							label={'Sign In With Spotify'}
							onClick={() => {
                window.location.href = '/authorize'
              }}
						/>
					</Stack>
				</Box>
			</Box>
		</Container>
	);
}

export default Login;