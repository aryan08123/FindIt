import { useEffect, useState } from "react";
import FormField from "./FormField";
import { useToast } from "../context/ToastContext";
import claimService from "../services/claimService";
import { errorMessage } from "../utils/helpers";

/** mode = "approve" | "reject". Remarks are optional for approve and required for reject. */
export default function ReviewDialog({ claim, mode, onClose, onDone }) {
  const toast = useToast();
  const isReject = mode === "reject";

  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReject && !remarks.trim()) {
      setError("Please give a reason for rejecting this claim");
      return;
    }
    if (remarks.length > 500) {
      setError("Maximum 500 characters");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (isReject) await claimService.reject(claim.id, remarks.trim());
      else await claimService.approve(claim.id, remarks.trim());
      toast.success(
        isReject
          ? "Claim rejected."
          : "Claim approved. The item is now marked as claimed.",
      );
      onDone();
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => !submitting && onClose()}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{isReject ? "Reject claim" : "Approve claim"}</h3>
        <p className="modal-sub">
          <strong>{claim.claimantName}</strong> claims{" "}
          <strong>{claim.itemName}</strong>.{" "}
          {isReject
            ? "The claimant will see your reason. The item stays open for other claims."
            : "The item will be marked as claimed and any other pending claims for it are rejected automatically."}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            as="textarea"
            label={isReject ? "Reason for rejection" : "Remarks (optional)"}
            name="remarks"
            placeholder={
              isReject
                ? "e.g. The proof does not match the finder's details."
                : "e.g. Details match. Collect the item from the admin office."
            }
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setError("");
            }}
            error={error}
          />
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className={`btn ${isReject ? "btn-danger" : "btn-primary"}`}
              disabled={submitting}
            >
              {submitting
                ? "Saving…"
                : isReject
                  ? "Reject claim"
                  : "Approve claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


