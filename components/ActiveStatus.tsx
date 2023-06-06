"use client";

import useActiveChannel from "@/app/hooks/useActiveChannel";

/**
 * Active status component which updates the active channel.
 * @returns (JSX.Element): active status component
 */
const ActiveStatus = () => {
  useActiveChannel();

  return null;
};

export default ActiveStatus;
