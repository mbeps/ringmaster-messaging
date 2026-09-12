"use client";

import useActiveChannel from "@/hooks/use-active-channel";

/**
 * Active status component which updates the active channel.
 * @returns active status component
 */
export default function ActiveStatus() {
  useActiveChannel();

  return null;
}
