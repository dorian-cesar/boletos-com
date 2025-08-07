import { useEffect, useState, useId } from "react";
import styles from "./DatosPasajero.module.css";
import Rut from "rutjs";

import { useDispatch, useSelector } from "react-redux";
import {
  agregarInformacionAsiento,
  asignarDatosComprador,
} from "store/usuario/compra-slice";
import Select from "react-select";

import axios from "axios";

const customStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "16px",
    display: "flex",
    padding: "4px 8px",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    alignSelf: "stretch",
    border: "1px solid var(--azul-50, #98B1D9)",
    background: "var(--Blanco, #FFF)",
    width: "100%",
    zIndex: 9999,
  }),
  placeholder: (provided) => ({
    ...provided,
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
  }),
};

const DatosPasajero = (props) => {
  // const { servicio, asiento, usuario, pasajero = false, nacionalidades = [] } = props;
  const { servicio, asiento, usuario, pasajero = false } = props;
  const { datosComprador } = useSelector((state) => state.compra);

  const dispatch = useDispatch();

  const [informacionAsiento, setInformacionAsiento] = useState({});
  const [cantidadEquipaje, setCantidadEquipaje] = useState(0);
  const [nationalitySelected, setNationalitySelected] = useState(null);

  function retornarDatosCompradorUsuario() {
    let asientoTemporal = { ...informacionAsiento };
    asientoTemporal["nombre"] = usuario?.nombres || "";
    asientoTemporal["apellido"] = usuario?.apellidoPaterno || "";
    asientoTemporal["tipoDocumento"] = usuario?.tipoDocumento || "R";
    asientoTemporal["rut"] = usuario?.rut || "";
    // asientoTemporal["email"] = usuario?.email || "";
    asientoTemporal["email"] = usuario?.correo || "";
    asientoTemporal["cantidadEquipaje"] = usuario?.cantidadEquipaje || 0;
    return asientoTemporal;
  }

  console.log("datos pasajero:", props);

  useEffect(() => {
    let asientoTemporal = { ...asiento };
    asientoTemporal["tipoDocumento"] = "R";

    const infoToDispatch = {
      servicio,
      asiento: asientoTemporal,
      // email: usuario?.email || "",
      email: usuario?.correo || "",
    };
    if (servicio) {
      setInformacionAsiento(asientoTemporal);
      dispatch(agregarInformacionAsiento(infoToDispatch));
    } else {
      const datosCompradorUsuario = retornarDatosCompradorUsuario();
      setInformacionAsiento(
        datosCompradorUsuario ? datosCompradorUsuario : asientoTemporal
      );
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
      let asientoTemporal;

      if (servicio) {
        asientoTemporal = { ...informacionAsiento };
      } else {
        asientoTemporal = { ...datosComprador };
      }

      if (name === "rut") {
        try {
          if (typeof value === "string") {
            value = value.toUpperCase();
          }
        } catch (error) {}
      }

      if (asiento["tipoDocumento"] == "R" && name === "rut" && value !== "") {
        value = validarFormatoRut(name, value);
      }

      if (asiento["tipoDocumento"] == "R" && name === "rut" && value !== "") {
        value = value.replace(/[^\dkK0-9.-]/g, "");
        if (value.length > 12) return;
      }

      if (name === "tipoDocumento") {
        asientoTemporal["rut"] = "";
        asientoTemporal["cantidadEquipaje"] = 0;
        setCantidadEquipaje(0);
      }

      asientoTemporal[name] = value;
      const infoToDispatch = {
        servicio,
        asiento: asientoTemporal,
      };

      if (servicio) {
        dispatch(agregarInformacionAsiento(infoToDispatch));

        //
        // TODO:
        // Para: Mi yo del futuro d=====(￣▽￣*)b
        // Posiblemente te digan, "oh, queremos que la mascotita tenga su nombre" a los chistosos se les ocurre cuestiones todos los dias
        // Aqui dejo una pista de que habria que borrar lo que esta abajo y validar que clase de información quieren (┬┬﹏┬┬)
        // Tambien en ResumenServicio.jsx habria que eliminar la validacion que no muestra el acordeon de rellenar ingormacion del pasajero
        // Eso TKM
        //
        if (asiento.asientoAsociado) {
          let asientoMab = {
            ...servicio.asientos.find(
              (asientoMab) => asientoMab.asiento === asiento.asientoAsociado
            ),
          };
          asientoMab[name] = value;
          asientoMab["tipoDocumento"] = asiento.tipoDocumento;

          dispatch(
            agregarInformacionAsiento({
              servicio,
              asiento: asientoMab,
            })
          );
        }
      } else {
        dispatch(asignarDatosComprador(asientoTemporal));
      }
      setInformacionAsiento(asientoTemporal);
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

  useEffect(() => {
    try {
      const asientoTemporal = {
        ...informacionAsiento,
        cantidadEquipaje,
      };

      const infoToDispatch = {
        servicio,
        asiento: asientoTemporal,
      };

      if (servicio) {
        dispatch(agregarInformacionAsiento(infoToDispatch));
      }
    } catch (error) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }, [cantidadEquipaje]);

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

  function returnNationalitiesArray() {
    const nacionalidadesArray = [];

    nacionalidades.map((nacionalidad) => {
      nacionalidadesArray.push({
        value: nacionalidad.valor,
        label: nacionalidad.descripcion,
      });
    });
    return nacionalidadesArray;
  }

  async function obtenerDatosPasajero() {
    let asientoTemporal = {
      ...informacionAsiento,
    }

    if( asientoTemporal['rut'] && asientoTemporal['tipoDocumento'] === 'R' && asientoTemporal['rut'].length >= 11 ||
      asientoTemporal['rut'] && asientoTemporal['tipoDocumento'] === 'P' && asientoTemporal['rut'].length >= 6
    ) {
      try {
        const response = await axios.post(`/api/obtener-datos-pasajero`,{
          documento: asientoTemporal['rut'],
          tipodoc: asientoTemporal['tipoDocumento']
        });

        setCantidadEquipaje(0);

        const { nombres, apellidos, nacionalidad } = response.data;

        asientoTemporal['nombre'] = nombres;
        asientoTemporal['apellido'] = apellidos;
        // asientoTemporal['nacionalidad'] = nacionalidad;
        asientoTemporal['cantidadEquipaje'] = 0;

        // const nacionalidadEncontrada = returnNationalitiesArray().find(nationality => nationality.value === nacionalidad);

        if( nacionalidadEncontrada ) {
          setNationalitySelected(nacionalidadEncontrada);
        }

        const infoToDispatch = {
          servicio,
          asiento: asientoTemporal,
        };

        if (servicio) {
          dispatch(agregarInformacionAsiento(infoToDispatch));

          if( asiento.asientoAsociado ) {
            let asientoMab = { ...servicio.asientos.find((asientoMab) => asientoMab.asiento === asiento.asientoAsociado) };

            asientoMab = {
              ...asientoMab,
              rut: asientoTemporal?.rut,
              tipoDocumento: asientoTemporal?.tipoDocumento,
              nombre: asientoTemporal?.nombre,
              apellido: asientoTemporal?.apellido,
              nacionalidad: asientoTemporal?.nacionalidad
            }

            dispatch(agregarInformacionAsiento({
              servicio,
              asiento: asientoMab
            }));
          }
        }

        setInformacionAsiento(asientoTemporal);
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleDisabledButtonBagagge = () => {
    if (
      !asiento["tipoDocumento"] ||
      asiento["tipoDocumento"] === "" ||
      !asiento["rut"] ||
      asiento["rut"] === "" ||
      !asiento["nacionalidad"] ||
      asiento["nacionalidad"] === "" ||
      !asiento["nombre"] ||
      asiento["nombre"] === "" ||
      !asiento["apellido"] ||
      asiento["apellido"] === ""
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <div className={styles["container"]}>
        <div className={"row"}>
          {pasajero ? (
            <>
              {/* <div className={"col-12 col-md-6"}>
                  <div className={"grupo-campos"}>
                    <label className={ `${styles["label"]} mb-2` }>Nacionalidad</label>
                    {
                      nacionalidades && nacionalidades.length > 0 ? (
                        <Select
                          options={ returnNationalitiesArray() }
                          value={ nationalitySelected }
                          styles={ customStyles }
                          className="mt-1"
                          onChange={(e) => {
                            setDataComprador({ name: 'nacionalidad', ...e});
                            setNationalitySelected(e);
                          }}
                          instanceId={useId()}
                          placeholder={ "Ej: Chilena" }
                          menuPosition="fixed"
                        />
                      ) : (
                        <input
                          type="text"
                          value={asiento["nacionalidad"]}
                          name="nacionalidad"
                          placeholder="Ej: Chilena"
                          className={styles["input"]}
                          disabled={ usuario }
                          onChange={(e) => setDataComprador(e.target)}
                        />
                      )
                    }
                  </div>
                </div> */}
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
              <div className={"col-12 col-md-6 mt-1"}>
                <div className="container">
                  <div className={"row"}>
                    <div className={"col-4 p-0"}>
                      <label className={"contenedor"}>
                        <label className={styles["label"]}>RUT</label>
                        <input
                          type="checkbox"
                          checked={
                            asiento["tipoDocumento"] === "R" ? true : false
                          }
                          value="R"
                          name="tipoDocumento"
                          disabled={usuario}
                          onChange={(e) => setDataComprador(e.target)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <div className={"col-6 p-0"}>
                      <label className={"contenedor"}>
                        <label className={styles["label"]}>DNI/Pasaporte</label>
                        <input
                          type="checkbox"
                          checked={
                            asiento["tipoDocumento"] === "P" ? true : false
                          }
                          value="P"
                          name="tipoDocumento"
                          disabled={usuario}
                          onChange={(e) => setDataComprador(e.target)}
                        />
                        <span className={"checkmark"}></span>
                      </label>
                    </div>
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
                    // onBlur={obtenerDatosPasajero}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
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
                <div className="container">
                  <div className={"row"}>
                    <div className={"col-4 p-0"}>
                      <label className={"contenedor"}>
                        <label className={styles["label"]}>RUT</label>
                        <input
                          type="checkbox"
                          checked={
                            asiento["tipoDocumento"] === "R" ? true : false
                          }
                          value="R"
                          name="tipoDocumento"
                          disabled={usuario}
                          onChange={(e) => setDataComprador(e.target)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </div>
                    <div className={"col-6 p-0"}>
                      <label className={"contenedor"}>
                        <label className={styles["label"]}>DNI/Pasaporte</label>
                        <input
                          type="checkbox"
                          checked={
                            asiento["tipoDocumento"] === "P" ? true : false
                          }
                          value="P"
                          name="tipoDocumento"
                          disabled={usuario}
                          onChange={(e) => setDataComprador(e.target)}
                        />
                        <span className={"checkmark"}></span>
                      </label>
                    </div>
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
                      <label className={styles["label"]}>E-mail</label>
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
            </>
          )}
          {/* {
            pasajero == true && (
              <div className="col-12 col-md-12">
                <div className="row justify-content-around">
                  <div className="col-12 col-md-6">
                    <p>Debes indicar cuanto equipaje llevarás en el maletero:</p>
                  </div>
                  <div className="col-12 col-md-5 row justify-content-center gap-1 p-3">
                    <div className="col-2 col-md-3 d-flex justify-content-center p-0">
                      <button 
                        className={`btn btn-outline-secondary border-2 rounded-circle fw-bold fs-3 d-flex justify-content-center align-items-center ${ styles["button-baggage"] }`}
                        disabled={ cantidadEquipaje <= 0 || handleDisabledButtonBagagge() }
                        onClick={ () => setCantidadEquipaje(cantidadEquipaje - 1) }>
                        <span className="mb-1">-</span>
                      </button>
                    </div>
                    <div className="col-2 col-md-3 d-flex justify-content-center p-0">
                      <span className={`fs-4 bg-secondary bg-opacity-25 d-flex justify-content-center rounded-circle align-items-center border border-2 border-secondary ${styles["button-baggage"]}`}>
                        { cantidadEquipaje }
                      </span>
                    </div>
                    <div className="col-2 col-md-3 d-flex justify-content-center p-0">
                      <button 
                        className={`btn btn-outline-secondary border-2 rounded-circle fw-bold fs-3 d-flex justify-content-center align-items-center ${ styles["button-baggage"] }`}
                        disabled={ cantidadEquipaje >= 1 || handleDisabledButtonBagagge() }
                        onClick={ () => setCantidadEquipaje(cantidadEquipaje + 1) }>
                        <span>+</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          } */}
        </div>
      </div>
    </>
  );
};

export default DatosPasajero;
