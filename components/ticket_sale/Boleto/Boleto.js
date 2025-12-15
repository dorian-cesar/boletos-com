import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import styles from "./Boleto.module.css";
import Parrilla from "../Parrilla/Parrilla";
import { BuscarPlanillaVerticalOpenPaneDTO } from "dto/MapaAsientosDTO";

import ServiceDetail from "@components/sale/ServiceDetail";

import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import LoadingOverlay from "react-loading-overlay";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "@formkit/tempo";
import { useSelector } from "react-redux";
import CryptoJS from "crypto-js";

import { decryptData } from "utils/encrypt-data";
import LocalStorageEntities from "entities/LocalStorageEntities";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
const Boleto = (props) => {
  const buttonRef = useRef();
  const buttonCloseModal = useRef();
  const sitMapButtonRef = useRef();

  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowItinerary, setIsShowItinerary] = useState(false);
  const [itinerario, setItinerario] = useState([]);
  const [asientos1, setAsientos1] = useState([]);
  const [asientos2, setAsientos2] = useState([]);
  let { origen, destino } = useSelector((state) => state.compra);
  origen = origen?.toUpperCase();
  destino = destino?.toUpperCase();
  const [user, setUser] = useState();

  console.log("Boleto props:::", props);

  const handleOpenPane = () => {
    if (!user) {
      // buttonRef.current.click();
      // return;
    }

    setIsOpened(!isOpened);
  };

  useEffect(() => {
    const screenSize = screen.width;

    if (screenSize <= 425) {
      try {
        if (isOpened && sitMapButtonRef.current) {
          sitMapButtonRef.current.click();
        } else if (buttonCloseModal.current) {
          buttonCloseModal.current.click();
        }
      } catch (error) {}
    }
  }, [isOpened]);

  useEffect(() => {
    const user = decryptData(LocalStorageEntities.user_auth);
    setUser(user);
  }, []);

  useEffect(() => {
    if (!isOpened) return;
    const obtenerAsientos = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAsientos(props);
        setAsientos1(data.seats.firstFloor);
        setAsientos2(data.seats.secondFloor);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    obtenerAsientos();
  }, [isOpened]);

  // let duracion = dayjs(
  //   props.arrivalDate + " " + props.arrivalTime,
  //   "DD/MM/YYYY HH:mm"
  // ).diff(
  //   dayjs(props.date + " " + props.departureTime, "DD/MM/YYYY HH:mm"),
  //   "minute"
  // );

  // duracion = Math.floor(duracion / 60) + " hrs " + (duracion % 60) + " min";

  // function format24HourWithAmPm(timeStr) {
  //   const [hours, minutes] = timeStr.split(":").map(Number);
  //   const ampm = hours < 12 ? "AM" : "PM";
  //   return `${hours.toString().padStart(2, "0")}:${minutes
  //     .toString()
  //     .padStart(2, "0")} ${ampm}`;
  // }

  // let departureTime = format24HourWithAmPm(props.departureTime);

  const arrival = dayjs(
    `${props.arrivalDate} ${props.arrivalTime}`,
    "YYYY-MM-DD HH:mm"
  );

  const departure = dayjs(
    `${props.date} ${props.departureTime}`,
    "YYYY-MM-DD HH:mm"
  );

  let duracionMinutos = arrival.diff(departure, "minute");

  let duracion =
    Math.floor(duracionMinutos / 60) +
    " hrs " +
    (duracionMinutos % 60) +
    " min";

  function formatTo24HourWithAmPm(timeStr) {
    const date = dayjs(timeStr, ["HH:mm", "hh:mm A"]);
    const hours = date.hour();
    const minutes = date.minute();
    const ampm = hours < 12 ? "AM" : "PM";
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  }

  let formattedDeparture = formatTo24HourWithAmPm(props.departureTime);
  let formattedArrival = formatTo24HourWithAmPm(props.arrivalTime);

  // const clpFormat = new Intl.NumberFormat("es-CL", {
  //   style: "currency",
  //   currency: "CLP",
  // });

  const formatGuarani = (value) =>
    new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      currencyDisplay: "symbol",
    })
      .format(value)
      .replace(/Gs\.?|PYG/, "₲");

  async function fetchAsientos(parrilla) {
    const request = CryptoJS.AES.encrypt(
      JSON.stringify(new BuscarPlanillaVerticalOpenPaneDTO(parrilla)),
      secret
    );

    const response = await fetch(`/api/ticket_sale/mapa-asientos`, {
      method: "POST",
      body: JSON.stringify({ data: request.toString() }),
    });

    const data = await response.json();
    // console.log("data asientos:", data)
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || "Error al obtener el mapa de asientos");
    }
  }

  async function showItinerary() {
    if (itinerario.length === 0) {
      try {
        const { data } = await axios.post("/api/itinerario", {
          servicio: props.id,
        });
        setItinerario(data.object);
      } catch (error) {
        toast.error("Error al obtener el itinerario", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    }
    setIsShowItinerary(!isShowItinerary);
  }

  const handleCloseModal = () => {
    setIsOpened(false);
  };

  return (
    <section
      className={`container bg-white shadow-sm rounded-4 ${styles["info-container"]}`}
    >
      <button
        ref={sitMapButtonRef}
        type="button"
        className="d-none"
        data-bs-toggle="modal"
        data-bs-target={`#parrillaModal-${
          props.id
        }-${props.terminalOrigin.replace(
          /\s+/g,
          ""
        )}${props.terminalDestination.replace(/\s+/g, "")}`}
      ></button>
      <div
        className={`row justify-content-evenly ${
          isOpened ? styles["enabled-details"] : ""
        }`}
      >
        <div className="d-flex flex-col col px-md-2 py-md-0 p-md-3">
          <div className="d-flex flex-row justify-content-between pt-2 p-md-2">
            <img
              src="../img/icon/logos/logo-boletos.png"
              className="img-fluid p-1"
              width={150}
              height={25}
              alt="Logo Pullman Bus"
            />
            {props.mascota == "1" ? (
              <img src="img/icon/logos/paw-outline.svg" />
            ) : (
              <div></div>
            )}
          </div>
          <div className="row mt-0 mt-md-1 p-2 gap-md-0 justify-content-evenly">
            <div className="row col-12 col-md-4 align-items-center text-center">
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold mb-0 mb-md-2">
                  {formattedDeparture}
                </span>
              </div>
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold">
                  {props.stage === 0 ? origen : destino}
                </span>
                <span className={`${styles["travel-terminal-subtitle"]}`}>
                  {props.stage === 0
                    ? props.terminalOrigin
                    : props.terminalDestination}
                </span>
                {/* <span>{props.fechaSalida}</span> */}
              </div>
            </div>
            <div className="col-12 col-md-4 align-self-center d-flex flex-col text-center align-items-center p-0">
              <span
                className={`fw-normal d-block d-md-none ${styles["travel-duration"]}`}
              >
                Duración: {duracion}
              </span>
              <div className="d-none d-md-block">
                <p className="m-0 text-primary fs-6 fw-bold">Duración:</p>
                <span className={`${styles["travel-duration"]}`}>
                  {duracion}
                </span>
              </div>
            </div>
            <div className="row col-12 col-md-4 align-items-center text-center">
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold mb-0 mb-md-2">{formattedArrival}</span>
              </div>
              <div className="col-12 col-md-12 d-flex flex-col">
                <span className="fw-bold">
                  {props.stage === 0 ? destino : origen}
                </span>
                <span className={`${styles["travel-terminal-subtitle"]}`}>
                  {props.stage === 0
                    ? props.terminalDestination
                    : props.terminalOrigin}
                </span>
                {/* <span>{props.fechaLlegada}</span> */}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`col-5 col-sm-4 d-flex flex-col p-md-3 p-xl-2 justify-content-between justify-content-md-evenly ${styles["border-dashed"]} gap-3`}
        >
          <div
            className={`d-grid pt-5 p-0 p-md-2 justify-content-center fw-bold gap-2`}
          >
            {props.priceFirst &&
              (props.priceFirst ? (
                <div className="d-flex flex-col flex-md-row gap-md-2 text-center">
                  Piso 1 desde:{" "}
                  <b className="text-primary">
                    {formatGuarani(props.priceFirst)}
                  </b>
                </div>
              ) : (
                <div className="d-flex flex-col flex-md-row gap-md-2 text-center">
                  Piso 1 desde:{" "}
                  <b className="text-primary">${props.priceFirst}</b>
                </div>
              ))}
            {props.priceSecond &&
              (props.priceSecond ? (
                <div className="d-flex flex-col flex-md-row gap-md-2 text-center">
                  Piso 2 desde:{" "}
                  <b className="text-primary">
                    {formatGuarani(props.priceSecond)}
                  </b>
                </div>
              ) : (
                <div className="d-flex flex-col flex-md-row gap-md-2 text-center">
                  Piso 2 desde:{" "}
                  <b className="text-primary">${props.priceSecond}</b>
                </div>
              ))}
          </div>
          <div className="d-grid pb-2 pb-md-0">
            <button
              type="button"
              className="btn btn-primary border-0 rounded-3"
              onClick={handleOpenPane}
            >
              Seleccionar Asiento
            </button>
          </div>
        </div>
      </div>
      <LoadingOverlay
        active={isLoading}
        spinner
        text="Espere un momento..."
        className={`${styles["grill-detail"]}`}
      >
        <div className={`${styles["grill-detail"]}`}>
          <Parrilla
            isShowParrilla={isOpened}
            thisParrilla={props.thisParrilla}
            setIsShowParrilla={setIsOpened}
            asientos1={asientos1}
            asientos2={asientos2}
            k={props.k}
            parrilla={props}
            stage={props.stage}
            setParrilla={props.setParrilla}
            asientos_selected={props.asientos_selected}
            setIsOpened={setIsOpened}
            setPasaje={props.setPasaje}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setModalMab={props.setModalMab}
            buttonCloseModalRef={buttonCloseModal}
          />
        </div>
      </LoadingOverlay>
      <div
        className="modal fade"
        id={`parrillaModal-${props.id}-${props.terminalOrigin.replace(
          /\s+/g,
          ""
        )}${props.terminalDestination.replace(/\s+/g, "")}`}
        tabIndex={-1}
        aria-labelledby="parrillaModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content overflow-y-scroll overflow-x-hidden">
            <div className="modal-header border border-0">
              <button
                ref={buttonCloseModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleCloseModal}
              ></button>
            </div>
            <LoadingOverlay
              active={isLoading}
              spinner
              text="Espere un momento..."
              className={styles["grill-detail"]}
            >
              <div className={styles["grill-detail"]}>
                <Parrilla
                  isShowParrilla={isOpened}
                  thisParrilla={props.thisParrilla}
                  setIsShowParrilla={setIsOpened}
                  asientos1={asientos1}
                  asientos2={asientos2}
                  k={props.k}
                  parrilla={props}
                  stage={props.stage}
                  setParrilla={props.setParrilla}
                  asientos_selected={props.asientos_selected}
                  setIsOpened={setIsOpened}
                  setPasaje={props.setPasaje}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setModalMab={props.setModalMab}
                  buttonCloseModalRef={buttonCloseModal}
                />
              </div>
            </LoadingOverlay>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Boleto;
