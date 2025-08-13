import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

// export default async (req, res) => {
//     try {
//         const postData = req.body;
//         let token = await doLogin();
//         let data = await axios.post(config.service_url + `/usuarioPortal/obtenerTransaccionesUsuario`, postData, {
//             headers: {
//                 'Authorization': `Bearer ${token.token}`
//             }
//         })
//         res.status(200).json(data.data);
//     } catch(error){
//         console.log('ERROR::::', error)
//         res.status(400).json(error?.response.data);
//     }

// }

export default async (req, res) => {
  try {
    const { userId } = req.query;
    const data = await axios.get(`${config.url_api}/seats/paid-only-seats`, {
      params: { userId },
    });
    res.status(200).json(data.data);
  } catch (error) {
    console.log("ERROR::::", error);
    res.status(400).json(error?.response?.data || { message: "Error" });
  }
};
