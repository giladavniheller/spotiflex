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
import SongRow from "../components/SongRow";
import { logOut } from "../helpers/generalHelpers";

// TODO: might be nice to add a recommended colors area, where I can categorize them into palettes (only include ones with more than X songs in it)
// TODO: might be nice to add a button that just makes a playlist with all of your songs sorted into a gradient
// TODO: might be nice to have an optional button for the playlist to sort them by artist

const ColorPicker = () => {
	const theme = useTheme();
	const [openConfirmationDialogue, setOpenConfirmationDialogue] = React.useState(false);
	const [hsva, setHsva] = useState({h: 141, s: 86, v: 84, a: 1});
	const [isGeneratingAlbumCovers, setIsGeneratingAlbumCovers] = useState(false);
	const [albumColors, setAlbumColors] = useState({});
	const [allLikedSongs, setAllLikedSongs] = useState([]);
	const [colorApplicableSongs, setColorApplicableSongs] = useState([]);
	const [playlistSongs, setPlaylistSongs] = useState([]);
	const [playlistName, setPlaylistName] = useState('New Playlist');

	// - - - - - - - - - - - - Pagination handling - - - - - - - - - - - - \\
	const [pageAllSongs, setPageAllSongs] = useState(0);
	const [pageColor, setPageColor] = useState(0);
	const [pagePlaylist, setPagePlaylist] = useState(0);
	const [rowsPerPageAllSongs, setRowsPerPageAllSongs] = React.useState(10);
	const [rowsPerPageColor, setRowsPerPageColor] = React.useState(10);
	const [rowsPerPagePlaylist, setRowsPerPagePlaylist] = React.useState(10);
	const handleChangePage = (setterFunction) => (event, newPage) => {
		setterFunction(newPage);
	}
	const handleChangeRowsPerPage = (setRowsPerPageFunction, setPageFunction) => (event) => {
		setRowsPerPageFunction(parseInt(event.target.value, 10));
		setPageFunction(0);
	}

	// - - - - - - - - - - - - Add/Remove Song handling - - - - - - - - - - - - \\
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
		currentPlaylist = currentPlaylist.filter((song) => song.id !== songToRemove.id);
		setPlaylistSongs(currentPlaylist);
	}

	// - - - - - - - - - - - - Color Profile Generation handling - - - - - - - - - - - - \\
	const [albumUrl0, setAlbumUrl0] = useState(''); // TODO: PLEASE see if this can be abstracted
	const [albumUrl1, setAlbumUrl1] = useState('');
	const [albumUrl2, setAlbumUrl2] = useState('');
	const [albumUrl3, setAlbumUrl3] = useState('');
	const [albumUrl4, setAlbumUrl4] = useState('');
	const [albumUrl5, setAlbumUrl5] = useState('');
	const [albumUrl6, setAlbumUrl6] = useState('');
	const [albumUrl7, setAlbumUrl7] = useState('');
	const [albumUrl8, setAlbumUrl8] = useState(''); // TODO: see if adding more album image tags makes it faster
	const albumUrls = [albumUrl0, albumUrl1, albumUrl2, albumUrl3, albumUrl4, albumUrl5, albumUrl6, albumUrl7, albumUrl8];
	const setAlbumUrl = (index, url) => {
		const setAlbumUrlFunctions = [setAlbumUrl0, setAlbumUrl1, setAlbumUrl2, setAlbumUrl3, setAlbumUrl4, setAlbumUrl5, setAlbumUrl6, setAlbumUrl7, setAlbumUrl8];
		const setFunc = setAlbumUrlFunctions[index];
		if (setFunc) {
			setFunc(url);
		}
	}

	// Attempt to retrieve access and refresh tokens from local storage, completely log out if not found
	const access_token = localStorage.getItem('access_token');
	const refresh_token = localStorage.getItem('refresh_token');
	if (!access_token || !refresh_token) {
		logOut();
	}

	useEffect(() => {
		if (access_token !== '') {
			if (localStorage.getItem('album_colors')) {
				console.log('found album colors')
				setAlbumColors(JSON.parse(localStorage.getItem('album_colors')));
			}
		}
	}, []);

	useEffect(() => {
		if (access_token !== '' && refresh_token !== '') {
			if (localStorage.getItem('allSongs')) {
				console.log('Found liked songs in local storage!')
				setAllLikedSongs(JSON.parse(localStorage.getItem('allSongs')));
			} else {
				try {
					console.log('Could not find liked songs in local storage, calling API!')
					getAllLikedSongs(access_token, refresh_token).then(allLikedSongsResponse => {
						setAllLikedSongs(allLikedSongsResponse);
						localStorage.setItem('allSongs', JSON.stringify(allLikedSongsResponse));
						console.log(allLikedSongsResponse)
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

	const generateColorProfiles = async () => { // TODO: maybe have this automatically happen when you open the page...?
		setIsGeneratingAlbumCovers(true);
		await new Promise(resolve => setTimeout(resolve, 100));

		let likedSongsCopy = [...allLikedSongs];
		let uniqueAlbumIds = new Set();
		const albumToColor = {};

		// Filter the list of songs to have only one entry per albumId
		likedSongsCopy = likedSongsCopy.filter(song => {
			const isUnique = !uniqueAlbumIds.has(song.albumId);
			if (isUnique) uniqueAlbumIds.add(song.albumId);
			return isUnique;
		});
		console.log('successfully filtered items to be unique by album');

		const waitUntilImageLoaded = (image, expectedUrl) => {
			return new Promise(resolve => {
				if ((image?.complete ?? false) && image.src === expectedUrl) {
					resolve();
				} else {
					image.addEventListener('load', resolve);
				}
			});
		};

		const processBatch = async (batchIndex, batch) => {
			// Instantiate Color Thief
			const colorThief = new ColorThief();

			for (const song of batch) {
				if (!song.url) {
					continue;
				}
				setAlbumUrl(batchIndex, song.url);
				const albumCoverImage = document.getElementById(`album_cover_${batchIndex}`);
				await waitUntilImageLoaded(albumCoverImage, song.url);

				try {
					albumToColor[song.albumId] = await colorThief.getColor(albumCoverImage, 1);
				} catch (err) {
					console.log(`Batch ${batchIndex}: ran into error for ${song.track}: ${err}`);
				}
			}
		};

		const numberOfBatches = 9;
		const batchSize = Math.ceil(likedSongsCopy.length / numberOfBatches);
		const batches = Array.from({length: numberOfBatches}, (_, index) =>
			likedSongsCopy.slice(index * batchSize, (index + 1) * batchSize)
		);

		await Promise.all(batches.map((batch, batchIndex) => processBatch(batchIndex, batch)));

		setIsGeneratingAlbumCovers(false);
		setAlbumColors(albumToColor);
		localStorage.setItem('album_colors', JSON.stringify(albumToColor));

		// TODO: add an alert here that the color profiles are done generating
		console.log('ooh!');
		console.log(albumToColor);
	}


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
				{/*<VerticalStepper steps={instructions} width={'350px'}/>*/}
			</Stack>

			<Stack
				direction={'column'}
				sx={{
					pt: 4,
					pb: 6,
					alignItems: 'center'
				}}
			>
				{isGeneratingAlbumCovers && <Container>
					<Stack direction={'row'} spacing={5}>
						{albumUrls.map((url, index) => (
							<div key={index} style={{padding: '5px'}}>
								<img
									src={url}
									alt={`album-${index}`}
									width='60px'
									height='60px'
									id={`album_cover_${index}`}
									crossOrigin='anonymous'
								/>
							</div>
						))}
					</Stack>
				</Container>}
				<Container
					sx={{alignItems: 'center', paddingRight: '0px', paddingLeft: '0px', marginRight: '0px', marginLeft: '0px'}}>
					<Stack direction={'row'} spacing={6} sx={{justifyContent: 'center', alignItems: 'flex-start'}}>

						{/*<Card sx={{minWidth: '420px', width: '50%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>*/}
						{/*	<CardHeader*/}
						{/*		title="All Liked Songs" // TODO: maybe add a search feature here*/}
						{/*		subheader="All Time"*/}
						{/*	/>*/}
						{/*	<Divider></Divider>*/}
						{/*	<CardContent>*/}
						{/*		<Stack direction={'column'} divider={<Divider/>}>*/}
						{/*			{allLikedSongs.slice(pageAllSongs * rowsPerPageAllSongs, pageAllSongs * rowsPerPageAllSongs + rowsPerPageAllSongs).map((song, index) => (*/}
						{/*				<SongRow song={song} index={index} page={pageAllSongs} rowsPerPage={rowsPerPageAllSongs}*/}
						{/*								 playlistSongIds={playlistSongs.map(song => song.id)}*/}
						{/*								 addOrRemoveSongToPlaylist={addSongToPlaylist}/>*/}
						{/*			))}*/}
						{/*		</Stack>*/}
						{/*	</CardContent>*/}
						{/*	<TablePagination*/}
						{/*		sx={{*/}
						{/*			paddingLeft: '0px', marginLeft: '0px', transform: 'scale(0.9)',*/}
						{/*		}}*/}
						{/*		showFirstButton={false}*/}
						{/*		component="div"*/}
						{/*		count={allLikedSongs.length}*/}
						{/*		page={pageAllSongs}*/}
						{/*		onPageChange={handleChangePage(setPageAllSongs)}*/}
						{/*		rowsPerPage={rowsPerPageAllSongs}*/}
						{/*		onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPageAllSongs, setPageAllSongs)}*/}
						{/*	/>*/}
						{/*</Card>*/}


						<Card sx={{minWidth: '420px', width: '50%', boxShadow: '0 0 4px 4px rgba(0, 0, 0, 0.2)'}}>
							<CardHeader
								action={
									<Tooltip title={'Add all color applicable songs to playlist'}>
										<span>
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
										</span>
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
								onPageChange={handleChangePage(setPageColor)}
								rowsPerPage={rowsPerPageColor}
								onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPageColor, setPageColor)}
							/>
						</Card>

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
								<Button // TODO: don't let this button be pressed for initialize colors if allSongs still being fetched
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
											const threshold = 70; // TODO: see if I can make this dynamic based on how far from the center you are, ideally would be stronger threshold further from center, or maybe like a pie slice
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

											// setColorApplicableSongs(filteredSongs);
										} else {
											console.log('Need to prep the album colors...');
											await generateColorProfiles();
										}
									}}
								>
									<b
										style={{color: 'black'}}>{localStorage.getItem('album_colors') ? 'Generate' : 'Initialize Colors'}</b> {/* TODO: ensure that you can't initialize colors until the liked songs has been successfully retrieved */}
								</Button> {/* TODO: probably add a button to re-download the liked songs, this should also clear the album_colors from local storage to ensure that the color initialization must be re-done... unless you manage to keep it around to speed up the second initialization... as there's no need to redo already color-paletted albums*/}
							</Box>
						</Stack>

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
										<Tooltip
											title={'Create new playlist!!!'}> {/* TODO: add a success/failure banner on top so users know it was successfully created */}
											<span>
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
											</span>
										</Tooltip>
										<Tooltip title={'Remove ALL songs from playlist'}>
											<span>
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
											</span>
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
								onPageChange={handleChangePage(setPagePlaylist)}
								rowsPerPage={rowsPerPagePlaylist}
								onRowsPerPageChange={handleChangeRowsPerPage(setRowsPerPagePlaylist, setPagePlaylist)}
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
						// TODO: create an action thing here to say that it was successful
					}} autoFocus>
						Confirm
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

export default ColorPicker;