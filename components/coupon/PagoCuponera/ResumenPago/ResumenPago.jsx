import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import styles from "./ResumenPago.module.css";
import { useSelector, useDispatch } from "react-redux";
import { isValidDatosComprador } from "utils/user-pasajero";
import { toast } from "react-toastify";
import { agregarMontoTotal } from "../../../../store/usuario/compra-cuponera-slice";

import CryptoJS from "crypto-js";

const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;

const diasUso = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

const ResumenPago = (props) => {
  const [resumen, setResumen] = useState({
    carro: {},
  });
  const clpFormat = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  });
  const [totalPagar, setTotalPagar] = useState(0);
  const [soloLectura, setSoloLectura] = useState(false);
  const [saldoMonederoVirtual, setSaldoMonederoVirtual] = useState(
    clpFormat.format(0)
  );

  const { setMedioDePago, carro } = props;
  const payment_form = useRef(null);
  const [payment, setPayment] = useState({});
  const carroCuponera = useSelector(
    (state) => state.compraCuponera.carroCuponera
  );
  const cuerpo = useSelector((state) => state.compraCuponera);
  const dispatch = useDispatch();
  const [isChecked, setIsChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [promotionsChecked, setPromotionsChecked] = useState(false);
  const [cuerpoTransformado, setCuerpoTransformado] = useState({});

  useEffect(() => {
    setCuerpoTransformado({ ...cuerpo });
  }, [cuerpo]);

  async function pagar() {
    if (isPaymentValid()) {
      try {
        const request = CryptoJS.AES.encrypt(
          JSON.stringify(cuerpoTransformado),
          secret
        );

        const { data } = await axios.post("/api/coupon/guardar-cuponera", {
          data: request.toString(),
        });

        setPayment({
          ...payment,
          url: data.url,
          token: data.token,
        });
      } catch ({ response }) {
        console.log("error", response);
      }
    }
  }

  function isPaymentValid() {
    try {
      let isValid = true;
      if (!isValidDatosComprador(cuerpo)) {
        isValid = false;
      }
      return isValid;
    } catch ({ message }) {
      console.error(`Error al validar el pago [${message}]`);
    }
  }

  useEffect(() => {
    if (payment.url) {
      payment_form.current?.submit();
    }
  }, [payment]);

  useEffect(() => {
    dispatch(agregarMontoTotal(carroCuponera));
  }, []);

  return (
    <div className={styles["resumen-container"]}>
      {}
      <h3>Resumen del viaje</h3>
      <div className={styles["contenedor-servicios"]}>
        <div className={styles["servicio-ida"]}>
          <b className={styles["titulo-servicio"]}>
            {carroCuponera.nombreCuponera}
          </b>
          <div className={styles["detalle-container"]}>
            <div className={styles["detalle-item"]}>
              <ul>
                <li>
                  <div>{carroCuponera.origenDescripcion}</div>
                </li>
                <li>
                  <div>{carroCuponera.destinoDescripcion}</div>
                </li>
              </ul>
              <div className={styles["resumen-servicio"]}>
                <div className={styles["tipo-cuponera"]}>
                  {carroCuponera.estadoNominativa
                    ? "Nominativa"
                    : "Al portador"}
                </div>
                <div className={styles["cantidad-cupones"]}>
                  <span onClick={() => console.log(carroCuponera)}>
                    Cantidad de cupones: {carroCuponera.cantidadCupones}{" "}
                    {carroCuponera.cuponesExtras > 0
                      ? " + " + carroCuponera.cuponesExtras + " cupon extra "
                      : " "}
                  </span>
                  <b>{clpFormat.format(carroCuponera.valorTotalCuponera)}</b>
                </div>
                <div className={styles["duracion"]}>
                  <span>
                    {`${carroCuponera.diasDuracion} días de duración`}
                  </span>
                </div>
                <div className={styles["dias-uso"]}>
                  {carroCuponera.dias.split("").map((dia, index) => {
                    return (
                      <div key={`dia-uso-${index}`}>
                        <span>{dia.trim() == "1" ? "🟢" : "🔴"}</span>
                        <span>{diasUso[index]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className={styles["medio-uso"]}>
                  <div>
                    <span>{carroCuponera.estadoVentanilla ? "🟢" : "🔴"}</span>
                    <span>Ventanilla</span>
                  </div>
                  <div>
                    <span>{carroCuponera.estadoWeb ? "🟢" : "🔴"}</span>
                    <span>Web</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles["total-container"]}>
          <div className={styles["contanedor-total-pagar"]}>
            <span>
              Total a pagar:{" "}
              {clpFormat.format(carroCuponera.valorTotalCuponera)}
            </span>
          </div>
          {!soloLectura && (
            <div className={styles["contenedor-checks"]}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={termsChecked}
                  onChange={() => setTermsChecked(!termsChecked)}
                  id="flexCheckDefault"
                />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                  Acepto los términos y condiciones de la compra
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={promotionsChecked}
                  onChange={() => setPromotionsChecked(!promotionsChecked)}
                  id="flexCheckDefault"
                />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                  Me gustaría recibir noticias, actualizaciones o información de
                  Boletos.com
                </label>
              </div>
            </div>
          )}
        </div>
        {!soloLectura && (
          <div className={styles["contenedor-boton-pagar"]}>
            <button
              className={
                termsChecked && isPaymentValid()
                  ? styles["boton-pagar"]
                  : styles["boton-pagar-disabled"]
              }
              onClick={() => {
                if (termsChecked && isPaymentValid()) {
                  pagar();
                }
              }}
            >
              Pagar
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
        )}
      </div>
    </div>
  );
};

export default ResumenPago;
