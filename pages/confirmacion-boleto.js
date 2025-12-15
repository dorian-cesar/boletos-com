import axios from "axios";
import Layout from "components/Layout";
import { useState } from "react";

import Head from "next/head";

export default function confirmacionBoleto(props) {
  const [stage, setStage] = useState(0);
  return (
    <Layout>
      <Head>
        <title>Boletos.com | Confirmación Boleto</title>
      </Head>
      <div className="pullman-mas mb-5">
        <div className="container">
          <div className="row py-4">
            <div className="col-12">
              <span>Home &gt; Te ayudamos &gt; Confirmación </span>
            </div>
          </div>
          <div className="row pb-5">
            <div className="col-md-6 col-12 d-flex align-items-center">
              <div>
                <img src="img/icon-estrella-mas.svg" alt="" />
                <h1>
                  Confirmación
                  <br /> <strong>de Boleto</strong>
                </h1>
                <p>
                  Completa los datos para confirmar el día y hora de tu pasaje
                  en blanco. La confirmación debe ser al menos 4 horas antes de
                  la partida del bus. Recuerda que el pasaje en blanco tiene una
                  duración máxima de 6 meses a partir de la fecha de compra.
                </p>
              </div>
            </div>
            <div className="col-md-6 col-12 foto-header">
              <img
                src="../public/img/boleto/Boleto.svg"
                className="img-fluid"
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {stage == 0 ? (
        <div className="ingreso-destino mb-5">
          <div className="container">
            <div className="bloque">
              <div className="row mb-4 d-flex justify-content-center">
                <div className="col-md-8 col-12 text-center">
                  <h2>
                    Ingresa el código de tu boleto{" "}
                    <strong>para confirmar el viaje</strong>
                  </h2>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 col-12">
                  <div className="grupo-campos">
                    <label className="label-input">Código de boleto</label>
                    <input
                      type="text"
                      name=""
                      placeholder="Ej: 9465hdiaikeba"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-4 col-12">
                  <div className="grupo-campos">
                    <label className="label-input">E-mail</label>
                    <input
                      type="email"
                      name=""
                      placeholder="Ingresa tu email de contacto"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-4 col-12">
                  <div className="grupo-campos">
                    <label className="label-input">Confirma E-mail</label>
                    <input
                      type="email"
                      name=""
                      placeholder="Confirma tu e-mail"
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-md-4 col-12 offset-md-4">
                  <a href="cuponera-3.html" className="btn">
                    Buscar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {stage == 1 ? (
        <div className="ingreso-destino mb-5">
          <div className="container">
            <div className="row">
              <div className="col-12 col-md-6 pt-2">
                <div className="w-100">
                  <label className="boleto">
                    <input type="checkbox" />
                    <div className="block">
                      <div className="content-block">
                        <div className="row">
                          <div className="col-4 d-flex align-items-end">
                            <strong>Arica</strong>
                          </div>
                          <div className="col-4 text-center pt-4">
                            <span>Duración</span>
                            <span className="datos">
                              <strong>28 hrs 50 min</strong>
                            </span>
                          </div>
                          <div className="col-4 text-end d-flex align-items-end">
                            <strong>Santiago</strong>
                          </div>
                        </div>
                        <div className="barra">
                          <img src="img/icon-barra.svg" />
                        </div>
                        <div className="row">
                          <div className="col-4">
                            <span>Estado:</span>
                            <strong>Por confirmar</strong>
                          </div>
                          <div className="col-4 text-center">
                            <span>Precio:</span>
                            <strong className="precio">$53.300</strong>
                          </div>
                          <div className="col-4 text-end">
                            <span>N° asiento</span>
                            <strong>-</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="bloque">
                  <div className="grupo-campos mb-4">
                    <label className="label-input">¿Cuándo viajamos?</label>
                    <div className="row">
                      <div className="col-12 col-md-3">
                        <select
                          name="cars"
                          id="cars"
                          className="form-control seleccion"
                        >
                          <option value="">20</option>
                          <option value="">21</option>
                          <option value="">22</option>
                          <option value="">23</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-3">
                        <select
                          name="cars"
                          id="cars"
                          className="form-control seleccion"
                        >
                          <option value="">12</option>
                          <option value="">21</option>
                          <option value="">22</option>
                          <option value="">23</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-3">
                        <select
                          name="cars"
                          id="cars"
                          className="form-control seleccion"
                        >
                          <option value="">2021</option>
                          <option value="">2022</option>
                          <option value="">2023</option>
                          <option value="">2024</option>
                        </select>
                      </div>
                      <div className="col-3 d-flex align-items-center">
                        <img src="img/icon-calendario-naranjo.svg" alt="" />
                      </div>
                    </div>
                  </div>
                  <div className="w-100">
                    <a href="cuponera-4.html" className="btn">
                      Buscar servicios
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </Layout>
  );
}
