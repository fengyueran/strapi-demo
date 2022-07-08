module.exports = ({ env }) => ({
  //https://github.com/ComfortablyCoding/strapi-plugin-io
  io: {
    enabled: true,
    config: {
      IOServerOptions: {
        cors: { origin: "http://localhost:3000", methods: ["GET"] },
      },
      contentTypes: {
        category: "*", //["create", "update"]
      },
      events: [
        {
          name: "connection",
          handler: ({ strapi }, socket) => {
            strapi.log.info(`[io] new connection with id ${socket.id}`);
          },
        },
      ],
    },
  },
});
