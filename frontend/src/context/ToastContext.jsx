import { createContext, useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  function showToast(message, variant = "success") {
    setToast({
      show: true,
      message,
      variant,
    });
  }

  function hideToast() {
    setToast((prev) => ({
      ...prev,
      show: false,
    }));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          show={toast.show}
          onClose={hideToast}
          delay={2500}
          autohide
          bg={toast.variant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toast.variant === "danger" ? "Error" : "Success"}
            </strong>
          </Toast.Header>

          <Toast.Body className={toast.variant === "danger" ? "text-white" : ""}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}