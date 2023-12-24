import * as React from 'react';
import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import StarsIcon from '@mui/icons-material/Stars';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardMedia,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Divider,
	IconButton,
	TablePagination,
	TextField,
	Tooltip,
	useTheme
} from "@mui/material";
import { createNewPlaylist, getAllLikedSongs } from "../helpers/spotifyHelpers";
import { hsvaToHex, hsvaToRgba, Wheel } from "@uiw/react-color";
import ColorThief from '../../node_modules/colorthief/dist/color-thief.mjs'
import VerticalStepper from "../components/VerticalStepper";

const SongRow = ({
									 song,
									 index,
									 page,
									 rowsPerPage,
									 playlistSongIds,
									 addOrRemoveSongToPlaylist,
									 isPlaylistSection = false
								 }) => {
	const theme = useTheme();
	return (
		<Stack key={`${song.id}${song.albumId}Row`} direction={'row'}
					 sx={{
						 width: '100%', height: '80px', alignItems: 'center', justifyContent: 'spaceBetween',
						 backgroundColor: !isPlaylistSection && playlistSongIds.includes(song.id) ? 'rgba(0, 0, 0, 0.06)' : 'transparent',
					 }}
		>

			<Stack key={`${song.id}${song.albumId}InnerRow`} direction={'row'}
						 sx={{width: '100%', height: '80px', alignItems: 'center'}}>
				<b
					key={`${song.id}${song.albumId}Number`}>#{page * rowsPerPage + index + 1}</b> {/* TODO: make the numbers aligned regardless of the number of digits */}
				<CardMedia
					key={`${song.id}${song.albumId}Image`}
					component="img"
					style={{
						height: '60px',
						width: '60px',
						objectFit: 'cover',
						marginLeft: '10px',
						marginRight: '5px',
						borderRadius: '10%',
						border: '1px solid rgba(0,0,0,0.1)'
					}}
					image={song.url}
					alt="album cover image"
				/>
				<Stack direction={'column'}>
					<b style={{fontSize: '16px'}}
						 key={`${song.id}${song.albumId}Title`}>{song.track}</b> {/* TODO: add something that makes the title trail off after a certain length "Mystery of Love (From the..." */}
					<Typography sx={{fontSize: '13px', margin: '0px', color: theme.palette.primary.grey}}
											key={`${song.id}${song.albumId}Artist`}
					>
						<span style={{fontWeight: 'bold'}}>{song.artists.join(' & ')}</span>, {song.albumName}
					</Typography>
				</Stack>
			</Stack>

			<Tooltip title={isPlaylistSection ? 'Remove song from playlist' : 'Add song to playlist'}>
				<IconButton onClick={() => {
					addOrRemoveSongToPlaylist(song);
				}}>
					{isPlaylistSection ?
						<RemoveCircleIcon sx={{
							color: theme.palette.primary.red,
							width: '30px',
							height: '30px'
						}}/> :
						<AddCircleIcon sx={{
							color: playlistSongIds.includes(song.id) ? theme.palette.primary.grey : theme.palette.primary.darkGreen,
							width: '30px',
							height: '30px'
						}}/>
					}
				</IconButton>
			</Tooltip>
		</Stack>
	)
}

