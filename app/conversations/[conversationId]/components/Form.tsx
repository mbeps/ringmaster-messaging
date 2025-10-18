"use client";

import useConversation from "@/hooks/useConversation";
import axios from "axios";
import React, { useEffect } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import MessageInput from "./MessageInput";
import { CldUploadButton } from "next-cloudinary";

/**
 * Form component which contains the message input, send button and image upload button.
 * This allows the user to send a message or image to the conversation.
 *
 * @returns (JSX.Element): form component with message input and send button
 */
const Form: React.FC = () => {
  // retrieve conversation id from context
  const { conversationId } = useConversation();

  /**
   * React hook form which handles the form state and validation.
   * Takes the text for the message to be sent.
   */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  /**
   * Function which handles the submission of the form.
   * Creates a new message for the current conversation with the data from the form.
   *
   * @param data (FieldValues): data from the form
   */
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true }); // once sent clear message input and re-render
    axios.post("/api/messages", {
      ...data,
      conversationId: conversationId,
    }); // create new message for the current conversation
  };

  /**
   * Allows the user to upload an image to the conversation.
   * Creates a new message for the current conversation with the image.
   * The image is uploaded to Cloudinary and the URL is stored in the database.
   *
   * @param result (any): result from the image upload
   */
  const handleUpload = (result: any) => {
    axios.post("/api/messages", {
      image: result?.info?.secure_url, // store image URL from Cloudinary in database
      conversationId: conversationId, // store current conversation ID in database
    }); // create new message for the current conversation
  };

  return (
    <div
      className="
        py-4 
        px-4 
        bg-white 
        border-t 
        flex 
        items-center 
        gap-2 
        lg:gap-4 
        w-full
      "
    >
      <CldUploadButton
        options={{ maxFiles: 1 }}
        onSuccess={handleUpload}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
      >
        <HiPhoto size={30} className="text-red-500" />
      </CldUploadButton>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 lg:gap-4 w-full"
      >
        <MessageInput
          id="message"
          register={register}
          errors={errors}
          required
          placeholder="Write a message"
        />
        <button
          type="submit"
          className="
            rounded-full 
            p-2 
            bg-red-500 
            cursor-pointer 
            hover:bg-red-600 
            transition
          "
        >
          <HiPaperAirplane size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
};
export default Form;