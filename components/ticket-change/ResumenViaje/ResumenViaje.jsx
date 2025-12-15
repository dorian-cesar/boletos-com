import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ResumenViaje.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { format } from "@formkit/tempo";
import {
  newIsValidPasajero,
  newIsValidComprador,
} from "../../../utils/user-pasajero";
import { toast } from "react-toastify";
import {
  agregarCambio,
  agregarResponseCambio,
} from "store/usuario/cambio-boleto-slice";
import {
  ListaCarritoDTO,
  PasajeroListaCarritoDTO,
} from "../../../dto/PasajesDTO";
import Popup from "../../Popup/Popup";
import ModalEntities from "../../../entities/ModalEntities";
import LocalStorageEntities from "entities/LocalStorageEntities";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { encryptDataNoTime, decryptData } from "utils/encrypt-data.js";

import CryptoJS from "crypto-js";

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

export const ResumenViaje = (props) => {
  const buttonRef = useRef();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const { boletoValido, medioPago } = props;
  const [loginOculto, setLoginOculto] = useState(true);
  const router = useRouter();
  const [resumen, setResumen] = useState({
    carro: {},
  });
  const [popup, setPopup] = useState({
    modalKey: "",
    modalClose: "",
    modalMethods: "",
    modalTitleButton: "",
  });

  useEffect(() => {
    const localUser = decryptData(LocalStorageEntities.user_auth);
    setUser(localUser);
  }, []);

  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });

  const [saldoMonederoVirtual, setSaldoMonederoVirtual] = useState(
    clpFormat.format(0)
  );
  const [totalPagar, setTotalPagar] = useState(0);
  const [payment, setPayment] = useState({});
  const payment_form = useRef(null);
  const [terminos, setTerminos] = useState(false);
  const [sendNews, setSendNews] = useState(true);
  const [valorCobrar, setValorCobrar] = useState(0);

  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || [];
  const informacionAgrupada =
    useSelector((state) => state.compra?.informacionAgrupada) || [];
  const datosComprador =
    useSelector((state) => state.compra?.datosComprador) || {};
  const dispatch = useDispatch();

  const obtenerInformacion = () => {
    {
      Object.entries(carroCompras).map(([key, value]) => {
        if (value.ida.length > 0) {
          const fechaIdaFormateada = value.ida[0].fechaSalida.split("/");
          const fechaIda = new Date(
            `${fechaIdaFormateada[1]}/${fechaIdaFormateada[0]}/${fechaIdaFormateada[2]}`
          );

          const idaNombre = `Salida, ${format(fechaIda, "ddd D MMM")}`;
          const keys = Object.keys(value);

          let vueltaNombre = "";
          if (keys.length >= 2) {
            const fechaVueltaFormateada =
              value.vuelta[0].fechaSalida.split("/");
            const fechaVuelta = new Date(
              `${fechaVueltaFormateada[1]}/${fechaVueltaFormateada[0]}/${fechaVueltaFormateada[2]}`
            );
            vueltaNombre = `Vuelta, ${format(fechaVuelta, "ddd D MMM")}`;
          }

          const idaList = value.ida || [];
          const vueltaList = value.vuelta || [];

          let carro_temp = { ...resumen };
          const datos = [];

          let carritoIda = {
            titulo: idaNombre,
            detalle: [],
          };
          let carritoVuelta = {
            titulo: vueltaNombre,
            detalle: [],
          };

          Object.entries(idaList).map(([key, value]) => {
            const datos = {
              origen: value.terminalOrigen,
              destino: value.terminalDestino,
              hora: value.horaSalida,
              horaLlegada: value.horaLlegada,
              cantidadAsientos: 0,
              total: 0,
            };

            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });

            datos.total = clpFormat.format(datos.total);

            carritoIda.detalle.push(datos);
          });

          Object.entries(vueltaList).map(([key, value]) => {
            const datos = {
              origen: value.terminalOrigen,
              destino: value.terminalDestino,
              hora: value.horaSalida,
              horaLlegada: value.horaLlegada,
              cantidadAsientos: 0,
              total: 0,
            };

            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });

            datos.total = clpFormat.format(datos.total);

            carritoVuelta.detalle.push(datos);
          });
          datos.push(carritoIda);
          datos.push(carritoVuelta);
          carro_temp.carro["lista"] = datos;
          setResumen(carro_temp);
        }
      });
    }
  };

  async function sendToPayment() {
    try {
      if (valorCobrar < 0) {
        abrirPopup();
      }

      if (valorCobrar === 0) {
        finalizarCambio();
      }

      if (valorCobrar > 0) {
        finalizarCambioTBK();
      }
    } catch ({ response }) {}
  }

  async function finalizarCambio() {
    try {
      cerrarPopup();
      let validator = isPaymentValid();
      if (!validator.valid) {
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }
      validator = newIsValidComprador(datosComprador);
      if (!validator.valid) {
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      if (!terminos) {
        toast.error("Debe aceptar los términos y condiciones", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }
      let fechaServicioParse = formatearFecha(
        informacionAgrupada[0]?.fechaServicio
      );
      let fechaServicioSalidarParse =
        formatearFecha(informacionAgrupada[0]?.fechaSalida) +
        informacionAgrupada[0]?.horaSalida.replace(":", "");
      let cambiarBoleto = {
        boleto: boletoValido?.boleto,
        idSistema: 1,
        idIntegrador: 1000,
        asiento: informacionAgrupada[0]?.asientos[0]?.asiento,
        clase: informacionAgrupada[0]?.asientos[0]?.claseBus,
        idServicio: informacionAgrupada[0]?.idServicio,
        fechaServicio: fechaServicioParse,
        fechaSalida: fechaServicioSalidarParse,
        piso: informacionAgrupada[0]?.asientos[0]?.piso,
        email: datosComprador.email,
        destino: informacionAgrupada[0]?.idTerminalDestino,
        idOrigen: informacionAgrupada[0]?.idTerminalOrigen,
        idDestino: informacionAgrupada[0]?.idTerminalDestino,
        fechaLlegada: informacionAgrupada[0]?.fechaLlegada,
        horaLlegada: informacionAgrupada[0]?.horaLlegada,
        valorCambio: valorCobrar,
        rut: informacionAgrupada[0]?.asientos[0]?.rut
          .replace(".", "")
          .replace(".", ""),
        tipoDocumento: informacionAgrupada[0]?.asientos[0]?.tipoDocumento,
        valorBoletoCambio: totalPagar,
      };

      if (!isPaymentValid()) return;
      let data;
      try {
        const response = await axios.post(
          "/api/ticket_sale/cambiar-boleto",
          cambiarBoleto
        );

        data = {
          status: true,
          object: response?.data?.object || response?.data,
        };
      } catch (error) {
        data = {
          status: false,
          message:
            error?.response?.data?.object.resultado.mensaje ||
            "Error al cambiar el boleto",
        };
      }

      if (data.status) {
        dispatch(agregarCambio(data.object));
        const url = `/respuesta-transaccion-cambio/${data.object.voucher.boleto}`;
        router.push(url);
      } else {
        toast.warn(data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    } catch (error) {}
  }

  async function finalizarCambioTBK() {
    try {
      cerrarPopup();
      let validator = isPaymentValid();
      if (!validator.valid) {
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }
      validator = newIsValidComprador(datosComprador);
      if (!validator.valid) {
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      if (!medioPago) {
        toast.error("Debe seleccionar un medio de pago", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      if (!terminos) {
        toast.error("Debe aceptar los términos y condiciones", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }
      let fechaServicioParse = formatearFecha(
        informacionAgrupada[0]?.fechaServicio
      );
      let fechaServicioSalidarParse =
        formatearFecha(informacionAgrupada[0]?.fechaSalida) +
        informacionAgrupada[0]?.horaSalida.replace(":", "");
      let cambiarBoleto = {
        boleto: boletoValido?.boleto,
        idSistema: 1,
        idIntegrador: 1000,
        asiento: informacionAgrupada[0]?.asientos[0]?.asiento,
        clase: informacionAgrupada[0]?.asientos[0]?.claseBus,
        idServicio: informacionAgrupada[0]?.idServicio,
        fechaServicio: fechaServicioParse,
        fechaSalida: fechaServicioSalidarParse,
        piso: informacionAgrupada[0]?.asientos[0]?.piso,
        email: datosComprador.email,
        destino: informacionAgrupada[0]?.idTerminalDestino,
        idOrigen: informacionAgrupada[0]?.idTerminalOrigen,
        idDestino: informacionAgrupada[0]?.idTerminalDestino,
        fechaLlegada: informacionAgrupada[0]?.fechaLlegada,
        horaLlegada: informacionAgrupada[0]?.horaLlegada,
        valorCambio: valorCobrar,
        rut: informacionAgrupada[0]?.asientos[0]?.rut
          .replace(".", "")
          .replace(".", ""),
        tipoDocumento: informacionAgrupada[0]?.asientos[0]?.tipoDocumento,
        valorBoletoCambio: totalPagar,
      };

      encryptDataNoTime(cambiarBoleto, "CHN_TKT");

      if (!isPaymentValid()) return;
      await pagarWebPay(cambiarBoleto);
    } catch (error) {}
  }

  async function pagarWebPay(canjeBoleto) {
    let resumenCompra = {
      medioDePago: medioPago,
      montoTotal: valorCobrar,
      idSistema: 1,
      integrador: 1000,
      datosComprador: datosComprador,
      listaCarrito: [],
      canjeBoleto,
    };

    try {
      const request = CryptoJS.AES.encrypt(
        JSON.stringify(resumenCompra),
        secret
      );

      const response = await axios.post(
        "/api/ticket_sale/guardar-transaccion-cambio",
        { data: request.toString() }
      );

      setPayment({
        ...payment,
        url: response?.data.url,
        token: response?.data.token,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error al completar cambio de boleto",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
    }
  }

  function isPaymentValid() {
    try {
      let validator;
      informacionAgrupada.forEach((servicio) => {
        servicio.asientos.forEach((asiento) => {
          if (!validator || validator.valid) {
            validator = newIsValidPasajero(asiento);
          }
        });
      });
      return validator;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  function formatearFecha(fecha) {
    const [dia, mes, año] = fecha.split("/");
    const mesConCeros = mes.padStart(2, "0");
    const diaConCeros = dia.padStart(2, "0");
    const fechaFormateada = `${año}${mesConCeros}${diaConCeros}`;
    return fechaFormateada;
  }

  useEffect(() => {
    obtenerInformacion();
  }, []);

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  useEffect(() => {
    let total = 0;
    Object.entries(carroCompras).map(([key, value]) => {
      const idaList = value.ida || [];
      const vueltaList = value.vuelta || [];

      Object.entries(idaList).map(([key, value]) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });

      Object.entries(vueltaList).map(([key, value]) => {
        value.asientos.forEach((element) => {
          total += element.valorAsiento;
        });
      });
    });

    setTotalPagar(total);
  }, [resumen]);

  useEffect(() => {
    setValorCobrar(Number(totalPagar) - Number(boletoValido["valor"]));
    props.setTotal(Number(totalPagar) - Number(boletoValido["valor"]));
  }, [resumen]);

  const abrirPopup = () => {
    if (user) {
      let modal = { ...popup };
      modal.modalClose = cerrarPopup;
      modal.modalTitleButton = "Continuar";
      modal.modalMethods = finalizarCambio;
      modal.modalKey = ModalEntities.exchange_return_information_login;
      setPopup(modal);
    } else {
      setValorCobrar(0);
      finalizarCambio();
      return;
    }
    setMostrarPopup(true);
  };
  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const iniciarSesion = () => {
    buttonRef.current.click();
    cerrarPopup();
  };

  return (
    <div className={styles["resumen-container"]}>
      <h3>Resumen del viaje</h3>
      <div className={styles["contenedor-servicios"]}>
        <div className={styles["servicio-ida"]}>
          {Array.isArray(resumen.carro.lista) &&
            resumen.carro.lista.map((element) => (
              <div className={styles["servicio-ida"]} key={element.titulo}>
                <b className={styles["titulo-servicio"]}>{element.titulo}</b>
                <div className={styles["detalle-container"]}>
                  {Array.isArray(element.detalle) &&
                    element.detalle.map((detalleItem, index) => (
                      <div key={index} className={styles["detalle-item"]}>
                        <ul>
                          <li>
                            <div>{detalleItem.origen}</div>
                            <div>{detalleItem.hora}</div>
                          </li>
                          <li>
                            <div>{detalleItem.destino}</div>
                            <div>{detalleItem.horaLlegada}</div>
                          </li>
                        </ul>
                        <div className={styles["resumen-servicio"]}>
                          <span>
                            Cantidad de Asientos: {detalleItem.cantidadAsientos}
                          </span>
                          <b>{detalleItem.total}</b>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
        <div className={styles["total-container"]}>
          <div className={styles["contanedor-total-pagar"]}>
            <span className={styles["valor-boleto"]}>
              Valor boleto anterior:{" "}
              {clpFormat.format(Number(boletoValido["valor"]))}
            </span>
            <span className={styles["valor-boleto"]}>
              Valor boleto nuevo: {clpFormat.format(totalPagar)}
            </span>
            <span className={styles["total-pagar"]}>
              {valorCobrar < 0 ? "Saldo a favor " : "Total a cancelar "}
              {clpFormat.format(valorCobrar)}
            </span>
          </div>
          <div className={styles["contenedor-checks"]}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value={terminos}
                onChange={() => setTerminos(!terminos)}
                id="flexCheckTerms"
              />
              <label className="form-check-label" htmlFor="flexCheckTerms">
                Acepto los términos y condiciones de la compra
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value={sendNews}
                onChange={() => setSendNews(!sendNews)}
                id="flexCheckNews"
              />
              <label className="form-check-label" htmlFor="flexCheckNews">
                Me gustaría recibir noticias, actualizaciones o información de
                Boletos.com
              </label>
            </div>
          </div>
        </div>
        <div className={styles["contenedor-boton-pagar"]}>
          <button
            className={styles["boton-pagar"]}
            onClick={(e) => {
              e.preventDefault();
              sendToPayment();
            }}
          >
            {valorCobrar <= 0 ? "Continuar" : "Pagar"}
          </button>
          <form
            ref={payment_form}
            style={{ display: "none" }}
            method="POST"
            action={payment.url}
          >
            <input name="TBK_TOKEN" value={payment.token} />
          </form>
        </div>

        <div
          className={styles["total-pagar"]}
          ref={buttonRef}
          data-bs-toggle="modal"
          data-bs-target="#loginModal"
        ></div>
      </div>
      {mostrarPopup && (
        <Popup
          modalKey={popup.modalKey}
          modalClose={popup.modalClose}
          modalMethods={popup.modalMethods}
          modalTitleButton={popup.modalTitleButton}
        />
      )}
    </div>
  );
};
