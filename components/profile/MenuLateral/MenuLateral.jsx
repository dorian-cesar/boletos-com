import axios from "axios";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import styles from "./MenuLateral.module.css";

const MenuLateral = (props) => {
  const { vista, setVista, setNombreVista } = props;
  const [menu, setMenu] = useState([]);
  const { getItem, clear } = useLocalStorage();
  const router = useRouter();

  // useEffect(() => {
  //   async function buscarMenu() {
  //     try {
  //       const data = await axios.post("/api/user/obtener-menu", "");
  //       if (data.data.status) {
  //         setMenu(data.data.object);
  //       }
  //     } catch ({ message }) {
  //       console.error(`Error al obtener menú [${message}]`);
  //     }
  //   }

  //   buscarMenu();
  // }, []);

  const data = [
    {
      idMenu: 1,
      opcionMenu: "miPerfil",
      nombreMenu: "Mi Perfil",
      classname: "item-texto-lateral",
    },
    {
      idMenu: 2,
      opcionMenu: "cambioContraseña",
      nombreMenu: "Cambiar contraseña",
      classname: "item-texto-lateral",
    },
    {
      idMenu: 3,
      opcionMenu: "historialCompra",
      nombreMenu: "Historial de compras",
      classname: "item-texto-lateral",
    },
  ];

  useEffect(() => {
    setMenu(data);
  }, []);

  const cerrarSesion = () => {
    router.push("/").then(() => {
      clear();
    });
  };

  const cambiarVista = (nuevaVista, nombreMenu) => {
    setVista(nuevaVista);
    setNombreVista(nombreMenu);
  };

  return (
    <>
      <div className={`${styles["menu-lateral"]}`}>
        {menu.map((opcion) => (
          <div
            key={opcion.idMenu}
            className={`${styles["item-menu-lateral"]}`}
            onClick={() => cambiarVista(opcion.opcionMenu, opcion.nombreMenu)}
          >
            <div className="">
              <a className={styles[opcion.classname]}>{opcion.nombreMenu}</a>
            </div>
            <div>
              <img
                src="../img/icon/profile/chevron-forward-circle-outline.svg"
                alt=""
              />
            </div>
          </div>
        ))}
        <div
          key="cerrar-sesion"
          className={`${styles["item-menu-lateral"]}`}
          onClick={cerrarSesion}
        >
          <div className="">
            <a className={styles["item-texto-lateral-cerrar"]}>Cerrar sesión</a>
          </div>
          <div>
            <img
              src="../img/icon/profile/chevron-forward-circle-outline.svg"
              alt=""
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuLateral;
