import Head from "next/head";
import { useEffect, useState } from "react";
import Link from "next/link";

import "react-modern-drawer/dist/index.css";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { liberarAsientos } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice";

import { GoogleTagManager } from "@next/third-parties/google";
import dynamic from "next/dynamic";
import Header from "./Header/Header";

const googleTagManager = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER;

const DynamicDrawerComponent = dynamic(() => import("react-modern-drawer"), {
  ssr: false,
});

export default function Layout({ children, isBuyStage = false }) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const closeNav = () => {
    setOpen(false);
  };
  const openNav = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (
      !router.pathname.includes("/respuesta-transaccion") &&
      !router.pathname.includes("/confirm-transaction") &&
      !router.pathname.includes("/respuesta-transaccion-v2") &&
      !router.pathname.includes("/comprar")
    ) {
      dispatch(liberarAsientos());
      dispatch(limpiarCambio());
    }
  }, [router.pathname]);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Pullman Bus</title>
        <meta
          name="description"
          content="Empresa de Transporte Pullman Bus S.A San Francisco de Borja 235, Estación Central, Santiago de Chile.  Transporte de Viajes Interurbanos, Viajes Especiales"
        />
        <meta
          name="keywords"
          content="Pasajes en bus, Transporte Urbano, buses pullman, Pullman, Pulman, PullmanBus, Pullman Bus, bus, viajes, viaje, viajes interurbanos, viaje en bus"
        />
      </Head>

      <Header isBuyStage={isBuyStage} openNav={openNav} />

      <GoogleTagManager gtmId={googleTagManager} />
      <main>{children}</main>
      <DynamicDrawerComponent
        open={open}
        onClose={() => setOpen(!open)}
        direction="left"
        className="overlay"
        overlayColor="#3365B4"
        overlayOpacity={0.25}
        zIndex={9999}
        lockBackgroundScroll={true}
        size="43vh"
      >
        <a className="closebtn" onClick={closeNav}>
          ×
        </a>
        <div className="overlay-content">
          <div className="links-menu">
            <div className="w-100">
              <Link href="/profile/home" legacyBehavior>
                <a href="/profile/home" className="cuponeras">
                  Mi Perfil
                </a>
              </Link>
            </div>
            <div className="w-100">
              <Link href="/comprar" legacyBehavior>
                <a href="/comprar" className="compra">
                  Compra tu pasaje
                </a>
              </Link>
            </div>
            {/* <div className="w-100">
              <Link href="/cuponera" legacyBehavior>
                <a href="/Cuponera" className="cuponeras">
                  Cuponera
                </a>
              </Link>
            </div> */}
            {/* <div className="w-100">
              <Link href="/confirmacionBoleto" legacyBehavior>
                <a href="" className="confirmacions">
                  Confirmación
                </a>
              </Link>
            </div> */}
            {/* <div className="w-100">
              <Link href="/cambioBoleto" legacyBehavior>
                <a className="cambio-boleto">
                  Cambio de boleto
                </a>
              </Link>
            </div> */}
            {/* <div className="w-100">
              <Link href="/devolucion" legacyBehavior>
                <a className="devolucion">
                  Devolución de boleto
                </a>
              </Link>
            </div> */}
            {/* <div className="w-100">
              <Link href="/viajesEspeciales" legacyBehavior>
                <a className="viajes-especiales">
                  Viajes especiales
                </a>
              </Link>
            </div> */}
            {/* <div className="w-100">
              <a
                href="https://pullmanempresas.cl/#/sessions/signin?return=%2Fempresa%2Fhome"
                className="cliente-empresa"
              >
                Cliente Empresas
              </a>
            </div> */}

            <div className="w-100">
              <Link href="/teAyudamos" legacyBehavior>
                <a className="ayuda">Te ayudamos</a>
              </Link>
            </div>
            {/* <div className="w-100">
              <Link href="https://api.pullman.cl/stuWAR/#/marketplace" legacyBehavior>
                <a className="venta-vehiculos">
                  Venta vehículos usados
                </a>
              </Link>
            </div> */}
          </div>
          <div className="contactanos-menu">
            <span>Síguenos :</span>
            <div>
              <a target="_blank" href="https://www.facebook.com/Pullman.cl/">
                <img src="../img/icon/chat/logo-facebook-color.svg" alt="" />
              </a>
              <a target="_blank" href="https://www.instagram.com/pullmanbus/">
                <img src="../img/icon/chat/logo-instagram-color.svg" alt="" />
              </a>
              <a
                target="_blank"
                href="https://www.linkedin.com/company/pullman-bus/"
              >
                <img src="../img/icon/chat/logo-linkedin-color.svg" alt="" />
              </a>
            </div>
          </div>
        </div>
      </DynamicDrawerComponent>
    </>
  );
}
