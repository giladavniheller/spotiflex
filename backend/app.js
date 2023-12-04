const express = require('express'); 
var cors = require('cors');
const { spotifyMgr } = require('./spotifyHelpers/SpotifyManager');

const app = express(); 
const PORT = 5000; 

app.use(cors()); // enalbe ALL origins

app.get('/', (req, res)=>{ 
	res.status(200); 
	res.send("Welcome to root URL of Server"); 
}); 

app.get('/authorization', (req, res) => {
  console.log('GET /authorization');
  const url = spotifyMgr.getUserAuthURL();
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  console.log('GET /callback');
  const code = req?.query?.code;
  const token = spotifyMgr.getUserAccessToken(code);

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

