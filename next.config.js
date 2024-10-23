module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://gilbertomorales.com',
        permanent: true, 
      },
    ];
  },
};
