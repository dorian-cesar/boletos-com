import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Rut from "rutjs";
import { useRouter } from "next/router";

import { PasajeConfirmarDTO, PasajeCambioDTO } from "dto/PasajesDTO";
import ResumenPasaje from "./ResumenPasaje";
import InformacionPasajero from "./InformacionPasajero";
import InformacionComprador from "./InformacionComprador";
import { isValidPasajero } from "utils/user-pasajero";
import { toast } from "react-toastify";

const StagePago = (props) => {
  const {
    carro,
    nacionalidades,
    convenios,
    mediosDePago,
    setCarro,
    boletoValido,
  } = props;

  const router = useRouter();

  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
  const [payment, setPayment] = useState({});
  const [datoCambiar, setDatoCambiar] = useState({});

  const payment_form = useRef(null);

  async function getConvenio() {
    try {
      const convenio_response = await axios.post("/api/ticket_sale/convenio", {
        idConvenio: convenioSelected,
      });
      setConvenio(convenio_response.data);
      setConvenioFields({});
    } catch ({ message }) {
      console.error(`Error al obtener convenio [${message}]`);
    }
  }

  function validarFormatoRut(name, value) {
    try {
      if (name.trim() == "rut" && value.length > 2) {
        let rut = new Rut(value);
        value = new Rut(rut.getCleanRut().replace("-", "")).getNiceRut(true);
      }
      return value;
    } catch ({ message }) {
      console.error(`Error al validar formato de rut [${message}]`);
    }
  }

  function obtenerPagoConvenioActivo(origen, asiento, piso) {
    try {
      return Number(
        convenioActive.listaBoleto.find(
          (boleto) =>
            boleto.origen == origen &&
            boleto.asiento == asiento &&
            boleto.piso == piso
        )
      );
    } catch ({ message }) {
      console.error(`Error al obtener pago convenio [${message}]`);
    }
  }

  function getSubtotal(clientes, clean) {
    try {
      return clientes.reduce(
        (valorAcumulado, { tarifa, origen, asiento, piso }) => {
          tarifa = asiento.tarifa.replace(".", ",");
          const precio =
            !clean && convenioActive
              ? obtenerPagoConvenioActivo(origen, asiento, piso)
              : Number(tarifa.replace(/[^\d.-]/g, ""));
          valorAcumulado += precio;
          return valorAcumulado;
        },
        0
      );
    } catch ({ message }) {
      console.error(`Error al obtener el sub total [${message}]`);
    }
  }

  function getTotal() {
    try {
      if (!carro || !carro.clientes_ida) {
        return 0;
      }

      let total_ida = 0;

      carro.clientes_ida.forEach((servicio) => {
        if (servicio.asiento && servicio.asiento.valorAsiento) {
          total_ida += servicio.asiento.valorAsiento;
        }
      });

      if (!carro || !carro.clientes_ida) {
        return 0;
      }

      let total_vuelta = 0;

      carro.clientes_vuelta.forEach((servicio) => {
        if (servicio.asiento && servicio.asiento.valorAsiento) {
          total_vuelta += servicio.asiento.valorAsiento;
        }
      });

      return Number(total_ida) + Number(total_vuelta);
    } catch ({ message }) {
      console.error(`Error al obtener el total [${message}]`);
      return 0;
    }
  }

  function isPaymentValid() {
    try {
      let isValid = true;

      const pasajerosIda = carro.clientes_ida.reduce(
        (valorIncial, pasajeroRecorrido, indexPasajero) => {
          if (
            !isValidPasajero(
              pasajeroRecorrido.pasajero,
              indexPasajero,
              "ida",
              setCarro,
              carro
            )
          ) {
            valorIncial = false;
          }
          return valorIncial;
        },
        true
      );

      if (!pasajerosIda) {
        isValid = false;
      }

      return isValid;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  async function sendToPayment() {
    try {
      if (!isPaymentValid()) return;
      let datosArmado;
      let confirmar = [
        ...carro.clientes_ida.map((clientesIdaMapped, clientesIdaIndex) => {
          datosArmado = clientesIdaMapped;
        }),
      ];
      armarResponseCanjear(datosArmado);
      let data;
      try {
        const response = await axios.post(
          "/api/ticket_sale/cambiar-boleto",
          datoCambiar
        );
        data = response.data;
      } catch (error) {
        data = error.response.data;
      }
      if (data.status) {
        const url = `/respuesta-transaccion-cambio/${data.object.voucher.boleto}`;
        router.push(url);
      } else {
        toast.warn(data.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    } catch ({ response }) {}
  }

  function armarResponseCanjear(datos) {
    let fechaServicioParse = formatearFecha(datos.fechaServicio);
    let fechaServicioSalidarParse =
      formatearFecha(datos.fechaSalida) + datos.horaSalida.replace(":", "");
    let cambiarBoleto = {
      boleto: datos.extras?.boletoValido?.boleto,
      idSistema: 7,
      idIntegrador: 1000,
      asiento: datos.asiento.asiento,
      clase: datos.clase,
      idServicio: datos.idServicio,
      fechaServicio: fechaServicioParse,
      fechaSalida: fechaServicioSalidarParse,
      piso: datos.asiento.piso,
      email: datos.pasajero.email,
      destino: datos.destino,
      idOrigen: datos.origen,
      idDestino: datos.destino,
      rut: datos.pasajero.rut.replace(".", "").replace(".", ""),
      tipoDocumento: datos.pasajero.tipoRut,
    };
    setDatoCambiar(cambiarBoleto);
  }

  function formatearFecha(fecha) {
    const [dia, mes, año] = fecha.split("/");
    const mesConCeros = mes.padStart(2, "0");
    const diaConCeros = dia.padStart(2, "0");
    const fechaFormateada = `${año}${mesConCeros}${diaConCeros}`;
    return fechaFormateada;
  }

  function obtenerCantidadAsientos(tipoClientes) {
    const listaServicios = carro[tipoClientes].reduce(
      (valorInicial, valorActual) => {
        if (!valorInicial[valorActual.servicio]) {
          valorInicial[valorActual.servicio] = [];
        }
        valorInicial[valorActual.servicio].push(valorActual);
        return valorInicial;
      },
      {}
    );

    return Object.keys(listaServicios).map((servicio) => (
      <>
        <div className="row">
          <div className="col-8">
            <h4>
              {listaServicios[servicio].length}X boleto {servicio}
            </h4>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <h3>
              ${getSubtotal(listaServicios[servicio]).toLocaleString("es")}
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
            <p>Precio Normal</p>
          </div>
          <div className="col-4 d-flex justify-content-end"></div>
        </div>
      </>
    ));
  }

  useEffect(() => {
    (async () => await getConvenio())();
  }, [convenioSelected]);

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  return (
    <div className="pago">
      <div className="container">
        <div className="bloque bg-white pasajeros">
          <h2>Registro de pasajeros</h2>
          <ResumenPasaje tipoPasaje={"IDA"} pasaje={carro.pasaje_ida} />
          {carro.clientes_ida.map((clienteMapped, indexCliente) => {
            return (
              <InformacionPasajero
                key={`key-informacion-pasajero-ida-${indexCliente}`}
                tipoViaje={"ida"}
                cliente={clienteMapped}
                index={indexCliente}
                nacionalidades={nacionalidades}
                carro={carro}
                setCarro={setCarro}
                validarFormatoRut={validarFormatoRut}
              />
            );
          })}
          {carro.pasaje_vuelta ? (
            <>
              <ResumenPasaje
                tipoPasaje={"VUELTA"}
                pasaje={carro.pasaje_vuelta}
              />
              {carro.clientes_vuelta.map((clienteMapped, indexCliente) => {
                return (
                  <InformacionPasajero
                    key={`key-informacion-pasajero-vuelta-${indexCliente}`}
                    tipoViaje={"vuelta"}
                    cliente={clienteMapped}
                    index={indexCliente}
                    nacionalidades={nacionalidades}
                    carro={carro}
                    setCarro={setCarro}
                    validarFormatoRut={validarFormatoRut}
                  />
                );
              })}
            </>
          ) : (
            ""
          )}
        </div>

        <InformacionComprador
          setCarro={setCarro}
          carro={carro}
          validarFormatoRut={validarFormatoRut}
        />

        <div className="bloque comprador  bg-white">
          <h2>Resumen de compra</h2>
          <div className="row">
            <div className="col-12 col-md-7">
              {carro.clientes_ida ? (
                <div className="row cantidad-asiento mb-5">
                  <div className="col-8">
                    <div className="row">
                      <div className="col-12">
                        <strong>IDA</strong>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-8">
                        <h5>Cantidad de asientos</h5>
                      </div>
                      <div className="col-4"></div>
                    </div>
                    {obtenerCantidadAsientos("clientes_ida")}
                  </div>
                </div>
              ) : (
                ""
              )}
              {carro.clientes_vuelta ? (
                <div className="row cantidad-asiento mb-5">
                  <div className="col-8">
                    <div className="row">
                      <div className="col-12">
                        <strong>VUELTA</strong>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-8">
                        <h5>Cantidad de asientos</h5>
                      </div>
                      <div className="col-4"></div>
                    </div>
                    {obtenerCantidadAsientos("clientes_vuelta")}
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="col-12 col-md-5 total-pagar">
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h3>Total a pagar:</h3>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>${getTotal().toLocaleString("es")}</h2>
                </div>
              </div>
              <div className="row my-5">
                <div className="col-12">
                  {mediosDePago.map(({ imagen }, indexImagen) => (
                    <img
                      key={`key-imagen-medio-pago-${indexImagen}`}
                      src={"data:image/png;base64," + imagen}
                    />
                  ))}
                </div>
                <div className="col-12 p-2">
                  <label className="d-flex align-items-baseline mb-3 mt-3">
                    <input type="checkbox" className="mr-2" />
                    <small>
                      He leido los{" "}
                      <a href="/terminos" target="_blank">
                        Terminos y Condiciones
                      </a>{" "}
                      de la compra
                    </small>
                  </label>
                  <label className="d-flex align-items-baseline">
                    <input type="checkbox" className="mr-2" />
                    <small>
                      Me gustaria recibir noticias, actualizaciones o
                      información de Boletos.com
                    </small>
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <a
                    href="#"
                    className={"btn " + (!isPaymentValid() ? "disabled" : "")}
                    disabled={!isPaymentValid()}
                    onClick={(e) => {
                      e.preventDefault();
                      sendToPayment();
                    }}
                  >
                    Pagar
                  </a>

                  <form
                    ref={payment_form}
                    style={{ display: "none" }}
                    method="POST"
                    action={payment.url}
                  >
                    <input name="TBK_TOKEN" value={payment.token} />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagePago;
