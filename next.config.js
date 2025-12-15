/** @type {import('next').NextConfig} */

const path = require("path");

module.exports = {
  async rewrites() {
    return [
      {
        source: "/devolucion",
        destination: "/devolucion/Devolucion",
      },
      {
        source: "/cuponera",
        destination: "/cuponera/Cuponera",
      },
      {
        source: "/cambioBoleto",
        destination: "/ticket-change/CambioBoleto",
      },
      {
        source: "/viajesEspeciales",
        destination: "/viajes-especiales/viajes-especiales",
      },
      {
        source: "/confirmacionBoleto",
        destination: "/ticket-confirmation/ConfirmacionBoleto",
      },
      {
        source: "/teAyudamos",
        destination: "/te-ayudamos/TeAyudamos",
      },
    ];
  },
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, "scss")],
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  env: {
    PROJECT_DIRNAME: __dirname,
    site_url: "https://boletos-com.netlify.app/",
  },
  publicRuntimeConfig: {
    site_url: "https://boletos-com.netlify.app/",
    site_url_local: "http://localhost:3000",
  },
  // serverRuntimeConfig: {
  //   site_url: "https://boletosparaguay.com",
  //   service_url: process.env.NODE_ENV == "production"?"https://apipasajes.pullman.cl/integracion-comercio-web/rest":"https://apipasajes.pullman.cl/integracion-comercio-web/rest",
  //   service_password: process.env.NODE_ENV == "production"?"":"INT0000002",
  //   clave: process.env.NODE_ENV == "production"?"":"xWL!96JRaWi2lT0jG"
  // },
  serverRuntimeConfig: {
    site_url: "https://boletos-com.netlify.app",
    service_url: "",
    url_api: "https://boletos-com.dev-wit.com/api",
    service_password: process.env.NODE_ENV == "production" ? "" : "INT0000002",
    clave: process.env.NODE_ENV == "production" ? "" : "xWL!96JRaWi2lT0jG",
  },
};
