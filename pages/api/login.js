export default async function handler(req, res) {
  const scope = 'user-top-read';
  const redirectUri = process.env.REDIRECT_URI;
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(authUrl);
}
