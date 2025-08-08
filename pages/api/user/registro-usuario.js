import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

import { generateToken } from "utils/jwt-auth";

// export default async (req, res) => {
//     try {
//         const postData = req.body;
//         let token = await doLogin();
//         let data = await axios.post(config.service_url + `/usuarioPortal/registrarUsuario`, postData,{
//         headers: {
//             'Authorization': `Bearer ${token.token}`
//         }
//         })
//         res.status(200).json(data.data);
//     } catch(error){
//         res.status(400).json(error.response.data);
//     }
// }

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }
  const token = generateToken();
  try {
    const { nombreApellido, mail, password, rut } = req.body;
    if (!nombreApellido || !mail || !password || !rut) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    const postData = {
      name: nombreApellido,
      rut,
      email: mail,
      password,
      role: 'usuario',
    };
    const response = await axios.post(
      `${config.url_api}/users/register`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error en registro:", error);
    const status = error?.response?.status || 500;
    const message = error?.response?.data || { error: "Error desconocido" };
    res.status(status).json(message);
  }
};

// export default async (req, res) => {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Método no permitido" });
//   }

//   try {
//     const { nombreApellido, mail, password, rut } = req.body;

//     if (!nombreApellido || !mail || !password || !rut) {
//       return res.status(400).json({
//         error: { message: "Faltan campos requeridos" },
//       });
//     }

//     const postData = {
//       name: nombreApellido,
//       rut: rut || null,
//       email: mail,
//       password,
//       role: "usuario",
//     };

//     console.log("Simulando registro con datos:", postData);

//     return res.status(500).json({
//       error: "Error al registrar usuario",
//       details:
//         'E11000 duplicate key error collection: bus_transport.users index: email_1 dup key: { email: "prueba2@prueba2.cl" }',
//     });
//   } catch (error) {
//     console.error("Error en registro simulado:", error);
//     return res.status(500).json({
//       error: "Error al registrar usuario",
//       details:
//         'E11000 duplicate key error collection: bus_transport.users index: email_1 dup key: { email: "prueba2@prueba2.cl" }',
//     });
//   }
// };
