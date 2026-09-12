"use client";

import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

interface MessageInputProps<TFieldValues extends FieldValues = FieldValues> {
  placeholder?: string;
  id: Path<TFieldValues>;
  type?: string;
  required?: boolean;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors;
}

/**
 * Message input component where the user inputs the text message to be sent.
 *
 * @param param0: MessageInputProps
 * @returns message input component
 */
export default function MessageInput<
  TFieldValues extends FieldValues = FieldValues,
>({
  placeholder,
  id,
  type,
  required,
  register,
}: MessageInputProps<TFieldValues>) {
  return (
    <div className="relative w-full">
      <input
        id={id}
        type={type}
        autoComplete={id}
        {...register(id, { required })}
        placeholder={placeholder}
        className="w-full rounded-lg bg-neutral-100 px-4 py-2 font-light text-black focus:outline-hidden"
      />
    </div>
  );
}
