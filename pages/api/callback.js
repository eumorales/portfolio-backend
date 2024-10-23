import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);

    res.status(200).json({ access_token, refresh_token });
  } catch (error) {
    console.error('Erro ao obter o token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Falha ao obter o token do Spotify' });
  }
}
