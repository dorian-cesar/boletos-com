import axios from "axios";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import BusquedaServicio from "../../components/ticket-change/BusquedaServicio/BusquedaServicio";
import { useEffect, useState } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import dayjs from "dayjs";
import { registerLocale } from "react-datepicker";
import { useRouter } from "next/router";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
const { publicRuntimeConfig } = getConfig();
import es from "date-fns/locale/es";
import { ObtenerParrillaServicioDTO } from "dto/ParrillaDTO";
import StagePasajes from "../../components/ticket-change/StagePasajes";
import StagePago from "../../components/ticket-change/StagePago/StagePago";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

import styles from "./CambioBoleto.module.css";

import CryptoJS from "crypto-js";

import { generateToken } from "utils/jwt-auth";

registerLocale("es", es);

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const stages = [
  {
    name: "Validación boleto",
    kind: "validacion",
  },
  {
    name: "Selección servicio",
    kind: "pasajes_1",
  },
  {
    name: "Pago",
    kind: "pago",
  },
  {
    name: "Confirmación",
    kind: "confirmacion",
  },
];

export default function Home(props) {
  async function validarBoleto() {
    try {
      const { data } = await axios.post("/api/ticket_sale/validar-cambio", {
        boleto,
      });
      setBoletoValido(data);
      setStage(1);
    } catch ({ response }) {
      const { message } = response.data;
      const { object } = response.data;
      toast.error(message + " (" + object?.resultado?.mensaje + ")", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
    }
  }

  const router = useRouter();

  const startDate = dayjs(router.query.startDate).isValid()
    ? dayjs(router.query.startDate).toDate()
    : null;
  const endDate = dayjs(router.query.endDate).isValid()
    ? dayjs(router.query.endDate).toDate()
    : null;
  const origen = router.query.origen;
  const destino = router.query.destino != "null" ? router.query.destino : null;

  const [modalMab, setModalMab] = useState(false);
  const [parrilla, setParrilla] = useState([]);
  const [loadingParrilla, setLoadingParrilla] = useState(true);
  const [boleto, setBoleto] = useState(null);
  const [boletoValido, setBoletoValido] = useState({});
  const [carro, setCarro] = useState({
    clientes_ida: [],
    pasaje_ida: null,
    clientes_vuelta: [],
    pasaje_vuelta: null,
    datos: { tipoRut: "rut" },
  });
  const [stage, setStage] = useState(0);

  async function searchParrilla(in_stage) {
    try {
      const stage_active = in_stage ?? stage;
      setLoadingParrilla(true);

      const token = generateToken();

      const request = CryptoJS.AES.encrypt(
        JSON.stringify(
          new ObtenerParrillaServicioDTO(
            stage_active,
            origen,
            destino,
            startDate,
            endDate
          )
        ),
        secret
      );

      const response = await fetch(`/api/parrilla`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const parrilla = await response.json();

      setParrilla(
        parrilla.map((parrillaMapped, index) => {
          return {
            ...parrillaMapped,
            id: index + 1,
          };
        })
      );
      setLoadingParrilla(false);
    } catch ({ message }) {
      console.error(`Error al obtener parrilla [${message}]`);
    }
  }

  const stages_active = endDate
    ? stages
    : stages.filter((i) => i.kind != "pasajes_2");

  useEffect(() => {
    searchParrilla();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  return (
    <Layout>
      <Head>
        <title>Boletos.com | Cambio Boleto</title>
      </Head>
      <div className={styles["home"]}>
        <div className="pullman-mas">
          <div className="container">
            <div className={`row py-4 ${styles["nav"]}`}>
              <span>Inicio &gt; Cambio de boleto </span>
            </div>
          </div>
        </div>
        {stage == 0 ? (
          <div className={`mb-5 container ${styles["fondo-cambio"]}`}>
            <div className="container">
              <div className={styles["cambio-title"]}>
                <h2>Cambio de boleto</h2>
              </div>
              <div className={styles["bloque"]}>
                <div className={styles["bloque-texto"]}>
                  <p>
                    Los cambios en los boletos pueden realizarse en el sitio web
                    como en las boleterías autorizadas y están permitidos
                    únicamente hasta cuatro (4) horas antes de la hora de salida
                    del bus. Están permitidos solo para boletos de Boletos.com,
                    Pullman Costa Central, Pullman Lago Peñuelas y Nilahue; ya
                    sea adquirido por www.pullmanbus.cl o boleterías
                    autorizadas.
                  </p>
                </div>
                <div className={styles["container"]}>
                  <div className={`search-row ${styles["search-row"]}`}>
                    <div className={styles["search-row-container"]}>
                      <div className={styles["grupo-campos"]}>
                        <label>Código de boleto</label>
                        <input
                          type="text"
                          name=""
                          value={boleto}
                          onChange={(e) =>
                            setBoleto(e.target.value.toUpperCase())
                          }
                          className={styles["input"]}
                          placeholder="PBB111111111111"
                        />
                      </div>
                      <div className={styles["grupo-campos"]}>
                        <div className={styles["button"]}>
                          <button
                            className={
                              boleto
                                ? styles["button-search-coupon"]
                                : styles["button-search-coupon-disabled"]
                            }
                            onClick={boleto && validarBoleto}
                          >
                            <img src="../img/icon/cuponera/search-outline.svg" />
                            Buscar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {stage == 1 ? (
          <div className="ingreso-destino mb-5">
            <div className="">
              <div className="row me-0">
                <BusquedaServicio
                  origenes={props.ciudades}
                  dias={props.dias}
                  isShowMascota={true}
                  setParrilla={setParrilla}
                  setLoadingParrilla={setLoadingParrilla}
                  boletoValido={boletoValido}
                  buscaAlIniciar={true}
                />
                <div className="contenido-busqueda">
                  {loadingParrilla ? (
                    <Loader />
                  ) : parrilla.length > 0 ? (
                    <div className="pasajes-compra py-5">
                      <div className="">
                        {stages_active[stage].kind == "pasajes_1" ||
                        stages_active[stage].kind == "pasajes_2" ? (
                          <StagePasajes
                            key={`stage-pasajes-${stages_active[stage].kind}`}
                            stage={stage}
                            parrilla={parrilla}
                            loadingParrilla={loadingParrilla}
                            setParrilla={setParrilla}
                            startDate={startDate}
                            endDate={endDate}
                            carro={carro}
                            setCarro={setCarro}
                            setStage={setStage}
                            searchParrilla={searchParrilla}
                            boletoValido={boletoValido}
                          />
                        ) : (
                          ""
                        )}
                        {stages_active[stage].kind == "pago" ? (
                          <StagePago
                            key={"stage-pago"}
                            carro={carro}
                            nacionalidades={props.nacionalidades}
                            convenios={props.convenios}
                            mediosDePago={props.mediosDePago}
                            setCarro={setCarro}
                            boletoValido={boletoValido}
                          />
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  ) : (
                    <h5 className={`p-2 ${styles["lo-sentimos"]}`}>
                      Lo sentimos, no existen resultados para su búsqueda
                    </h5>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {stage == 2 ? (
          <StagePago
            key={"stage-pago"}
            carro={carro}
            nacionalidades={props.nacionalidades}
            convenios={props.convenios}
            mediosDePago={props.mediosDePago}
            setCarro={setCarro}
            boletoValido={boletoValido}
          />
        ) : (
          ""
        )}
      </div>
      <ToastContainer />
      <Footer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
  query,
}) {
  let ciudades = await axios.get(
    publicRuntimeConfig.site_url + "/api/ciudades"
  );

  let destinos = await axios.post(
    publicRuntimeConfig.site_url + "/api/destinos",
    { id_ciudad: query.origen }
  );

  return {
    props: {
      ciudades: ciudades.data,
      destinos: destinos.data,
    },
  };
},
sessionOptions);
