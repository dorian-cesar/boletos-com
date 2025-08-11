import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

// export default async (req, res) => {
//     try {
//         const postData = req.body;
//         let token = await doLogin();
//         let data = await axios.post(config.service_url + `/usuarioPortal/recuperarPassword`, postData, {
//             headers: {
//                 'Authorization': `Bearer ${token.token}`
//             }
//         })
//         res.status(200).json(data.data);
//     } catch(error){
//         res.status(400).json(error.response.data);
//     }

// }

export default async (req, res) => {
  try {
    const reqData = req.body;
    const postData = {
      email: reqData.mail,
    };
    console.log(postData);
    let data = await axios.post(
      config.url_api + `/users/forgot-password`,
      postData
    );
    console.log("data", data);
    res.status(200).json(data.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(400).json(error.response?.data || { message: error.message });
  }
};
