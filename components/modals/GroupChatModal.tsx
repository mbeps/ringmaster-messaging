"use client";

import axios from "axios";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { User } from "@prisma/client";

import Input from "../inputs/Input";
import Modal from "./Modal";
import Button from "../Button";
import { toast } from "react-hot-toast";
import Select from "../inputs/Select";
import { API_ROUTES } from "@/libs/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConversationSchema } from "@/schema/ConversationSchema";

interface GroupChatModalProps {
  isOpen?: boolean;
  onClose: () => void;
  users: User[];
}

/**
 * A modal to create a group chat.
 * The group chat takes:
 *  - The name of the group chat
 *  - The list of members
 * @param param0 { isOpen, onClose, users}
 * @returns (JSX.Element)
 */
function GroupChatModal({
  isOpen,
  onClose,
  users = [],
}: GroupChatModalProps) {
  const router = useRouter();
  // loading creation of group chat
  const [isLoading, setIsLoading] = useState(false);

  /**
   * React hook form handles the form state.
   * Takes the name of the group chat and the list of members.
   */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: zodResolver(ConversationSchema),
    defaultValues: {
      name: "",
      members: [],
      isGroup: true,
    },
  });

  // Watches changes in the list of members
  const members = watch("members");

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // start loading the creation of the group chat

    axios
      .post(API_ROUTES.CONVERSATIONS, {
        ...data,
        isGroup: true,
      }) // create the group chat
      .then(() => {
        router.refresh(); // refresh the page
        onClose(); // close the modal
      })
      .catch(() => toast.error("Something went wrong!")) // if there is an error, display an error message
      .finally(() => setIsLoading(false)); // stop loading the creation of the group chat
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
              Create a group chat
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Create a chat with more than 2 people.
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
              <Select
                disabled={isLoading}
                label="Members"
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
                onChange={(value: any) =>
                  setValue("members", value, {
                    shouldValidate: true,
                  })
                }
                value={members}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            disabled={isLoading}
            onClick={onClose}
            type="button"
            secondary
          >
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal;