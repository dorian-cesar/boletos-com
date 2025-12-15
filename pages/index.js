import Layout from "components/Layout";
import Head from "next/head";
import { registerLocale } from "react-datepicker";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { liberarAsientos } from "store/usuario/compra-slice";
import { limpiarCambio } from "store/usuario/cambio-boleto-slice";
// import Ofertas from "components/Ofertas/Ofertas";

import Banner from "components/banner";

import Popup from "components/Popup/Popup";

import ModalEntities from "entities/ModalEntities";

import es from "date-fns/locale/es";
import dynamic from "next/dynamic";
import PopupInformativo from "../components/PopupInformativo/PopupInformativo";
import Script from "next/script";

registerLocale("es", es);

const DynamicBusquedaServicioComponent = dynamic(
  () => import("components/BusquedaServicio/BusquedaServicio"),
  {
    ssr: false,
  }
);

const DynamicFooterComponent = dynamic(() => import("components/Footer"), {
  ssr: false,
});

export default function Home(props) {
  const origenes = props.ciudades;
  const dispatch = useDispatch();

  const [isShowModalMobile, setIsShowModalMobile] = useState(false);

  useEffect(() => {
    dispatch(liberarAsientos());
    dispatch(limpiarCambio());
  }, []);

  useEffect(() => {
    const fechaLimite = new Date(2024, 11, 8, 23, 59, 59);
    if (new Date() <= fechaLimite) {
      setIsShowModalMobile(true);
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>Boletos | Inicio</title>
      </Head>
      <div className="home">
        <div className="hero">
          <img
            src="/banner.png"
            alt="Banner principal"
            className="hero__image"
          />
          <div className="hero__search">
            <DynamicBusquedaServicioComponent
              origenes={origenes}
              dias={props.dias}
              isHomeComponent={true}
            />
          </div>
        </div>
      </div>
      {/* <div className="home">
        <Banner/>
        <DynamicBusquedaServicioComponent
          origenes={origenes}
          dias={props.dias}
          // isShowMascota={true}
        />

        <Ofertas />
      </div> */}
      <DynamicFooterComponent />
      {isShowModalMobile && (
        <PopupInformativo modalClose={() => setIsShowModalMobile(false)} />
      )}
    </Layout>
  );
}
