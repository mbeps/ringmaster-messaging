"use client";

import axios from "axios";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { User } from "@prisma/client";
import { CldUploadButton } from "next-cloudinary";

import Input from "../inputs/Input";
import Modal from "../modals/Modal";
import Button from "../Button";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface SettingsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: User;
}

/**
 * Opens a modal for editing the user's profile.
 * This allows the user to edit their profile picture and name given they are logged in.
 *
 * @param param0 { isOpen, onClose, currentUser}: SettingsModalProps
 * @returns (JSX.Element): settings modal for editing the user's profile
 */
function SettingsModal({
  isOpen,
  onClose,
  currentUser,
}: SettingsModalProps) {
  const router = useRouter();
  // loading state for updating the user's profile
  const [isLoading, setIsLoading] = useState(false);

  /**
   * React hook form handles the form state.
   * Takes the name of the user and the image.
   */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name,
      image: currentUser?.image,
    },
  });

  // Watches changes in the image
  const image = watch("image");

  /**
   * Handles the upload of the image to Cloudinary.
   * Once the image is uploaded, the URL of the image is set as the value of the image field.
   * This URL will be stored in the database.
   *
   * @param result: URL of the image uploaded to Cloudinary
   */
  const handleUpload = (result: any) => {
    setValue("image", result.info.secure_url, {
      shouldValidate: true,
    });
  };

  /**
   * Handles the submission of the form to update the user's profile.
   * it sets the new name and image of the user using the API.
   *
   * @param data { name, image }: new name and image of the user
   */
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // start loading the update of the user's profile

    axios
      .post("/api/settings", data) // update the user's profile
      .then(() => {
        router.refresh(); // refresh the page
        onClose(); // close the modal
      })
      .catch(() => toast.error("Something went wrong!")) // if there is an error, display an error message
      .finally(() => setIsLoading(false)); // stop loading the update of the user's profile
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2
              className="
                text-base 
                font-semibold 
                leading-7 
                text-gray-900
              "
            >
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Edit your public information.
            </p>

            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                disabled={isLoading}
                label="Name"
                id="name"
                errors={errors}
                required
                register={register}
              />
              <div>
                <label
                  htmlFor="photo"
                  className="
                    block 
                    text-sm 
                    font-medium 
                    leading-6 
                    text-gray-900
                  "
                >
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <Image
                    width="48"
                    height="48"
                    className="rounded-full"
                    src={
                      image || currentUser?.image || "/images/placeholder.jpg"
                    }
                    alt="Avatar"
                  />
                  <CldUploadButton
                    options={{ maxFiles: 1 }}
                    onSuccess={handleUpload}
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET}
                  >
                    <Button disabled={isLoading} secondary type="button">
                      Change
                    </Button>
                  </CldUploadButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="
            mt-6 
            flex 
            items-center 
            justify-end 
            gap-x-6
          "
        >
          <Button disabled={isLoading} secondary onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SettingsModal;