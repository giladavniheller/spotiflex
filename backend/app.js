const express = require('express'); 
var cors = require('cors');
const { spotifyMgr } = require('./spotifyHelpers/SpotifyManager');

const app = express(); 
const PORT = 5000; 

app.use(cors()); // enalbe ALL origins

app.get('/', (req, res)=>{ 
  console.log('GET /');
	res.status(200); 
	res.send("Welcome to root URL of Server"); 
}); 

app.get('/authorization', (req, res) => {
  console.log('GET /authorization');
  const url = spotifyMgr.getUserAuthURL();
  console.log(url);
  res.json({ url }).status(200);
});

app.get('/login', async (req, res) => {
  console.log('GET /login');
  const code = req?.query?.code;
  console.log('code', code);
  const token = await spotifyMgr.getUserAccessToken(code);
  console.log('token', token.body);
  // TODO: verify code
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

