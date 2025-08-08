import DatePicker, { registerLocale } from "react-datepicker";
import { useForm } from "/hooks/useForm";
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import Rut from "rutjs";
import axios from "axios";

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    className="fecha-input-modal form-control form-control-modal"
    onClick={onClick}
    ref={ref}
    value={value}
    onChange={() => {}}
  />
));
const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// const registroFormFields = {
//   rut:"",
//   apellidoMaterno:"",
//   apellidoPaterno:"",
//   password:"",
//   password2: "",
//   mail:"",
//   mail2:"",
//   fechaNacimiento:"",
//   nombres:"",
//   tipoDocumento:"R",
//   sexo:""
// }

const registroFormFields = {
  rut: "",
  password: "",
  password2: "",
  mail: "",
  mail2: "",
  nombreApellido: "",
  tipoDocumento: "R",
};

const Registro = ({ onChangeMode, onChangeAlert }) => {
  const { formState: registro, onInputChange } = useForm(registroFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    errorMsg: "",
    status: false,
  });

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowPassword2, setIsShowPassword2] = useState(false);

  const listaYears = useMemo(() => {
    let years = [];
    for (let i = new Date().getFullYear(); i >= 1910; i--) {
      years.push(i);
    }
    return years;
  }, []);

  // useEffect(() => {
  //   registro.fechaNacimiento = fechaNacimiento;
  // }, [fechaNacimiento]);

  const changeMode = () => {
    onChangeMode("0");
  };

  const registrar = async () => {
    const formStatus = await validarForm();
    if (formStatus) {
      try {
        setIsLoading(true);
        const res = await axios.post("/api/user/registro-usuario", {
          ...registro,
        });
        if (res.data.message === "Usuario registrado correctamente") {
          onChangeAlert({
            msg: "¡Registro completado con éxito! Ingrese con su correo electrónico y contraseña.",
            visible: true,
            // type: "alert-success",
            type: "text-success",
          });
          changeMode();
        }
      } catch (e) {
        setIsLoading(false);
        if (e.response) {
          const backendError = e.response.data;
          const isDuplicateEmail =
            backendError.details &&
            backendError.details.includes("E11000 duplicate key error");
          const baseMsg = isDuplicateEmail
            ? (onChangeAlert({
                msg: "El usuario ya está registrado. Ingrese con su correo electrónico y contraseña.",
                visible: true,
                // type: "alert-success",
                type: "text-success",
              }),
              changeMode())
            : backendError.error || "Error desconocido.";
          const errorMsg = isDuplicateEmail
            ? baseMsg
            : `${baseMsg} Intente nuevamente.`;
          setError({
            status: true,
            errorMsg,
          });
        } else {
          setError({
            status: true,
            errorMsg: "Ocurrió un error inesperado.",
          });
        }
      }
    }
  };

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      const values = Object.values(registro);
      const camposVacios = values.filter((v) => v == "");
      if (camposVacios.length > 0) {
        setError({
          status: true,
          errorMsg: "Se requiere rellenar todos los campos.",
        });
        resolve(false);
      } else {
        if (registro?.tipoDocumento == "R") {
          let rut = new Rut(registro?.rut);
          if (!rut?.isValid) {
            setError({
              status: true,
              errorMsg: "Se requiere ingresar un rut válido",
            });
            return resolve(false);
          }
        }
        if (registro?.mail != registro?.mail2) {
          setError({
            status: true,
            errorMsg: "Los correos no coinciden. Por favor, verificar.",
          });
          resolve(false);
        } else if (registro?.password != registro?.password2) {
          setError({
            status: true,
            errorMsg: "Las contraseñas no coinciden. Por favor, verificar.",
          });
          resolve(false);
        } else {
          setError({ status: false, errorMsg: "" });
          resolve(true);
        }
      }
    });
  };

  return (
    <>
      <div className="modal-content">
        <div className="modal-body">
          <div className="container">
            <div className="d-flex justify-content-center">
              <img src="img/icon-foto.svg" width={75}></img>
            </div>
            <div className="d-flex justify-content-center mt-2">
              <h4 className="titulo-azul">Registrate</h4>
            </div>
            <div className="d-flex justify-content-center text-center">
              ¡Se parte de Pullman Bus! Ingresa los siguientes datos para crear
              tu cuenta
            </div>
            <div className="row mt-2 text-center">
              {error.status ? (
                <div className="alert alert-danger text-danger" role="alert">
                  {error?.errorMsg}
                </div>
              ) : (
                ""
              )}
            </div>
            {isLoading ? (
              <div className="d-flex justify-content-center">
                <div className="spinner-border text-primary my-2" role="status">
                  <span className="visually-hidden"></span>
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="row mt-2">
              <div className="col-12 col-md-6">
                <div className="row">
                  <div className="col-4">
                    <label className="contenedor">
                      RUT
                      <input
                        type="checkbox"
                        value={"R"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={registro?.tipoDocumento == "R" ? true : false}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                  <div className="col-8">
                    <label className="contenedor">
                      Pasaporte
                      <input
                        type="checkbox"
                        value={"P"}
                        name="tipoDocumento"
                        onChange={onInputChange}
                        checked={registro?.tipoDocumento == "P" ? true : false}
                      />
                      <span className="checkmark"></span>
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={
                    registro?.tipoDocumento != "R"
                      ? "Ej. 111111111"
                      : "Ej. 11111111-1"
                  }
                  disabled={registro?.tipoDocumento != "" ? false : true}
                  className={"form-control form-control-modal"}
                  name="rut"
                  value={registro?.rut}
                  onChange={onInputChange}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Nombre y Apellido</label>
                <input
                  type="text"
                  className={"form-control form-control-modal"}
                  // name="nombres"
                  // value={ registro?.nombres }
                  name="nombreApellido"
                  value={registro?.nombreApellido}
                  onChange={onInputChange}
                />
              </div>
            </div>
            {/* <div className="row">
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Apellido Paterno</label>
                <input
                  type="text"
                  className={"form-control form-control-modal"}
                  name="apellidoPaterno"
                  value={ registro?.apellidoPaterno }
                  onChange={ onInputChange }
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Apellido Materno</label>
                <input
                  type="text"
                  className={"form-control form-control-modal"}
                  name="apellidoMaterno"
                  value={ registro?.apellidoMaterno }
                  onChange={ onInputChange }
                />
              </div>
            </div> */}
            {/* <div className="row">
              <div className="col-12 col-md-7 col-lg-6">
                <label className="label-input-modal">Género</label>
                <select
                  name="sexo"
                  id="sexo"
                  className="form-control form-control-modal seleccion"
                  value={registro?.sexo}
                  onChange={ onInputChange }
                >
                  <option value={""}>Seleccione una opción...</option>
                  <option value={"Hombre"}>Hombre</option>
                  <option value={"Mujer"}>Mujer</option>
                  <option value={"OTRO"}>Prefiero no especificar</option>
                </select>
              </div> */}
            {/* <div className="col-12 col-md-5 col-lg-6">
                <label className="label-input-modal">Fecha nacimiento</label>
                <DatePicker
                  renderCustomHeader={({
                    date,
                    changeYear,
                    changeMonth,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div
                      style={{
                        margin: 10,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                        {"<"}
                      </button>
                      <select
                        onChange={({ target: { value } }) => changeYear(value)}
                      >
                        {listaYears.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
            
                      <select
                        value={months[date.getMonth()]}
                        onChange={({ target: { value } }) =>
                          changeMonth(months.indexOf(value))
                        }
                      >
                        {months.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
            
                      <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                        {">"}
                      </button>
                    </div>
                  )}
                  selected={fechaNacimiento}
                  onChange={(date) => setFechaNacimiento(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={"es"}
                  placeholderText={""}
                  customInput={<CustomInput />}
                />
              </div> */}
            {/* </div> */}
            <div className="row">
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Correo</label>
                <input
                  type="email"
                  className={"form-control form-control-modal"}
                  name="mail"
                  value={registro?.mail}
                  onChange={onInputChange}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Confirme correo</label>
                <input
                  type="email"
                  className={"form-control form-control-modal"}
                  name="mail2"
                  value={registro?.mail2}
                  onChange={onInputChange}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Contraseña</label>
                <div className="input-group">
                  <input
                    type={!isShowPassword ? "password" : "text"}
                    className={"form-control form-control-modal w-75"}
                    name="password"
                    value={registro?.password}
                    onChange={onInputChange}
                  />
                  <span
                    className="input-group-text form-control p-0 d-flex"
                    onClick={() => setIsShowPassword(!isShowPassword)}
                  >
                    {!isShowPassword ? (
                      <img
                        src="img/icon/form/eye-outline.svg"
                        className="d-flex m-auto"
                        width={25}
                        height={25}
                        alt="eye outline"
                      />
                    ) : (
                      <img
                        src="img/icon/form/eye-off-outline.svg"
                        className="d-flex m-auto"
                        width={25}
                        height={25}
                        alt="eye outline"
                      />
                    )}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <label className="label-input-modal">Confirme contraseña</label>
                <div className="input-group">
                  <input
                    type={!isShowPassword2 ? "password" : "text"}
                    className={"form-control form-control-modal w-75"}
                    name="password2"
                    value={registro?.password2}
                    onChange={onInputChange}
                  />
                  <span
                    className="input-group-text form-control p-0 d-flex"
                    onClick={() => setIsShowPassword2(!isShowPassword2)}
                  >
                    {!isShowPassword2 ? (
                      <img
                        src="img/icon/form/eye-outline.svg"
                        className="d-flex m-auto"
                        width={25}
                        height={25}
                        alt="eye outline"
                      />
                    ) : (
                      <img
                        src="img/icon/form/eye-off-outline.svg"
                        className="d-flex m-auto"
                        width={25}
                        height={25}
                        alt="eye outline"
                      />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-modal-primary"
            onClick={(e) => registrar()}
          >
            Registrarme
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

export default Registro;
