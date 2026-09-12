"use client";

import Image from "next/image";
import Modal from "@/components/modals/modal";

interface ImageModalProps {
  isOpen?: boolean; // is the modal open?
  onClose: () => void; // function to close the modal
  src?: string | null; // the image source
}

/**
 * Opens an image in a modal to view the image in a larger size.
 * This is used in the chat page to open an image in a modal.
 *
 * @param param0: ImageModalProps
 * @returns The image modal component
 */
export default function ImageModal({ isOpen, onClose, src }: ImageModalProps) {
  // check if there is an image source
  if (!src) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="h-80 w-80">
        <Image className="object-cover" fill alt="Image" src={src} />
      </div>
    </Modal>
  );
}
