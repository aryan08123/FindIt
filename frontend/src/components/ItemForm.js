import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import FormField from "./FormField";
import ImageUpload from "./ImageUpload";
import publicService from "../services/publicService";
import { errorMessage, fieldErrorsOf, todayISO } from "../utils/helpers";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EMPTY = {
  itemName: "",
  category: "",
  description: "",
  reportedDate: "",
  location: "",
  contactInfo: "",
  additionalDetails: "",
};

/**
 * type = "LOST" | "FOUND"
 * initial = starting field values (edit mode), existingImage = saved image path (edit mode)
 * onSubmit(values, imageFile, removeExistingImage) must return a promise; throw/reject to show errors.
 */
export default function ItemForm({
  type,
  initial = {},
  existingImage = null,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const isLost = type === "LOST";

  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [removeExisting, setRemoveExisting] = useState(false);

  useEffect(() => {
    publicService
      .categories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setServerError("");
  };

  const handleSelectImage = (picked) => {
    const ext = picked.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      setImageError("Only JPG, JPEG and PNG images are allowed");
      return;
    }
    if (picked.size > MAX_IMAGE_BYTES) {
      setImageError("Image is too large (maximum 5 MB)");
      return;
    }
    setImageError("");
    setFile(picked);
  };

  const handleClearImage = () => {
    setImageError("");
    if (file) setFile(null);
    else setRemoveExisting(true);
  };

  const validate = () => {
    const e = {};
    if (!form.itemName.trim()) e.itemName = "Item name is required";
    else if (form.itemName.trim().length > 120)
      e.itemName = "Maximum 120 characters";

    if (!form.category) e.category = "Please choose a category";

    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.length > 2000)
      e.description = "Maximum 2000 characters";

    if (!form.reportedDate)
      e.reportedDate = isLost
        ? "Date lost is required"
        : "Date found is required";
    else if (form.reportedDate > todayISO())
      e.reportedDate = "Date cannot be in the future";

    if (!form.location.trim()) e.location = "Location is required";
    else if (form.location.trim().length > 150)
      e.location = "Maximum 150 characters";

    if (isLost) {
      if (!form.contactInfo.trim())
        e.contactInfo = "Contact information is required";
      else if (form.contactInfo.trim().length > 150)
        e.contactInfo = "Maximum 150 characters";
    }
    if (form.additionalDetails.length > 2000)
      e.additionalDetails = "Maximum 2000 characters";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    const values = {
      itemName: form.itemName.trim(),
      category: form.category,
      description: form.description.trim(),
      reportedDate: form.reportedDate,
      location: form.location.trim(),
      contactInfo: form.contactInfo.trim(),
      additionalDetails: form.additionalDetails.trim(),
    };

    setSubmitting(true);
    setServerError("");
    try {
      await onSubmit(values, file, removeExisting);
    } catch (err) {
      const fieldErrs = fieldErrorsOf(err);
      if (Object.keys(fieldErrs).length) setErrors(fieldErrs);
      setServerError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="form-grid">
        <FormField
          className="field-full"
          label="Item name"
          name="itemName"
          placeholder="e.g. Blue umbrella, Casio calculator, Student ID card"
          value={form.itemName}
          onChange={handleChange}
          error={errors.itemName}
        />
        <FormField
          as="select"
          label="Category"
          name="category"
          value={form.category}
          onChange={handleChange}
          error={errors.category}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FormField>
        <FormField
          label={isLost ? "Date lost" : "Date found"}
          name="reportedDate"
          type="date"
          icon={Calendar}
          max={todayISO()}
          value={form.reportedDate}
          onChange={handleChange}
          error={errors.reportedDate}
        />
        <FormField
          className="field-full"
          label={isLost ? "Location lost" : "Location found"}
          name="location"
          icon={MapPin}
          placeholder="e.g. Central Library, 2nd floor"
          value={form.location}
          onChange={handleChange}
          error={errors.location}
        />
        <FormField
          as="textarea"
          className="field-full"
          label="Description"
          name="description"
          placeholder="Colour, brand, size, condition, anything that helps identify the item"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />

        {isLost ? (
          <FormField
            className="field-full"
            label="Contact information"
            name="contactInfo"
            placeholder="Email or phone number where you can be reached"
            value={form.contactInfo}
            onChange={handleChange}
            error={errors.contactInfo}
            hint="Shown to logged-in students so a finder can reach you."
          />
        ) : (
          <FormField
            as="textarea"
            className="field-full"
            label="Additional identifying details"
            name="additionalDetails"
            placeholder="Something only the real owner would know: marks, contents, name tag, serial number…"
            value={form.additionalDetails}
            onChange={handleChange}
            error={errors.additionalDetails}
            hint="Private: only you and the administrator can see this. It is used to verify the real owner."
          />
        )}
      </div>

      <ImageUpload
        file={file}
        existingPath={removeExisting ? null : existingImage}
        onSelect={handleSelectImage}
        onClear={handleClearImage}
        error={imageError}
      />

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}



