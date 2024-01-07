import { CardMedia, IconButton, Tooltip, useTheme } from "@mui/material";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

import * as React from "react";

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
					<b style={{
						fontSize: '16px',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						width: '240px'
					}}
						 key={`${song.id}${song.albumId}Title`}>{song.track}</b> {/* TODO: add a tooltip to display full title when truncated. Might be easier to manually use a function to truncate after a certain number of characters." */}
					<Typography
						sx={{
							fontSize: '13px', margin: '0px', color: theme.palette.primary.grey,
							whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '240px'
						}}
						key={`${song.id}${song.albumId}Artist`}
					>
						<span style={{fontWeight: 'bold'}}>{song.artists.join(' & ')}</span>, {song.albumName}
					</Typography>
				</Stack>
			</Stack>

			<Tooltip
				title={isPlaylistSection ? 'Remove song from playlist' : 'Add song to playlist'}>
				<IconButton
					onClick={() => {
						addOrRemoveSongToPlaylist(song)
					}}
					disabled={playlistSongIds.includes(song.id) && !isPlaylistSection}
				>
					{isPlaylistSection ?
						<RemoveCircleIcon sx={{
							color: theme.palette.primary.red,
							width: '30px',
							height: '30px'
						}}/> :
						<ArrowCircleRightIcon sx={{
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

export default SongRow;