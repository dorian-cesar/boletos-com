import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./ActualizarDatos.module.css";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const ActualizarDatos = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["menu-central"]}>
      <div className={`${styles["bloque"]} col-12`}>
        <h1 className={styles["title-modify-data"]}>Mi Perfil</h1>

        <div className="row mb-3">
          <div className="col-12 col-md-6">
            <label className={styles["title-data"]}>Nombre(s)</label>
            <div className={styles["data-box"]}>{user?.nombres}</div>
          </div>
          <div className="col-12 col-md-6">
            <label className={styles["title-data"]}>Apellido Paterno</label>
            <div className={styles["data-box"]}>{user?.apellidoPaterno}</div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12 col-md-6">
            <label className={styles["title-data"]}>Correo electrónico</label>
            <div className={styles["data-box"]}>{user?.correo}</div>
          </div>
          <div className="col-12 col-md-6">
            <label className={styles["title-data"]}>RUT</label>
            <div className={styles["data-box"]}>{user?.rut}</div>
          </div>
        </div>

        <div
          className={styles["return"]}
          onClick={() => router.back()}
        >
          Regresar
        </div>
      </div>
    </div>
  );
};

export default ActualizarDatos;
