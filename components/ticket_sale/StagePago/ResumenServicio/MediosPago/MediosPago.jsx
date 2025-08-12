import { useEffect, useRef, useState } from "react";
import styles from "./MediosPago.module.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { agregarMedioPago } from "store/usuario/compra-slice";

const MediosPago = (props) => {
  // const {mediosPago, setMediosPago, codigoCuponera, setCodigoCuponera} = props;
  const [selectedMedioPago, setSelectedMedioPago] = useState(null);
  const [validar, setValidar] = useState(false);

  const [codigoCuponera, setCodigoCuponera] = useState("");
  const [mediosPago, setMediosPago] = useState([
    {
      id: "medio-webpay",
      valor1: "Pagar con Webpay",
      valor2: "WBPAY",
    },
    // {
    //   id: "medio-cuponera",
    //   valor1: "Usar cuponera",
    //   valor2: "CUP",
    // },
  ]);

  const dispatch = useDispatch();
  const medioPago = useSelector((state) => state.compra.medioPago);

  const [carro, setCarro] = useState({
    datos: {},
  });

  function setDataMedioPago({ name, value }) {
    try {
      let carro_temp = { ...carro };
      carro_temp.datos[name] = value;
      dispatch(agregarMedioPago(carro_temp.datos));
      setCarro(carro_temp);
      setSelectedMedioPago(carro_temp.datos.medioPago);
    } catch ({ message }) {
      console.error(`Error al agregar informacion del comprador [${message}]`);
    }
  }

  return (
    <>
      <div className={styles["container"]}>
        {mediosPago.map((element) => (
          <label
            key={element.id}
            className={styles["body-pay"]}
            htmlFor={element.id}
          >
            <input
              type="radio"
              id={element.id}
              name="medioPago"
              value={element.valor2}
              checked={medioPago === element.valor2}
              onChange={(e) => setDataMedioPago(e.target)}
            />
            {element.valor2 === "WBPAY" ? (
              <img
                src="/img/icon/cuponera/logo-flow.png"
                style={{
                  maxWidth: "100px",
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                className={
                  element.valor2 === "CUP" ? styles["text-coupon"] : ""
                }
              >
                {element?.valor1}
                <img src="/img/icon/cuponera/ticket-outline.svg" />
              </div>
            )}
          </label>
        ))}

        {medioPago === "CUP" && (
          <>
            <span className={styles["text-input-coupon"]}>
              Ingresa tu código de cuponera aquí:
            </span>
            <input
              type="text"
              value={codigoCuponera}
              name="codigoCuponera"
              placeholder="Ej: XTQ1234567"
              className={styles["input-body"]}
              onChange={(e) => setCodigoCuponera(e.target.value.toUpperCase())}
            />
          </>
        )}
      </div>
    </>
  );
};

export default MediosPago;

// import { useEffect, useRef, useState } from "react";
// import styles from "./MediosPago.module.css";
// import axios from "axios";
// import { useDispatch, useSelector } from "react-redux";
// import { agregarMedioPago } from "store/usuario/compra-slice";

// const MediosPago = (props) => {
//   const {mediosPago, setMediosPago, codigoCuponera, setCodigoCuponera} = props;
//   const [selectedMedioPago, setSelectedMedioPago] = useState(null);
//   const [validar, setValidar] =useState(false);

//   const dispatch = useDispatch();
//   const medioPago = useSelector((state) => state.compra.medioPago);

//   const [carro, setCarro] = useState({
//     datos: {},
//   });

//   function setDataMedioPago({ name, value }) {
//     try {
//       let carro_temp = { ...carro };
//       carro_temp.datos[name] = value;
//       dispatch(agregarMedioPago(carro_temp.datos));
//       setCarro(carro_temp);
//       setSelectedMedioPago(carro_temp.datos.medioPago)
//     } catch ({ message }) {
//       console.error(`Error al agregar informacion del comprador [${message}]`);
//     }
//   }

//   return (
//     <>
//       <div className={styles["container"]}>
//         {mediosPago.map((element) => (
//           <div key={element.id} className={styles["body-pay"]}>
//             <input
//               type="radio"
//               id={element.id}
//               name="medioPago"
//               value={element.valor2}
//               checked={ medioPago === element.valor2 ? 'checked' : '' }
//               onClick={ (e) => setDataMedioPago(e.target) }
//             />
//             {element.valor2 === "WBPAY" ? (
//               <img src="/img/icon/cuponera/Logo-webpay.svg"></img>
//             ) : (
//               <label
//                 className={
//                   element.valor2 === "CUP" ? styles["text-coupon"] : ""
//                 }
//                 htmlFor={element.id}
//               >
//                 {element?.valor1}
//                 <img src="/img/icon/cuponera/ticket-outline.svg"></img>
//               </label>
//             )}
//           </div>
//         ))}

//         { medioPago === 'CUP' ? (
//           <>
//             <span className={styles["text-input-coupon"]}>
//               {" "}
//               Ingresa tu código de cuponera aquí:{" "}
//             </span>
//             <input
//               type="codigoCuponera"
//               value={codigoCuponera}
//               name="codigoCuponera"
//               placeholder="Ej: XTQ1234567"
//               className={styles["input-body"]}
//               onChange={(e) => setCodigoCuponera(e.target.value.toUpperCase())}
//             />
//           </>
//         ) : null}
//       </div>
//     </>
//   );
// };

// export default MediosPago;
