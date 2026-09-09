"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CldUploadButton } from "next-cloudinary";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Button from "@/components/Button";
import Input from "@/components/inputs/Input";
import { CLOUDINARY_CONFIG } from "@/lib/env";
import { API_ROUTES } from "@/libs/routes";
import { type SettingsFormData, SettingsSchema } from "@/schema/SettingsSchema";

interface AccountFormProps {
  currentUser: User;
}

/**
 * Form for updating user account information (name and profile picture).
 * Reuses the same logic from SettingsModal but in a page context.
 */
function AccountForm({ currentUser }: AccountFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      name: currentUser?.name ?? "",
      image: currentUser?.image,
    },
  });

  const image = watch("image");

  const handleUpload = (result: any) => {
    setValue("image", result.info.secure_url, {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<SettingsFormData> = (data) => {
    setIsLoading(true);

    axios
      .post(API_ROUTES.SETTINGS.path, data)
      .then(() => {
        router.refresh();
        toast.success("Profile updated successfully!");
      })
      .catch(() => toast.error("Something went wrong!"))
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          className="block font-medium text-gray-900 text-sm leading-6"
        >
          Photo
        </label>
        <div className="mt-2 flex items-center gap-x-3">
          <Image
            width={48}
            height={48}
            className="rounded-full"
            src={image || currentUser?.image || "/images/placeholder.jpg"}
            alt="Avatar"
          />
          <CldUploadButton
            options={{ maxFiles: 1 }}
            onSuccess={handleUpload}
            uploadPreset={CLOUDINARY_CONFIG.uploadPreset}
          >
            <Button disabled={isLoading} secondary type="button">
              Change
            </Button>
          </CldUploadButton>
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={isLoading} type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export default AccountForm;
