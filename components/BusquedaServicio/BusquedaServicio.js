import axios from "axios";
import dayjs from "dayjs";
import DatePicker, { registerLocale } from "react-datepicker";
import Link from "next/link";
import Input from "../Input";
import { useEffect, useState, forwardRef, useRef } from "react";
import es from "date-fns/locale/es";
import { useRouter } from "next/router";
import styles from "./BusquedaServicio.module.css";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import Popup from "../Popup/Popup";
import ModalEntities from "entities/ModalEntities";
import {
  liberarAsientos,
  limpiarListaCarrito,
} from "store/usuario/compra-slice";
import {
  decryptDataNoSaved,
  encryptDataNoSave,
  decryptData,
} from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";
// import ReCAPTCHA from "react-google-recaptcha";

registerLocale("es", es);

// const captchaSiteKey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA;

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="fecha-input form-control m-0 w-100"
    onClick={onClick}
    ref={ref}
    defaultValue={value}
    readOnly={true}
  />
));

const BusquedaServicio = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { dias, isShowMascota = false, isHomeComponent = true } = props;

  const [decryptedData, setDecryptedData] = useState(null);
  const [mascota_allowed, setMascota] = useState(false);
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [destinos, setDestinos] = useState([]);
  const [startDate, setStartDate] = useState(
    props.startDate ? props.startDate : null
  );
  const [endDate, setEndDate] = useState(props.endDate ? props.endDate : null);
  const [datePickerKey, setDatePickerKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [mostrarPopup, setMostrarPopup] = useState(false);

  const [origenes, setOrigenes] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  useEffect(() => {
    setStartDate(props.startDate);
    setEndDate(props.endDate);
  }, [props.startDate, props.endDate]);

  useEffect(() => {
    if (!startDate) {
      if (router.query.search) {
        setDecryptedData(decryptDataNoSaved(router.query.search, "search"));
        setStartDate(
          decryptedData?.startDate
            ? dayjs(decryptedData.startDate).toDate()
            : dayjs().toDate()
        );
        setEndDate(
          decryptedData?.endDate ? dayjs(decryptedData.endDate).toDate() : null
        );
      }
      if (!decryptedData) {
        setStartDate(dayjs().toDate());
        setEndDate(null);
      }
    }
  }, []);

  useEffect(() => {
    setDatePickerKey((prevKey) => prevKey + 1);
  }, [startDate]);

  const buscarBtnRef = useRef();

  async function redireccionarBuscarServicio() {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // const token = await captchaRef.current.executeAsync();

      // const tokenVerify = await fetch('/api/token-verify', {
      //   method: 'POST',
      //   body: JSON.stringify({ token })
      // });

      // const tokenVerifyResponse = await tokenVerify.json();

      // if( !tokenVerifyResponse.success ) {
      //   return;
      // }

      dispatch(liberarAsientos());

      const data = {
        origen,
        destino,
        startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
        endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
        mascota_allowed,
      };

      const encriptedData = encryptDataNoSave(data, "search");
      // const encriptedData = encryptDataNoSave(data, process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA);

      router
        .replace(`/comprar?search=${encriptedData}`)
        .then(() => window.location.reload())
        .catch((_) => setIsLoading(false));
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getCiudades();
  }, []);

  useEffect(() => {
    if (origen) {
      const origenData = ciudades.find((item) => item.origen === origen);
      setDestinos(origenData ? origenData.destinos : []);
    } else {
      setDestinos([]);
    }
  }, [origen, ciudades]);

  async function getCiudades() {
    try {
      const { data } = await axios.get("/api/ciudades");
      setCiudades(data);

      // Extraer orígenes únicos
      const listaOrigenes = [...new Set(data.map((item) => item.origen))];
      setOrigenes(listaOrigenes);
    } catch (error) {
      console.error(`Error al obtener ciudades: ${error.message}`);
    }
  }

  async function isValidStart(date) {
    return (
      dayjs(date).isAfter(dayjs().subtract(1, "day")) &&
      dayjs(date).isBefore(dayjs().add(dias, "day"))
    );
  }

  async function isValidAfter(date) {
    return (
      dayjs(date).isAfter(dayjs(startDate).subtract(1, "day")) &&
      dayjs(date).isBefore(dayjs().add(dias, "day"))
    );
  }

  function retornaCiudadesSelect(arrayCiudades) {
    return arrayCiudades.map((ciudad) => {
      return {
        label: ciudad,
        value: ciudad,
      };
    });
  }

  function retornaDestinosSelect(arrayDestinos) {
    return arrayDestinos.map((destino) => ({
      label: destino,
      value: destino,
    }));
  }

  function cambiarOrigen(origenSeleccionado) {
    setDestino(null);
    setOrigen(origenSeleccionado);
  }

  useEffect(() => {
    if (endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      setEndDate(dayjs(startDate).toDate());
    }
  }, [startDate]);

  useEffect(() => {
    if (!router.query.search) return;
    const decryptedData = decryptDataNoSaved(router.query.search, "search");
    const { origen, destino, startDate, endDate } = decryptedData;
    const startDateFromUrl =
      startDate && startDate !== "null" && dayjs(startDate).isValid()
        ? dayjs(startDate).toDate()
        : null;

    if (origen) setOrigen(origen);
    if (destino) setDestino(destino);

    if (startDateFromUrl) {
      setStartDate(dayjs(startDateFromUrl).toDate());
    }

    if (endDate && endDate !== "null") {
      setEndDate(dayjs(endDate).toDate());
    }
  }, [router.query.search]);

  useEffect(() => {
    const savedActiveTab = localStorage.getItem("activeTab");
    if (savedActiveTab) {
      setActiveTab(savedActiveTab);
    }
  }, []);

  function invertirDestinos() {
    const origenBackup = origen;
    const destinoBackup = destino;
    setOrigen(destinoBackup);
    setDestino(origenBackup);
  }

  return (
    <>
      <section
        className={isHomeComponent ? "container pb-5" : "container py-1"}
      >
        <div className={isHomeComponent ? styles["seleccion-servicio"] : ""}>
          <div>
            {isHomeComponent && (
              <h1 className={styles["titulo-azul"]}>
                ¿Cuál es tu próximo destino?
              </h1>
            )}
            {mostrarPopup && (
              <Popup
                modalKey={ModalEntities.delete_car}
                modalClose={cerrarPopup}
                modalMethods={null}
              />
            )}
            {isShowMascota && (
              <div className="container px-xs-0 px-sm-3 px-md-4 px-lg-5 px-xl-2 px-xxl-4">
                <div
                  className={`form-check form-switch form-check-reverse ${styles["input-switch-pet"]}`}
                >
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="isMascotaAllowedSwitch"
                    value={mascota_allowed}
                    onChange={() => setMascota(!mascota_allowed)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="isMascotaAllowedSwitch"
                  >
                    Mascota a bordo
                  </label>
                </div>
              </div>
            )}
          </div>
          <div className="container">
            <div className="row d-flex justify-content-evenly align-items-end">
              <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-2 col-xxl-2">
                <label className={styles["label-titulo-busqueda-servicio"]}>
                  Origen
                </label>
                {/* <Input
                  className="sel-input origen"
                  placeholder="Seleccione origen"
                  items={retornaCiudadesSelect(origenes)}
                  selected={
                    origen &&
                    retornaCiudadesSelect([
                      origenes.find((i) => i.codigo == origen.codigo),
                    ])
                  }
                  setSelected={cambiarOrigen}
                /> */}
                <Input
                  className="sel-input origen"
                  placeholder="Seleccione origen"
                  items={retornaCiudadesSelect(origenes)}
                  selected={origen ? { label: origen, value: origen } : null}
                  setSelected={cambiarOrigen}
                />
              </div>
              <div className="col-12 col-sm-12 col-md-1 col-lg-auto col-xl-auto col-xxl-auto d-flex">
                <img
                  src="img/repeat-outline.svg"
                  onClick={() => invertirDestinos()}
                  className={`pointer mx-auto mb-1 d-none d-md-block ${styles.svgImage} ${styles.svgShadow}`}
                />
              </div>
              <div className="col-12 col-sm-12 col-md-5 col-lg-5 col-xl-2 col-xxl-2">
                <label className={styles["label-titulo-busqueda-servicio"]}>
                  Destino
                </label>
                {/* <Input
                  className="sel-input destino"
                  placeholder="Seleccione destino"
                  items={retornaCiudadesSelect([
                    ...destinos,
                    {
                      codigo: "NO_OPTIONS",
                      nombre: "Por favor seleccione un origen",
                    },
                  ])}
                  selected={
                    destino &&
                    destinos.length > 0 &&
                    retornaCiudadesSelect([
                      destinos.find((i) => i.codigo == destino.codigo),
                    ])
                  }
                  setSelected={setDestino}
                /> */}
                <div
                  style={{
                    pointerEvents: !origen ? "none" : "auto",
                    opacity: !origen ? 0.7 : 1,
                  }}
                >
                  <Input
                    className="sel-input destino"
                    placeholder={"Seleccione destino"}
                    items={retornaDestinosSelect(destinos)}
                    selected={
                      destino ? { label: destino, value: destino } : null
                    }
                    setSelected={setDestino}
                  />
                </div>
              </div>
              <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-2 col-xxl-2">
                <label className={styles["label-titulo-busqueda-servicio"]}>
                  Salida
                </label>
                <DatePicker
                  key={datePickerKey}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  filterDate={isValidStart}
                  locale={"es"}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  customInput={<CustomInput />}
                />
              </div>
              <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-2 col-xxl-2">
                <label className={styles["label-titulo-busqueda-servicio"]}>
                  Vuelta
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    if (date && buscarBtnRef.current) {
                      setTimeout(() => {
                        buscarBtnRef.current.click();
                      }, 100);
                    }
                  }}
                  filterDate={isValidAfter}
                  locale={"es"}
                  minDate={startDate}
                  dateFormat="dd/MM/yyyy"
                  className={styles["input"]}
                  customInput={<CustomInput />}
                  isClearable
                />
              </div>
              <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-2 col-xxl-2">
                <button
                  ref={buscarBtnRef}
                  className={`mx-auto mt-4 mt-md-0 ${
                    styles["button-busqueda-servicio"]
                  } ${isLoading ? styles["loading-button"] : ""}`}
                  onClick={redireccionarBuscarServicio}
                  disabled={!origen || !destino}
                >
                  <img
                    src="img/icon-buscar-blanco.svg"
                    style={{ width: "15px" }}
                  />{" "}
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BusquedaServicio;
