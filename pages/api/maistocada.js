import axios from 'axios';

let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
let tokenExpiryTime = Date.now() + 3600 * 1000;

const refreshSpotifyToken = async () => {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
  } catch (error) {
    console.error('Erro ao atualizar o token do Spotify:', error.response?.data || error.message);
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (Date.now() >= tokenExpiryTime) {
    await refreshSpotifyToken();
  }

  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/tracks?limit=1&time_range=short_term',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const track = response.data.items[0];
    const topTrack = track?.name || 'Nenhuma música encontrada';
    const trackUrl = track?.external_urls?.spotify || '#';

    res.status(200).json({ topTrack, trackUrl });
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshSpotifyToken();
      return handler(req, res);
    }

    console.error('Erro ao buscar a música mais tocada:', error.response?.data || error.message);
    res.status(500).json({ error: 'Falha ao buscar a música mais tocada' });
  }
}
