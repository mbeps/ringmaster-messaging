"use client";

import Modal from "@/components/modals/Modal";
import Image from "next/image";

interface ImageModalProps {
  isOpen?: boolean; // is the modal open?
  onClose: () => void; // function to close the modal
  src?: string | null; // the image source
}

/**
 * Opens an image in a modal to make the image bigger.
 * This is used in the chat page to open an image in a modal.
 *
 * @param param0 { isOpen, onClose, src}: ImageModalProps
 * @returns (JSX.Element | null): The image modal component
 */
const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, src }) => {
  // check if there is an image source
  if (!src) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80 h-80">
        <Image className="object-cover" fill alt="Image" src={src} />
      </div>
    </Modal>
  );
};

export default ImageModal;
