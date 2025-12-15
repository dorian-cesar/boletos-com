import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import MobileSearchBar from "components/ui/MobileSearchBar";
import SearchBar from "components/ui/SearchBar";
import BusquedaServicio from "components/BusquedaServicio/BusquedaServicio";
import React, { useEffect, useState } from "react";
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
import StagePasajes from "../components/ticket_sale/StagePasajes/StagePasajes";
import StagePago from "../components/ticket_sale/StagePago/StagePago";

import { decryptDataNoSaved } from "utils/encrypt-data";
import { useDispatch, useSelector } from "react-redux";
import { agregarOrigenDestino } from "store/usuario/compra-slice";
import { limpiarListaCarrito } from "store/usuario/compra-slice";

import CryptoJS from "crypto-js";

import { generateToken } from "utils/jwt-auth";

registerLocale("es", es);

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const stages = [
  {
    name: "Servicio ida",
    kind: "pasajes_1",
  },
  {
    name: "Servicio vuelta",
    kind: "pasajes_2",
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(limpiarListaCarrito());
  }, []);

  const decryptedData = router.query.search
    ? decryptDataNoSaved(router.query.search, "search")
    : null;

  const [startDate, setStartDate] = useState(
    dayjs(decryptedData?.startDate).isValid()
      ? dayjs(decryptedData?.startDate).toDate()
      : null
  );
  const [endDate, setEndDate] = useState(
    dayjs(decryptedData?.endDate).isValid()
      ? dayjs(decryptedData?.endDate).toDate()
      : null
  );
  const [origen, setOrigen] = useState(decryptedData?.origen || "");
  const [destino, setDestino] = useState(
    decryptedData?.destino != "null" ? decryptedData?.destino : null
  );
  const [mascotaAllowed, setMascotaAllowed] = useState(
    decryptedData?.mascota_allowed || false
  );

  const stateCompra = useSelector((state) => state.compra);

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

  const [fechaViaje, setFechaViaje] = useState(
    startDate ? dayjs(startDate).toDate() : ""
  );

  useEffect(() => {
    switch (stage) {
      case 0:
        setFechaViaje(dayjs(startDate).toDate());
        break;
      case 1:
        setFechaViaje(dayjs(endDate).toDate());
        break;
      default:
        break;
    }
  }, [stage]);

  useEffect(() => {
    const origenDestino = {
      origen: decryptedData?.origen,
      destino: decryptedData?.destino,
    };
    dispatch(agregarOrigenDestino(origenDestino));
    setStage(0);
    // TODO: Descomentar si falla en produccion
    // searchParrilla(0);
  }, [router.query.search]);

  async function searchParrilla(in_stage) {
    try {
      const stage_active = in_stage ?? stage;
      setLoadingParrilla(true);

      // const token = generateToken();

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

      // console.log("dto: ", new ObtenerParrillaServicioDTO(
      //       stage_active,
      //       origen,
      //       destino,
      //       startDate,
      //       endDate
      //     ));

      const response = await fetch(`/api/parrilla`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      const res = await response.json();

      const now = new Date();
      const nowPlus15 = new Date(now.getTime() + 15 * 60 * 1000);

      const futuros = res.filter((item) => {
        const salida = new Date(
          `${item.date}T${item.departureTime.padStart(5, "0")}`
        );
        return salida > nowPlus15;
      });

      const parrilla = futuros.map((item) => ({
        ...item,
        stage_active,
      }));

      console.log("parrilla: ", parrilla);

      // const parrilla = await axios.post("/api/parrilla", new ObtenerParrillaServicioDTO(stage_active, origen, destino, startDate, endDate));
      setParrilla(
        parrilla.map((parrillaMapped, index) => {
          return {
            ...parrillaMapped,
            idParrilla: index + 1,
          };
        })
      );
      setLoadingParrilla(false);
    } catch (e) {
      console.error(e);
      console.error(`Error al obtener parrilla [${e.message}]`);
    }
  }

  async function componentSearch(inputStartDate, inputEndDate) {
    try {
      setLoadingParrilla(true);

      // const token = generateToken();

      const request = CryptoJS.AES.encrypt(
        JSON.stringify(
          new ObtenerParrillaServicioDTO(
            stage,
            origen,
            destino,
            inputStartDate,
            inputEndDate
          )
        ),
        secret
      );

      // console.log(
      //   "dto: ",
      //   new ObtenerParrillaServicioDTO(
      //     stage,
      //     origen,
      //     destino,
      //     startDate,
      //     endDate
      //   )
      // );

      const response = await fetch(`/api/parrilla`, {
        method: "POST",
        body: JSON.stringify({ data: request.toString() }),
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      });

      const res = await response.json();

      const now = new Date();
      const nowPlus15 = new Date(now.getTime() + 15 * 60 * 1000);

      const futuros = res.filter((item) => {
        const salida = new Date(
          `${item.date}T${item.departureTime.padStart(5, "0")}`
        );
        return salida > nowPlus15;
      });

      const parrilla = futuros.map((item) => ({
        ...item,
        stage,
      }));

      console.log("parrilla: ", parrilla);

      // const parrilla = await axios.post("/api/parrilla", new ObtenerParrillaServicioDTO(stage_active, origen, destino, startDate, endDate));
      setParrilla(
        parrilla.map((parrillaMapped, index) => {
          return {
            ...parrillaMapped,
            idParrilla: index + 1,
          };
        })
      );

      setStartDate(inputStartDate);
      setEndDate(inputEndDate);
      setLoadingParrilla(false);
    } catch (e) {
      console.error(e);
      console.error(`Error al obtener parrilla [${e.message}]`);
    }
  }

  const stages_active = endDate
    ? stages
    : stages.filter((i) => i.kind != "pasajes_2");

  // TODO: Descomentar si falla en produccion
  // useEffect(() => {
  //     searchParrilla();
  // }, [stage]);

  useEffect(() => {
    if (stage === 0 || stage === 1) {
      searchParrilla();
    }
  }, [stage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  return (
    <Layout isBuyStage={true}>
      <Head>
        <title>Boletos.com | Compra Boleto</title>
      </Head>
      <MobileSearchBar
        startDate={startDate}
        endDate={endDate}
        origin={decryptedData?.origen}
        destination={decryptedData?.destino}
        stage={stage}
        setStage={setStage}
        componentSearch={componentSearch}
      />
      <SearchBar
        startDate={startDate}
        endDate={endDate}
        origin={decryptedData?.origen}
        destination={decryptedData?.destino}
        stage={stage}
        setStage={setStage}
        componentSearch={componentSearch}
      />
      <div className="pasajes-compra">
        <div className="container">
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
              origen={
                stages_active[stage].kind == "pasajes_1"
                  ? stateCompra.origen
                  : stateCompra.destino
              }
              destino={
                stages_active[stage].kind == "pasajes_2"
                  ? stateCompra.destino
                  : stateCompra.origen
              }
              setModalMab={setModalMab}
              mascota_allowed={mascotaAllowed}
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
                  <li>Sólo puede viajar una mascota por pasajero.</li>
                  <li>
                    Sólo transportamos a perros y gatos que quepan cómodamente
                    en un canil rígido y cerrado que va sobre el asiento
                    asignado. El canil no puede superar los 60 cm de largo, 39
                    cm de ancho y 34 cm de alto.
                  </li>
                  <li>
                    Debe llevar firmada una "Declaración Jurada de tenencia
                    responsable" al momento de abordar la cual se adjunta con el
                    envío de pasajes MAB al correo.
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
  const decryptedData = query.search
    ? decryptDataNoSaved(query.search, "search")
    : null;
  if (
    !decryptedData ||
    !decryptedData?.origen ||
    !decryptedData?.destino ||
    !decryptedData?.startDate
  ) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }

  // let ciudades = await axios.get(
  //   publicRuntimeConfig.site_url + "/api/ciudades"
  // );

  // let destinos = await axios.post(
  //   publicRuntimeConfig.site_url + "/api/destinos",
  //   { id_ciudad: query.origen }
  // );

  // let nationalities = await axios.get(
  //   publicRuntimeConfig.site_url + "/api/nacionalidades"
  // );

  return {
    props: {
      // ciudades: ciudades.data,
      ciudades: ["santiago", "valparaiso", "concepcion", "puerto montt"],
      // destinos: destinos.data,
      destinos: [
        { codigo: "santiago", nombre: "Santiago" },
        { codigo: "puerto-montt", nombre: "Puerto Montt" },
        { codigo: "valparaiso", nombre: "Valparaíso" },
        { codigo: "concepcion", nombre: "Concepción" },
      ],
      // nacionalidades: nationalities.data,
      nacionalidades: [
        { value: "CL", label: "Chile" },
        { value: "AR", label: "Argentina" },
        { value: "BR", label: "Brasil" },
      ],
    },
  };
},
sessionOptions);
