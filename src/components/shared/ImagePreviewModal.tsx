import React from 'react';
import { Modal } from 'flowbite-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = "Vista previa de imagen"
}) => {
  return (
    <Modal show={isOpen} onClose={onClose} size="3xl" popup>
      <Modal.Header>
        <span className="p-4 font-bold text-gray-900 dark:text-white">{title}</span>
      </Modal.Header>
      <Modal.Body className="p-2">
        <div className="flex justify-center bg-gray-50 dark:bg-dark rounded-lg overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="max-h-[80vh] w-auto object-contain shadow-lg"
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImagePreviewModal;
