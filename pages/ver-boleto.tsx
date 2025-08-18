import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "components/Layout";
import Footer from "components/Footer";
import styles from "./respuesta-transaccion-v2/RespuestaTransaccionV2.module.css";

export default function BoletoOperador() {
  const router = useRouter();
  const [boleto, setBoleto] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null); // null: cargando, true: válido, false: inválido
  const [errorAlDecodificar, setErrorAlDecodificar] = useState(false);
  const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA2;

  useEffect(() => {
    if (!router.isReady) return;

    const { data } = router.query;
    if (data) {
      try {
        const base64 = data as string;
        const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
        const decoded = JSON.parse(jsonStr);
        const parsedData =
          typeof decoded === "string" ? JSON.parse(decoded) : decoded;
        setBoleto(parsedData);
      } catch (err) {
        console.error("Error al decodificar QR:", err);
        setErrorAlDecodificar(true);
      }
    } else {
      setErrorAlDecodificar(true);
    }
  }, [router.isReady, router.query]);

  // Validar boleto
  useEffect(() => {
    if (!boleto) return;
    console.log("Boleto:", boleto);

    const validateBoleto = async () => {
      try {
        if (boleto.type === "transaction" && boleto.token) {
          // Validación vía API
          const res = await fetch("/api/v2/confirm-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: boleto.token,
              flowOrder: boleto.authCode,
            }),
          });
          const response = await res.json();
          setIsValid(response?.status === 2);
        } else if (boleto.type === "boleto" && boleto.tokenBoleto) {
          // Validación JWT
          const jwt = await import("jsonwebtoken");
          try {
            const decoded = jwt.verify(boleto.tokenBoleto, secret);
            console.log("TokenBoleto válido:", decoded);
            setIsValid(true);
            if (typeof decoded === "object" && decoded !== null) {
              setBoleto((prev) => ({ ...prev, ...decoded }));
            } else {
              console.warn(
                "TokenBoleto decodificado no es un objeto:",
                decoded
              );
              setBoleto((prev) => ({ ...prev, payload: decoded }));
            }
          } catch (err) {
            console.error("TokenBoleto inválido:", err);
            setIsValid(false);
          }
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error al validar boleto:", error);
        setIsValid(false);
      }
    };

    validateBoleto();
  }, [boleto]);

  // Logs para debug
  // useEffect(() => {
  //   if (boleto) {
  //     console.log("Boleto actualizado:", boleto);
  //     console.log("Tipo de boleto:", typeof boleto);
  //   }
  // }, [boleto]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (errorAlDecodificar) {
    return (
      <Layout>
        <div
          className="container d-flex flex-column justify-content-center align-items-center py-5"
          style={{ minHeight: "75vh" }}
        >
          <div className="text-center mb-2 p-4">
            <h1 className="display-4">Lo sentimos 😢</h1>
            <p className="h5">No se pudo mostrar el boleto</p>
            <p className="text-muted">
              Por favor, escanee el código QR nuevamente.
            </p>
          </div>
          {/* <a href="/" className="btn btn-primary px-4 py-2 mt-3">
            Volver al inicio
          </a> */}
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!boleto || isValid === null) {
    return (
      <div
        className="d-flex justify-content-center align-items-center flex-column"
        style={{ minHeight: "75vh" }}
      >
        <div className="spinner-border text-primary mb-3" role="status" />
        <span className="text-primary fw-semibold">Cargando boleto...</span>
      </div>
    );
  }

  if (isValid === false) {
    return (
      <Layout>
        <div
          className="container d-flex flex-column justify-content-center align-items-center py-5"
          style={{ minHeight: "75vh" }}
        >
          <div className="text-center mb-2 p-4">
            <h1 className="display-4">Boleto inválido</h1>
            <p className="text-muted">
              Este boleto no es válido o no pudo ser confirmado.
            </p>
          </div>
          {/* <a href="/" className="btn btn-primary px-4 py-2 mt-3">
            Volver al inicio
          </a> */}
        </div>
        <Footer />
      </Layout>
    );
  }

  // isValid === true
  return (
    <div className="container my-4">
      <div className="card text-center border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-0 mt-2">
          <img
            src="/img/ui/transaction/transaction-success.svg"
            alt="boleto confirmado"
          />
        </div>

        <div className="card-body">
          <h1 className="fw-bold text-secondary">Boleto de viaje</h1>

          <div className="container mt-3 mb-2">
            <div className="row justify-content-center">
              <p className="col-12 col-md-8 mb-1">
                Este boleto ha sido validado correctamente.
              </p>
              <p className="col-12 col-md-8">
                A continuación se muestran los detalles del viaje.
              </p>
            </div>
          </div>

          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-6">
                <div className="bg-secondary p-2 rounded-4 shadow-s">
                  <h5 className="text-white fw-bold m-0">
                    Código de boleto: {boleto.authCode}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 dotted-top dotted-bottom pt-5">
            <div className="container">
              <div className="row justify-content-center gap-4">
                <div className="col-12 col-md-5">
                  <h5 className="fw-bold mb-0">Detalles del viaje</h5>
                  <div className="my-5">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <div className={`${styles["detalle-item"]}`}>
                        <ul>
                          <li>
                            Origen: <b>{boleto.origin}</b>
                          </li>
                          <li>
                            Destino: <b>{boleto.destination}</b>
                          </li>
                        </ul>
                      </div>
                      <div>
                        Salida:{" "}
                        <b>
                          {boleto.departureTime}hrs - {formatDate(boleto.date)}
                        </b>
                      </div>
                      <div>
                        Llegada:{" "}
                        <b>
                          {boleto.arrivalTime}hrs -{" "}
                          {formatDate(boleto.arrivalDate)}
                        </b>
                      </div>
                    </div>

                    <div
                      className={styles["resumen-servicio-ver-boleto"]}
                      style={{ marginTop: "1rem" }}
                    >
                      <div>
                        Asiento: <b>{boleto.seat}</b>
                      </div>
                      <div>
                        Piso: <b>{boleto.floor === "floor1" ? "1" : "2"}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
