import type { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
        className="relative flex w-full cursor-pointer items-center space-x-3 rounded-lg bg-white p-3 transition hover:bg-neutral-100"
      >
        <Avatar user={data} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-hidden">
            <span className="absolute inset-0" aria-hidden="true" />
            <div className="mb-1 flex items-center justify-between">
              <p className="font-medium text-gray-900 text-sm">{data.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserBox;
