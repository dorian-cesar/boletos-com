import axios from "axios";
import DatePicker, { registerLocale } from "react-datepicker";
import Layout from "../Layout"
import { useEffect, useState, forwardRef, useRef, useMemo } from "react";
import { useLocalStorage } from "/hooks/useLocalStorage";
import { useRouter } from "next/router";
import { useForm } from "/hooks/useForm";
import Head from "next/head";
import { decryptData } from "utils/encrypt-data.js";
import LocalStorageEntities from "entities/LocalStorageEntities";

const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <input
      type="text"
      className="fecha-input-modal form-control form-control-modal"
      onClick={onClick}
      ref={ref}
      value={value}
      onChange={()=>{}}
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

const actualizarFormFields = {
  rut: "",
  apellidoMaterno: "",
  apellidoPaterno: "",
  correo: "",
  correo2: "",
  fechaNacimiento: "",
  nombres: "",
  tipoDocumento: "R",
  sexo: "",
};

const ActualizarDatos = () => {
  const { formState: data, onInputChange } = useForm(actualizarFormFields);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const router = useRouter();
  const { getItem } = useLocalStorage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(false);
  const [alerta, setAlerta] = useState({
    msg: "",
    visible: false,
    type: "",
  });

  useEffect(() => {
    let checkUser = decryptData(LocalStorageEntities.user_auth);
    if (checkUser == null) router.push("/");
    setUser(checkUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    data.nombres = user?.nombres;
    data.apellidoPaterno = user?.apellidoPaterno;
    data.apellidoMaterno = user?.apellidoMaterno;
    data.sexo = user?.sexo;
    data.correo = user?.correo;
    data.correo2 = user?.correo;
    data.rut = user?.rut;
    if(!!user?.fechaNacimiento) {
        let fecha = new Date(String(user?.fechaNacimiento).substring(0, String(user?.fechaNacimiento).length-5));
        setFechaNacimiento(fecha);
    }
  }, [user])

  useEffect(() => {
    data.fechaNacimiento = fechaNacimiento;
  }, [fechaNacimiento]);
  
  const listaYears = useMemo(() => {
    let years = [];
    for(let i = new Date().getFullYear(); i >= 1910; i--) {
      years.push(i);
    }
    return years
  }, [])

  const actualizarDatos = async () => {
    const formStatus = await validarForm();
    if(formStatus){
      setIsLoading2(true);
      const res = await axios.post("../api/user/actualizar-datos-perfil", {
        ...data,
      });
      if(res.data.status){
        setIsLoading2(false);
        setAlerta({ visible: true, msg: res.data.message, type: "alert-success" });
        setTimeout(() => {
          setAlerta({ visible: false, msg: '', type: '' });
        }, 5000); 
      }
      setIsLoading2(false);
    }
  }

  const validarForm = () => {
    return new Promise((resolve, reject) => {
      const values = Object.values(data);
      const camposVacios = values.filter((v) => v == '');
      if(camposVacios.length > 0){
        setAlerta({ visible: true, msg: 'Se requiere rellenar todos los campos.', type:'alert-danger' });
        resolve(false);
      } else {
        if(data?.correo != data?.correo2){
          setAlerta({ visible: true, msg: 'Los correos no coinciden. Por favor, verificar.', type:'alert-danger' });
          resolve(false);
        } else {
          setAlerta({ visible: false, msg: '', type:'' });
          resolve(true);
        }
      }
    })
  }


  return (
    <Layout>
      <Head>
        <title>Pullman Bus | Actualizar mis datos</title>
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
                  <span>Home &gt; Mi Perfil </span>
                </div>
              </div>
            </div>
          </div>
          <div className="row pb-5">
            <div className="d-flex justify-content-center">
              <div className="col-12 col-md-8 bloque flex-column">
                <div className="row mb-2">
                  <div className="d-flex justify-content-center mt-2">
                    <img src="/img/icon-foto-naranjo.svg" width={120} color={'#eb7f33'}></img>
                  </div>
                </div>
                <h1 className="titulo-azul text-center">
                  { user?.nombres } {user?.apellidoPaterno}
                </h1>
                <div className="d-flex justify-content-center mt-2 mb-4">
                  <a href="/">Volver</a>
                </div>
                <h1 className="titulo-azul">
                  Mi Perfil
                </h1>
                {alerta?.visible ? (
                    <div className={"alert " + alerta?.type} role="alert">
                      {alerta?.msg}
                    </div>
                  ) : (
                    ""
                )}
                {isLoading2 ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden"></span>
                  </div>
                </div>
                ):("")}
                <div className="row mt-2">
                  <div className="col-6">
                    <label className="label-input-modal">Nombres</label>
                    <input
                      type="text"
                      className={"form-control form-control-modal"}
                      name="nombres"
                      value={ data?.nombres }
                      onChange={ onInputChange }
                    />
                  </div>
                </div>
                <div className="row mt-2">
                    <div className="col-6">
                        <label className="label-input-modal">Apellido Paterno</label>
                        <input
                        type="text"
                        className={"form-control form-control-modal"}
                        name="apellidoPaterno"
                        value={ data?.apellidoPaterno }
                        onChange={ onInputChange }
                        />
                    </div>
                    <div className="col-6">
                        <label className="label-input-modal">Apellido Materno</label>
                        <input
                        type="text"
                        className={"form-control form-control-modal"}
                        name="apellidoMaterno"
                        value={ data?.apellidoMaterno }
                        onChange={ onInputChange }
                        />
                    </div>
                </div>
                {/* <div className="row">
                    <div className="col-6">
                        <label className="label-input-modal">Sexo</label>
                        <select
                        name="sexo"
                        id="sexo"
                        className="form-control form-control-modal seleccion"
                        value={data?.sexo}
                        onChange={ onInputChange }
                        >
                        <option value={""}>Seleccione una opción...</option>
                        <option value={"FEMENINO"}>Femenino</option>
                        <option value={"MASCULINO"}>Masculino</option>
                        <option value={"OTRO"}>Otro</option>
                        </select>
                    </div> */}
                    {/* <div className="col-6">
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
                    </div>
                </div> */}
                {/* <div className="row">
                    <div className="col-6">
                        <label className="label-input-modal">Correo</label>
                        <input
                        type="email"
                        className={"form-control form-control-modal"}
                        name="correo"
                        value={data?.correo}
                        onChange={onInputChange}
                        />
                    </div>
                    <div className="col-6">
                        <label className="label-input-modal">Confirme correo</label>
                        <input
                        type="email"
                        className={"form-control form-control-modal"}
                        name="correo2"
                        value={data?.correo2}
                        onChange={onInputChange}
                        />
                    </div>
                </div> */}
                <div className="row mt-4 d-flex justify-content-center">
                    <div className="col-12 col-md-6">
                        <div className="">
                          <button
                            type="button"
                            className="btn"
                            onClick={(e) => actualizarDatos()}
                          >
                            Actualizar datos
                          </button>
                        </div>
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

export default ActualizarDatos;