const ColorPicker = () => {
	const theme = useTheme();
	const [openConfirmationDialogue, setOpenConfirmationDialogue] = React.useState(false);
	const [hsva, setHsva] = useState({h: 141, s: 86, v: 84, a: 1});

	// Pagination for each column
	const [pageAllSongs, setPageAllSongs] = useState(0);
	const [pageColor, setPageColor] = useState(0);
	const [pagePlaylist, setPagePlaylist] = useState(0);

	const [rowsPerPageAllSongs, setRowsPerPageAllSongs] = React.useState(10);
	const [rowsPerPageColor, setRowsPerPageColor] = React.useState(10);
	const [rowsPerPagePlaylist, setRowsPerPagePlaylist] = React.useState(10);

	// TODO: abstract these
	const handleChangePageAllSongs = (event, newPage) => {
		setPageAllSongs(newPage);
	};
	const handleChangePageColor = (event, newPage) => {
		setPageColor(newPage);
	};
	const handleChangePagePlaylist = (event, newPage) => {
		setPagePlaylist(newPage);
	};

	const handleChangeRowsPerPageAllSongs = (event) => {
		setRowsPerPageAllSongs(parseInt(event.target.value, 10));
		setPageAllSongs(0);
	};
	const handleChangeRowsPerPageColor = (event) => {
		setRowsPerPageColor(parseInt(event.target.value, 10));
		setPageColor(0);
	};
	const handleChangeRowsPerPagePlaylist = (event) => {
		setRowsPerPagePlaylist(parseInt(event.target.value, 10));
		setPagePlaylist(0);
	};

	const addSongToPlaylist = (song) => {
		const currentPlaylist = [...playlistSongs];
		currentPlaylist.push(song);
		setPlaylistSongs(currentPlaylist);
	}

	const addSongsToPlaylist = (songs) => {
		const currentPlaylist = [...playlistSongs];
		songs.forEach((song) => {
			if (!currentPlaylist.map((songInPlaylist) => songInPlaylist.id).includes(song.id)) {
				currentPlaylist.push(song);
			}
		})
		setPlaylistSongs(currentPlaylist);
	}

	const removeSongFromPlaylist = (songToRemove) => {
		let currentPlaylist = [...playlistSongs];
		console.log(`currentPlaylist=${JSON.stringify(currentPlaylist)}`);
		console.log(`song to remove: ${JSON.stringify(songToRemove)}`);
		currentPlaylist = currentPlaylist.filter((song) => song.id !== songToRemove.id);
		setPlaylistSongs(currentPlaylist);
	}

	// TODO: might be nice to add a recommended colors area, where I can categorize them into palettes (only include ones with more than X songs in it)

	const [isGeneratingAlbumCovers, setIsGeneratingAlbumCovers] = useState(false);
	const [currentAlbumUrl, setCurrentAlbumUrl] = useState('');
	const [albumColors, setAlbumColors] = useState({});
	const [allLikedSongs, setAllLikedSongs] = useState([]);
	const [colorApplicableSongs, setColorApplicableSongs] = useState([]);
	const [playlistSongs, setPlaylistSongs] = useState([]);
	const [playlistName, setPlaylistName] = useState('New Playlist');

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

	const instructions = [
		{
			label: 'Wait for Your Spotify Data',
			description: `The very first time you use this tool you may need to wait a minute or two for  
			the application to fetch data from Spotify, especially if you have more than a few thousand saved songs.`,
		},
		{
			label: 'Initialize Colors',
			description:
				'Once data appears under the \'All Liked Songs\' column, you may press the \'INITIALIZE COLORS\' button. ' +
				'Flashing images of albums will appear as the application generates color profiles for each album cover. ' +
				'Again, please be patient as this process may take a minute or two if you have many saved songs.',
		},
		{
			label: 'Create Playlists',
			description: `When the application has finished developing color profiles for your albums, the \'INITIALIZE COLORS\'
			button will change to \'GENERATE\', indicating you are free to begin creating new playlists!`,
		},
	];


	return (
		<Container sx={{justifyContent: 'center'}}>
			<Stack direction={'row'} sx={{alignItems: 'center', width: '100%'}} spacing={15}>
				<Stack direction={'column'} sx={{}}>
					<Typography
						sx={{fontSize: '50px', marginBottom: '0px'}}

						color="text.primary"
						gutterBottom
					>
						Color Tool
					</Typography>
					<Typography sx={{fontSize: '20px', marginBottom: '0px'}} color="text.secondary"
											paragraph>
						Welcome to the Color Tool. Please select a color and precision index to filter
						your liked songs by the primary color(s) of their album covers.
					</Typography>
				</Stack>
				<Stack
					direction={'column'}
					sx={{
						padding: '10px',
						height: '290px',
						// width: '350px',
						borderRadius: '10%',

						alignItems: 'center',
						marginTop: '15px'
					}}>
					<Wheel style={{marginTop: '15px'}} color={hsva} onChange={(color) => setHsva({...hsva, ...color.hsva})}/>
					<Box sx={{
						width: '100%',
						justifyContent: 'center',
						alignItems: 'center',
						display: 'flex',
						height: '39px',
						borderRadius: '7%',
						marginTop: '15px',
						background: hsvaToHex(hsva)
					}}>
						{/*<Typography>{hsvaToHex(hsva)} —*/}
						{/*	({hsvaToRgba(hsva).r},{hsvaToRgba(hsva).g},{hsvaToRgba(hsva).b})</Typography>*/}
						<Button
							sx={{
								backgroundColor: 'transparent',
								width: '100%',
								border: '1.5px solid black',
								'&:hover': {
									backgroundColor: 'white'
								},
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
											// const rDiffSquared = (albumColor[0] - requestedColor[0]) * (albumColor[0] - requestedColor[0]);
											// const gDiffSquared = (albumColor[1] - requestedColor[1]) * (albumColor[1] - requestedColor[1]);
											// const bDiffSquared = (albumColor[2] - requestedColor[2]) * (albumColor[2] - requestedColor[2]);
											// return Math.sqrt(rDiffSquared + gDiffSquared + bDiffSquared) <= threshold;
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
												colorPalette = await colorThief.getColor(albumImage, 1); // TODO: investigate if getPalette is slower, might be more accurate to check top three colors...
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
													intermediateTimeMs += 5; // TODO: need to fix this
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
							<b
								style={{color: 'black'}}>{localStorage.getItem('album_colors') ? 'Generate' : 'Initialize Colors'}</b>
						</Button>
					</Box>
				</Stack>
				<VerticalStepper steps={instructions} width={'350px'}/>
			</Stack>

			<Stack
				direction={'column'}
				sx={{
					pt: 4,
					pb: 6,
					alignItems: 'center'
				}}
			>
				<Container>
					<Stack direction={'row'} spacing={5}>
						{isGeneratingAlbumCovers && <div style={{padding: '20px'}}>
							<img src={currentAlbumUrl} alt='current album' width='100px' height='100px' id='album_cover'
									 crossOrigin='anonymous'/>
						</div>}

					</Stack>
				</Container>
				<Container
					sx={{alignItems: 'center', paddingRight: '0px', paddingLeft: '0px', marginRight: '0px', marginLeft: '0px'}}>
					<Stack direction={'row'} spacing={6} sx={{justifyContent: 'center', alignItems: 'baseline'}}>

						<Card sx={{minWidth: '420px', width: '50%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
							<CardHeader
								title="All Liked Songs" // TODO: maybe add a search feature here
								subheader="All Time"
							/>
							<Divider></Divider>
							<CardContent>
								<Stack direction={'column'} divider={<Divider/>}>
									{allLikedSongs.slice(pageAllSongs * rowsPerPageAllSongs, pageAllSongs * rowsPerPageAllSongs + rowsPerPageAllSongs).map((song, index) => (
										<SongRow song={song} index={index} page={pageAllSongs} rowsPerPage={rowsPerPageAllSongs}
														 playlistSongIds={playlistSongs.map(song => song.id)}
														 addOrRemoveSongToPlaylist={addSongToPlaylist}/>
									))}
								</Stack>
							</CardContent>
							<TablePagination
								sx={{
									paddingLeft: '0px', marginLeft: '0px', transform: 'scale(0.9)',
								}}
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
								action={
									<Tooltip title={'Add ALL color applicable songs to playlist'}>
										<IconButton
											disabled={colorApplicableSongs.length === 0 || colorApplicableSongs.every(applicableSong => playlistSongs.map((playlistSong) => playlistSong.id).includes(applicableSong.id))}
											onClick={() => {
												addSongsToPlaylist(colorApplicableSongs)
											}}
										>
											<AddCircleIcon sx={{
												color: colorApplicableSongs.length === 0 || colorApplicableSongs.every(applicableSong => playlistSongs.map((playlistSong) => playlistSong.id).includes(applicableSong.id)) ? theme.palette.primary.grey : theme.palette.primary.darkGreen,
												width: '50px',
												height: '50px'
											}}/>
										</IconButton>
									</Tooltip>
								}
								title="Color Applicable Songs"
								subheader="Intensity Factor: 0.5" // TODO: set up a slider for precision, change wording
							/>
							<Divider></Divider>
							<CardContent>
								<Stack direction={'column'} divider={<Divider/>}>
									{colorApplicableSongs.slice(pageColor * rowsPerPageColor, pageColor * rowsPerPageColor + rowsPerPageColor).map((song, index) => (
										<SongRow song={song} index={index} page={pageColor} rowsPerPage={rowsPerPageColor}
														 playlistSongIds={playlistSongs.map(song => song.id)}
														 addOrRemoveSongToPlaylist={addSongToPlaylist}/>
									))}
								</Stack>
							</CardContent>
							<TablePagination
								sx={{
									paddingLeft: '0px', marginLeft: '0px', transform: 'scale(0.9)' //TODO: make this look nicer
								}}
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
								title={
									<TextField
										label={''}
										value={playlistName}
										onChange={(event) => setPlaylistName(event.target.value)}
										variant={'standard'}
										InputProps={{
											sx: {padding: '0px'},
											style: {fontSize: '1.5rem', paddingTop: '0px'},
										}}
										inputProps={{
											style: {padding: '0px'}
										}}
									/>
								}
								action={
									<Stack direction={'row'}>
										<Tooltip title={'Create new playlist!!!'}>
											<IconButton disabled={playlistSongs.length === 0}
																	onClick={async () => {
																		console.log(`make new playlist: ${playlistName} with access token ${access_token}`);
																		console.log(`songuris = ${playlistSongs.map((song) => song.uri)}`)
																		setOpenConfirmationDialogue(true);
																	}}
											>
												<StarsIcon sx={{
													color: playlistSongs.length === 0 ? theme.palette.primary.grey : theme.palette.primary.main,
													width: '50px',
													height: '50px'
												}}/>
											</IconButton>
										</Tooltip>
										<Tooltip title={'Remove ALL songs from playlist'}>
											<IconButton disabled={playlistSongs.length === 0}
																	onClick={() => {
																		setPlaylistSongs([]);
																	}}
											>
												<RemoveCircleIcon sx={{
													color: playlistSongs.length === 0 ? theme.palette.primary.grey : theme.palette.primary.red,
													width: '50px',
													height: '50px'
												}}/>
											</IconButton>
										</Tooltip>
									</Stack>

								}
								subheader={`Choose playlist name`} // TODO: maybe use a library to identify a color name for the hex, low priority
							/>
							<Divider></Divider>
							<CardContent>
								<Stack direction={'column'} divider={<Divider/>}>
									{playlistSongs.slice(pagePlaylist * rowsPerPagePlaylist, pagePlaylist * rowsPerPagePlaylist + rowsPerPagePlaylist).map((song, index) => (
										<SongRow song={song} index={index} page={pagePlaylist} rowsPerPage={rowsPerPagePlaylist}
														 playlistSongIds={playlistSongs.map(song => song.id)}
														 isPlaylistSection={true}
														 addOrRemoveSongToPlaylist={removeSongFromPlaylist}/>
									))}
								</Stack>
							</CardContent>
							<TablePagination
								sx={{paddingLeft: '0px', marginLeft: '0px', transform: 'scale(0.9)'}}
								showFirstButton={false}
								component="div"
								count={playlistSongs.length}
								page={pagePlaylist}
								onPageChange={handleChangePagePlaylist}
								rowsPerPage={rowsPerPagePlaylist}
								onRowsPerPageChange={handleChangeRowsPerPagePlaylist}
							/>
						</Card>
					</Stack>
				</Container>
			</Stack>
			<Dialog
				open={openConfirmationDialogue}
				onClose={() => setOpenConfirmationDialogue(false)}
			>
				<DialogTitle id="confirmation-dialogue">
					Create New Playlist <span
					style={{
						fontWeight: 'bold',
					}}>{playlistName}</span>?
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="confirmation-dialog-description">
						Let SpotiFlex create a new public playlist on your Spotify profile? This playlist will contain
						the songs you have selected in the new playlist column. You may have to restart Spotify to see
						your new playlist.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{alignItems: 'center'}}>
					<Button sx={{
						backgroundColor: 'transparent', color: theme.palette.primary.red, fontWeight: 'bold',
						border: `1.5px solid ${theme.palette.primary.red}`,
						'&:hover': {
							backgroundColor: 'white'
						}
					}} onClick={() => setOpenConfirmationDialogue(false)}>Cancel</Button>
					<Button sx={{
						backgroundColor: 'transparent', color: theme.palette.primary.main, fontWeight: 'bold',
						border: `1.5px solid ${theme.palette.primary.main}`,
						'&:hover': {
							backgroundColor: 'white'
						}
					}} onClick={async () => {
						const response = await createNewPlaylist(access_token, playlistName, playlistSongs.map((song) => song.uri));
						setOpenConfirmationDialogue(false);
					}} autoFocus>
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default ColorPicker;