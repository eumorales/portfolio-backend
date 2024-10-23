import axios from 'axios';

let accessToken = process.env.SPOTIFY_ACCESS_TOKEN;
let refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
let tokenExpiryTime = Date.now() + 3600 * 1000;

const refreshSpotifyToken = async () => {
  try {
    console.log('Iniciando a atualização do token do Spotify...');
    console.log('Variáveis de ambiente:');
    console.log('CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET);
    console.log('REFRESH_TOKEN:', refreshToken);

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

    if (response.status === 200) {
      accessToken = response.data.access_token;
      tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
      console.log('Novo token de acesso obtido:', accessToken);
    } else {
      console.log('Falha ao atualizar o token, status:', response.status);
      console.log('Detalhes da resposta:', response.data);
      throw new Error('Falha ao atualizar o token do Spotify');
    }
  } catch (error) {
    console.error('Erro ao atualizar o token do Spotify:', error.response?.data || error.message);
    throw new Error('Erro ao atualizar o token do Spotify');
  }
};

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (Date.now() >= tokenExpiryTime) {
      console.log('Token expirado, tentando renovar...');
      await refreshSpotifyToken();
    }

    console.log('Fazendo requisição para o Spotify...');
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/artists?limit=1&time_range=short_term',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const artist = response.data.items[0];
    if (!artist) {
      console.log('Nenhum artista encontrado na resposta do Spotify');
      return res.status(404).json({ error: 'Nenhum artista encontrado' });
    }

    const topArtist = artist.name;
    const artistUrl = artist.external_urls.spotify;

    res.status(200).json({ topArtist, artistUrl });
    console.log('Artista retornado:', topArtist);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('Token inválido ou expirado, tentando renovar...');
      await refreshSpotifyToken();
      return handler(req, res); 
    }

    console.error('Erro ao buscar o artista mais escutado:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Falha ao buscar o artista mais escutado' });
  }
}
