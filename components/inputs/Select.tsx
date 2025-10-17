"use client";

import ReactSelect from "react-select";

interface SelectProps {
  label: string; // the label for the input
  value?: Record<string, any>; // the value of the input
  onChange: (value: Record<string, any>) => void; // the value of the input
  options: Record<string, any>[]; // options for the select
  disabled?: boolean; // whether the input is disabled
}

/**
 * Displays a select input with a label.
 * This is used inside the form component where a user can select multiple options.
 *
 * @param param0 : SelectProps
 * @returns (JSX.Element): A select input
 */
const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled,
}) => {
  return (
    <div className="z-100">
      <label
        className="
          block 
          text-sm 
          font-medium 
          leading-6 
          text-gray-900
        "
      >
        {label}
      </label>
      <div className="mt-2">
        <ReactSelect
          isDisabled={disabled}
          value={value}
          onChange={onChange}
          isMulti
          options={options}
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          }}
          classNames={{
            control: () => "text-sm",
          }}
        />
      </div>
    </div>
  );
};

export default Select;
