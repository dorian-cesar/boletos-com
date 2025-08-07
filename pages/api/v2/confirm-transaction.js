// import getConfig from 'next/config'
// import axios from "axios"
// const {serverRuntimeConfig} = getConfig();
// const config = serverRuntimeConfig;

// async function endTransaction(token, codigo) {
//     let carro;
//     try {
//         carro = await axios.post(config.site_url + "/api/carro", {
//             token_ws: token,
//             codigo
//         });
//     } catch (error) {
//         console.log('ERROR:::', error);
//     }
//     return carro;
// }

// export default async (req, res) => {
//     try {
//         const { codigo, token_ws } = req.body;

//         const { data } = await endTransaction(token_ws, codigo);
//         const { carro, cerrar, commit } = data;

//         if( commit && commit.status === 'AUTHORIZED' ){
//             res.status(200).json({ carro, cerrar, commit });
//             // res.redirect('/respuesta-transaccion-v2');
//         } else {
//             res.status(400).json({ cerrar, transactionCode: codigo });
//             // res.redirect('/error-transaccion');
//         }
//     } catch(error){
//         console.error('ERROR:::', error);
//         res.status(400).json({ error: "Error al procesar la solicitud" });
//     }

// }

// import axios from "axios";

// export default async function handler(req, res) {
//   if (req.method !== "POST")
//     return res.status(405).json({ error: "Method not allowed" });

//   const { token, flowOrder } = req.body;

//   if (!token) return res.status(400).json({ error: "Token is required" });

//   try {
//     const { data } = await axios.get(
//       `http://sandbox.dev-wit.com/api/paymentStatus/${flowOrder}?token=${token}`,
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     res.status(200).json(data); // data.status es 1, 2, 3, 4
//   } catch (error) {
//     console.error(
//       "Error al consultar estado:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       error: "Error al verificar estado del pago",
//       apiError: error.response?.data || null,
//       token,
//       flowOrder,
//     });
//   }
// }

import axios from "axios";
import crypto from "crypto";

const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_SANDBOX_URL = process.env.FLOW_API_URL;

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token, flowOrder } = req.body;

  if (!token || !flowOrder) {
    return res.status(400).json({ error: "Token y flowOrder son requeridos" });
  }

  try {
    const params = {
      apiKey: FLOW_API_KEY,
      token,
    };

    const stringToSign = `apiKey=${params.apiKey}&token=${params.token}`;
    params.s = crypto
      .createHmac("sha256", FLOW_SECRET_KEY)
      .update(stringToSign)
      .digest("hex");

    const { data: flowResponse } = await axios.get(
      `${FLOW_SANDBOX_URL}/payment/getStatus`,
      { params }
    );

    res.status(200).json({
      success: true,
      status: flowResponse.status, // 1: pendiente, 2: pagado, 3: rechazado, 4: anulado
      flowResponse,
    });
  } catch (error) {
    console.error("Error en /api/paymentStatus:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al consultar estado del pago.",
      error: error.response?.data || error.message,
    });
  }
}