"use client";

import clsx from "clsx";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface InputProps {
  label: string; // label for the input
  id: string; // id for the input
  type?: string; // type for the input
  required?: boolean; // whether the input is required
  register: UseFormRegister<any>; // register function from react-hook-form
  errors: FieldErrors; // errors from react-hook-form
  disabled?: boolean; // whether the input is disabled
}

/**
 * Text input component for forms.
 * Takes in a label, id, type, required, register, errors, and disabled prop to modify the style and functionality of the input.
 * @param param0: InputProps
 * @returns (JSX.Element): an text input component
 */
function Input({
  label,
  id,
  register,
  required,
  errors,
  type = "text",
  disabled,
}: InputProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-medium text-gray-900 text-sm leading-6"
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
            `form-input block w-full rounded-lg border-0 px-2 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-red-400 focus:ring-inset sm:text-sm sm:leading-6`,
            errors[id] && "focus:ring-rose-900",
            disabled && "cursor-default opacity-50",
          )}
        />
      </div>
      {errors[id] && (
        <span className="mt-1 text-rose-500 text-sm">
          {errors[id]?.message as string}
        </span>
      )}
    </div>
  );
}

export default Input;
