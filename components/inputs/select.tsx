"use client";

import ReactSelect from "react-select";

interface SelectProps {
  label: string; // the label for the input
  value?: unknown; // the value of the input
  onChange: (value: unknown) => void; // the value of the input
  options: Record<string, unknown>[]; // options for the select
  disabled?: boolean; // whether the input is disabled
}

/**
 * Displays a select input with a label.
 * This is used inside the form component where a user can select multiple options.
 *
 * @param param0: SelectProps
 * @returns A select input
 */
export default function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: SelectProps) {
  return (
    <div className="z-100">
      <label className="block font-medium text-gray-900 text-sm leading-6">
        {label}
      </label>
      <div className="mt-2">
        <ReactSelect
          isDisabled={disabled}
          value={value}
          onChange={onChange}
          isMulti
          options={options}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
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
}
