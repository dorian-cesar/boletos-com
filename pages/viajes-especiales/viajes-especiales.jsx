import axios from "axios";
import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import styles from "./viajes-especiales.module.css";
import es from "date-fns/locale/es";
import { registerLocale } from "react-datepicker";
import Head from "next/head";
import { ToastContainer } from "react-toastify";
import React, { useEffect, useState } from "react";
import { useForm } from "/hooks/useForm";
import Rut from "rutjs";
import Input2 from "../../components/Input2";
import Popup from "../../components/Popup/Popup";
import ModalEntities from "../../entities/ModalEntities";

registerLocale("es", es);

const SolicitudFormFields = {
  numeroDocumento: "",
  nombre: "",
  numeroContacto: "",
  correoElectronico: "",
  cantidadPasajeros: "",
  mensaje: "",
  tipoDocumento: "R",
  origen: "",
  destino: "",
  origenDesc: "",
  destinoDesc: "",
};

export default function Home(props) {
  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);
  const [origenes, setOrigenes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [actButton, setActButton] = useState(false);
  const {
    formState: solicitud,
    setSolicitud,
    onInputChange,
  } = useForm(SolicitudFormFields);

  const [isLoading, setIsLoading] = useState(false);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarPopupError, setMostrarPopupError] = useState(false);
  const { setStage } = props;

  const abrirPopup = () => {
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const abrirPopupError = () => {
    setMostrarPopupError(true);
  };
  const cerrarPopupError = () => {
    setMostrarPopupError(false);
  };

  const [error, setError] = useState({
    errorMsg: "",
    status: false,
  });

  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });

  const enviarSolicitud = async () => {
    let formStatus = validarForm();

    if (formStatus == true) {
      try {
        setIsLoading(true);
        const newSolicitud = {
          ...solicitud,
          origen: origen?.nombre,
          destino: destino?.nombre,
        };
        const res = await axios.post(
          "/api/parametros/guardar-solicitud-viajes-especiales",
          newSolicitud
        );

        if (res.data.status) {
          abrirPopup();
        } else {
          abrirPopupError();
        }
      } catch (e) {
        console.log(solicitud);
        setIsLoading(false);
        if (!!e.response) {
          setError({ status: true, errorMsg: "Ocurrió un error inesperado." });
          abrirPopupError();
        }
      } finally {
        setIsLoading(false);
        limpiarCampos();
      }
    }
    setActButton(false);
  };

  const limpiarCampos = () => {
    setSolicitud(SolicitudFormFields);
    setOrigen(null);
    setDestino(null);
  };

  const validarForm = () => {
    const { mensaje, ...fieldsToValidate } = solicitud;

    const values = Object.values(fieldsToValidate);

    const camposVacios = values.filter((v) => v == "");

    if (camposVacios.length > 0) {
      setError({
        status: true,
        errorMsg: `Todos los campos.son obligatorios.`,
      });
      return false;
    } else if (solicitud.cantidadPasajeros == 0) {
      setError({
        status: true,
        errorMsg: "Se requiere cantidad de pasajeros sea mayor a 0.",
      });
      return false;
    } else if (solicitud.cantidadPasajeros > 500) {
      setError({ status: true, errorMsg: "Cantidad maxima 500  pasajeros." });
      return false;
    } else {
      if (solicitud?.tipoDocumento == "R") {
        let rut = new Rut(solicitud.numeroDocumento);
        if (!rut?.isValid) {
          setError({
            status: true,
            errorMsg: "Se requiere ingresar un rut válido",
          });
          return false;
        }
      }
      return true;
    }
  };

  function setInputDocumento({ name, value }) {
    try {
      // Si el tipo de documento es RUT, validamos el formato
      if (
        solicitud.tipoDocumento === "R" &&
        name === "numeroDocumento" &&
        value !== ""
      ) {
        value = validarFormatoRut(value);
      }
      // Si es RUT, limpiamos caracteres no válidos
      if (
        solicitud.tipoDocumento === "R" &&
        name === "numeroDocumento" &&
        value !== ""
      ) {
        value = value.replace(/[^\dkK0-9.-]/g, ""); // Remueve caracteres no permitidos
        if (value.length > 12) return; // Limita la longitud del RUT
      }
      if (
        (solicitud.tipoDocumento === "D" || solicitud.tipoDocumento === "P") &&
        name === "numeroDocumento" &&
        value !== ""
      ) {
        value = value.replace(/[^\dkK0-9.-]/g, ""); // Remueve caracteres no permitidos
        if (value.length > 15) return; // Limita la longitud del DNI y PASAPORTE
      }
      // Actualizamos el estado del formulario
      onInputChange({ target: { name, value } });
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

  function validarFormatoRut(value) {
    try {
      if (value.length > 2) {
        let rut = new Rut(value);
        value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(true);
      }
      return value;
    } catch ({ message }) {
      console.error(`Error al validar formato de RUT [${message}]`);
      return value;
    }
  }

  async function getOrigins() {
    try {
      const res = await fetch("/api/ciudades");
      const ciudades = await res.json();
      setOrigenes(ciudades);
    } catch (error) {
      console.log(`Error al obtener ciudades [${error?.message}]`);
    }
  }

  async function getDestinos() {
    if (origen !== null) {
      try {
        let { data } = await axios.post("/api/destinos", {
          id_ciudad: origen.codigo,
        });
        setDestinos(data);
      } catch ({ message }) {
        console.error(`Error al obtener destinos [${message}]`);
      }
    }
  }

  useEffect(() => {
    getOrigins();
  }, []);

  useEffect(() => {
    (async () => await getDestinos())();
  }, [origen]);

  function cambiarOrigen(origenSeleccionado) {
    setDestino(null);
    setOrigen(origenSeleccionado);
  }

  function cambiarDestino(destinoSeleccionado) {
    setDestino(destinoSeleccionado);
  }

  useEffect(() => {
    if (origen != null) {
      solicitud.origen = origen.codigo;
      solicitud.origenDesc = origen.nombre;
    }
    (async () => await getOrigins())();
  }, [origen]);

  useEffect(() => {
    if (destino != null) {
      solicitud.destino = destino.codigo;
      solicitud.destinoDesc = destino.nombre;
    }
    (async () => await getDestinos())();
  }, [destino]);

  function retornaCiudadesSelect(arrayCiudades) {
    return arrayCiudades.map((ciudad) => {
      return {
        value: ciudad,
        label: ciudad?.nombre,
      };
    });
  }

  return (
    <Layout>
      <Head>
        <title>Boletos.com | Viaje Especiale</title>
      </Head>
      <div className={styles["home"]}>
        <div className="pullman-mas">
          <div className="container">
            <div className={`row py-4 ${styles["nav"]}`}>
              <span>Inicio &gt; Solicita Viajes Especiales</span>
            </div>
          </div>
        </div>
        <div
          className={`mb-5 container ${styles["bloque"]} "col-12 col-md-12"`}
        >
          <h1 className={styles["title-modify-data"]}>
            Solicita aquí tu viaje especial
          </h1>
          {alerta?.visible ? (
            <div className={"alert " + alerta?.type} role="alert">
              {alerta?.msg}
            </div>
          ) : (
            ""
          )}

          <div className={"row"}>
            <div className={styles["bloque-texto"]}>
              <p>
                Experimenta de un transporte exclusivo para ti, tu empresa,
                fundación o club deportivo. Contáctanos ahora para solicitar una
                cotización personalizada y descubre cómo podemos llevar tu
                experiencia de transporte al siguiente nivel.{" "}
                <strong>¡Esperamos tu mensaje!</strong>
              </p>
            </div>
          </div>
          <div className="row mt-2">
            {error.status ? (
              <div className="alert alert-danger" role="alert">
                {error?.errorMsg}
              </div>
            ) : (
              ""
            )}
          </div>

          <div className={styles["cuadro"]}>
            {/* nombre - rut*/}
            <div className={"row"}>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
                }
              >
                <label className={styles["title-data"]}>Nombre(s): </label>
                <input
                  type="text"
                  className={styles["input-data"]}
                  name="nombre"
                  placeholder="Ej: Emma Cortez"
                  value={solicitud.nombre}
                  onChange={onInputChange}
                  maxLength={30}
                />
              </div>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
                }
              >
                <div className={`${styles["rut"]} row`}>
                  <div className="col-3 col-sm-3 col-md-4">
                    <label className="contenedor">
                      RUT
                      <input
                        type="checkbox"
                        value={"R"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={solicitud?.tipoDocumento == "R" ? true : false}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <div className="col-8">
                    <label className="contenedor">
                      DNI / Pasaporte
                      <input
                        type="checkbox"
                        value={"P"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={solicitud?.tipoDocumento == "P" ? true : false}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={
                    solicitud?.tipoDocumento != "R"
                      ? "Ej. 111111111"
                      : "Ej. 11111111-1"
                  }
                  disabled={solicitud?.tipoDocumento != "" ? false : true}
                  className={styles["input-data"]}
                  name="numeroDocumento"
                  value={solicitud?.numeroDocumento}
                  onChange={(e) => setInputDocumento(e.target)}
                />
              </div>
            </div>

            {/* email - contacto*/}
            <div className={"row "}>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6 "
                }
              >
                <label className={styles["title-data"]}>
                  Correo electrónico:{" "}
                </label>
                <input
                  type="email"
                  value={solicitud?.correoElectronico}
                  className={styles["input-data"]}
                  name="correoElectronico"
                  placeholder="Ej: ejemplo@ejemplo.com"
                  onChange={onInputChange}
                  maxLength={50}
                />
              </div>
              {/* N° contacto */}
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
                }
              >
                <label className={styles["title-data"]}>N° de Contacto: </label>
                <input
                  type="text"
                  className={styles["input-data"]}
                  name="numeroContacto"
                  placeholder="Ej: +56 9 1111 1111"
                  value={solicitud?.numeroContacto}
                  onChange={onInputChange}
                  maxLength={12}
                />
              </div>
            </div>
            {/* Origen - Destino */}
            <div className={"row"}>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
                }
              >
                <label className={styles["title-data"]}>
                  Origen del viaje:{" "}
                </label>
                <Input2
                  type="text"
                  styles={"input-data "}
                  className={styles["input-data"]}
                  name="origen"
                  placeholder="Ej: Santiago"
                  items={retornaCiudadesSelect(origenes)}
                  selected={
                    origen &&
                    retornaCiudadesSelect([
                      origenes.find((i) => i.codigo == origen.codigo),
                    ])
                  }
                  setSelected={cambiarOrigen}
                  onChange={onInputChange}
                />
              </div>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
                }
              >
                <label className={styles["title-data"]}>
                  Destino del viaje:{" "}
                </label>
                <Input2
                  type="text"
                  className={styles["input-data"]}
                  name="destino"
                  placeholder="Ej: La Serena"
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
                  setSelected={cambiarDestino}
                  value={solicitud?.destino}
                  onChange={onInputChange}
                />
              </div>
            </div>

            {/* pasajeros */}
            <div className={`${styles.spaceAround} row`}>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
                }
              >
                <label className={styles["title-data"]}>
                  Cantidad de Pasajero:
                </label>
                <input
                  type="number"
                  className={styles["input-data"]}
                  name="cantidadPasajeros"
                  placeholder="Ej: 30"
                  value={solicitud?.cantidadPasajeros}
                  min={0}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,3}$/.test(value)) {
                      onInputChange(e);
                    }
                  }}
                />
              </div>
            </div>

            {/* mensaje */}
            <div className={"row"}>
              <div
                className={
                  "col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 col-xxl-12"
                }
              >
                <label className={styles["title-data"]}>Mensaje: </label>
                <textarea
                  className={styles["textarea-data-mensaje"]}
                  name="mensaje"
                  placeholder="Opcional"
                  maxLength={500}
                  value={solicitud?.mensaje}
                  onChange={onInputChange}
                />
              </div>
            </div>
            {isLoading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden"></span>
                </div>
              </div>
            ) : (
              ""
            )}
            {/* boton */}
            <div className={"row"}>
              <div className={"col-12"}>
                <div className={styles["grupo-campos"]}>
                  <div className={styles["button"]}>
                    <button
                      disabled={actButton}
                      className={
                        SolicitudFormFields
                          ? styles["button-search-coupon"]
                          : styles["button-search-coupon-disabled"]
                      }
                      onClick={(e) => {
                        setActButton(true);
                        enviarSolicitud();
                      }}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {mostrarPopup && (
          <Popup
            modalKey={ModalEntities.correo_viajes_special}
            modalClose={cerrarPopup}
            modalMethods={cerrarPopup}
          />
        )}
        {mostrarPopupError && (
          <Popup
            modalKey={ModalEntities.bad_viajes_special}
            modalClose={cerrarPopupError}
            modalMethods={cerrarPopupError}
          />
        )}
      </div>
      <ToastContainer />
      <Footer />
    </Layout>
  );
}
