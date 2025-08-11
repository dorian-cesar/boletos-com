import doLogin from "../../../utils/oauth-token";
import getConfig from "next/config";
import axios from "axios";
import { WebpayPlus, Environment, Options } from "transbank-sdk";
import crypto from "crypto";
import { stringify } from "querystring";
import CryptoJS from "crypto-js";
import { isPropertyAccessChain } from "typescript";
import { authMiddleware } from "../auth-middleware";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

// async function handleGuardarMultiCarro(req, res) {
//   try {
//     // let token = await doLogin();
//     // console.log("FLOW_API_KEY", process.env.FLOW_API_KEY);
//     // console.log("FLOW_SECRET_KEY", process.env.FLOW_SECRET_KEY);
//     // console.log("FLOW_API_URL", process.env.FLOW_API_URL);

//     const { data } = JSON.parse(req.body);

//     const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
//     const decrypted = CryptoJS.AES.decrypt(data, secret);
//     const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

//     // console.log("serviceRequest:", serviceRequest)

//     const apiKey = process.env.FLOW_API_KEY;
//     // console.log("apiKey", apiKey);

//     const isProd = process.env.NODE_ENV === "production";
//     const urlReturn = isProd
//     // ? "https://boletos-com.netlify.app/confirm-transaction"
//       ? "https://boletos-com.netlify.app/api/v2/receive-transaction"
//       // : `http://localhost:3000/confirm-transaction`;
//       : `http://localhost:3000/api/v2/receive-transaction`;

//     const params = {
//       apiKey: apiKey,
//       commerceOrder: crypto.randomUUID(),
//       currency: "CLP",
//       // paymentMethod: 9,
//       timeout: 1800,
//       urlConfirmation: "http://sandbox.dev-wit.com/api/paymentConfirmation/", // llamada POST api/endpoint
//       urlReturn: urlReturn,
//       email: serviceRequest.datosComprador.email,
//       subject: "Compra de pasajes de bus",
//       amount: serviceRequest.montoTotal,
//     };

//     const secretKey = process.env.FLOW_SECRET_KEY;

//     const keys = Object.keys(params);
//     keys.sort();
//     let toSign = "";
//     for (let i = 0; i < keys.length; i++) {
//       let key = keys[i];
//       toSign += key + params[key];
//     }
//     const signature = crypto
//       .createHmac("sha256", secretKey)
//       .update(toSign)
//       .digest("hex");

//     const body = {
//       ...params,
//       s: signature,
//     };

//     const encodedBody = stringify(body);
//     const url = process.env.FLOW_API_URL;

//     try {
//       const response = await axios.post(`${url}/payment/create`, encodedBody, {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       });
//       console.log(
//         "checkout url",
//         `${response.data.url}?token=${response.data.token}`
//       );
//       return res.status(200).json(response.data);
//     } catch (error) {
//       console.error("Error en llamada a Flow:", error.message);
//       res.status(500).json({
//         error: "Error al crear el pago en Flow",
//         errorMessage: error.message,
//         bodyReq: body,
//       });
//     }
//   } catch (e) {
//     console.log(e.message);
//     res.status(400).json({ error: e.message });
//   }
// }

// export default handleGuardarMultiCarro;

async function handleGuardarMultiCarro(req, res) {
  try {
    const { data } = JSON.parse(req.body);

    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    const decrypted = CryptoJS.AES.decrypt(data, secret);
    const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    console.log("serviceRequest:", serviceRequest);

    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;
    console.log("publicKey", publicKey);

    const productId = crypto.randomUUID();

    const comercio_token_privado = process.env.PAGOPAR_PRIVATE_KEY;
    const idPedido = productId;
    const monto_total = serviceRequest.montoTotal;

    function generarSha1(comercio_token_privado, idPedido, monto_total) {
      // Aseguramos que monto_total sea float y luego string
      const montoStr = String(parseFloat(monto_total));
      // Concatenamos los valores
      const texto = comercio_token_privado + idPedido + montoStr;
      // Calculamos sha1
      const hash = crypto.createHash("sha1").update(texto).digest("hex");
      return hash;
    }

    const tokenTransaccion = generarSha1(
      comercio_token_privado,
      idPedido,
      monto_total
    );
    console.log(tokenTransaccion);

    const fecha = new Date();
    fecha.setMinutes(fecha.getMinutes() + 15); // sumar 15 minutos
    const fechaMaxPago = fecha
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    console.log({ fechaMaxPago });

    const params = {
      token: tokenTransaccion,
      comprador: {
        ruc: "4247903-7",
        email: serviceRequest.datosComprador.email,
        ciudad: 1,
        nombre: "Rudolph Goetz",
        telefono: "0972200046",
        direccion: "",
        documento: "4247903",
        coordenadas: "",
        razon_social: "",
        tipo_documento: "CI",
        direccion_referencia: "",
      },
      public_key: publicKey,
      monto_total: serviceRequest.montoTotal,
      tipo_pedido: "VENTA-COMERCIO",
      compras_items: [
        {
          ciudad: "1",
          nombre: "Pasajes de bus",
          cantidad: 1,
          categoria: "909",
          public_key: publicKey,
          url_imagen:
            "http://www.example.com/d7/wordpress/wp-content/uploads/2017/10/ticket.png",
          descripcion: "Compra de pasajes de bus",
          id_producto: 1,
          precio_total: serviceRequest.montoTotal,
          vendedor_telefono: "",
          vendedor_direccion: "",
          vendedor_direccion_referencia: "",
          vendedor_direccion_coordenadas: "",
        },
      ],
      fecha_maxima_pago: fechaMaxPago,
      id_pedido_comercio: productId,
      descripcion_resumen: "",
      forma_pago: 9,
    };

    try {
      const response = await axios.post(
        `https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion`,
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log("response", response);
      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Error en llamada a PagoPar:", error.message);
      res.status(500).json({
        error: "Error al crear el pago en PagoPar",
        errorMessage: error.message,
        bodyReq: body,
      });
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).json({ error: e.message });
  }
}

export default handleGuardarMultiCarro;
