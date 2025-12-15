import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Rut from "rutjs";
import { useRouter } from "next/router";

import {
  GuardarCarroDTO,
  PasajePagoDTO,
  ValidarUsoCuponeraDTO,
  CanjearCuponeraDTO,
} from "dto/PasajesDTO";
import ResumenPasaje from "./ResumenPasaje";
import InformacionPasajero from "./InformacionPasajero";
import InformacionCuponera from "./InformacionCuponera";
import { isValidPasajero, isValidCodigoCuponera } from "utils/user-pasajero";
import { toast } from "react-toastify";

const StagePago = (props) => {
  const { carro, nacionalidades, convenios, mediosDePago, setCarro } = props;

  const router = useRouter();

  const [convenioSelected, setConvenioSelected] = useState(null);
  const [convenio, setConvenio] = useState(null);
  const [payment, setPayment] = useState({});
  const [convenioActive, setConvenioActive] = useState(null);
  const [convenioFields, setConvenioFields] = useState({});
  const payment_form = useRef(null);
  const [canjeCuponera, setCanjearCuponera] = useState({});

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

  function getSubtotal(clientes, clean) {
    try {
      return clientes.reduce(
        (valorAcumulado, { tarifa, origen, asiento, piso }) => {
          tarifa = tarifa.replace(".", ",");
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
      const ida = getSubtotal(carro.clientes_ida);
      return Number(ida);
    } catch ({ message }) {
      console.error(`Error al obtener el total [${message}]`);
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
            ) ||
            !isValidCodigoCuponera(carro.datos["codigoCuponera"])
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

  async function validarUsoCuponera() {
    try {
      const primerCliente = carro.clientes_ida[0];
      if (!primerCliente) {
        return false;
      }

      let fecha = primerCliente.fechaServicio.replace(/\//g, "-");
      const validarUsoCuponeraDTO = new ValidarUsoCuponeraDTO(
        primerCliente.origen,
        primerCliente.destino,
        fecha,
        primerCliente.idServicio,
        carro.datos["codigoCuponera"]
      );

      const { data } = await axios.post(
        "/api/coupon/validar-cuponera",
        validarUsoCuponeraDTO
      );
      return data.status;
    } catch (error) {
      console.error(`Error al validarUsoCuponera [${error.message}]`);
      return false;
    }
  }

  function armarResponseCanjear(datos) {
    let fechaServicioParse = formatearFecha(datos.fechaServicio);
    let fechaServicioSalidarParse =
      formatearFecha(datos.fechaSalida) + datos.horaSalida.replace(":", "");
    let canjearCuponera = {
      idSistema: 7,
      idIntegrador: 1000,
      codigoCuponera: carro.datos["codigoCuponera"],
      boleto: {
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
      },
    };
    setCanjearCuponera(canjearCuponera);
  }

  function formatearFecha(fecha) {
    const [dia, mes, año] = fecha.split("/");
    const mesConCeros = mes.padStart(2, "0");
    const diaConCeros = dia.padStart(2, "0");
    const fechaFormateada = `${año}${mesConCeros}${diaConCeros}`;
    return fechaFormateada;
  }

  async function sendToPayment() {
    try {
      const isValidCuponera = await validarUsoCuponera();
      if (isValidCuponera) {
        let datosArmado;
        let pasajes = [
          ...carro.clientes_ida.map((clientesIdaMapped, clientesIdaIndex) => {
            console.log("datos clientes", clientesIdaMapped);
            datosArmado = clientesIdaMapped;
          }),
        ];
        armarResponseCanjear(datosArmado);
        const { email, rut } = carro.datos;

        const { data } = await axios.post(
          "/api/coupon/canjear-cuponera",
          canjeCuponera
        );

        if (data.resultado.exito) {
          console.log("Tipo de data.voucher:", typeof data.voucher);
          console.log("Contenido de data.voucher:", data.voucher);
          const url = `/pages/respuesta-transaccion-canje/${data.voucher.toString()}`;
          router.push(url);
        }
      } else {
        toast.warn(`Cuponera no es valida para uso`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        });
      }
    } catch ({ response }) {}
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
          <div className="col-4 d-flex justify-content-end">
            <h4 className="tachado">
              $
              {(
                Math.round(
                  (getSubtotal(listaServicios[servicio], true) * 1.12) / 100
                ) * 100
              ).toLocaleString("es")}
            </h4>
          </div>
        </div>
      </>
    ));
  }

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  return (
    <div className="row">
      <div className="col-12 col-md-8">
        <div className="bloque bg-white pasajeros">
          <h2>Registro de pasajero</h2>

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
        </div>
        <InformacionCuponera
          setCarro={setCarro}
          carro={carro}
          validarFormatoRut={validarFormatoRut}
        />
      </div>

      <div className="col-12 col-md-4">
        <div className="bloque bg-white pasajeros">
          <h2>Resumen de compra</h2>
          <ResumenPasaje tipoPasaje={"IDA"} pasaje={carro.pasaje_ida} />
          <div className="row">
            <div className="col-12 col-md-12 total-pagar">
              <div className="row">
                <div className="col-6 d-flex align-items-center">
                  <h3>Total a pagar:</h3>
                </div>
                <div className="col-6 d-flex justify-content-end">
                  <h2>${getTotal().toLocaleString("es")}</h2>
                </div>
              </div>
              <div className="row my-5">
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
