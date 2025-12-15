import Rut from "rutjs";
import Check from "components/Check";

const isSame = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);

const InformacionPasajero = (props) => {
  const {
    tipoViaje,
    cliente,
    index,
    nacionalidades,
    carro,
    setCarro,
    validarFormatoRut,
  } = props;

  function openPasajero(indexCliente, tipo) {
    try {
      let carroTemporal = { ...carro };
      const tipoCliente = tipo == "ida" ? "clientes_ida" : "clientes_vuelta";
      carroTemporal[tipoCliente] = carro[tipoCliente].map((carroMapped) => {
        carroMapped.open = false;
        return carroMapped;
      });
      carroTemporal[tipoCliente][indexCliente].open = true;
      setCarro(carroTemporal);
    } catch ({ message }) {
      console.error(`Error al abrir detalle pasajero [${message}]`);
    }
  }

  function setDataPasaje({ name, value }, indexCliente, tipo) {
    try {
      let carroTemporal = { ...carro };
      const tipoCliente = tipo == "ida" ? "clientes_ida" : "clientes_vuelta";
      value = validarFormatoRut(name, value);
      carroTemporal[tipoCliente][indexCliente].pasajero[name] = value;
      setCarro(carroTemporal);
    } catch ({ message }) {
      console.error(`Error al agregar información al pasajero [${message}]`);
    }
  }

  function isValidPasajero(pasajero, indexPasajero, direccionRecorrido) {
    try {
      let isValid = true;
      let errors = [...pasajero.errors];
      let carroTemporal = { ...carro };
      let errorTemporal = [];

      if (!pasajero.nombre || pasajero.nombre == "") {
        isValid = false;
      }

      if (!pasajero.apellido || pasajero.apellido == "") {
        isValid = false;
      }

      if (!pasajero.email || pasajero.email == "") {
        isValid = false;
      } else {
        if (
          !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email)
        ) {
          errorTemporal.push("email");
        }
      }

      if (!pasajero.email_2 || pasajero.email_2 == "") {
        isValid = false;
      } else {
        if (pasajero.email != pasajero.email_2) {
          errorTemporal.push("email_2");
        }
      }

      if (!pasajero.rut || pasajero.rut == "") {
        isValid = false;
      } else {
        const rutValidacion = new Rut(pasajero.rut);
        if (!rutValidacion.isValid) {
          isValid = false;
          errorTemporal.push("rut");
        }
      }

      if (!isSame(errorTemporal, errors)) {
        carroTemporal[`clientes_${direccionRecorrido}`][
          indexPasajero
        ].pasajero.errors = errorTemporal;
        setCarro(carroTemporal);
      }

      return isValid;
    } catch ({ message }) {
      console.error(`Error al validar pasajero [${message}]`);
    }
  }

  return (
    <div
      className={`d-flex flex-col bloque-pasajero ${
        cliente.open ? "active" : ""
      }`}
    >
      <div
        className={"header-pasajero"}
        onClick={() => {
          !cliente.pet ? openPasajero(index, tipoViaje) : "";
        }}
      >
        <h5>{`Pasajero ${index + 1} - Asiento ${
          cliente.asiento.asiento
        } - Piso ${cliente.piso}`}</h5>
        {isValidPasajero(cliente.pasajero, index, tipoViaje) ? <Check /> : ""}
        {cliente.pet ? (
          <img
            style={{ width: "30px", marginLeft: "auto" }}
            src="/img/icon-patita.svg"
            alt="Icono Patita"
          />
        ) : (
          ""
        )}
      </div>
      <div className="content-pasajero d-flex justify-content-center">
        <div className="col-12 col-md-8">
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="grupo-campos">
                <label className="label-input">Nombres</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Andrés"
                  value={cliente.pasajero["nombre"]}
                  className="form-control"
                  name="nombre"
                  onChange={(e) => setDataPasaje(e.target, index, tipoViaje)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="grupo-campos">
                <label className="label-input">Apellidos</label>
                <input
                  type="text"
                  placeholder="Ej: Espinoza Arcos"
                  value={cliente.pasajero["apellido"]}
                  className="form-control"
                  name="apellido"
                  onChange={(e) => setDataPasaje(e.target, index, tipoViaje)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row">
                <div className="col">
                  <label className="contenedor">
                    Rut
                    <input
                      type="checkbox"
                      checked={
                        cliente.pasajero["tipoRut"] == "rut" ? "true" : ""
                      }
                      value={"rut"}
                      name="tipoRut"
                      onChange={(e) => {
                        setDataPasaje(e.target, index, tipoViaje);
                      }}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
                <div className="col">
                  <label className="contenedor">
                    Pasaporte
                    <input
                      type="checkbox"
                      checked={
                        cliente.pasajero["tipoRut"] == "pasaporte" ? "true" : ""
                      }
                      value={"pasaporte"}
                      name="tipoRut"
                      onChange={(e) =>
                        setDataPasaje(e.target, index, tipoViaje)
                      }
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
              </div>
              <div className="grupo-campos">
                <input
                  type="text"
                  placeholder="Ej: 111111111"
                  value={cliente.pasajero["rut"]}
                  className={`form-control ${
                    cliente.pasajero.errors.includes("rut") ? "is-invalid" : ""
                  }`}
                  name="rut"
                  onChange={(e) => setDataPasaje(e.target, index, tipoViaje)}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="grupo-campos">
                <label className="label-input input-op">Nacionalidad</label>
                <select
                  name="nacionalidad"
                  id="cars"
                  className="form-control seleccion"
                  value={cliente.pasajero["nacionalidad"]}
                  onChange={(e) => setDataPasaje(e.target, index, tipoViaje)}
                >
                  {nacionalidades.map((nacionalidadMapped) => (
                    <option value={nacionalidadMapped.valor || ""}>
                      {nacionalidadMapped.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="grupo-campos">
                <label className="label-input">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  onChange={(e) => setDataPasaje(e.target, index, tipoViaje)}
                  value={cliente.pasajero["email"]}
                  placeholder="Ingresa tu email de contacto"
                  className={`form-control ${
                    cliente.pasajero.errors.includes("email")
                      ? "is-invalid"
                      : ""
                  }`}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="grupo-campos">
                <label className="label-input">
                  Confirme correo electrónico
                </label>
                <input
                  type="email"
                  name="email_2"
                  onChange={(e) => setDataPasaje(e.target, index, tipoViaje)}
                  value={cliente.pasajero["email_2"]}
                  placeholder="Confirme correo electrónico"
                  className={`form-control ${
                    cliente.pasajero.errors.includes("email_2")
                      ? "is-invalid"
                      : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionPasajero;
