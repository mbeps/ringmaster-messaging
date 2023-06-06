import { useEffect, useState } from "react";
import { pusherClient } from "../app/libs/pusher";
import { Channel, Members } from "pusher-js";
import useActiveList from "./useActiveList";

/**
 * Manages the active Pusher channel for a presence-based messenger application.
 * There are several functionalities:
 *  - Subscribes to the channel
 *  - Handles channel events (such as member additions and removals)
 *  - Keeps track of the list of active members using the `useActiveList` hook.
 */
const useActiveChannel = () => {
  // functions are used to manage the list of active members in the channel
  const { set, add, remove } = useActiveList();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  /**
   * Used to subscribe/unsubscribe from the Pusher channel and handle the channel events.
   */
  useEffect(() => {
    let channel = activeChannel;

    // if the channel is not active, subscribe to it
    if (!channel) {
      channel = pusherClient.subscribe("presence-messenger"); // presence-SOMETHING
      setActiveChannel(channel); // set the channel as active
    }

    /**
     * This event is triggered when the subscription to the channel is successful.
     * It retrieves the initial members of the channel and sets them using the set function from `useActiveList`.
     */
    channel.bind("pusher:subscription_succeeded", (members: Members) => {
      // initially no members are active
      const initialMembers: string[] = [];

      // add each member to the list of active members
      members.each((member: Record<string, any>) =>
        initialMembers.push(member.id)
      );
      // set the list of active members
      set(initialMembers);
    });

    /**
     * This event is triggered when a new member joins the channel.
     * It adds the member ID to the active members list using the add function from `useActiveList`.
     */
    channel.bind("pusher:member_added", (member: Record<string, any>) => {
      add(member.id);
    });

    /**
     * This event is triggered when a member leaves the channel.
     * It removes the member ID from the active members list using the remove function from `useActiveList`.
     */
    channel.bind("pusher:member_removed", (member: Record<string, any>) => {
      remove(member.id);
    });

    // return a function to unsubscribe from the channel
    return () => {
      if (activeChannel) {
        pusherClient.unsubscribe("presence-messenger");
        setActiveChannel(null);
      }
    };
  }, [activeChannel, set, add, remove]);
};

export default useActiveChannel;
