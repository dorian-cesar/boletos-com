// import Rut from "rutjs";

// Función para validar RUC de Paraguay
function validarRucParaguay(ruc) {
  if (!ruc || typeof ruc !== "string") return false;

  // Limpiar el RUC (eliminar puntos, guiones, espacios)
  const rucLimpio = ruc.trim().replace(/[\.\-\s]/g, "");

  // Validar longitud - Paraguay acepta desde 6 hasta 9 dígitos
  if (rucLimpio.length < 6 || rucLimpio.length > 9) return false;

  // Validar que solo contenga números
  if (!/^\d+$/.test(rucLimpio)) return false;
  return true;
}

const isSame = (array1, array2) =>
  array1.length === array2.length &&
  array1.every((value, index) => value === array2[index]);

export function isValidPasajero(
  pasajero,
  indexPasajero,
  direccionRecorrido,
  setCarro,
  carro
) {
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
      // PARA PARAGUAY: Cuando tipoDocumento es "R", validar como RUC paraguayo
      if (pasajero.tipoDocumento === "R" && !validarRucParaguay(pasajero.rut)) {
        isValid = false;
        errorTemporal.push("rut");
      }
      // Para tipoDocumento "P" (pasaporte), no aplicamos validación de RUC
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

export function newIsValidPasajero(pasajero) {
  try {
    let validator = {
      valid: true,
      error: "",
    };

    if (!pasajero.nombre || pasajero.nombre == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un nombre para pasajero del asiento ${pasajero.asiento}`;
      return validator;
    }

    if (!pasajero.apellido || pasajero.apellido == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un apellido para pasajero del asiento ${pasajero.asiento}`;
      return validator;
    }

    if (pasajero.tipoDocumento == "R") {
      if (!pasajero.rut || pasajero.rut == "") {
        validator.valid = false;
        validator.error = `Debe ingresar un ruc para pasajero del asiento ${pasajero.asiento}`;
        return validator;
      } else {
        // PARA PARAGUAY: Validar como RUC paraguayo
        if (!validarRucParaguay(pasajero.rut)) {
          validator.valid = false;
          validator.error = `Debe ingresar un ruc válido para pasajero del asiento ${pasajero.asiento}`;
          return validator;
        }
      }
    }

    if (pasajero.tipoDocumento == "P") {
      if (!pasajero.rut || pasajero.rut == "") {
        validator.valid = false;
        validator.error = `Debe ingresar un numero de pasaporte para pasajero del asiento ${pasajero.asiento}`;
        return validator;
      }
      // Para pasaporte, no validamos formato específico
    }

    if (!pasajero.email || pasajero.email == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un email para pasajero del asiento ${pasajero.asiento}`;
      return validator;
    } else {
      if (
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email)
      ) {
        validator.valid = false;
        validator.error = `Debe ingresar un email válido para pasajero del asiento ${pasajero.asiento}`;
        return validator;
      }
    }

    return validator;
  } catch ({ message }) {
    console.error(`Error al validar pasajero [${message}]`);
  }
}

export function newIsValidPasajeroCompra(pasajero) {
  try {
    let validator = {
      valid: true,
      error: "",
    };

    if (pasajero.tipoDocumento == "R") {
      if (!pasajero.rut || pasajero.rut == "") {
        validator.valid = false;
        validator.error = `Debe ingresar un ruc para pasajero del asiento ${pasajero.asiento}`;
        return validator;
      } else {
        // PARA PARAGUAY: Validar como RUC paraguayo
        if (!validarRucParaguay(pasajero.rut)) {
          validator.valid = false;
          validator.error = `Debe ingresar un ruc válido para pasajero del asiento ${pasajero.asiento}`;
          return validator;
        }
      }
    }

    if (pasajero.tipoDocumento == "P") {
      if (!pasajero.rut || pasajero.rut == "") {
        validator.valid = false;
        validator.error = `Debe ingresar un numero de pasaporte para pasajero del asiento ${pasajero.asiento}`;
        return validator;
      }
    }

    if (!pasajero.nombre || pasajero.nombre == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un nombre para pasajero del asiento ${pasajero.asiento}`;
      return validator;
    }

    if (!pasajero.apellido || pasajero.apellido == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un apellido para pasajero del asiento ${pasajero.asiento}`;
      return validator;
    }

    return validator;
  } catch ({ message }) {
    console.error(`Error al validar pasajero [${message}]`);
  }
}

export function newIsValidComprador(pasajero) {
  try {
    let validator = {
      valid: true,
      error: "",
    };

    if (!pasajero.nombre || pasajero.nombre == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un nombre para datos del comprador`;
      return validator;
    }

    if (!pasajero.apellido || pasajero.apellido == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un apellido para datos del comprador`;
      return validator;
    }

    if (pasajero.tipoDocumento == "R") {
      if (!pasajero.rut || pasajero.rut == "") {
        validator.valid = false;
        validator.error = `Debe ingresar un ruc para datos del comprador`;
        return validator;
      } else {
        // PARA PARAGUAY: Validar como RUC paraguayo
        if (!validarRucParaguay(pasajero.rut)) {
          validator.valid = false;
          validator.error = `Debe ingresar un ruc válido para datos del comprador`;
          return validator;
        }
      }
    }

    if (!pasajero.email || pasajero.email == "") {
      validator.valid = false;
      validator.error = `Debe ingresar un email para datos del comprador`;
      return validator;
    } else {
      if (
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email)
      ) {
        validator.valid = false;
        validator.error = `Debe ingresar un email válido para datos del comprador`;
        return validator;
      }
    }

    return validator;
  } catch ({ message }) {
    console.error(`Error al validar comprador [${message}]`);
  }
}

export function isValidCodigoCuponera(codigoCuponera) {
  try {
    let isValid = true;

    if (!codigoCuponera || codigoCuponera == "") {
      isValid = false;
    }

    return isValid;
  } catch ({ message }) {
    console.error(`Error al validar codigo cuponera [${message}]`);
  }
}

export function isValidDatosComprador(cuerpo) {
  console.log("aaa", cuerpo);
  try {
    let isValid = true;

    if (!cuerpo.nombre || cuerpo.nombre == "") {
      isValid = false;
    }

    if (!cuerpo.apellido || cuerpo.apellido == "") {
      isValid = false;
    }

    if (!cuerpo.email || cuerpo.email == "") {
      isValid = false;
    } else {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(cuerpo.email)) {
        isValid = false;
      }
    }

    if (!cuerpo.rut || cuerpo.rut == "") {
      isValid = false;
    } else {
      // PARA PARAGUAY: Validar como RUC paraguayo
      if (cuerpo.tipoDocumento === "R" && !validarRucParaguay(cuerpo.rut)) {
        isValid = false;
      }
    }
    return isValid;
  } catch ({ message }) {
    console.error(`Error al validar pasajero [${message}]`);
  }
}

export function isValidDatosConsulta(cuerpo) {
  try {
    let isValid = true;

    if (!cuerpo.nombreSolicitante || cuerpo.nombreSolicitante == "") {
      isValid = false;
    }

    if (!cuerpo.contacto || cuerpo.contacto == "") {
      isValid = false;
    }

    if (!cuerpo.mail || cuerpo.mail == "") {
      isValid = false;
    } else {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(cuerpo.mail)) {
        isValid = false;
      }
    }
    return isValid;
  } catch ({ message }) {
    console.error(`Error al validar consulta datos [${message}]`);
  }
}

// import Rut from "rutjs";

// const isSame = (array1, array2) =>
//   array1.length === array2.length &&
//   array1.every((value, index) => value === array2[index]);

// export function isValidPasajero(
//   pasajero,
//   indexPasajero,
//   direccionRecorrido,
//   setCarro,
//   carro
// ) {
//   try {
//     let isValid = true;
//     let errors = [...pasajero.errors];
//     let carroTemporal = { ...carro };
//     let errorTemporal = [];

//     if (!pasajero.nombre || pasajero.nombre == "") {
//       isValid = false;
//     }

//     if (!pasajero.apellido || pasajero.apellido == "") {
//       isValid = false;
//     }

//     if (!pasajero.email || pasajero.email == "") {
//       isValid = false;
//     } else {
//       if (
//         !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email)
//       ) {
//         errorTemporal.push("email");
//       }
//     }

//     if (!pasajero.email_2 || pasajero.email_2 == "") {
//       isValid = false;
//     } else {
//       if (pasajero.email != pasajero.email_2) {
//         errorTemporal.push("email_2");
//       }
//     }

//     if (!pasajero.rut || pasajero.rut == "") {
//       isValid = false;
//     } else {
//       const rutValidacion = new Rut(pasajero.rut);
//       if (!rutValidacion.isValid) {
//         isValid = false;
//         errorTemporal.push("rut");
//       }
//     }

//     if (!isSame(errorTemporal, errors)) {
//       carroTemporal[`clientes_${direccionRecorrido}`][
//         indexPasajero
//       ].pasajero.errors = errorTemporal;
//       setCarro(carroTemporal);
//     }

//     return isValid;
//   } catch ({ message }) {
//     console.error(`Error al validar pasajero [${message}]`);
//   }
// }

// export function newIsValidPasajero(pasajero) {
//   try {
//     let validator = {
//       valid: true,
//       error: "",
//     };

//     if (!pasajero.nombre || pasajero.nombre == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un nombre para pasajero del asiento ${pasajero.asiento}`;
//       return validator;
//     }

//     if (!pasajero.apellido || pasajero.apellido == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un apellido para pasajero del asiento ${pasajero.asiento}`;
//       return validator;
//     }

//     if (pasajero.tipoDocumento == "R") {
//       if (!pasajero.rut || pasajero.rut == "") {
//         validator.valid = false;
//         validator.error = `Debe ingresar un rut para pasajero del asiento ${pasajero.asiento}`;
//         return validator;
//       } else {
//         const rutValidacion = new Rut(pasajero.rut);
//         if (!rutValidacion.isValid) {
//           validator.valid = false;
//           validator.error = `Debe ingresar un rut válido para pasajero del asiento ${pasajero.asiento}`;
//           return validator;
//         }
//       }
//     }

//     if (pasajero.tipoDocumento == "P") {
//       if (!pasajero.rut || pasajero.rut == "") {
//         validator.valid = false;
//         validator.error = `Debe ingresar un numero de pasaporte para pasajero del asiento ${pasajero.asiento}`;
//         return validator;
//       }
//     }

//     if (!pasajero.email || pasajero.email == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un email para pasajero del asiento ${pasajero.asiento}`;
//       return validator;
//     } else {
//       if (
//         !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email)
//       ) {
//         validator.valid = false;
//         validator.error = `Debe ingresar un email válido para pasajero del asiento ${pasajero.asiento}`;
//         return validator;
//       }
//     }

//     return validator;
//   } catch ({ message }) {
//     console.error(`Error al validar pasajero [${message}]`);
//   }
// }

// export function newIsValidPasajeroCompra(pasajero) {
//   try {
//     let validator = {
//       valid: true,
//       error: "",
//     };

//     if (pasajero.tipoDocumento == "R") {
//       if (!pasajero.rut || pasajero.rut == "") {
//         validator.valid = false;
//         validator.error = `Debe ingresar un rut para pasajero del asiento ${pasajero.asiento}`;
//         return validator;
//       } else {
//         const rutValidacion = new Rut(pasajero.rut);
//         if (!rutValidacion.isValid) {
//           validator.valid = false;
//           validator.error = `Debe ingresar un rut válido para pasajero del asiento ${pasajero.asiento}`;
//           return validator;
//         }
//       }
//     }

//     if (pasajero.tipoDocumento == "P") {
//       if (!pasajero.rut || pasajero.rut == "") {
//         validator.valid = false;
//         validator.error = `Debe ingresar un numero de pasaporte para pasajero del asiento ${pasajero.asiento}`;
//         return validator;
//       }
//     }

//     // if (!pasajero.nacionalidad || pasajero.nacionalidad == "") {
//     //   validator.valid = false;
//     //   validator.error = `Debe ingresar una nacionalidad para pasajero del asiento ${pasajero.asiento}`;
//     //   return validator;
//     // }

//     if (!pasajero.nombre || pasajero.nombre == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un nombre para pasajero del asiento ${pasajero.asiento}`;
//       return validator;
//     }

//     if (!pasajero.apellido || pasajero.apellido == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un apellido para pasajero del asiento ${pasajero.asiento}`;
//       return validator;
//     }

//     return validator;
//   } catch ({ message }) {
//     console.error(`Error al validar pasajero [${message}]`);
//   }
// }

// export function newIsValidComprador(pasajero) {
//   try {
//     let validator = {
//       valid: true,
//       error: "",
//     };

//     if (!pasajero.nombre || pasajero.nombre == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un nombre para datos del comprador`;
//       return validator;
//     }

//     if (!pasajero.apellido || pasajero.apellido == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un apellido para datos del comprador`;
//       return validator;
//     }

//     if (pasajero.tipoDocumento == "R") {
//       if (!pasajero.rut || pasajero.rut == "") {
//         validator.valid = false;
//         validator.error = `Debe ingresar un rut para datos del comprador`;
//         return validator;
//       } else {
//         const rutValidacion = new Rut(pasajero.rut);
//         if (!rutValidacion.isValid) {
//           validator.valid = false;
//           validator.error = `Debe ingresar un rut válido para datos del comprador`;
//           return validator;
//         }
//       }
//     }

//     if (!pasajero.email || pasajero.email == "") {
//       validator.valid = false;
//       validator.error = `Debe ingresar un email para datos del comprador`;
//       return validator;
//     } else {
//       if (
//         !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(pasajero.email)
//       ) {
//         validator.valid = false;
//         validator.error = `Debe ingresar un email para datos del comprador`;
//         return validator;
//       }
//     }

//     return validator;
//   } catch ({ message }) {
//     console.error(`Error al validar comprador [${message}]`);
//   }
// }

// export function isValidCodigoCuponera(codigoCuponera) {
//   try {
//     let isValid = true;

//     if (!codigoCuponera || codigoCuponera == "") {
//       isValid = false;
//     }

//     return isValid;
//   } catch ({ message }) {
//     console.error(`Error al validar codigo cuponera [${message}]`);
//   }
// }

// export function isValidDatosComprador(cuerpo) {
//   console.log("aaa", cuerpo);
//   try {
//     let isValid = true;

//     if (!cuerpo.nombre || cuerpo.nombre == "") {
//       isValid = false;
//     }

//     if (!cuerpo.apellido || cuerpo.apellido == "") {
//       isValid = false;
//     }

//     if (!cuerpo.email || cuerpo.email == "") {
//       isValid = false;
//     } else {
//       if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(cuerpo.email)) {
//         isValid = false;
//       }
//     }

//     if (!cuerpo.rut || cuerpo.rut == "") {
//       isValid = false;
//     } else {
//       const rutValidacion = new Rut(cuerpo.rut);
//       if (!rutValidacion.isValid) {
//         isValid = false;
//       }
//     }
//     return isValid;
//   } catch ({ message }) {
//     console.error(`Error al validar pasajero [${message}]`);
//   }
// }

// export function isValidDatosConsulta(cuerpo) {
//   try {
//     let isValid = true;

//     if (!cuerpo.nombreSolicitante || cuerpo.nombreSolicitante == "") {
//       isValid = false;
//     }

//     if (!cuerpo.contacto || cuerpo.contacto == "") {
//       isValid = false;
//     }

//     if (!cuerpo.mail || cuerpo.mail == "") {
//       isValid = false;
//     } else {
//       if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(cuerpo.mail)) {
//         isValid = false;
//       }
//     }
//     return isValid;
//   } catch ({ message }) {
//     console.error(`Error al validar consulta datos [${message}]`);
//   }
// }
