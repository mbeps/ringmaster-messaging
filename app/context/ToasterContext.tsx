"use client";

import { Toaster } from "react-hot-toast";

/**
 * Allows toast messages to be displayed from anywhere in the app
 *
 * @returns (Toaster: ReactElement): toaster component
 */
const ToasterContext = () => {
  return <Toaster />;
};

export default ToasterContext;
