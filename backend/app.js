const express = require('express'); 
const SpotifyManager = require('./spotifyHelpers/SpotifyManager');

const app = express(); 
const PORT = 5000; 

app.get('/', (req, res)=>{ 
	res.status(200); 
	res.send("Welcome to root URL of Server"); 
}); 

app.get('/authorization', (req, res) => {
  const url = SpotifyManager.getUserAuthURL();
  req.redirect(url);
});

app.get('/callback', async (req, res) => {
  const code = req?.query?.code;
  const token = SpotifyManager.getUserAccessToken(code);

  res.redirect('/dashbaord');
});

app.get('/dashboard', (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, (error) => { 
  if (!error) {
    console.log("Server is Successfully Running, and App is listening on port "+ PORT) 
  }
  else {
    console.log("Error occurred, server can't start", error); 
  }
}); 

