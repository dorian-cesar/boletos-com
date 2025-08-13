// import Footer from "components/Footer";
// import Layout from "components/Layout";
// import { useEffect, useState } from "react";

// import { withIronSessionSsr } from "iron-session/next";
// import { sessionOptions } from "lib/session";
// import Image from "next/image";
// import axios from "axios";
// import getConfig from "next/config";
// import { useRouter } from "next/router";

// import crypto from "crypto";
// import { stringify } from "querystring";

// import { redirect } from "next/navigation";

// const { publicRuntimeConfig } = getConfig();

// import JWT from "jsonwebtoken";
// import { useSelector } from "react-redux";

// interface ConfirmTransactionProps {
//   serviceResponse: any;
// }

// const SECRET = "xWL!96JRaWi2lT0jG";

// export default function ConfrimTransaction({
//   serviceResponse,
// }: ConfirmTransactionProps) {
//   const router = useRouter();
//   const [carroCompras, setCarroCompras] = useState([]);
//   const [hasPushed, setHasPushed] = useState(false);

//   const selector =
//     useSelector((state: any) => state.compra?.listaCarrito) || [];

//   useEffect(() => {
//     let keys = 0;

//     if (selector) {
//       keys = Object.keys(selector).length;
//     }

//     if (keys > 0) {
//       const token = JWT.sign(selector, SECRET);
//       sessionStorage.setItem("transactionBasketInfo", token);
//       setCarroCompras(selector);
//     } else {
//       setCarroCompras([]);
//     }
//   }, []);

//   useEffect(() => {
// //   if( !serviceResponse && !hasPushed ) {
// //       router.push('/error-transaccion');
// //       setHasPushed(true);
// //       return;
// //   }

//   // if( serviceResponse && serviceResponse.status && !hasPushed ) {
//   //     const token = JWT.sign(serviceResponse, SECRET);
//   //     sessionStorage.setItem('transactionInformation', token);
//   //     router.push('/respuesta-transaccion-v2');
//   //     setHasPushed(true);
//   //     return;
//   // }

// //   if( !hasPushed ) {
// //       router.push('/error-transaccion');
// //   }
//   }, [carroCompras]);

//   useEffect(() => {
//     if (serviceResponse && serviceResponse.status === 2 && !hasPushed) {
//       const token = JWT.sign(serviceResponse, SECRET);
//       sessionStorage.setItem("transactionInformation", token);
//       router.push("/respuesta-transaccion-v2");
//       setHasPushed(true);
//     }

//     if (serviceResponse && serviceResponse.status !== 1 && !hasPushed) {
//       router.push("/error-transaccion");
//       setHasPushed(true);
//     }
//   }, [carroCompras]);

//   return (
//     <Layout>
//       <div className="container row d-flex justify-content-center mb-5 w-100 mx-auto">
//         <div className="text-center mt-2">
//           <Image
//             src="/img/paraguay.gif"
//             width={300}
//             height={200}
//             alt="Picture of the author"
//           />
//         </div>
//         <div className="text-center my-2">
//           <h5>Estamos completando su transacción, por favor espere.</h5>
//         </div>
//       </div>
//       <Footer />
//     </Layout>
//   );
// }

// export const getServerSideProps = withIronSessionSsr(async function (context) {
//   const { flowOrder, token } = context.query;

//   let serviceResponse = {};
//   try {
//     const { data } = await axios.post("http://localhost:3000" + '/api/v2/confirm-transaction', {
//         flowOrder,
//         token,
//     });
//     serviceResponse = data;
//     console.log("Service Response:", serviceResponse);
//   } catch (error) {
//     console.log("Error:", error);
//   }

//   return {
//     props: {
//       serviceResponse,
//     },
//   };
// }, sessionOptions);

import Footer from "components/Footer";
import Layout from "components/Layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { generateToken } from "utils/jwt-auth";
import JWT from "jsonwebtoken";
import { useSelector } from "react-redux";

const SECRET = "xWL!96JRaWi2lT0jG";

