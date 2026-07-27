import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal.jsx";

const useConfirm = () => {
  const [promise, setPromise] = useState(null);

  const confirm = (title, message) =>
    new Promise((resolve) => {
      setPromise({ resolve, title, message });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () =>
    promise ? (
      <ConfirmModal
        isOpen={promise !== null}
        title={promise.title}
        message={promise.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ) : null;

  return [ConfirmationDialog, confirm];
};

export default useConfirm;