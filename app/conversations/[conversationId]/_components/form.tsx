"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CldUploadButton } from "next-cloudinary";
import { useEffect } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import MessageInput from "@/app/conversations/[conversationId]/_components/message-input";
import { CLOUDINARY_CONFIG } from "@/config/env";
import { API_ROUTES } from "@/config/routes";
import useConversation from "@/hooks/use-conversation";
import {
  type MessageFormData,
  messageSchema,
} from "@/schemas/message/message.schema";

interface CloudinaryUploadResult {
  info?: {
    secure_url?: string;
  };
}

/**
 * Form component which contains the message input, send button and image upload button.
 * This allows the user to send a message or image to the conversation.
 *
 * @returns form component with message input and send button
 */
export default function Form() {
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
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
      conversationId: conversationId,
    },
  });

  useEffect(() => {
    setValue("conversationId", conversationId);
  }, [conversationId, setValue]);

  /**
   * Function which handles the submission of the form.
   * Creates a new message for the current conversation with the data from the form.
   *
   * @param data - data from the form
   */
  const onSubmit: SubmitHandler<MessageFormData> = (data) => {
    setValue("message", ""); // once sent clear message input
    axios.post(API_ROUTES.MESSAGES.path, {
      ...data,
      conversationId: conversationId,
    }); // create new message for the current conversation
  };

  /**
   * Allows the user to upload an image to the conversation.
   * Creates a new message for the current conversation with the image.
   * The image is uploaded to Cloudinary and the URL is stored in the database.
   *
   * @param result - result from the image upload
   */
  const handleUpload = (result: unknown) => {
    const uploadResult = result as CloudinaryUploadResult;
    if (uploadResult?.info?.secure_url) {
      axios.post(API_ROUTES.MESSAGES.path, {
        image: uploadResult.info.secure_url, // store image URL from Cloudinary in database
        conversationId: conversationId, // store current conversation ID in database
      }); // create new message for the current conversation
    }
  };

  return (
    <div className="flex w-full items-center gap-2 border-t bg-white px-4 py-4 lg:gap-4">
      <CldUploadButton
        options={{ maxFiles: 1 }}
        onSuccess={handleUpload}
        uploadPreset={CLOUDINARY_CONFIG.uploadPreset}
      >
        <HiPhoto size={30} className="text-red-500" />
      </CldUploadButton>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full items-center gap-2 lg:gap-4"
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
          className="cursor-pointer rounded-full bg-red-500 p-2 transition hover:bg-red-600"
        >
          <HiPaperAirplane size={18} className="text-white" />
        </button>
      </form>
    </div>
  );
}
