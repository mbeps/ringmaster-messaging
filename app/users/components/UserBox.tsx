import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

import Avatar from "@/components/Avatar";
import LoadingModal from "@/components/modals/LoadingModal";
import { API_ROUTES, ROUTES } from "@/libs/routes";

interface UserBoxProps {
  data: User;
}

/**
 * Button displaying a user's name and avatar.
 * When clicked, it opens a conversation with that user.
 *
 * @param {User}: user for which to render the box
 * @returns (JSX.Element): the user box
 */
function UserBox({ data }: UserBoxProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Creates a conversation with the user
  const handleClick = () => {
    setIsLoading(true);

    axios
      .post(API_ROUTES.CONVERSATIONS, { userId: data.id }) // create conversation
      .then((data) => {
        router.push(ROUTES.CONVERSATION_ID(data.data.id));
      }) // redirect to conversation
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      {isLoading && <LoadingModal />}
      <div
        onClick={handleClick}
        className="
          w-full 
          relative 
          flex 
          items-center 
          space-x-3 
          bg-white 
          p-3 
          hover:bg-neutral-100
          rounded-lg
          transition
          cursor-pointer
        "
      >
        <Avatar user={data} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-hidden">
            <span className="absolute inset-0" aria-hidden="true" />
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-gray-900">{data.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
