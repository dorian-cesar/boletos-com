import { useState, useEffect } from "react";
import { useForm } from "hooks/useForm";
import { useRouter } from "next/router";
import axios from "axios";

const resetPasswordFormFields = {
  password: "",
  confirmPassword: "",
};

const ResetPassword = () => {
  const { formState: reset, onInputChange } = useForm(resetPasswordFormFields);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ errorMsg: "", status: false });
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(null);

  const router = useRouter();
  const [token, setToken] = useState("");

  useEffect(() => {
    if (router.query.token) {
      const queryToken = Array.isArray(router.query.token)
        ? router.query.token[0]
        : router.query.token;
      setToken(queryToken || "");
    }
  }, [router.query.token]);

  useEffect(() => {
    let timer;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      router.push("/");
    }
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const enviarResetPassword = async () => {
    setError({ errorMsg: "", status: false });
    setSuccessMsg("");

    if (!reset.password || !reset.confirmPassword) {
      return setError({
        errorMsg: "Debes completar ambos campos.",
        status: true,
      });
    }

    if (reset.password !== reset.confirmPassword) {
      return setError({
        errorMsg: "Las contraseñas no coinciden.",
        status: true,
      });
    }

    try {
      setIsLoading(true);
      const res = await axios.post("/api/user/cambiar-password", {
        token,
        newPassword: reset.password,
      });
      if (res.data.message) {
        setSuccessMsg("Contraseña cambiada con éxito");
        setCountdown(3);
      }
    } catch (e) {
      setIsLoading(false);
      if (e.response?.status === 400) {
        setError({ status: true, errorMsg: "Enlace inválido o expirado." });
      } else {
        setError({
          status: true,
          errorMsg: "Ocurrió un error inesperado.",
        });
      }
    } finally {
      if (!successMsg) setIsLoading(false);
    }
  };

  const isDisabled = isLoading || countdown !== null;

  return (
    <div className="container p-4" style={{ maxWidth: 400, margin: "auto" }}>
      <div className="text-center mb-3">
        <img src="/img/icon-foto.svg" width={75} alt="icon" />
      </div>
      <h4 className="titulo-azul text-center">Restablecer Contraseña</h4>
      <p className="text-center">
        Ingresa tu nueva contraseña para completar el proceso
      </p>

      {error.status && (
        <div className="alert text-danger text-center">{error.errorMsg}</div>
      )}
      {successMsg && (
        <div className="alert text-success text-center">
          {successMsg} <br />
          Redirigiendo en {countdown}...
        </div>
      )}
      {isLoading && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Nueva contraseña</label>
        <input
          type="password"
          placeholder="********"
          className="form-control"
          name="password"
          value={reset.password}
          onChange={onInputChange}
          disabled={isDisabled}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirmar contraseña</label>
        <input
          type="password"
          placeholder="********"
          className="form-control"
          name="confirmPassword"
          value={reset.confirmPassword}
          onChange={onInputChange}
          disabled={isDisabled}
        />
      </div>

      <button
        className="btn btn-primary w-100 mb-2"
        onClick={enviarResetPassword}
        disabled={isDisabled}
      >
        {isLoading ? "Guardando..." : "Guardar"}
      </button>

      <button
        className="btn btn-secondary w-100"
        onClick={() => router.push("/")}
        disabled={isDisabled}
      >
        Volver
      </button>
    </div>
  );
};

export default ResetPassword;
