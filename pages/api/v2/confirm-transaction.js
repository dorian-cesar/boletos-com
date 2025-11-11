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

// FLOW

// import axios from "axios";
// import crypto from "crypto";

// const FLOW_API_KEY = process.env.FLOW_API_KEY;
// const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
// const FLOW_SANDBOX_URL = process.env.FLOW_API_URL;

// export default async function handler(req, res) {
//   if (req.method !== "POST")
//     return res.status(405).json({ error: "Method not allowed" });

//   const { token, flowOrder } = req.body;

//   if (!token || !flowOrder) {
//     return res.status(400).json({ error: "Token y flowOrder son requeridos" });
//   }

//   try {
//     const params = {
//       apiKey: FLOW_API_KEY,
//       token,
//     };

//     const stringToSign = `apiKey=${params.apiKey}&token=${params.token}`;
//     params.s = crypto
//       .createHmac("sha256", FLOW_SECRET_KEY)
//       .update(stringToSign)
//       .digest("hex");

//     const { data: flowResponse } = await axios.get(
//       `${FLOW_SANDBOX_URL}/payment/getStatus`,
//       { params }
//     );

//     res.status(200).json({
//       success: true,
//       status: flowResponse.status, // 1: pendiente, 2: pagado, 3: rechazado, 4: anulado
//       flowResponse,
//     });
//   } catch (error) {
//     console.error("Error en /api/paymentStatus:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Error al consultar estado del pago.",
//       error: error.response?.data || error.message,
//     });
//   }
// }

import axios from "axios";
import crypto from "crypto";

const PAGOPAR_PUBLIC_KEY = process.env.PAGOPAR_PUBLIC_KEY;
const PAGOPAR_PRIVATE_KEY = process.env.PAGOPAR_PRIVATE_KEY;
const PAGOPAR_URL = "https://api.pagopar.com/api/pedidos/1.1/traer";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { hash_order } = req.body;

  if (!hash_order) {
    return res.status(400).json({ error: "hash_order es requerido" });
  }

  try {
    // 🔐 Generar token según documentación
    const token = crypto
      .createHash("sha1")
      .update(PAGOPAR_PRIVATE_KEY + "CONSULTA")
      .digest("hex");

    // 📦 Cuerpo de la petición a la API de Pagopar
    const payload = {
      hash_order,
      token,
      token_publico: PAGOPAR_PUBLIC_KEY,
    };

    const { data } = await axios.post(PAGOPAR_URL, payload, {
      headers: { "Content-Type": "application/json" },
    });

    // 🧩 Validar respuesta
    if (!data.respuesta || !data.resultado?.length) {
      return res.status(400).json({
        success: false,
        message: "Respuesta inválida de Pagopar",
        data,
      });
    }

    const pedido = data.resultado[0];

    // 🎯 Construcción de respuesta para el frontend
    const pagoExitoso = pedido.pagado === true;
    const pagoCancelado = pedido.cancelado === true;

    if (pagoExitoso) {
      return res.status(200).json({
        success: true,
        estado: "pagado",
        mensaje: "Pago realizado con éxito ✅",
        detalle: {
          numero_pedido: pedido.numero_pedido,
          numero_comprobante: pedido.numero_comprobante_interno,
          monto: pedido.monto,
          forma_pago: pedido.forma_pago,
          fecha_pago: pedido.fecha_pago,
          documento: pedido.documento,
        },
      });
    }

    if (pagoCancelado) {
      return res.status(200).json({
        success: true,
        estado: "cancelado",
        mensaje: "El pago fue cancelado ❌",
        detalle: {
          numero_pedido: pedido.numero_pedido,
          monto: pedido.monto,
          forma_pago: pedido.forma_pago,
          fecha_maxima_pago: pedido.fecha_maxima_pago,
          ultimo_mensaje_error: pedido.ultimo_mensaje_error,
        },
      });
    }

    // Si no está pagado ni cancelado → pendiente
    return res.status(200).json({
      success: true,
      estado: "pendiente",
      mensaje: "El pago está pendiente ⏳",
      detalle: {
        numero_pedido: pedido.numero_pedido,
        monto: pedido.monto,
        forma_pago: pedido.forma_pago,
        fecha_maxima_pago: pedido.fecha_maxima_pago,
      },
    });
  } catch (error) {
    console.error("Error consultando Pagopar:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al consultar estado del pedido en Pagopar.",
      error: error.response?.data || error.message,
    });
  }
}
