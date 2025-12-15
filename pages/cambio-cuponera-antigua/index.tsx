import { useState } from "react";
import styles from "./cambio-cuponera-antigua.module.css";

import Footer from "components/Footer";
import Layout from "components/Layout";

import { ToastContainer, toast } from "react-toastify";

type Form = {
  codigoCuponera: string;
  email: string;
  confirmacionEmail: string;
};

export default function CambioCuponeraAntigua() {
  const [isSended, setIsSended] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);

  const [form, setForm] = useState<Form>({
    codigoCuponera: "",
    email: "",
    confirmacionEmail: "",
  });

  async function handleSubmit(event: any) {
    event.preventDefault();

    setLoader(true);

    if (
      form.codigoCuponera === "" ||
      form.email === "" ||
      form.confirmacionEmail === ""
    ) {
      setLoader(false);
      toast.error("Debe ingresar todos los datos para solicitar sus boletos", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
      return;
    }

    if (form.email !== form.confirmacionEmail) {
      setLoader(false);
      toast.error("Los correos electronicos ingresados deben ser iguales", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
      return;
    }

    try {
      const response = await fetch("/api/coupon/recuperar-cuponera", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const { message, status } = await response.json();

      setLoader(false);

      if (!status) {
        toast.error(message, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
        });
      } else {
        setIsSended(true);
      }
    } catch (error) {
      setLoader(false);

      toast.error("Ocurrio un error al intentar validar tu cuponera", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
      });
      return;
    }
  }

  function handleSetValues(event: any) {
    let formValues: any = { ...form };
    formValues[event.target.name] =
      event.target.name === "codigoCuponera"
        ? event.target.value.toUpperCase()
        : event.target.value;
    setForm(formValues);
  }

  return (
    <Layout>
      <main className="container my-4">
        <h6>{"Inicio > Cambio de cuponera antigua"}</h6>
        <section className={styles["contenedor-formulario"]}>
          {!isSended ? (
            <>
              <h4>Cambio de cuponera antigua</h4>
              <span>
                Ingresa el código de tu cuponera antigua y el correo al cual
                deseas que lleguen los nuevos boletos en blanco. Esto solo puede
                ser realizado <strong>una vez por cuponera</strong> y es valido
                solo para cuponeras compradas con sistema antiguo Boletos.com.
              </span>
              <strong>
                Este formulario dejará de operar el 31/05/2024 a las 23:59.
              </strong>
              <form onSubmit={handleSubmit}>
                <section className={`${styles["contenedor-inputs"]} row`}>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                    <label
                      htmlFor="codigoCuponera"
                      className="form-label fw-normal"
                    >
                      Código de Cuponera antigua
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="codigoCuponera"
                      name="codigoCuponera"
                      value={form.codigoCuponera}
                      onChange={handleSetValues}
                    />
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                    <label htmlFor="email" className="form-label fw-normal">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={handleSetValues}
                    />
                  </div>
                  <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xxl-4 px-2">
                    <label
                      htmlFor="confirmacionEmail"
                      className="form-label fw-normal"
                    >
                      Confirmación de correo electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="confirmacionEmail"
                      name="confirmacionEmail"
                      placeholder="correo@ejemplo.com"
                      value={form.confirmacionEmail}
                      onChange={handleSetValues}
                    />
                  </div>
                  <div className={`col-12 ${styles["contenedor-boton"]}`}>
                    <button
                      type="submit"
                      disabled={loader}
                      className={loader ? styles["cursor-block"] : ""}
                    >
                      Continuar
                    </button>
                  </div>
                </section>
              </form>
            </>
          ) : (
            <>
              <span className={`mx-auto ${styles["check"]}`}>👍</span>
              <section className="mx-auto p-3">
                <p className="fs-2 fw-normal text-center">
                  Su(s) boleto(s) en blanco ya fueron enviados al correo{" "}
                  <strong>{form.email}</strong>. <br />
                  Recuerde confirmar su(s) boleto(s) en blanco en la sección
                  "Confirmación" del menú.
                </p>
              </section>
            </>
          )}
        </section>
      </main>
      <ToastContainer />
      <Footer />
    </Layout>
  );
}
