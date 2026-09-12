"use client";

import type { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface MessageInputProps {
  placeholder?: string;
  id: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

/**
 * Message input component where the user inputs the text message to be sent.
 *
 * @param param0: MessageInputProps
 * @returns message input component
 */
export default function MessageInput({
  placeholder,
  id,
  type,
  required,
  register,
}: MessageInputProps) {
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
