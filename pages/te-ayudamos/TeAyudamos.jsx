import Layout from "../../components/Layout";
import Footer from "../../components/Footer";
import Head from "next/head";
import styles from "./TeAyudamos.module.css";
import React, { useState, useEffect } from "react";
import PreguntasFrecuente from "../../components/PreguntasFrecuente/PreguntasFrecuente";
import NecesitasAyuda from "../../components/NecesitasAyuda/NecesitasAyuda";
import { useRouter } from "next/router";
import Link from "next/link";

const mappedStages = {
  preguntas: 1,
  ayuda: 2
}

const TeAyudamos = (props) => {
  const [stage, setStage] = useState(0);
  const router = useRouter();

  function cambiarVista(id) {
    setStage(id);
  }

  useEffect(() => {
    const queryParams = router.query;
    if( queryParams ) {
      setStage(mappedStages[queryParams.page] || 0);
    }
  }, [])

  return (
    <Layout>
      <Head>
        <title>Pullman Bus | Te Ayudamos</title>
      </Head>
      {stage == 0 ? (
        <div className="pt-3 pb-5 bg-bus">
          <h2 className="text-center text-secondary fw-bold mb-4 pt-5">Nuestros canales de atención</h2>
          <div className="container overflow-hidden">
            <div className="row g-2 g-md-0 justify-content-center gap-5 py-5">

              {/* <div className="card text-center col-12 col-md-5 bg-white shadow-sm border-0 p-3 rounded-4">
                <div className="card-header bg-white border-0">
                  <img src="/img/icon/help/help-circle-outline.svg" height={ 48 } width={ 48 }/>
                  <h4 className="text-secondary fw-bold mb-0">Preguntas frecuentes</h4>
                </div>
                <div className="card-body">
                  <p>
                    Aquí tienes un montón de respuestas a las preguntas que la
                    gente suele hacer. Échale un vistazo y hagamos que todo sea
                    más fácil para ti!
                  </p>
                </div>
                <div className="card-footer border-0">
                  <div className="d-grid">
                    <button className="btn btn-primary rounded-4 fw-bold" onClick={() => cambiarVista(1)}>
                      Encuentra respuestas aquí
                    </button>
                  </div>
                </div>
              </div> */}

              <div className="card text-center col-12 col-md-5 bg-white shadow-sm border-0 p-3 rounded-4">
                <div className="card-header bg-white border-0">
                  <img src="/img/icon/help/megaphone-outline.svg" height={ 48 } width={ 48 }/>
                  <h4 className="text-secondary fw-bold mb-0">Escríbenos</h4>
                </div>
                <div className="card-body">
                  <p>
                    ¿No hallaste lo que necesitabas en nuestra sección de
                    preguntas frecuentes? Mándanos un mensaje y nos pondremos en
                    acción para responderte lo más pronto posible.
                  </p>
                </div>
                <div className="card-footer border-0">
                  <div className="d-grid">
                    <button className="btn btn-primary rounded-4 fw-bold" onClick={() => cambiarVista(2)}>
                      Habla con nosotros
                    </button>
                  </div>
                </div>
              </div>

              <div className="card col-12 col-md-5 bg-white shadow-sm border-0 p-3 rounded-4">
                <div className="card-body">
                  <div>
                    <h5 className="text-secondary fw-bold">Horario de atención al cliente:</h5>
                    <span><b>Lunes a viernes:</b> 09:00AM - 18:00PM</span>
                  </div>
                  <div>
                    <h5 className="text-secondary fw-bold mt-4">
                      Atención via WhatsApp:
                    </h5>
                    <p className="fs-6 mb-0">Sábados, domingos y festivos: 09:00AM - 18:00PM</p>
                    <a className="text-black" href="https://wa.me/56996193091" target="_blank">
                      <img src="/img/icon/help/what-up.svg"/>
                      <span className="mx-1">+569 96193091</span>
                      <span>(sólo mensajes, <b>NO</b> llamados telefónicos)</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* <div className="card col-12 col-md-5 bg-white shadow-sm border-0 p-3 rounded-4">
                <div className="card-body">
                  <h5 className="text-secondary fw-bold">¿Buscas cotizar un viaje especial?</h5>
                  <span>
                    Escríbenos y solicita una cotización personalizada y descubre cómo podemos transformar tu experiencia de transporte en algo único.
                  </span>
                </div>
                <div className="card-footer border-0">
                  <div className="d-grid">
                    <Link href="/viajesEspeciales" legacyBehavior>
                      <a href='#' className="btn btn-primary rounded-4 fw-bold" role="button">
                        Contáctanos
                      </a>
                    </Link>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {stage == 1 ? (
        <>
          <PreguntasFrecuente />
        </>
      ) : (
        <></>
      )}

      {stage == 2 ? (
        <>
          <NecesitasAyuda setStage={setStage} />
        </>
      ) : (
        <></>
      )}

      <Footer />
    </Layout>
  );
};

export default TeAyudamos;