export default function ConfrimTransaction() {
  const router = useRouter();
  const [carroCompras, setCarroCompras] = useState([]);
  const [hasPushed, setHasPushed] = useState(false);

  const selector =
    useSelector((state: any) => state.compra?.listaCarrito) || [];

  useEffect(() => {
    let keys = 0;

    if (selector) {
      keys = Object.keys(selector).length;
    }

    if (keys > 0) {
      const token = JWT.sign(selector, SECRET);
      sessionStorage.setItem("transactionBasketInfo", token);
      setCarroCompras(selector);
    } else {
      setCarroCompras([]);
    }
  }, []);

  useEffect(() => {
    const runCheck = async () => {
      const token = localStorage.getItem("tokenTemp");
      const flowOrder = localStorage.getItem("flowOrder");

      if (!token) {
        if (router.pathname !== "/error-transaccion") {
          router.push("/error-transaccion");
        }
        return;
      }

      try {
        const response = await fetch("/api/v2/confirm-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, flowOrder }),
        });

        const data = await response.json();

        switch (data.status) {
          case 1:
            setTimeout(runCheck, 3000);
            break;

          case 2:
            try {
              const rawPurchaseInfo = localStorage.getItem("purchase_info");
              const rawBuyerInfo = localStorage.getItem("buyer_info");
              const buyerInfo = rawBuyerInfo ? JSON.parse(rawBuyerInfo) : null;
              const purchaseInfo = rawPurchaseInfo
                ? JSON.parse(rawPurchaseInfo)
                : [];

              const firstName = buyerInfo?.nombre?.trim() || "";
              const lastName = buyerInfo?.apellido?.trim() || "";
              const userName = `${firstName} ${lastName}`.trim() || "Invitado";
              const userEmail = buyerInfo?.email || null;
              const tokenAPI = generateToken();

              if (
                !Array.isArray(purchaseInfo) ||
                purchaseInfo.length === 0 ||
                !userEmail ||
                !flowOrder
              ) {
                console.warn("Faltan datos para confirmar asientos");
                if (router.pathname !== "/error-transaccion") {
                  router.push("/error-transaccion");
                }
                return;
              }

              // Registra usuario invitado
              let userId = null;
              try {
                const userRes = await fetch(
                  "https://boletos.dev-wit.com/api/users/register-guest",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      name: userName,
                      email: userEmail,
                    }),
                  }
                );

                if (!userRes.ok) {
                  const errorText = await userRes.text();
                  console.error(
                    "Error al registrar usuario invitado:",
                    errorText
                  );
                  if (router.pathname !== "/error-transaccion") {
                    router.push("/error-transaccion");
                  }
                  return;
                }

                const userData = await userRes.json();
                userId = userData?.user_id;
                console.log("Usuario registrado:", userData);

                if (!userId) {
                  console.error("No se obtuvo el ID del usuario creado");
                  if (router.pathname !== "/error-transaccion") {
                    router.push("/error-transaccion");
                  }
                  return;
                }

                console.log("Usuario registrado con éxito, ID:", userId);
              } catch (err) {
                console.error("Error durante el registro de usuario:", err);
                if (router.pathname !== "/error-transaccion") {
                  router.push("/error-transaccion");
                }
                return;
              }

              // Confirmar asientos
              for (const servicio of purchaseInfo) {
                const serviceId = servicio?.id;
                const asientos = servicio?.asientos || [];

                if (!serviceId || asientos.length === 0) {
                  console.warn("Servicio inválido o sin asientos:", servicio);
                  if (router.pathname !== "/error-transaccion") {
                    router.push("/error-transaccion");
                  }
                  return;
                }

                for (const asiento of asientos) {
                  const seatNumber = asiento?.asiento;
                  if (!seatNumber) continue;

                  const confirmRes = await fetch(
                    `https://boletos.dev-wit.com/api/seats/${serviceId}/confirm`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenAPI}`,
                      },
                      body: JSON.stringify({
                        seatNumber,
                        authCode: flowOrder,
                        userId,
                      }),
                    }
                  );

                  if (!confirmRes.ok) {
                    const errorText = await confirmRes.text();
                    console.error(
                      `Error al confirmar asiento ${seatNumber} del servicio ${serviceId}:`,
                      errorText
                    );
                    if (router.pathname !== "/error-transaccion") {
                      router.push("/error-transaccion");
                    }
                    return;
                  } else {
                    console.log(`Asiento ${seatNumber} confirmado`);
                  }
                }
              }

              // Éxito total
              if (router.pathname !== "/respuesta-transaccion-v2") {
                router.push("/respuesta-transaccion-v2");
              }
            } catch (error) {
              console.error("Error confirmando asientos:", error);
              if (router.pathname !== "/error-transaccion") {
                router.push("/error-transaccion");
              }
            }
            break;

          case 3:
          case 4:
          default:
            if (router.pathname !== "/error-transaccion") {
              router.push("/error-transaccion");
            }
            break;
        }
      } catch (error) {
        console.error("Error al verificar estado del pago:", error);
        if (router.pathname !== "/error-transaccion") {
          router.push("/error-transaccion");
        }
      }
    };

    if (router.isReady) {
      runCheck();
    }
  }, [router.isReady]);

  return (
    <Layout>
      <div
        className="container d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "75vh" }}
      >
        <img src="/img/loading.gif" width={300} height={300} alt="Loading" />
        <h5 className="text-center">
          Estamos completando su transacción, por favor espere.
        </h5>
      </div>
      <Footer />
    </Layout>
  );
}
