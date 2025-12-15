import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import BusquedaServicio from "../components/BusquedaServicio/BusquedaServicio";
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
import StagePasajes from "../components/confirmation_coupon/StagePasajes";
import StagePago from "../components/confirmation_coupon/StagePago";

import CryptoJS from "crypto-js";

import { generateToken } from "utils/jwt-auth";

registerLocale("es", es);

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const stages = [
  {
    name: "Selección viaje IDA",
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

  return (
    <Layout>
      <Head>
        <title>Boletos.com | Compra Boleto</title>
      </Head>
      <div className="pasajes">
        <div className="container">
          <BusquedaServicio
            origenes={props.ciudades}
            dias={props.dias}
            isShowMascota={true}
          />
        </div>
      </div>
      <div className="pasajes-compra py-5">
        <div className="container">
          <div className="d-flex flex-row justify-content-around">
            {stages
              .filter(
                (stageMaped) =>
                  endDate || (!endDate && stageMaped.kind != "pasajes_2")
              )
              .map((stageMaped, indexStage) => {
                return (
                  <div
                    key={`stage-${indexStage}`}
                    className={
                      "seleccion text-center " +
                      (indexStage == stage ? "active" : "")
                    }
                  >
                    <div className="numeros">
                      <div className="numero">{indexStage + 1}</div>
                    </div>
                    <h3>{stageMaped.name}</h3>
                  </div>
                );
              })}
          </div>
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
            />
          ) : (
            ""
          )}
        </div>
      </div>
      {modalMab ? (
        <div className="modal fade show" tabindex="-1" role="dialog">
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <b>
                    Seleccionaste un asiento dentro del espacio reservado para
                    mascotas abordo
                  </b>
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setModalMab(false)}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body d-flex align-items-center">
                <img src="/MAB-logo1.png" className="col-12 col-md-3" />
                <ul className="p-1 list-style-dot">
                  <li>
                    Solo podrán viajar Perros y Gatos en un Canil que no exceda
                    los 60 cm de largo, 34 cm de alto y 38,5 cm de ancho.
                  </li>
                  <li>Solo puede viajar una mascota por pasajero.</li>
                  <li>
                    {" "}
                    Debe firmar una "Declaración Jurada de Tenencia Responsable"
                    antes del viaje que se enviará junto el pasaje.
                  </li>
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setModalMab(false)}
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
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
