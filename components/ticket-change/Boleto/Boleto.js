import dayjs from "dayjs";
import { useState } from "react";
import styles from "./Boleto.module.css";
import Parrilla from "../Parrilla/Parrilla";

import "swiper/css";
import "swiper/css/effect-flip";
import "swiper/css/pagination";
import "swiper/css/navigation";
import LoadingOverlay from "react-loading-overlay";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "@formkit/tempo";

var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const Boleto = (props) => {
  const { cantidadIda, setCantidadIda } = props;
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowItinerary, setIsShowItinerary] = useState(false);
  const [itinerario, setItinerario] = useState([]);

  let duracion = dayjs(
    props.fechaLlegada + " " + props.horaLlegada,
    "DD/MM/YYYY HH:mm"
  ).diff(
    dayjs(props.fechaSalida + " " + props.horaSalida, "DD/MM/YYYY HH:mm"),
    "minute"
  );

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  duracion = Math.floor(duracion / 60) + " hrs " + (duracion % 60) + " min";

  async function showItinerary() {
    if (itinerario.length === 0) {
      try {
        const { data } = await axios.post("/api/itinerario", {
          servicio: props.idServicio,
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

  return (
    <>
      <section className={styles["container-ticket"]}>
        <input
          type="checkbox"
          className={styles["checkbox-open-pane"]}
          checked={isOpened}
          readOnly
        />
        <input
          type="checkbox"
          className={styles["checkbox-show-itinerary"]}
          checked={isShowItinerary}
          readOnly
        />
        <div className={styles["flip-box"]}>
          <div className={styles["flip-box-inner"]}>
            <div className={`${styles["ticket"]} ${styles["flip-box-front"]}`}>
              <input type="checkbox" checked={isOpened} readOnly />
              <div className={styles["ticket-details"]}>
                <div className={styles["ticket-details__header"]}>
                  <img
                    src="img/logo-pullmanbus.svg"
                    width={150}
                    height={25}
                    alt="Logo Boletos.com"
                  />
                  {props.mascota == "1" && (
                    <img src="img/icon/logos/paw-outline.svg" />
                  )}
                </div>
                <div className={styles["ticket-details__travel"]}>
                  <div className={styles["ticket-details__travel-detail"]}>
                    <span className={styles["bold"]}>{props.horaSalida}</span>
                    <span className={styles["bold"]}>
                      {props.terminalSalida}
                    </span>
                    <span>{props.fechaSalida}</span>
                  </div>
                  <div className={styles["ticket-details__travel-detail"]}>
                    <span>Duración</span>
                    <span className={styles["bold"]}>{duracion}</span>
                    {/* <a className={styles['link']} onClick={() => showItinerary()}>Itinerario</a> */}
                  </div>
                  <div className={styles["ticket-details__travel-detail"]}>
                    <span className={styles["bold"]}>{props.horaLlegada}</span>
                    <span className={styles["bold"]}>
                      {props.terminalDestino}
                    </span>
                    <span>{props.fechaLlegada}</span>
                  </div>
                </div>
              </div>
              <div className={styles["ticket-price"]}>
                <div></div>
                <div className={styles["ticket-price__detail"]}>
                  <div className={styles["ticket-price__price-detail"]}>
                    {props.tarifaPrimerPisoInternet &&
                      (props.tarifaValor &&
                      props.tarifaValor.primerPisoInternet ? (
                        <span>
                          <b>Piso 1 desde: </b>{" "}
                          {clpFormat.format(
                            props.tarifaValor.primerPisoInternet
                          )}
                        </span>
                      ) : (
                        <span>
                          <b>Piso 1 desde: </b> $
                          {props.tarifaPrimerPisoInternet}
                        </span>
                      ))}
                    {props.tarifaSegundoPisoInternet &&
                      (props.tarifaValor &&
                      props.tarifaValor.segundoPisoInternet ? (
                        <span>
                          <b>Piso 2 desde: </b>{" "}
                          {clpFormat.format(
                            props.tarifaValor.segundoPisoInternet
                          )}
                        </span>
                      ) : (
                        <span>
                          <b>Piso 2 desde: </b> $
                          {props.tarifaSegundoPisoInternet}
                        </span>
                      ))}
                  </div>
                </div>
                <button onClick={() => setIsOpened(!isOpened)}>Comprar</button>
              </div>
              <div className={styles["animated-logo"]}>
                <img src="img/icon-barra.svg" />
              </div>
            </div>
            <div className={`${styles["ticket"]} ${styles["flip-box-back"]}`}>
              <div className={styles["itinerario"]}>
                <div className={styles["cabecera-itinerario"]}>
                  <span>Itinerario</span>
                  <img
                    src="img/close.svg"
                    className={styles["cross"]}
                    onClick={() => showItinerary()}
                  />
                </div>
                <div className={styles["contenedor-itinerario"]}>
                  <ul>
                    {itinerario.length > 0 &&
                      itinerario.map((data) => {
                        const horaSalida = data.horaSalidaServicio;
                        const hour =
                          horaSalida.slice(0, 2) + ":" + horaSalida.slice(2);
                        return (
                          <li key={data.id}>
                            <div className={styles["circle"]}></div>
                            <b>{hour}</b>
                            <span>{data.nombreTerminal}</span>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoadingOverlay
          active={isLoading}
          spinner
          text="Tomando asiento..."
          className={styles["grill-detail"]}
        >
          <div className={styles["grill-detail"]}>
            <Parrilla
              isShowParrilla={isOpened}
              thisParrilla={props.thisParrilla}
              setIsShowParrilla={setIsOpened}
              asientos1={props.asientos1}
              asientos2={props.asientos2}
              k={props.k}
              parrilla={props}
              stage={props.stage}
              setParrilla={props.setParrilla}
              asientos_selected={props.asientos_selected}
              setIsOpened={setIsOpened}
              setPasaje={props.setPasaje}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              cantidadIda={cantidadIda}
              setCantidadIda={setCantidadIda}
            />
          </div>
        </LoadingOverlay>
      </section>
    </>
  );
};
export default Boleto;
