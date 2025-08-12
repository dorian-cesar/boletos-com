import Layout from "../Layout";
import { useEffect, useState } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import Head from "next/head";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const VerDatosUsuario = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { getItem } = useLocalStorage();

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  return (
    <Layout>
      <Head>
        <title>Pullman Bus | Mi Perfil</title>
      </Head>

      {isLoading ? (
        <div className="d-flex justify-content-center mt-2">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden"></span>
          </div>
        </div>
      ) : (
        <>
          <div className="pullman-mas">
            <div className="container">
              <div className="row py-4">
                <div className="col-12">
                  <span>Home &gt; Mi Perfil</span>
                </div>
              </div>
            </div>
          </div>

          <div className="row pb-5">
            <div className="d-flex justify-content-center">
              <div className="col-12 col-md-8 bloque flex-column">
                <div className="row mb-2">
                  <div className="d-flex justify-content-center mt-2">
                    <img
                      src="/img/icon-foto-naranjo.svg"
                      width={120}
                      alt="Foto perfil"
                    />
                  </div>
                </div>

                <h1 className="titulo-azul text-center">
                  {user?.nombres} {user?.apellidoPaterno}
                </h1>

                <div className="d-flex justify-content-center mt-2 mb-4">
                  <a href="/">Volver</a>
                </div>

                <h1 className="titulo-azul">Mi Perfil</h1>

                <div className="row mt-2">
                  <div className="col-6">
                    <label className="label-input-modal">Nombres</label>
                    <p>{user?.nombres}</p>
                  </div>
                  <div className="col-6">
                    <label className="label-input-modal">
                      Apellido Paterno
                    </label>
                    <p>{user?.apellidoPaterno}</p>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-6">
                    <label className="label-input-modal">
                      Apellido Materno
                    </label>
                    <p>{user?.apellidoMaterno}</p>
                  </div>
                  <div className="col-6">
                    <label className="label-input-modal">RUT</label>
                    <p>{user?.rut}</p>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-6">
                    <label className="label-input-modal">Sexo</label>
                    <p>{user?.sexo}</p>
                  </div>
                  <div className="col-6">
                    <label className="label-input-modal">
                      Fecha de nacimiento
                    </label>
                    <p>
                      {user?.fechaNacimiento
                        ? new Date(user.fechaNacimiento).toLocaleDateString(
                            "es-CL"
                          )
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-6">
                    <label className="label-input-modal">Correo</label>
                    <p>{user?.correo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default VerDatosUsuario;
