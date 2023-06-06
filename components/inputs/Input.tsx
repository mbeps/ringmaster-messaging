"use client";

import clsx from "clsx";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string; // label for the input
  id: string; // id for the input
  type?: string; // type for the input
  required?: boolean; // whether the input is required
  register: UseFormRegister<FieldValues>; // register function from react-hook-form
  errors: FieldErrors; // errors from react-hook-form
  disabled?: boolean; // whether the input is disabled
}

/**
 * Text input component for forms.
 * Takes in a label, id, type, required, register, errors, and disabled prop to modify the style and functionality of the input.
 * @param param0: InputProps
 * @returns (JSX.Element): an text input component
 */
const Input: React.FC<InputProps> = ({
  label,
  id,
  register,
  required,
  errors,
  type = "text",
  disabled,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
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
        <input
          id={id}
          type={type}
          autoComplete={id}
          disabled={disabled}
          {...register(id, { required })}
          className={clsx(
            `
            form-input
            block 
            w-full 
            rounded-lg 
            border-0 
            py-1.5 
            text-gray-900 
            shadow-sm 
            ring-1 
            ring-inset 
            ring-gray-300 
            placeholder:text-gray-400 
            focus:ring-2 
            focus:ring-inset 
            focus:ring-red-400 
            sm:text-sm 
            sm:leading-6`,
            errors[id] && "focus:ring-rose-900",
            disabled && "opacity-50 cursor-default"
          )}
        />
      </div>
    </div>
  );
};

export default Input;
