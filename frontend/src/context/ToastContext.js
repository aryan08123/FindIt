import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = { success: Check, error: Info, info: Info };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, type, message }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const api = useMemo(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Icon size={20} />
              <span>{t.message}</span>
              <button onClick={() => remove(t.id)} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Usage: const toast = useToast(); toast.success("Saved!"); toast.error("Oops"); */
export const useToast = () => useContext(ToastContext);


