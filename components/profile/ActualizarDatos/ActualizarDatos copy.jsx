import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import Layout from "../../Layout";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./ActualizarDatos.module.css";
import Head from "next/head";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className={styles["input-data"]}
    onClick={onClick}
    ref={ref}
    value={value}
    onChange={() => {}}
  />
));

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const actualizarFormFields = {
  rut: "",
  apellidoMaterno: "",
  apellidoPaterno: "",
  mail: "",
  mail2: "",
  fechaNacimiento: "",
  nombres: "",
  tipoDocumento: "R",
  sexo: "",
};

const ActualizarDatos = () => {
  const { formState: data, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    data.nombres = user?.nombres;
    data.apellidoPaterno = user?.apellidoPaterno;
    data.apellidoMaterno = user?.apellidoMaterno;
    data.sexo = user?.sexo;
    data.mail = user?.mail;
    data.mail2 = user?.mail;
    data.rut = user?.rut;
    if (!!user?.fechaNacimiento) {
      const fecha = new Date(
        user?.fechaNacimiento.toString().replace(/Z$/, "")
      );
      setFechaNacimiento(fecha);
    }
  }, [user]);

  useEffect(() => {
    data.fechaNacimiento = fechaNacimiento;
  }, [fechaNacimiento]);

  const listaYears = useMemo(() => {
    let years = [];
    for (let i = new Date().getFullYear(); i >= 1910; i--) {
      years.push(i);
    }
    return years;
  }, []);

  const actualizarDatos = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      setIsLoading2(true);
      try {
        const res = await axios.post("../api/user/actualizar-datos-perfil", {
          ...data,
        });
        if (res.data.status) {
          setIsLoading2(false);
          setAlerta({
            visible: true,
            msg: res.data.message,
            type: "alert-success",
          });
          setTimeout(() => {
            setAlerta({ visible: false, msg: "", type: "" });
          }, 5000);
        }
      } catch (error) {
        setAlerta({
          visible: true,
          msg: "Ocurrio un error al intentar actualizar la información",
          type: "alert-danger",
        });
      }
      setIsLoading2(false);
    }
  };

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      const values = Object.values(data);
      const camposVacios = values.filter((v) => v == "");
      if (camposVacios.length > 0) {
        setAlerta({
          visible: true,
          msg: "Se requiere rellenar todos los campos.",
          type: "text-danger",
        });
        resolve(false);
      } else {
        if (data?.mail != data?.mail2) {
          setAlerta({
            visible: true,
            msg: "Los correos no coinciden. Por favor, verificar.",
            type: "alert-danger",
          });
          resolve(false);
        } else {
          setAlerta({ visible: false, msg: "", type: "" });
          resolve(true);
        }
      }
    });
  };

  return (
    <>
      <div className={styles["menu-central"]}>
        <div className={`${styles["bloque"]} "col-12 col-md-12"`}>
          <h1 className={styles["title-modify-data"]}>Mi Perfil</h1>
          {alerta?.visible ? (
            <div className={"alert " + alerta?.type + " mb-0"} role="alert">
              {alerta?.msg}
            </div>
          ) : (
            ""
          )}
          {isLoading2 ? (
            <div className={"d-flex justify-content-center"}>
              <div className={"spinner-border text-primary"} role="status">
                <span className="visually-hidden"></span>
              </div>
            </div>
          ) : (
            ""
          )}
          <div className={"row"}>
            <div
              className={
                "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
              }
            >
              <label className={styles["title-data"]}>Nombre(s)</label>
              <input
                type="text"
                className={styles["input-data"]}
                name="nombres"
                value={data?.nombres}
                onChange={onInputChange}
              />
            </div>
          </div>
          <div className={"row "}>
            <div
              className={
                "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
              }
            >
              <label className={styles["title-data"]}>Apellido Paterno</label>
              <input
                type="text"
                className={styles["input-data"]}
                name="apellidoPaterno"
                value={data?.apellidoPaterno}
                onChange={onInputChange}
              />
            </div>
            <div
              className={
                "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
              }
            >
              <label className={styles["title-data"]}>Apellido Materno</label>
              <input
                type="text"
                className={styles["input-data"]}
                name="apellidoMaterno"
                value={data?.apellidoMaterno}
                onChange={onInputChange}
              />
            </div>
          </div>
          {/* <div className={"row"}>
            <div
              className={
                "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
              }
            >
              <label className={styles["title-data"]}>Género</label>
              <select
                name="sexo"
                id="sexo"
                className={styles["input-data"]}
                value={data?.sexo}
                onChange={onInputChange}
              >
                <option value={""}>Seleccione una opción...</option>
                <option value={"FEMENINO"}>Femenino</option>
                <option value={"MASCULINO"}>Masculino</option>
                <option value={"OTRO"}>Otro</option>
              </select>
            </div> */}
            {/* <div
              className={
                "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
              }
            >
              <label className={styles["title-data"]}>
                Fecha de nacimiento
              </label>
              <DatePicker
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div
                    style={{
                      margin: 10,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                    >
                      {"<"}
                    </button>
                    <select
                      onChange={({ target: { value } }) => changeYear(value)}
                    >
                      {listaYears.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      value={months[date.getMonth()]}
                      onChange={({ target: { value } }) =>
                        changeMonth(months.indexOf(value))
                      }
                    >
                      {months.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                    >
                      {">"}
                    </button>
                  </div>
                )}
                selected={fechaNacimiento}
                onChange={(date) => setFechaNacimiento(date)}
                dateFormat="dd/MM/yyyy"
                locale={"es"}
                placeholderText={""}
                customInput={<CustomInput />}
              />
            </div> */}
          {/* </div> */}
          {/* <div className={"row"}>
            <div
              className={
                "col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"
              }
            >
              <label className={styles["title-data"]}>Correo electrónico</label>
              <input
                type="email"
                className={styles["input-data"]}
                name="mail"
                value={data?.mail}
                disabled
              />
            </div>
          </div> */}
          <div className={"row d-flex justify-content-between align-items-center"}>
            {/* <div className={"col-6"}>
              <div className={styles["return"]}>
                <a href="/">Regresar</a>
              </div>
            </div> */}
            <div
              type="button"
              className={styles["return"]}
              onClick={() => router.back()}
            >
              Regresar
            </div>
            <div className={"col-6"}>
              <div
                type="button"
                className={styles["button-update"]}
                onClick={(e) => actualizarDatos()}
              >
                Actualizar datos
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActualizarDatos;
