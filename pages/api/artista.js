const getTopArtist = async (timeRange = 'short_term') => {
  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/top/artists',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          time_range: timeRange, 
          limit: 1,
        },
      }
    );

    console.log('Artista mais tocado:', response.data.items[0].name);
    return response.data.items[0];
  } catch (error) {
    console.error('Erro ao obter o artista mais tocado:', error.message);
    throw error;
  }
};
