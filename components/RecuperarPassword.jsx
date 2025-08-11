import { useState } from "react";
import { useForm } from "/hooks/useForm";
import axios from "axios";

const recuperarPasswordFormFields = {
  mail:""
}
const RecuperarPassword = ({ onChangeMode,  onChangeAlert }) => {
  const { formState: recuperar, onInputChange } = useForm(recuperarPasswordFormFields);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    errorMsg: '',
    status: false
  });

  const changeMode = () => {
    onChangeMode("0");
  };

  const recuperarPassword = async () => {
    if(recuperar.mail == '') {
      return setError({
        errorMsg: 'Se requiere ingresar un correo electrónico para recuperar la contraseña.',
        status: true
      })
    }

    try{
      setIsLoading(true);
      const res = await axios.post("/api/user/recuperar-password", {...recuperar});
      if(res.data){
        onChangeAlert({
          msg: "Se ha enviado un correo para restaurar su contraseña.",
          visible: true,
          type: 'text-success'
        })
        changeMode();
      }
    } catch (e) {
      setIsLoading(false);
      if(e.response.status == 400){
        setError({ status: true, errorMsg: "Revise el correo ingresado." });
      } else {
        setError({ status: true, errorMsg: 'Ocurrió un error inesperado.' });
      }
    }
  }

  return (
    <>
      <div className="modal-content">
        <div className="modal-body">
          <div className="container">
            <div className="d-flex justify-content-center">
              <img src="img/icon-foto.svg" width={75}></img>
            </div>
            <div className="d-flex justify-content-center mt-2">
              <h4 className="titulo-azul">Recuperación de Contraseña</h4>
            </div>
            <div className="d-flex justify-content-center text-center">
              Ingresa un correo electrónico para enviarte un email con una
              contraseña provisoria
            </div>
            <div className="row mt-2">
              {error.status ?  
              <div className="alert text-danger text-center" role="alert">
                { error?.errorMsg }
              </div>:''
              }
            </div>
            {isLoading ? 
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden"></span>
              </div>
            </div>:''
            }
            <div className="row mt-2">
              <div className="col-12">
                <label className="label-input">Correo electrónico</label>
                <input
                  type="text"
                  placeholder="Ej: example@example.com"
                  className="form-control"
                  name="mail"
                  value={recuperar?.mail}
                  onChange={ onInputChange }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-modal-primary" onClick={(e) => recuperarPassword()}>
            Enviar
          </button>
          <button
            type="button"
            className="btn btn-modal-secondary"
            onClick={changeMode}
          >
            Volver
          </button>
        </div>
      </div>
    </>
  );
};

export default RecuperarPassword;
