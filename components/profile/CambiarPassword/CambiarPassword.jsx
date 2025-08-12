import axios from "axios";
import { useEffect, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import styles from "./CambiarPassword.module.css";
import Popup from "../../Popup/Popup";
import { toast } from "react-toastify";
import ModalEntities from "../../../entities/ModalEntities";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const changePasswordFormFields = {
  email: "",
  password: "",
  newPassword: "",
  newPassword2: "",
};

const CambiarPassword = (props) => {
  const { setVista } = props;
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarPasswordIncorrectaPopup, setmostrarPasswordIncorrectaPopup] =
    useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const {
    formState: changePassword,
    onInputChange,
    setSolicitud,
  } = useForm(changePasswordFormFields);

  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.correo) {
      setSolicitud({
        ...changePassword,
        email: user.correo,
      });
    }
  }, [user]);

  const cambiarPassword = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading2(true);
        const res = await axios.post("/api/user/cambiar-password-perfil", {
          ...changePassword,
        });

        if (res.data.error) {
          setApiResponse({
            status: false,
            message: res.data.error,
            isPasswordError: res.data.error === "Contraseña incorrecta",
            isGenericError: res.data.error !== "Contraseña incorrecta",
          });
        } else {
          setApiResponse({
            status: true,
            message: "¡Contraseña actualizada correctamente!",
          });
          setSolicitud({
            ...changePassword,
            password: "",
            newPassword: "",
            newPassword2: "",
          });
        }
        abrirPopup();
      } catch (e) {
        setApiResponse({
          status: false,
          message: e.response?.data?.error || "Error al cambiar la contraseña",
          isPasswordError: e.response?.data?.error === "Contraseña incorrecta",
          isGenericError: e.response?.data?.error !== "Contraseña incorrecta",
        });
        abrirPopup();
      } finally {
        setIsLoading2(false);
      }
    }
  };

  const validarForm = () => {
    return new Promise((resolve) => {
      if (
        !changePassword.password ||
        !changePassword.newPassword ||
        !changePassword.newPassword2
      ) {
        toast.error("Todos los campos son obligatorios");
        return resolve(false);
      } else if (changePassword.newPassword !== changePassword.newPassword2) {
        abrirPasswordIncorrectaPopup();
        return resolve(false);
      }
      return resolve(true);
    });
  };

  const abrirPopup = () => {
    setMostrarPopup(true);
  };

  const cerrarPopup = () => {
    setMostrarPopup(false);
  };

  const abrirPasswordIncorrectaPopup = () => {
    setmostrarPasswordIncorrectaPopup(true);
  };

  const cerrarPasswordIncorrectaPopup = () => {
    setmostrarPasswordIncorrectaPopup(false);
  };

  const volverInicio = () => {
    setVista("miPerfil");
  };

  // Función para determinar qué modal mostrar según la respuesta
  const getModalKey = () => {
    if (apiResponse?.status) {
      return ModalEntities.change_password;
    } else if (apiResponse?.isPasswordError) {
      return ModalEntities.password_incorrect;
    } else if (apiResponse?.isGenericError) {
      return ModalEntities.password_not_same;
    }
    return ModalEntities.error;
  };

  return (
    <div className={styles["menu-central"]}>
      <div className={"row "}>
        <div
          className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}
        >
          <a className={styles["title-change-password"]}>Cambio contraseña</a>
        </div>
      </div>

      <div className={"row"}>
        <div
          className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}
        >
          <label className={styles["title-data"]}>Contraseña actual</label>
          <input
            type="password"
            className={styles["input-data"]}
            name="password"
            value={changePassword.password}
            onChange={onInputChange}
          />
        </div>
      </div>
      <div className={"row "}>
        <div
          className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}
        >
          <label className={styles["title-data"]}>Contraseña nueva</label>
          <input
            type="password"
            className={styles["input-data"]}
            name="newPassword"
            value={changePassword.newPassword}
            onChange={onInputChange}
          />
        </div>
        <div
          className={"col-12 col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-6"}
        >
          <label className={styles["title-data"]}>
            Repetir Contraseña nueva
          </label>
          <input
            type="password"
            className={styles["input-data"]}
            name="newPassword2"
            value={changePassword.newPassword2}
            onChange={onInputChange}
          />
        </div>
      </div>
      <div className={"row"}>
        <div className={"col-6"}>
          <div className={styles["return"]}>
            <a onClick={volverInicio}>Regresar</a>
          </div>
        </div>
        <div className={"col-6"}>
          <div
            className={
              changePassword.password &&
              changePassword.newPassword &&
              changePassword.newPassword2 &&
              !isLoading2
                ? styles["button-update"]
                : styles["button-update-disabled"]
            }
            onClick={() => {
              if (
                changePassword.password &&
                changePassword.newPassword &&
                changePassword.newPassword2 &&
                !isLoading2
              ) {
                cambiarPassword();
              }
            }}
            style={{ cursor: isLoading2 ? "not-allowed" : "pointer" }}
          >
            {isLoading2 ? "Procesando..." : "Cambiar contraseña"}
          </div>
        </div>
      </div>

      {mostrarPopup && (
        <Popup
          modalKey={getModalKey()}
          modalClose={cerrarPopup}
          modalMethods={apiResponse?.status ? volverInicio : cerrarPopup}
          modalBody={apiResponse?.message}
        />
      )}

      {mostrarPasswordIncorrectaPopup && (
        <Popup
          modalKey={ModalEntities.password_not_same}
          modalClose={cerrarPasswordIncorrectaPopup}
          modalMethods={cerrarPasswordIncorrectaPopup}
        />
      )}
    </div>
  );
};

export default CambiarPassword;
