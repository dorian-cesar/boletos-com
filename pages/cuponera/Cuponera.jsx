import axios from "axios";
import Layout from "components/Layout";
import Footer from "components/Footer";
import Loader from "components/Loader";
import BusquedaCuponera from "../../components/coupon/BusquedaCuponera/BusquedaCuponera";
import ParrillaCuponera from "../../components/coupon/ParrillaCuponera/ParrillaCuponera";
import PagoCuponera from "../../components/coupon/PagoCuponera/PagoCuponera";
import styles from "./Cuponera.module.css";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";
import getConfig from "next/config";
import React, { useState, useEffect } from "react";
import Head from "next/head";

const { publicRuntimeConfig } = getConfig();

const stages = [
  {
    name: "Selección Cuponera",
    kind: "cuponera_1",
  },
  {
    name: "Pago",
    kind: "pago",
  },
  {
    name: "Confirmación",
    kind: "confirmacion",
  },
];

export default function cuponera(props) {
  const origenes = props.ciudades;
  const [stage, setStage] = useState(0);
  const [parrilla, setParrilla] = useState(props.cuponeras.object);
  const [parrillaSeleccionada, setParrillaSeleccionada] = useState({});
  const [loadingParrilla, setLoadingParrilla] = useState(false);
  const stages_active = stages.filter((i) => i.kind != "cuponera_1");

  return (
    <Layout>
      <Head>
        <title>Boletos.com | Compra tu cuponera</title>
      </Head>
      <div className={styles["home"]}>
        {stage == 0 ? (
          <>
            <div className={styles["container"]}>
              <div className={styles["fila"]}>
                <div className={styles["title"]}>Cuponera</div>
                <div className={styles["sub-title"]}>
                  La cuponera es un talonario de boletos de ida y regreso a un
                  precio preferencial en las rutas que este disponible, las
                  condiciones de uso son las siguentes:
                  <br /> &#8226; Los boletos pueden ser usados de lunes a
                  domingo.
                  <br /> &#8226; Sólo se pueden realizar dos viajes diarios, es
                  decir, uno de ida y uno de regreso.
                  <br /> &#8226; Una vez adquirida la cuponera{" "}
                  <span>no puede ser transferida a otra persona. </span>
                  <br />
                  <br />
                  Por último si compras la cuponera y decides no utilizarla,
                  podrás devolverla en cualquier oficina.
                </div>
                <BusquedaCuponera
                  origenes={origenes}
                  parrilla={parrilla}
                  setParrilla={setParrilla}
                  setLoadingParrilla={setLoadingParrilla}
                />
                <div className="pasajes-compra bg-transparent">
                  <div className="container">
                    <ul className="d-flex flex-row justify-content-around py-4 px-0">
                      {stages
                        .filter((stageMaped) => stageMaped.kind != "pasajes_2")
                        .map((stageMaped, indexStage) => {
                          return (
                            <div
                              key={`stage-${indexStage}`}
                              className={
                                "seleccion text-center " +
                                (indexStage == stage ? "active" : "")
                              }
                            >
                              <div className="numeros">
                                <div className="numero">{indexStage + 1}</div>
                              </div>
                              <h3>{stageMaped.name}</h3>
                            </div>
                          );
                        })}
                    </ul>
                  </div>
                </div>

                {loadingParrilla ? (
                  <Loader />
                ) : parrilla.length > 0 ? (
                  <ParrillaCuponera
                    parrilla={parrilla}
                    setParrilla={setParrilla}
                    stage={stage}
                    setStage={setStage}
                    parrillaSeleccionada={parrillaSeleccionada}
                    setParrillaSeleccionada={setParrillaSeleccionada}
                  />
                ) : (
                  <h5 className="p-2 text-center">
                    Lo sentimos, no existen resultados para su búsqueda
                  </h5>
                )}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}

        {stage == 1 ? (
          <>
            <div>
              <div className="pasajes-compra bg-transparent">
                <div className="container">
                  <ul className="d-flex flex-row justify-content-around py-4">
                    {stages
                      .filter((stageMaped) => stageMaped.kind != "pasajes_2")
                      .map((stageMaped, indexStage) => {
                        return (
                          <div
                            key={`stage-${indexStage}`}
                            className={
                              "seleccion text-center " +
                              (indexStage == stage ? "active" : "")
                            }
                          >
                            <div className="numeros">
                              <div className="numero">{indexStage + 1}</div>
                            </div>
                            <h3>{stageMaped.name}</h3>
                          </div>
                        );
                      })}
                  </ul>
                </div>
              </div>
              <PagoCuponera />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <Footer />
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  let ciudades = await axios.get(
    publicRuntimeConfig.site_url + "/api/ciudades"
  );

  let dias = await axios.get(publicRuntimeConfig.site_url + "/api/dias");

  let cuponeras = {
    data: {
      object: [],
    },
  };

  try {
    cuponeras = await axios.get(
      publicRuntimeConfig.site_url + "/api/coupon/obtener-cuponera-activas"
    );
  } catch (error) {}

  return {
    props: {
      ciudades: ciudades.data,
      dias: dias.data,
      cuponeras: cuponeras.data,
    },
  };
},
sessionOptions);
