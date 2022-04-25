module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '68381ff8bed19cfb2f4598c38afc1720'),
  },
});
