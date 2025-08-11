import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
import { PassThrough } from "nodemailer/lib/xoauth2";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

// export default async (req, res) => {
//     try {
//         const postData = req.body;
//         let data = await axios.post(config.service_url + `/usuarioPortal/validarLogin`, postData)
//         res.status(200).json(data.data);
//     } catch(error){
//         if( error.response.data.status === false ) {
//             res.status(400).json({ status: false, message: 'Correo electrónico o contraseña incorrectos' })
//         } else {
//             res.status(500).json({ status: false, message: 'Error al obtener la información, intente mas tarde.'});
//         }
//     }
// }

export default async (req, res) => {
  try {
    const postData = req.body;
    let response = await axios.post(config.url_api + `/users/login/`, postData);
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response.status === 404 || error.response.status === 401) {
      res.status(400).json({
        status: false,
        message: "Correo electrónico o contraseña incorrectos.",
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Error al obtener la información, intente mas tarde.",
      });
    }
  }
};
