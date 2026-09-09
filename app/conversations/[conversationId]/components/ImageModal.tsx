"use client";

import Image from "next/image";
import Modal from "@/components/modals/Modal";

interface ImageModalProps {
  isOpen?: boolean;
  onClose: () => void;
  src?: string | null;
}

/**
 * Image modal component to view an image in a larger size.
 * @param {isOpen, onClose, src}: props for the image modal
 * @returns (JSX.Element): the image modal component
 */
function ImageModal({ isOpen, onClose, src }: ImageModalProps) {
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

export default ImageModal;
