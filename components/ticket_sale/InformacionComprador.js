import Rut from "rutjs";

const InformacionComprador = (props) => {
  const { setCarro, carro, cliente, validarFormatoRut } = props;

  function setDataComprador({ name, value }) {
    try {
      let carro_temp = { ...carro };
      value = validarFormatoRut(name, value);
      carro_temp.datos[name] = value;
      setCarro(carro_temp);
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

  return (
    <div className="bloque comprador  bg-white">
      <h2>Datos comprador</h2>

      <div className="row mt-5">
        <div className="col-12 col-md-6">
          <div className="grupo-campos">
            <label className="label-input">Nombres</label>
            <input
              type="text"
              value={carro.datos["nombre"]}
              name="nombre"
              placeholder="Ej: Juan Andrés"
              className="form-control"
              onChange={(e) => setDataComprador(e.target)}
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="grupo-campos">
            <label className="label-input">Apellidos</label>
            <input
              type="text"
              value={carro.datos["apellido"]}
              name="apellido"
              placeholder="Ej: Espinoza Arcos"
              className="form-control"
              onChange={(e) => setDataComprador(e.target)}
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
                  checked={carro.datos["tipoRut"] == "rut" ? "checked" : ""}
                  value="rut"
                  name="tipoRut"
                  onChange={(e) => setDataComprador(e.target)}
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
                    carro.datos["tipoRut"] == "pasaporte" ? "checked" : ""
                  }
                  value="pasaporte"
                  name="tipoRut"
                  onChange={(e) => setDataComprador(e.target)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
          </div>
          <div className="grupo-campos">
            <input
              type="text"
              value={carro.datos["rut"]}
              name="rut"
              placeholder="Ej: 111111111"
              className={`form-control ${
                Array.isArray(carro.datos.errors) &&
                carro.datos.errors.includes("rut")
                  ? "is-invalid"
                  : ""
              }`}
              onChange={(e) => setDataComprador(e.target)}
            />
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="grupo-campos">
            <label className="label-input">Correo electrónico</label>
            <input
              type="email"
              value={carro.datos["email"]}
              name="email"
              placeholder="Ingresa tu email de contacto"
              className="form-control"
              onChange={(e) => setDataComprador(e.target)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformacionComprador;
