"use client";

import { Toaster } from "react-hot-toast";

/**
 * Allows toast messages to be displayed from anywhere in the app.
 *
 * @returns Toaster component
 */
export default function ToasterProvider() {
  return <Toaster />;
}
