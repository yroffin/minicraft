module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'c47de01c3b065d64a4727b4cf3a96b3b'),
  },
});
