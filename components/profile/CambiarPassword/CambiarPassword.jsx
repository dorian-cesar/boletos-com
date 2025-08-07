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
  mail: "",
  password: null,
  newPassword: null,
  newPassword2: null,
};

const CambiarPassword = (props) => {
  const { setVista } = props;
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [mostrarPasswordIncorrectaPopup, setmostrarPasswordIncorrectaPopup] =
    useState(false);
  const { formState: changePassword, onInputChange } = useForm(
    changePasswordFormFields
  );
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
    changePassword.mail = user?.mail;
  }, [user]);

  const cambiarPassword = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading2(true);
        const res = await axios.post("/api/user/cambiar-password", {
          ...changePassword,
        });
        if (res.data.status) {
          changePassword.password = "";
          changePassword.newPassword = "";
          changePassword.newPassword2 = "";
          abrirPopup();
        }
      } catch (e) {
        setIsLoading2(false);
        if (!!e.response) {
          const { message } = e.response?.data;
        } else {
          console.log("");
        }
      }
    }
  };

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      if (
        changePassword.password == "" ||
        changePassword.newPassword == "" ||
        changePassword.newPassword2 == ""
      ) {
        return resolve(false);
      } else if (changePassword.newPassword != changePassword.newPassword2) {
        abrirPasswordIncorrectaPopup();
        return resolve(false);
      } else {
        return resolve(true);
      }
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
            value={changePassword?.password}
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
            value={changePassword?.newPassword}
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
            value={changePassword?.newPassword2}
            onChange={onInputChange}
          />
        </div>
      </div>
      <div className={"row"}>
        {/* <div className={"col-6"}> */}
          {/* <div className={styles["return"]}>
            <a onClick={(e) => setVista("miPerfil")}>Regresar</a>
          </div> */}
          <div
            type="button"
            className={styles["return"]}
            onClick={(e) => setVista("miPerfil")}
          >
            Regresar
          </div>
        {/* </div> */}
        {/* <div className={"col-6"}> */}
          <div
            type="button"
            className={
              changePassword.password && changePassword.newPassword
                ? styles["button-update"]
                : styles["button-update-disabled"]
            }
            onClick={(e) =>
              changePassword.password &&
              changePassword.newPassword &&
              changePassword.newPassword2 &&
              cambiarPassword()
            }
          >
            Cambiar contraseña
          </div>
        {/* </div> */}
      </div>
      {mostrarPopup && (
        <Popup
          modalKey={ModalEntities.change_password}
          modalClose={cerrarPopup}
          modalMethods={volverInicio}
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
