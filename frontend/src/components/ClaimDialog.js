import { useEffect, useState } from "react";
import FormField from "./FormField";
import { useToast } from "../context/ToastContext";
import claimService from "../services/claimService";
import { errorMessage } from "../utils/helpers";

export default function ClaimDialog({ item, onClose, onSubmitted }) {
  const toast = useToast();
  const [form, setForm] = useState({ description: "", proofDetails: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Escape closes the dialog (unless a request is in progress)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setServerError("");
  };

  const validate = () => {
    const found = {};
    if (!form.description.trim())
      found.description = "Please explain why this item is yours";
    else if (form.description.length > 2000)
      found.description = "Maximum 2000 characters";
    if (!form.proofDetails.trim())
      found.proofDetails = "Proof or identifying details are required";
    else if (form.proofDetails.length > 2000)
      found.proofDetails = "Maximum 2000 characters";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      await claimService.submit(item.id, {
        description: form.description.trim(),
        proofDetails: form.proofDetails.trim(),
      });
      toast.success("Claim submitted! An administrator will review it soon.");
      onSubmitted();
    } catch (err) {
      setServerError(errorMessage(err));
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
        <h3>Claim: {item.itemName}</h3>
        <p className="modal-sub">
          Describe the item and give details that only the real owner would
          know, such as marks, contents or a serial number. An administrator
          compares them with the finder's private notes.
        </p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            as="textarea"
            label="Why is this item yours?"
            name="description"
            placeholder="Where and when did you lose it? What does it look like?"
            value={form.description}
            onChange={handleChange}
            error={errors.description}
          />
          <FormField
            as="textarea"
            label="Proof / identifying details"
            name="proofDetails"
            placeholder="Unique marks, contents, name tag, serial number, purchase details…"
            value={form.proofDetails}
            onChange={handleChange}
            error={errors.proofDetails}
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
            <button className="btn btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

