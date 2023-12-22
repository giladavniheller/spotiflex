import * as React from 'react';
import { Fragment, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Button, Card, CardContent, CardHeader, CardMedia, Divider, TablePagination, useTheme } from "@mui/material";
import { getAllLikedSongs } from "../helpers/spotifyHelpers";
import { hsvaToHex, hsvaToRgba, Wheel } from "@uiw/react-color";
import ColorThief from '../../node_modules/colorthief/dist/color-thief.mjs'


const ColorPicker = () => {
	const theme = useTheme();
	const [hsva, setHsva] = useState({h: 141, s: 86, v: 84, a: 1});

	// Pagination for each column
	const [pageAllSongs, setPageAllSongs] = useState(0);
	const [pageColor, setPageColor] = useState(0);
	const [pagePlaylist, setPagePlaylist] = useState(0);

	const [rowsPerPageAllSongs, setRowsPerPageAllSongs] = React.useState(10);
	const [rowsPerPageColor, setRowsPerPageColor] = React.useState(10);
	const [rowsPerPagePlaylist, setRowsPerPagePlaylist] = React.useState(10);

	const handleChangePageAllSongs = (event, newPage) => {
		setPageAllSongs(newPage);
	};
	const handleChangePageColor = (event, newPage) => {
		setPageColor(newPage);
	};

	const handleChangeRowsPerPageAllSongs = (event) => {
		setRowsPerPageAllSongs(parseInt(event.target.value, 10));
		setPageAllSongs(0);
	};
	const handleChangeRowsPerPageColor = (event) => {
		setRowsPerPageColor(parseInt(event.target.value, 10));
		setPageColor(0);
	};

	// TODO: might be nice to add a recommended colors area, where I can categorize them into palettes (only include ones with more than X songs in it)

	const [isGeneratingAlbumCovers, setIsGeneratingAlbumCovers] = useState(false);
	const [currentAlbumUrl, setCurrentAlbumUrl] = useState('');
	const [albumColors, setAlbumColors] = useState({});
	const [allLikedSongs, setAllLikedSongs] = useState([]);
	const [colorApplicableSongs, setColorApplicableSongs] = useState([]);
	const [playlistSongs, setPlaylistSongs] = useState([]);

	const access_token = localStorage.getItem('access_token');
	if (!access_token) {
		console.log('No access token found in local storage, need to log in!');
		window.location.href = 'http://localhost:3000/login';
		// TODO: might be good to make a common function that clears any cached data and navigates you to the log-in page.
	}

	useEffect(() => {
		console.log('in a useEffect...');
		if (access_token !== '') {
			if (localStorage.getItem('album_colors')) {
				setAlbumColors(JSON.parse(localStorage.getItem('album_colors')));
			}
		}
	}, []);

	useEffect(() => {
		console.log('in the useEffect');
		if (access_token !== '') {
			if (localStorage.getItem('allSongs')) {
				console.log('Found liked songs in local storage!')
				setAllLikedSongs(JSON.parse(localStorage.getItem('allSongs')));
			} else {
				try {
					console.log('Could not find liked songs in local storage, calling API!')
					getAllLikedSongs(access_token).then(response => {
						setAllLikedSongs(response.data);
						localStorage.setItem('allSongs', JSON.stringify(response.data));
						console.log(response.data)
					});
				} catch (err) {
					console.log(`uh oh, received error ${err}`)
				}
			}
		}
	}, []);


	return (
		<main>
			<Stack
				direction={'column'}
				sx={{
					bgcolor: 'background.paper',
					pt: 4,
					pb: 6,
					alignItems: 'center'
				}}
			>
				<Container>
					<Stack direction={'row'} spacing={5}>
						<div style={{padding: '20px', border: '1px solid black', borderRadius: '10%'}}>
							<Fragment>
								<Wheel color={hsva} onChange={(color) => setHsva({...hsva, ...color.hsva})}/>
								<Box sx={{
									width: '100%',
									justifyContent: 'center',
									alignItems: 'center',
									display: 'flex',
									height: '30px',
									marginTop: '15px',
									background: hsvaToHex(hsva)
								}}>
									<Typography>{hsvaToHex(hsva)} —
										({hsvaToRgba(hsva).r},{hsvaToRgba(hsva).g},{hsvaToRgba(hsva).b})</Typography>
								</Box>
							</Fragment>
						</div>
						<Stack direction={'column'}>
							<Typography
								sx={{fontSize: '50px', marginBottom: '0px'}}
								align="center"
								color="text.primary"
								gutterBottom
							>
								Color Tool
							</Typography>
							<Typography variant="h5" align="center" color="text.secondary" paragraph>
								Welcome to the Color Tool. Please select a color and precision index to filter
								your liked songs by the primary color(s) of their album covers.
							</Typography>
						</Stack>

						{isGeneratingAlbumCovers && <div style={{padding: '20px'}}>
							<img src={currentAlbumUrl} alt='current album' width='100px' height='100px' id='album_cover'
									 crossOrigin='anonymous'/>
						</div>}

					</Stack>
				</Container>
				<Button
					sx={{
						backgroundColor: hsvaToHex(hsva),
						border: '1.5px solid black',
						'&:hover': {
							backgroundColor: 'white'
						},
						width: '15vw',
						minWidth: '220px',
						marginTop: '5vh', marginBottom: '5vh'
					}}
					onClick={async () => {

						if (localStorage.getItem('album_colors')) {
							console.log('Album colors are already found, ready to generate playlist!!!!');
							// Album cover information already exists
							const rgb = hsvaToRgba(hsva);
							const requestedColor = [rgb.r, rgb.g, rgb.b];
							const threshold = 70;
							console.log(requestedColor);
							let likedSongsCopy = [...allLikedSongs];
							console.log(likedSongsCopy);
							console.log(albumColors);
							console.log(`albumColors[1st song]: ${albumColors["7DH0auN5IxIWaqFj4SL98o"]}`);

							const filteredSongs = likedSongsCopy.filter(song => {
								if (albumColors[song.albumId]) {
									const albumColor = albumColors[song.albumId];
									// TODO: explore using normal distance formula here instead
									return Math.abs(albumColor[0] - requestedColor[0]) <= threshold &&
										Math.abs(albumColor[1] - requestedColor[1]) <= threshold &&
										Math.abs(albumColor[2] - requestedColor[2]) <= threshold
								} else {
									return false;
								}
							})
							console.log(filteredSongs);

							setColorApplicableSongs(filteredSongs);
						} else {
							console.log('Need to prep the album colors...');
							setIsGeneratingAlbumCovers(true);

							const albumToColor = {};
							const colorThief = new ColorThief();
							let intermediateTimeMs = 100;
							let successesWithoutFailures = 0;
							let likedSongsCopy = [...allLikedSongs];

							for (const song of likedSongsCopy) {
								if (!albumToColor.hasOwnProperty(song.albumId)) {
									// Display the image
									setCurrentAlbumUrl(song.url);
									await new Promise(resolve => setTimeout(resolve, intermediateTimeMs));

									// Use color thief
									let colorPalette
									try {
										const albumImage = document.getElementById('album_cover');
										colorPalette = await colorThief.getColor(albumImage, 1);
										successesWithoutFailures += 1;

										// If you have succeeded ten times in a row, it's probably safe to lower the amount of time between songs
										if (successesWithoutFailures > 5) {
											intermediateTimeMs = Math.max(intermediateTimeMs - 10, 0);
											successesWithoutFailures = 0;
										}
									} catch (err) {
										try {
											// TODO: dynamically change the timeout based on the number of success/failures
											await new Promise(resolve => setTimeout(resolve, intermediateTimeMs));
											const albumImage = document.getElementById('album_cover');
											colorPalette = await colorThief.getColor(albumImage, 1);

											// Needed to wait extra, increase back up by 10
											intermediateTimeMs += 10;
											successesWithoutFailures = 0;
										} catch (err) {
											intermediateTimeMs += 5;
											successesWithoutFailures = 0;
											// TODO: need to do something so I'm not losing these albums
											console.log(`couldn't seem to get the album cover for track ${song.track}, adding it to the back of the list`);
											// likedSongsCopy.push(song);
										}
									}

									// Save result
									if (colorPalette) {
										albumToColor[song.albumId] = colorPalette;
									}
								}
							}

							console.log(`done with album cover colors!!`);
							localStorage.setItem('album_colors', JSON.stringify(albumToColor));
							setAlbumColors(albumToColor);
						}
					}}
				>
					<b style={{color: 'black'}}>{localStorage.getItem('album_colors') ? 'Generate' : 'Initialize Colors'}</b>
				</Button>


				<Container
					sx={{alignItems: 'center', paddingRight: '0px', paddingLeft: '0px', marginRight: '0px', marginLeft: '0px'}}>
					<Stack direction={'row'} spacing={6} sx={{justifyContent: 'center'}}>

						<Card sx={{minWidth: '420px', width: '50%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
							<CardHeader
								title="All Liked Songs" // TODO: maybe add a search feature here
								subheader="All Time"
							/>
							<Divider></Divider>
							<CardContent>
								<Stack direction={'column'} divider={<Divider/>}>
									{allLikedSongs.slice(pageAllSongs * rowsPerPageAllSongs, pageAllSongs * rowsPerPageAllSongs + rowsPerPageAllSongs).map((song, index) => (
										<Stack key={`${song.id}${song.albumId}Row`} direction={'row'}
													 sx={{width: '100%', height: '80px', alignItems: 'center'}}>
											<b key={`${song.id}${song.albumId}Number`}>#{pageAllSongs * rowsPerPageAllSongs + index + 1}</b>
											<CardMedia
												key={`${song.id}${song.albumId}Image`}
												component="img"
												style={{
													height: '60px',
													width: '60px',
													objectFit: 'cover',
													marginLeft: '10px',
													marginRight: '5px',
													borderRadius: '10%'
												}}
												image={song.url}
												alt="album cover image"
											/>
											<b key={`${song.id}${song.albumId}Title`}>{song.track}</b>

										</Stack>
									))}
								</Stack>
							</CardContent>
							<TablePagination
								sx={{paddingLeft: '0px', marginLeft: '0px', transform: 'scale(0.9)'}}
								showFirstButton={false}
								component="div"
								count={allLikedSongs.length}
								page={pageAllSongs}
								onPageChange={handleChangePageAllSongs}
								rowsPerPage={rowsPerPageAllSongs}
								onRowsPerPageChange={handleChangeRowsPerPageAllSongs}
							/>
						</Card>


						<Card sx={{minWidth: '420px', width: '50%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
							<CardHeader
								title="Color Applicable Songs"
								subheader="Intensity Factor: 0.5" // TODO: set up a slider for precision, change wording
							/>
							<Divider></Divider>
							<CardContent>
								<Stack direction={'column'} divider={<Divider/>}>
									{colorApplicableSongs.slice(pageColor * rowsPerPageColor, pageColor * rowsPerPageColor + rowsPerPageColor).map((song, index) => (
										<Stack key={`${song.id}${song.albumId}Row`} direction={'row'}
													 sx={{width: '100%', height: '80px', alignItems: 'center'}}>
											<b key={`${song.id}${song.albumId}Number`}>#{pageColor * rowsPerPageColor + index + 1}</b>
											<CardMedia
												key={`${song.id}${song.albumId}Image`}
												component="img"
												style={{
													height: '60px',
													width: '60px',
													objectFit: 'cover',
													marginLeft: '10px',
													marginRight: '5px',
													borderRadius: '10%'
												}}
												image={song.url}
												alt="album cover image"
											/>
											<b key={`${song.id}${song.albumId}Title`}>{song.track}</b>

										</Stack>
									))}
								</Stack>
							</CardContent>
							<TablePagination
								sx={{paddingLeft: '0px', marginLeft: '0px', transform: 'scale(0.9)'}}
								showFirstButton={false}
								component="div"
								count={colorApplicableSongs.length}
								page={pageColor}
								onPageChange={handleChangePageColor}
								rowsPerPage={rowsPerPageColor}
								onRowsPerPageChange={handleChangeRowsPerPageColor}
							/>
						</Card>

						<Card sx={{minWidth: '420px', width: '50%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
							<CardHeader
								title="New Playlist" // TODO: make this editable
								subheader="For Color #123456" // TODO: set up a color picker
							/>
							<Divider></Divider>
							<CardContent>
								<Stack direction={'column'} divider={<Divider/>}>

								</Stack>
							</CardContent>
						</Card>
					</Stack>
				</Container>
			</Stack>
		</main>
	);
}

export default ColorPicker;