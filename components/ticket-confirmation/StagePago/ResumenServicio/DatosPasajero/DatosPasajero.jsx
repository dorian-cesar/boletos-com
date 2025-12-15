import { useEffect, useState } from "react";
import styles from "./DatosPasajero.module.css";
import Rut from "rutjs";

import { useSelector, useDispatch } from "react-redux";
import {
  agregarInformacionAsiento,
  asignarDatosComprador,
} from "store/usuario/compra-slice";

const DatosPasajero = (props) => {
  const { servicio, asiento, usuario } = props;
  const dispatch = useDispatch();

  function retornarDatosCompradorUsuario() {
    let asientoTemporal = { ...asiento };
    asientoTemporal["nombre"] = usuario?.nombres;
    asientoTemporal["apellido"] = usuario?.apellidoPaterno;
    asientoTemporal["tipoDocumento"] = usuario?.tipoDocumento;
    asientoTemporal["rut"] = usuario?.rut;
    asientoTemporal["email"] = usuario?.mail;
    return asientoTemporal;
  }

  useEffect(() => {
    let asientoTemporal = { ...asiento };
    asientoTemporal["tipoDocumento"] = "R";
    const infoToDispatch = {
      servicio,
      asiento: asientoTemporal,
    };
    if (servicio) {
      dispatch(agregarInformacionAsiento(infoToDispatch));
    } else {
      const datosCompradorUsuario = retornarDatosCompradorUsuario();
      dispatch(
        asignarDatosComprador(
          usuario !== null ? datosCompradorUsuario : asientoTemporal
        )
      );
    }
  }, []);

  useEffect(() => {
    if (usuario) {
      const datosCompradorUsuario = retornarDatosCompradorUsuario();
      dispatch(asignarDatosComprador(datosCompradorUsuario));
    }
  }, [usuario]);

  function setDataComprador({ name, value }) {
    try {
      let carro_temp = { ...asiento };
      value = validarFormatoRut(name, value);

      if (asiento["tipoDocumento"] == "R" && name === "rut" && value !== "") {
        value = validarFormatoRut(name, value);
      }

      if (asiento["tipoDocumento"] == "R" && name === "rut" && value !== "") {
        value = value.replace(/[^\dkK0-9.-]/g, "");
        if (value.length > 12) return;
      }

      if (name === "tipoDocumento") {
        carro_temp["rut"] = "";
      }

      carro_temp[name] = value;
      const infoToDispatch = {
        servicio,
        asiento: carro_temp,
      };

      if (servicio) {
        dispatch(agregarInformacionAsiento(infoToDispatch));
      } else {
        dispatch(asignarDatosComprador(carro_temp));
      }
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
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

  return (
    <>
      <div className={styles["container"]}>
        <div className={"row"}>
          <div className={"col-12 col-md-6"}>
            <div className={"grupo-campos"}>
              <label className={styles["label"]}>Nombres</label>
              <input
                type="text"
                value={asiento["nombre"]}
                name="nombre"
                placeholder="Ej: Juan Andrés"
                className={styles["input"]}
                disabled={usuario}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div className={"grupo-campos"}>
              <label className={styles["label"]}>Apellidos</label>
              <input
                type="text"
                value={asiento["apellido"]}
                name="apellido"
                placeholder="Ej: Espinoza Arcos"
                className={styles["input"]}
                disabled={usuario}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div className={"row"}>
              <div className={"col"}>
                <label className={"contenedor"}>
                  <label className={styles["label"]}>RUT</label>
                  <input
                    type="checkbox"
                    checked={asiento["tipoDocumento"] == "R" ? "checked" : ""}
                    value="R"
                    name="tipoDocumento"
                    disabled={usuario}
                    onChange={(e) => setDataComprador(e.target)}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
              <div className={"col"}>
                <label className={"contenedor"}>
                  <label className={styles["label"]}>Pasaporte</label>
                  <input
                    type="checkbox"
                    checked={asiento["tipoDocumento"] == "P" ? "checked" : ""}
                    value="P"
                    name="tipoDocumento"
                    disabled={usuario}
                    onChange={(e) => setDataComprador(e.target)}
                  />
                  <span className={"checkmark"}></span>
                </label>
              </div>
            </div>
            <div className={"grupo-campos"}>
              <input
                type="text"
                value={asiento["rut"]}
                name="rut"
                placeholder="Ej: 111111111"
                className={`${
                  Array.isArray(asiento.errors) &&
                  asiento.errors.includes("rut")
                    ? "is-invalid"
                    : ""
                } ${styles["input"]}`}
                disabled={usuario}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
          <div className={"col-12 col-md-6"}>
            <div className={"row"}>
              <div className={"col"}>
                <label className={styles["container-text"]}>
                  <label className={styles["label"]}>Correo electrónico</label>
                </label>
              </div>
              <div className={"col"}></div>
            </div>
            <div className={"grupo-campos"}>
              <input
                type="email"
                value={asiento["email"]}
                name="email"
                placeholder="Ej: correo@correo.cl"
                className={styles["input"]}
                disabled={usuario}
                onChange={(e) => setDataComprador(e.target)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatosPasajero;
