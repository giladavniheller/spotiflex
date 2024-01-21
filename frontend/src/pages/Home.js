import * as React from 'react';
import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Card, CardContent, CardHeader, CardMedia, Divider, useTheme } from "@mui/material";
import { getTopArtists, getTopSongs, getUserProfile } from "../helpers/spotifyHelpers";
import Avatar from "@mui/material/Avatar";
import { logOut } from "../helpers/generalHelpers";

const Home = () => {
	const theme = useTheme();
	const [accessToken, setAccessToken] = useState('');
	const [refreshToken, setRefreshToken] = useState('');
	const [userProfile, setUserProfile] = useState({});
	const [topArtists, setTopArtists] = useState([]);
	const [topSongs, setTopSongs] = useState([]);


	useEffect(() => {
		console.log('in home page useEffect 0');

		let params = (new URL(document.location)).searchParams;
		const urlAccessToken = params.get('access_token');
		if (urlAccessToken) {
			console.log('Access token found in url parameters!');
			localStorage.setItem('access_token', urlAccessToken);
		} else {
			console.log('No access token in url, checking local storage...');
			const localStorageAccessToken = localStorage.getItem('access_token');
			if (!localStorageAccessToken) {
				console.log('No access token found in local storage either... need to log in!')
				logOut();
			}
			console.log('Access token found in local storage, all good!');
		}

		const urlRefreshToken = params.get('refresh_token');
		if (urlRefreshToken) {
			console.log('Refresh token found in url parameters!');
			localStorage.setItem('refresh_token', urlRefreshToken);
		} else {
			console.log('No refresh token in url, checking local storage...');
			const localStorageRefreshToken = localStorage.getItem('refresh_token');
			if (!localStorageRefreshToken) {
				console.log('No refresh token found in local storage either... need to log in!')
				logOut();
			}
			console.log('Refresh token found in local storage, all good!');
		}

		setAccessToken(localStorage.getItem('access_token'));
		setRefreshToken(localStorage.getItem('refresh_token'));
	}, []);

	useEffect(() => {
		if (accessToken !== '') {
			getUserProfile(accessToken, refreshToken).then(userProfileResponse => {
				setUserProfile(userProfileResponse);
			});
		}
	}, [accessToken, refreshToken]);

	useEffect(() => {
		if (accessToken !== '') {
			getTopArtists(accessToken, refreshToken).then((topArtistsResponse) => {
				setTopArtists(topArtistsResponse[0] ?? []);
			});
		}
	}, [accessToken, refreshToken]);

	useEffect(() => {
		if (accessToken !== '') {
			getTopSongs(accessToken, refreshToken).then(topSongsResponse => {
				setTopSongs(topSongsResponse[0] ?? []);
			});
		}
	}, [accessToken, refreshToken]);

	return (
		<main>
			<Box
				sx={{
					bgcolor: 'background.paper',
					pt: 4,
					pb: 6,
					alignItems: 'center'
				}}
			>
				<Container maxWidth="sm">
					<Stack directio={'column'}>
						<Typography
							sx={{fontSize: '50px', marginBottom: '0px'}}
							align="center"
							color="text.primary"
							gutterBottom
						>
							Welcome to SpotiFlex,
						</Typography>
						<Stack direction={'row'} sx={{'alignItems': 'center', 'alignSelf': 'center'}} spacing={2}>
							<Typography
								sx={{fontSize: '50px'}}
								align="center"
								color={theme.palette.primary.darkGreen}
							>
								{userProfile?.display_name ?? ''}
							</Typography>
							{(userProfile?.images ?? []).length > 0 && userProfile?.images[0].url &&
								<Avatar sx={{width: '70px', height: '70px'}} alt="profilePhoto"
												src={userProfile?.images[userProfile?.images.length - 1].url ?? ''}/>}
						</Stack>
					</Stack>

					<Typography variant="h5" align="center" color="text.secondary" paragraph>
						We're so happy you decided to visit my website! Please click around and explore
						the various features I have to offer! Love ya!!!
					</Typography>

				</Container>
			</Box>
			<Container sx={{alignItems: 'center'}}>
				<Stack direction={'row'} spacing={14} sx={{justifyContent: 'center', marginBottom: '40px'}}>

					<Card sx={{width: '40%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
						<CardHeader
							title="Top Artists"
							subheader="Top 10 of the Past 30 Days"
						/>
						<Divider></Divider>
						<CardContent>
							<Stack direction={'column'} divider={<Divider/>}>
								{topArtists.map((topArtist, index) => (
									<Stack key={`${topArtist.name}Row`} direction={'row'}
												 sx={{width: '100%', height: '80px', alignItems: 'center'}}>
										<b>#{index + 1}</b>
										<CardMedia
											key={`${topArtist.name}Image`}
											component="img"
											style={{
												height: '60px',
												width: '60px',
												objectFit: 'cover',
												marginLeft: '10px',
												marginRight: '5px',
												borderRadius: '10%'
											}}
											image={topArtist.images[0].url}
										/>
										<b key={topArtist.name}>{topArtist.name}</b>

									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>


					<Card sx={{width: '40%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
						<CardHeader
							title="Top Songs"
							subheader="Top 10 of the Past 30 Days"
						/>
						<Divider></Divider>
						<CardContent>
							<Stack direction={'column'} divider={<Divider/>}>
								{topSongs.map((topSong, index) => (
									<Stack key={`${topSong.name}Row`} direction={'row'}
												 sx={{width: '100%', height: '80px', alignItems: 'center'}}>
										<b>#{index + 1}</b>
										<CardMedia
											key={`${topSong.name}Image`}
											component="img"
											style={{
												height: '60px',
												width: '60px',
												objectFit: 'cover',
												marginLeft: '10px',
												marginRight: '5px',
												borderRadius: '10%'
											}}
											image={topSong.album.images[0].url}
											alt="Paella dish"
										/>
										<b key={topSong.name}>{topSong.name}</b>

									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Stack>
			</Container>
		</main>
	);
}

export default Home;