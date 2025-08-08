"use client";

import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Login from "components/Login/Login";
import { useLocalStorage } from "hooks/useLocalStorage";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import styles from "./Header.module.css";

import { ResumenViaje } from "components/ticket_sale/ResumenViaje/ResumenViaje";
import {
  liberarAsientos,
  limpiarListaCarrito,
} from "store/usuario/compra-slice";
import Popup from "components/Popup/Popup";
import ModalEntities from "entities/ModalEntities";
import LocalStorageEntities from "entities/LocalStorageEntities";
import { decryptData } from "utils/encrypt-data";

export default function Header({
  openNav,
  isBuyStage = false,
}: {
  openNav: any;
  isBuyStage: boolean;
}) {
  const [user, setUser] = useState();
  const router = useRouter();
  const { getItem, clear } = useLocalStorage();
  const [carroCompras, setCarroCompras] = useState([]);
  const data = useSelector((state: any) => state.compra?.listaCarrito) || {};
  const live_time =
    useSelector((state: any) => state.compra?.live_time) || null;
  const [countdownInterval, setCountdownInterval] = useState<any>(null);
  const [timeToEnd, setTimeToEnd] = useState("");

  const [isShowModalEndTime, setIsShowModalEndTime] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement: "bottom",
    middleware: [
      offset(5),
      flip({
        fallbackAxisSideDirection: "start",
      }),
      shift(),
    ],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const dispatch = useDispatch();

  function setData() {
    const listaCarrito: any = [];
    Object.entries(data).forEach(([key, value]) => {
      if (data[key]["ida"]) {
        data[key]["ida"].forEach((element: any) => {
          element.asientos.forEach((asiento: any) =>
            listaCarrito.push(asiento)
          );
        });
      }
      if (data[key]["vuelta"]) {
        data[key]["vuelta"].forEach((element: any) => {
          element.asientos.forEach((asiento: any) =>
            listaCarrito.push(asiento)
          );
        });
      }
    });
    setCarroCompras(listaCarrito);
  }

  function setCountdown() {
    if (!countdownInterval && live_time) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = live_time - now;

        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeToEnd(
          `${minutes < 10 ? "0" : ""}${minutes}:${
            seconds < 10 ? "0" : ""
          }${seconds}`
        );

        if (distance < 0) {
          clearInterval(interval);
          setCountdownInterval(null);
          dispatch(limpiarListaCarrito(null));
          setIsShowModalEndTime(true);
        }
      }, 1000);
      setCountdownInterval(interval);
    }
  }

  function timeEnd() {
    setIsShowModalEndTime(false);
    router.push("/");
  }

  useEffect(() => {
    if (!live_time && countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
  }, [live_time]);

  useEffect(() => {
    const user = decryptData(LocalStorageEntities.user_auth);
    setUser(user);
    setData();
  }, []);

  useEffect(() => {
    setData();
    setCountdown();
  }, [data]);

  //cambiar icon de mobile a destokp
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={
          isBuyStage
            ? `d-none d-md-block sticky-top bg-white ${styles["header"]}`
            : `sticky-top bg-white ${styles["header"]}`
        }
      >
        <div className="container">
          <div className="row">
            <div className="col-2 col-sm-1 justify-content-center d-flex align-items-center">
              <span onClick={openNav}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="42"
                  viewBox="0 0 42 42"
                  fill="none"
                >
                  <path
                    d="M7.21875 12.4688H34.7812H7.21875ZM7.21875 21H34.7812H7.21875ZM7.21875 29.5312H34.7812H7.21875Z"
                    fill="#3365B4"
                  />
                  <path
                    d="M7.21875 12.4688H34.7812M7.21875 21H34.7812M7.21875 29.5312H34.7812"
                    stroke="#FF6500"
                    strokeWidth="3"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
            <div className="col-6 col-sm-9 d-flex align-items-center ">
              <a href="/">
                <img
                  src="../img/icon/logos/Logo.svg"
                  width={300}
                  height={100}
                  className="img-fluid p-2"
                />
              </a>
            </div>
            <div className="col-4 col-sm-2 d-flex justify-content-end">
              {router.pathname !== "/respuesta-transaccion-v2" && router.pathname !== "/confirm-transaction" &&
                (user == null ? (
                  <img
                    src={
                      isMobile
                        ? "../img/icon-foto-mobile.svg"
                        : "../img/icon/logos/cuenta.svg"
                    }
                    className={`img-fluid cuenta-img ${styles.svgImage} ${styles.svgShadow}`}
                    data-bs-toggle="modal"
                    data-bs-target="#loginModal"
                  />
                ) : (
                  <ul className="nav nav-pills">
                    <li
                      className="nav-item dropdown"
                      style={{ display: "flex" }}
                    >
                      <button
                        className="nav-link dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <span className="text-login">Mi cuenta</span>
                        <img
                          src="../img/icon-user.svg"
                          width={30}
                          className="m-1"
                          // className={`m-1 ${styles.svgImage} ${styles.svgShadow}`}
                        />
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <Link href="/profile/home" legacyBehavior>
                            <a className="dropdown-item" href="/profile/home">
                              Mi perfil
                            </a>
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={(e) => clear()}
                          >
                            Cerrar sesión
                          </button>
                        </li>
                      </ul>
                    </li>
                  </ul>
                ))}
              <a
                className="d-flex align-items-center"
                ref={refs.setReference}
                {...getReferenceProps()}
              >
                {live_time && countdownInterval && (
                  <span className="badge bg-primary rounded-pill">
                    {timeToEnd}
                  </span>
                )}
                <img
                  src="../img/cart-outline.svg"
                  width={30}
                  className={`${styles.svgImage} ${styles.svgShadow}`}
                />
                {carroCompras.length > 0 && (
                  <span className="badge bg-primary rounded-pill">
                    {carroCompras.length}
                  </span>
                )}
              </a>
              {isOpen && carroCompras.length > 0 && (
                <div
                  className={`shadow ${styles["tooltip-container"]}`}
                  ref={refs.setFloating}
                  style={floatingStyles}
                  {...getFloatingProps()}
                >
                  <ResumenViaje soloLectura={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <Login cuponera={0}></Login>
      {isShowModalEndTime && (
        <Popup
          modalKey={ModalEntities.car_live_time_end}
          modalClose={null}
          modalMethods={timeEnd}
          modalTitleButton={""}
        />
      )}
    </>
  );
}
