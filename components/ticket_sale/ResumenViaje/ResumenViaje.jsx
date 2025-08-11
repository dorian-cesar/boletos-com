import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import styles from "./ResumenViaje.module.css";
import { useDispatch, useSelector } from "react-redux";
import { format } from "@formkit/tempo";
import {
  newIsValidPasajeroCompra,
  newIsValidComprador,
} from "../../../utils/user-pasajero";
import { toast } from "react-toastify";
import {
  ListaCarritoDTO,
  PasajeroListaCarritoDTO,
} from "../../../dto/PasajesDTO";
import {
  agregarCompraCuponera,
  limpiarListaCarrito,
} from "store/usuario/compra-slice";
import { useRouter } from "next/router";
import LocalStorageEntities from "entities/LocalStorageEntities";
import { decryptData, encryptData } from "utils/encrypt-data";

import CryptoJS from "crypto-js";

import { generateToken } from "utils/jwt-auth";

import { sendGTMEvent } from "@next/third-parties/google";

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

export const ResumenViaje = (props) => {
  const { origen, destino } = useSelector((state) => state.compra);
  const {
    codigoCuponera,
    setCodigoCuponera,
    descuentoConvenio,
    setDescuentoConvenio,
    convenio,
    setConvenio,
    requestConvenio,
    setRequestConvenio,
  } = props;
  const [resumen, setResumen] = useState({
    carro: {},
  });

  const router = useRouter();
  const dispatch = useDispatch();

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

  const [saldoMonederoVirtual, setSaldoMonederoVirtual] = useState(0);

  const [totalPagar, setTotalPagar] = useState(0);
  const [payment, setPayment] = useState({});
  const payment_form = useRef(null);
  const [terminos, setTerminos] = useState(false);
  const [sendNews, setSendNews] = useState(false);
  const [user, setUser] = useState({});
  const [usaWallet, setUsaWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const carroCompras = useSelector((state) => state.compra?.listaCarrito) || {};
  const informacionAgrupada =
    useSelector((state) => state.compra?.informacionAgrupada) || [];
  const datosComprador =
    useSelector((state) => state.compra?.datosComprador) || {};
  const medioPago = useSelector((state) => state.compra.medioPago);
  const [soloLectura, setSoloLectura] = useState(false);
  const [montoDescuentoConvenio, setMontoDescuentoConvenio] = useState(0);
  const [totalOriginal, setTotalOriginal] = useState(0);

  useEffect(() => {
    if (props.soloLectura) {
      setSoloLectura(props.soloLectura);
    }
  }, []);

  useEffect(() => {
    const localUser = decryptData(LocalStorageEntities.user_auth);
    setUser(localUser);
  }, []);

  // useEffect(() => {
  //   actualizarSaldoWallet().then();
  // }, [user]);

  const agregarEventoTagManager = () => {
    try {
      sendGTMEvent({
        event: "add_payment_info",
        value: {
          currency: "CLP",
          value: totalPagar,
          coupon: descuentoConvenio ? descuentoConvenio.id : null,
          payment_type: medioPago,
        },
      });
    } catch (error) {}
  };

  // async function actualizarSaldoWallet() {
  //   if (!!user) {
  //     try {
  //       const response = await axios.post(
  //         "/api/user/consulta-saldo-wallet",
  //         user
  //       );
  //       const saldo = response.data.object.saldoContable || 0;
  //       setSaldoMonederoVirtual(saldo);
  //     } catch (error) {
  //       // console.error("Error al actualizar el saldo de la billetera:", error);
  //     }
  //   }
  // }

  const obtenerInformacion = () => {
    {
      let carritoIda = {
        titulo: "",
        detalle: [],
      };
      let carritoVuelta = {
        titulo: "",
        detalle: [],
      };

      let idaNombre;
      let vueltaNombre;

      Object.keys(carroCompras).forEach((key) => {
        const compra = carroCompras[key];
        if (compra.ida && compra.ida.length > 0) {
          const [year, month, day] = compra.ida[0].date.split("-").map(Number);
          const fechaIda = new Date(year, month - 1, day);
          const idaList = compra.ida;
          idaList.forEach((value) => {
            const datos = {
              origen: `${origen} (${value.terminalOrigin})`,
              destino: `${destino} (${value.terminalDestination})`,
              hora: value.departureTime,
              horaLlegada: value.arrivalTime,
              valorAsientos: [],
              cantidadAsientos: 0,
              total: 0,
              asientosEquipaje: [],
            };

            // const informacionPasajeros = informacionAgrupada.find(
            //   (servicio) =>
            //     servicio?.idServicio === value?.idServicio &&
            //     servicio?.idTerminalOrigen === value?.idTerminalOrigen &&
            //     servicio?.idTerminalDestino === value?.idTerminalDestino &&
            //     servicio?.horaSalida === value?.horaSalida
            // );

            // if (informacionPasajeros) {
            //   const asientos = informacionPasajeros?.asientos;
            //   if (asientos && asientos.length > 0) {
            //     asientos.forEach((asiento, indexAsiento) => {
            //       if (
            //         asiento?.cantidadEquipaje &&
            //         asiento.cantidadEquipaje > 0
            //       ) {
            //         datos.asientosEquipaje.push(
            //           `Pasajero ${indexAsiento + 1} - Asiento ${
            //             asiento?.asiento
            //           } x ${asiento?.cantidadEquipaje}`
            //         );
            //       }
            //     });
            //   }
            // }

            datos.valorAsientos = value.asientos.map((a) => ({
              num: a.asiento,
              valorAsiento: formatGuarani(a.valorAsiento),
            }));

            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });

            idaNombre = `Salida, ${format(fechaIda, "ddd D MMM", "es")}`;
            datos.total = formatGuarani(datos.total);
            carritoIda.detalle.push(datos);
          });
        }

        if (compra.vuelta && compra.vuelta.length > 0) {
          const [year, month, day] = compra.vuelta[0].date
            .split("-")
            .map(Number);
          const fechaVuelta = new Date(year, month - 1, day);
          const vueltaList = compra.vuelta;
          vueltaList.forEach((value) => {
            const datos = {
              origen: `${destino} (${value.terminalDestination})`,
              destino: `${origen} (${value.terminalOrigin})`,
              hora: value.departureTime,
              horaLlegada: value.arrivalTime,
              valorAsientos: [],
              cantidadAsientos: 0,
              total: 0,
              asientosEquipaje: [],
            };

            // const informacionPasajeros = informacionAgrupada.find(
            //   (servicio) =>
            //     servicio?.idServicio === value?.idServicio &&
            //     servicio?.idTerminalOrigen === value?.idTerminalOrigen &&
            //     servicio?.idTerminalDestino === value?.idTerminalDestino &&
            //     servicio?.horaSalida === value?.horaSalida
            // );

            // if (informacionPasajeros) {
            //   const asientos = informacionPasajeros?.asientos;
            //   if (asientos && asientos.length > 0) {
            //     asientos.forEach((asiento, indexAsiento) => {
            //       if (
            //         asiento?.cantidadEquipaje &&
            //         asiento.cantidadEquipaje > 0
            //       ) {
            //         datos.asientosEquipaje.push(
            //           `Pasajero ${indexAsiento + 1} - Asiento ${
            //             asiento?.asiento
            //           } x ${asiento?.cantidadEquipaje}`
            //         );
            //       }
            //     });
            //   }
            // }

            datos.valorAsientos = value.asientos.map((a) => ({
              num: a.asiento,
              valorAsiento: formatGuarani(a.valorAsiento),
            }));

            value.asientos.forEach((element) => {
              datos.cantidadAsientos += 1;
              datos.total += element.valorAsiento;
            });

            datos.total = formatGuarani(datos.total);
            carritoVuelta.detalle.push(datos);
            vueltaNombre = `Vuelta, ${format(fechaVuelta, "ddd D MMM", "es")}`;
          });
        }
      });

      const datos = [];
      carritoIda.titulo = idaNombre;
      carritoVuelta.titulo = vueltaNombre;
      datos.push(carritoIda);
      datos.push(carritoVuelta);
      const carro_temp = { ...resumen };
      carro_temp.carro["lista"] = datos;
      setResumen(carro_temp);
    }
  };

  async function sendToPayment() {
    try {
      let validator = isPaymentValid();

      if (!validator.valid) {
        setIsLoading(false);
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      validator = newIsValidComprador(datosComprador);

      if (!validator.valid) {
        setIsLoading(false);
        toast.error(validator.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      if (!medioPago) {
        setIsLoading(false);
        toast.error("Debe seleccionar un medio de pago", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      if (!terminos) {
        setIsLoading(false);
        toast.error("Debe aceptar los términos y condiciones", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
        return;
      }

      let montoUsoWallet = 0;

      if (medioPago !== "CUP" && usaWallet) {
        await actualizarSaldoWallet();
        const valorNuevo = totalPagar - saldoMonederoVirtual;
        montoUsoWallet = valorNuevo < 0 ? totalPagar : saldoMonederoVirtual;
      }

      let resumenCompra = {
        medioDePago: medioPago,
        montoTotal: totalPagar - montoUsoWallet,
        idSistema: 1,
        idIntegrador: 1000,
        datosComprador: {
          ...datosComprador,
          usaConvenio: descuentoConvenio ? true : false,
        },
        montoUsoWallet,
        listaCarrito: [],
      };

      // console.log("resumen compra:", resumenCompra);

      let restoUsoWallet = montoUsoWallet;

      informacionAgrupada.forEach((servicio) => {
        const carrito = new ListaCarritoDTO(servicio, servicio.asientos[0]);
        console.log("ListaCarritoDTO", servicio);
        console.log("aca se agregan props para enviar, como email");

        servicio.asientos.forEach((asiento, index) => {
          const nuevoAsiento = {
            ...asiento,
            precio: asiento.valorAsiento,
            email: datosComprador?.email || "",
          };

          if (medioPago !== "CUP" && usaWallet && restoUsoWallet > 0) {
            const montoUsar = Math.min(
              restoUsoWallet,
              nuevoAsiento.valorAsiento
            );
            nuevoAsiento.precio = Math.max(
              nuevoAsiento.valorAsiento - montoUsar,
              0
            );
            restoUsoWallet -= montoUsar;
          }

          if (descuentoConvenio) {
            const montoDescuento = Math.round(
              (nuevoAsiento.valorAsiento * descuentoConvenio.descuento) / 100
            );
            const montoUsar = Math.round(
              montoDescuento,
              nuevoAsiento.valorAsiento
            );
            nuevoAsiento.precio = Math.round(
              Math.max(nuevoAsiento.valorAsiento - montoUsar, 0)
            );
            nuevoAsiento.descuento = Math.round(montoDescuento);
            nuevoAsiento.convenio = convenio;
            nuevoAsiento.datoConvenio = requestConvenio?.atributo;
          }

          if (descuentoConvenio?.id === "COPEC") {
            nuevoAsiento.datoConvenio = requestConvenio?.atributo;
          }
          // console.log("nuevoAsiento:", nuevoAsiento);
          carrito.pasajeros.push(new PasajeroListaCarritoDTO(nuevoAsiento));
          // console.log("carrito.pasajeros:", carrito.pasajeros);
        });

        resumenCompra.listaCarrito.push(carrito);
        // console.log("resumenCompra.listaCarrito:", resumenCompra.listaCarrito);
      });

      agregarEventoTagManager();

      if (medioPago === "CUP") {
        if (resumenCompra.listaCarrito.length > 1) {
          toast.error(
            "No puede usar código cuponera cuando tiene más de un servicio en el carro",
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
            }
          );
          setCodigoCuponera("");
          return;
        }

        let masAsientoSeleccionado = false;
        let existeAsientoVuelta = false;

        Object.entries(carroCompras).map(([key, value]) => {
          if (value.ida) {
            value.ida.forEach((servicioIda) => {
              if (servicioIda.asientos.length > 1) {
                toast.error(
                  "No puede usar código cuponera cuando tiene más de un asiento seleccionado",
                  {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                  }
                );
                setCodigoCuponera("");
                masAsientoSeleccionado = true;
                setIsLoading(false);
                return;
              }
            });
          }

          if (value.vuelta) {
            toast.error(
              "No puede usar código cuponera cuando un tiene un servicio con vuelta incluido en el carro",
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
              }
            );
            setCodigoCuponera("");
            existeAsientoVuelta = true;
            setIsLoading(false);
            return;
          }
        });

        if (masAsientoSeleccionado || existeAsientoVuelta) {
          setIsLoading(false);
          return;
        }

        let validaCuponera = {
          origen: resumenCompra.listaCarrito[0].origen,
          destino: resumenCompra.listaCarrito[0].destino,
          fechaServicio: resumenCompra.listaCarrito[0].fechaServicio
            .replace("/", "-")
            .replace("/", "-"),
          idServicio: resumenCompra.listaCarrito[0].servicio,
          codigoCuponera: codigoCuponera,
          rutComprador: resumenCompra.datosComprador.rut
            .replace(".", "")
            .replace(".", ""),
          idSistema: resumenCompra.idSistema,
          idIntegrador: resumenCompra.idIntegrador,
        };

        try {
          let response = await axios.post(
            "/api/coupon/validar-cuponera",
            validaCuponera
          );

          if (response && response.data && response.data.status) {
            let fechaServicioParse = formatearFecha(
              resumenCompra.listaCarrito[0].fechaServicio
            );
            let fechaServicioSalidarParse =
              formatearFecha(resumenCompra.listaCarrito[0].fechaServicio) +
              resumenCompra.listaCarrito[0].horaSalida.replace(":", "");

            let canjearCuponera = {
              idSistema: resumenCompra.idSistema,
              idIntegrador: resumenCompra.idIntegrador,
              codigoCuponera: codigoCuponera,
              boleto: {
                fechaLlegada: resumenCompra.listaCarrito[0].fechaLlegada,
                horaLlegada: resumenCompra.listaCarrito[0].horaLlegada,
                nombre: datosComprador?.nombre,
                apellido: datosComprador?.apellido,
                asiento: resumenCompra.listaCarrito[0].pasajeros[0].asiento,
                clase: resumenCompra.listaCarrito[0].pasajeros[0].clase,
                idServicio: resumenCompra.listaCarrito[0].servicio,
                fechaServicio: fechaServicioParse,
                fechaSalida: fechaServicioSalidarParse,
                piso: resumenCompra.listaCarrito[0].pasajeros[0].piso,
                email: datosComprador?.email,
                destino: resumenCompra.listaCarrito[0].destino,
                idOrigen: resumenCompra.listaCarrito[0].origen,
                idDestino: resumenCompra.listaCarrito[0].destino,
                rut: resumenCompra.listaCarrito[0].pasajeros[0]?.documento
                  .replace(".", "")
                  .replace(".", ""),
                tipoDocumento: datosComprador.tipoDocumento,
                cantidadEquipaje:
                  resumenCompra.listaCarrito[0].pasajeros[0]
                    ?.cantidadEquipaje || 0,
              },
            };
            let data;
            try {
              localStorage.setItem(
                "purchase_info",
                JSON.stringify(informacionAgrupada)
              );

              const response = await axios.post(
                "/api/coupon/canjear-cuponera",
                canjearCuponera
              );
              data = response.data;
            } catch (error) {
              // Esto hace que pase igual a la pagina de /respuesta-transaccion-canje
              // data = error.response.data;
            }
            if (data) {
              dispatch(agregarCompraCuponera(data));
              const url = `/respuesta-transaccion-canje/${data?.voucher?.boleto}`;
              router.push(url);
            } else {
              toast.warn("Ocurrio un error al canjear la cuponera", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
              });
            }
          }
        } catch (error) {
          setIsLoading(false);
          toast.error("Ocurrio un error al canjear la cuponera", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
          });
          return false;
        }
      } else {
        const token = generateToken();

        const request = CryptoJS.AES.encrypt(
          JSON.stringify(resumenCompra),
          secret
        );

        // console.log("info compra:", informacionAgrupada);
        // console.log("datos comprador:", datosComprador);

        localStorage.setItem(
          "purchase_info",
          JSON.stringify(informacionAgrupada)
        );

        localStorage.setItem("buyer_info", JSON.stringify(datosComprador));

        const response = await fetch(`/api/ticket_sale/guardar-multi-carro`, {
          method: "POST",
          body: JSON.stringify({ data: request.toString() }),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log("data", data);

        if (Boolean(data.error)) {
          toast.error("Error al completar la transacción", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
          });
          return;
        } else {
          localStorage.setItem("tokenTemp", data.token);
          localStorage.setItem("flowOrder", data.flowOrder);
        }

        // setPayment({
        //   ...payment,
        //   url: data.url,
        //   token: data.token,
        // });

        setPayment({
          ...payment,
          data: data.resultado.data,
        });

        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(`Error al completar la transacción [${error.message}]`);
      toast.error("Error al completar la transacción", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
    }
  }

  function formatearFecha(fecha) {
    const [dia, mes, año] = fecha.split("/");
    const mesConCeros = mes.padStart(2, "0");
    const diaConCeros = dia.padStart(2, "0");
    const fechaFormateada = `${año}${mesConCeros}${diaConCeros}`;
    return fechaFormateada;
  }

  function isPaymentValid() {
    try {
      let validator;
      informacionAgrupada.forEach((servicio) => {
        servicio.asientos.forEach((asiento) => {
          if (!validator || validator.valid) {
            validator = newIsValidPasajeroCompra(asiento);
          }
        });
      });
      return validator;
    } catch ({ message }) {
      setIsLoading(false);
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  useEffect(() => {
    obtenerInformacion();
  }, []);

  useEffect(() => {
    obtenerInformacion();
  }, [informacionAgrupada]);

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
    setTotalOriginal(total);
  }, [resumen]);

  useEffect(() => {
    if (descuentoConvenio) {
      let totalConDescuento = totalOriginal;

      if (descuentoConvenio.tipoDescuento === "POR") {
        const montoDescuento = Math.round(
          (totalOriginal * descuentoConvenio.descuento) / 100
        );
        totalConDescuento = totalOriginal - Math.round(montoDescuento);
      }

      setTotalOriginal(totalOriginal);
      setTotalPagar(totalConDescuento);
      setUsaWallet(false);
    } else {
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

      setTotalPagar(Math.round(total));
    }
  }, [descuentoConvenio]);

  function calcularPuntos(valor, porcentaje) {
    const valorPorcentaje = (valor * porcentaje) / 100;
    return Math.floor(valorPorcentaje);
  }

  // useEffect(() => {
  //   if (medioPago === "CUP") {
  //     setRequestConvenio(null);
  //     setDescuentoConvenio(null);
  //     setConvenio(null);
  //   }
  // }, [medioPago]);

  return (
    <div className={styles["resumen-container"]}>
      <h3>Resumen del viaje</h3>
      <div className={styles["contenedor-servicios"]}>
        <div className={styles["servicio-ida"]}>
          {Array.isArray(resumen.carro.lista) &&
            resumen.carro.lista.map((element) => (
              <div className={styles["servicio-ida"]} key={element.titulo}>
                <span
                  className={`${styles["titulo-servicio"]} fw-bold text-black fs-6`}
                >
                  {element.titulo}
                </span>
                <div className={styles["detalle-container"]}>
                  {Array.isArray(element.detalle) &&
                    element.detalle.map((detalleItem) => (
                      <div
                        key={`${detalleItem.origen}-${detalleItem.destino}-${detalleItem.hora}`}
                        className={styles["detalle-item"]}
                      >
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
                        <div
                          className={`flex-column ${styles["resumen-servicio"]}`}
                        >
                          {detalleItem.valorAsientos?.map((asiento) => (
                            <span key={asiento.num}>
                              Asiento {asiento.num}:{" "}
                              <b>{asiento.valorAsiento}</b>
                            </span>
                          ))}
                          <span>
                            Cantidad de Asientos: {detalleItem.cantidadAsientos}
                          </span>
                          <b>Total: {detalleItem.total}</b>
                        </div>
                        {/* {detalleItem.asientosEquipaje &&
                          detalleItem.asientosEquipaje.length > 0 && (
                            <div className={`row mb-3 dotted-bottom mx-1 pb-3`}>
                              <div className="row mb-3 mx-1 pb-3">
                                <span className="col-12 fw-bold text-black fs-6 p-0">
                                  Equipaje
                                </span>
                                {detalleItem.asientosEquipaje.map((asiento) => {
                                  return (
                                    <div
                                      key={`${asiento}-${index}`}
                                      className="col-12 p-0"
                                    >
                                      {asiento}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )} */}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
        <div className={styles["total-container"]}>
          {/* {!soloLectura && (
            <div
              className={`form-check form-switch ${styles["utiliza-monedero-virtual"]}`}
            >
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                disabled={!user}
                value={usaWallet}
                checked={usaWallet}
                onClick={() => {
                  actualizarSaldoWallet().then();
                  setUsaWallet(!usaWallet);
                  setDescuentoConvenio(null);
                }}
              />
              <label
                className="form-check-label"
                htmlFor="flexSwitchCheckDefault"
              >
                Utilizar monedero virtual (
                {clpFormat.format(saldoMonederoVirtual)})
              </label>
              <img src="/img/icon/general/information-circle-outline.svg" />
              <span className={styles["tooltip-text"]}>
                Sólo se puede pagar con el monedero cuando inicies sesión.
              </span>
            </div>
          )} */}
          {/* {descuentoConvenio ? (
            descuentoConvenio?.id === "COPEC" ? (
              <div>
                <div className={styles["contanedor-puntaje"]}>
                  <span>
                    Puntos para acumular COPEC:{" "}
                    {calcularPuntos(descuentoConvenio.tarifa, totalPagar)}{" "}
                  </span>
                </div>
                <div className={styles["contanedor-total-pagar-descuento"]}>
                  <span>
                    Total anterior: {clpFormat.format(totalOriginal)}{" "}
                  </span>
                </div>
              </div>
            ) : (
              <div className={styles["contanedor-total-pagar-descuento"]}>
                <span>Total anterior: {clpFormat.format(totalOriginal)} </span>
              </div>
            )
          ) : (
            ""
          )} */}
          <div className={styles["contanedor-total-pagar"]}>
            {descuentoConvenio ? (
              <span>Total a pagar: {formatGuarani(totalPagar)} </span>
            ) : (
              <span>Total a pagar: {formatGuarani(totalOriginal)}</span>
            )}
          </div>
          {!soloLectura && (
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
              {/* <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={sendNews}
                  onChange={() => setSendNews(!sendNews)}
                  id="flexCheckNews"
                />
                <label className="form-check-label" htmlFor="flexCheckNews">
                  Me gustaría recibir noticias, actualizaciones o información de
                  Pullman Bus
                </label>
              </div> */}
            </div>
          )}
        </div>
        {!soloLectura &&
          (!isLoading ? (
            <div className={styles["contenedor-boton-pagar"]}>
              <button
                className={styles["boton-pagar"]}
                onClick={() => {
                  setIsLoading(true);
                  sendToPayment();
                }}
              >
                Pagar
              </button>
              <form
                ref={payment_form}
                style={{ display: "none" }}
                method="POST"
                // action={payment.url}
                // action={`${payment.url}?token=${payment.token}`}
                action={`https://www.pagopar.com/pagos/${payment.data}`}
              >
                <input name="TBK_TOKEN" value={payment.token} />
              </form>
            </div>
          ) : (
            <img
              src="/img/loading.gif"
              width={150}
              height={150}
              alt="Perro caminando"
              style={{ display: "flex", margin: "auto" }}
            />
            // <div className={styles["loader"]}></div>
          ))}
      </div>
    </div>
  );
};
