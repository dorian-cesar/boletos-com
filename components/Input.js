import { useId } from "react";

import Select from "react-select";

const customStyles = {
  control: (provided) => ({
    ...provided,
    height: "40px",
    borderRadius: "16px",
    background: "var(--azul-15, #E1E8F4)",
    minWidth: "190px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "var(--azul-100, #3365B4)",
    fontFamily: "Titillium Web",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "normal",
  }),
};
const Input = ({
  items,
  selected,
  setSelected,
  className,
  placeholder,
  isDisabled,
}) => {
  return (
    <>
      {" "}
      <Select
        className="w-100"
        value={selected}
        styles={customStyles}
        placeholder={placeholder}
        options={items}
        onChange={(e, a) => {
          setSelected(e.value);
        }}
        instanceId={useId()}
        isDisabled={isDisabled}
      />
    </>
  );
};
export default Input;
