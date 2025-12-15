import Layout from "../../components/Layout";
import Loader from "../../components/Loader";
import Footer from "../../components/Footer";
import Head from "next/head";
import styles from "./Devolucion.module.css";
import axios from "axios";
import React, { useState, useEffect } from "react";
import BusquedaBoletos from "../../components/Devolucion/BusquedaBoletos/BusquedaBoletos";
import BoletosSeleccion from "../../components/Devolucion/BoletosSeleccion/BoletosSeleccion";
import ModoDevolucion from "../../components/Devolucion/ModoDevolucion/ModoDevolucion";
import DevolucionDebito from "../../components/Devolucion/DevolucionDebito/DevolucionDebito";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import DevolucionCredito from "../../components/Devolucion/DevolucionCredito/DevolucionCredito";

const Devolucion = (props) => {
  const [stage, setStage] = useState(0);
  const [loadingBoleto, setLoadingBoleto] = useState(false);
  const [boletos, setBoletos] = useState([]);
  const [selectedBoletos, setSelectedBoletos] = useState([]);
  const [medioDevolucion, setMedioDevolucion] = useState(null);
  const [codigoTransaccion, setCodigoTransaccion] = useState(null);
  const [tipoCompra, setTipoCompra] = useState(null);

  //tipo compra VN -> credito, VD debito, WALLET -> Wallet XD

  useEffect(() => {
    if (boletos.length > 0) {
      const primerBoleto = boletos[0];
      setTipoCompra(primerBoleto.tipoCompra);
    }
  }, [boletos]);

  return (
    <Layout>
      <Head>
        <title>Boletos.com | Devolución</title>
      </Head>
      <div className={styles["home"]}>
        <div className={`py-4 container ${styles["nav"]}`}>
          <span>Inicio &gt; Devolución de boleto </span>
        </div>
        {stage == 0 ? (
          <>
            <div className={`mb-5 container ${styles["fondo-devolucion"]}`}>
              <div className={"fila"}>
                <div className={styles["title"]}>
                  <h2>Devolución de boleto</h2>
                </div>
                <div className={styles["bloque"]}>
                  <div className={styles["sub-title"]}>
                    <p>
                      Puedes realizar cambios en tus boletos tanto en nuestro
                      sitio web como en las boleterías autorizadas, siempre y
                      cuando lo hagas hasta cuatro (4) horas antes de la hora de
                      salida del bus.
                    </p>
                  </div>
                  <BusquedaBoletos
                    setStage={setStage}
                    setBoletos={setBoletos}
                    setLoadingBoleto={setLoadingBoleto}
                    codigoTransaccion={codigoTransaccion}
                    setCodigoTransaccion={setCodigoTransaccion}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <></>
        )}

        {stage == 1 ? (
          <BoletosSeleccion
            setStage={setStage}
            boletos={boletos}
            setLoadingBoleto={setLoadingBoleto}
            selectedBoletos={selectedBoletos}
            setSelectedBoletos={setSelectedBoletos}
          />
        ) : (
          <></>
        )}

        {stage == 2 ? (
          loadingBoleto ? (
            <Loader />
          ) : boletos.length > 0 ? (
            <ModoDevolucion
              setStage={setStage}
              medioDevolucion={medioDevolucion}
              setMedioDevolucion={setMedioDevolucion}
              boletos={boletos}
              selectedBoletos={selectedBoletos}
            />
          ) : (
            ""
          )
        ) : (
          <></>
        )}

        {stage == 3 ? (
          tipoCompra === "VN" ? (
            <DevolucionCredito
              setStage={setStage}
              tipoCompra={tipoCompra}
              selectedBoletos={selectedBoletos}
              codigoTransaccion={codigoTransaccion}
            />
          ) : (
            <DevolucionDebito
              setStage={setStage}
              tipoCompra={tipoCompra}
              selectedBoletos={selectedBoletos}
              codigoTransaccion={codigoTransaccion}
            />
          )
        ) : (
          <></>
        )}
      </div>

      <ToastContainer />
      <Footer />
    </Layout>
  );
};

export default Devolucion;
