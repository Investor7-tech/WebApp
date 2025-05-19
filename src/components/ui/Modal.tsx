import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full relative">
        <div className="p-4">
          {children}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-lg text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center justify-center"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;