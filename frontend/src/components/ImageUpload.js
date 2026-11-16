import { useEffect, useMemo, useRef } from "react";
import { Upload, X } from "lucide-react";
import { imageSrc } from "../utils/helpers";

/**
 * Image picker with preview.
 * file = newly chosen File (or null); existingPath = saved image path when editing (or null).
 */
export default function ImageUpload({
  file,
  existingPath,
  onSelect,
  onClear,
  error,
}) {
  const inputRef = useRef(null);

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const shown = preview || imageSrc(existingPath);

  const handleChange = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // lets the user pick the same file again later
    if (picked) onSelect(picked);
  };

  return (
    <div className={`field ${error ? "field-has-error" : ""}`}>
      <span className="field-label">
        Item image <em>(optional)</em>
      </span>
      <input
        ref={inputRef}
        id="item-image"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        hidden
        onChange={handleChange}
      />

      {shown ? (
        <div className="upload-preview-wrap">
          <div className="upload-preview">
            <img src={shown} alt="Selected item" />
            <button
              type="button"
              className="upload-remove"
              onClick={onClear}
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
          <label htmlFor="item-image" className="btn btn-outline btn-sm">
            Change image
          </label>
        </div>
      ) : (
        <label htmlFor="item-image" className="upload">
          <Upload size={28} className="upload-icon" />
          <div>
            <strong>Click to choose an image</strong>
          </div>
          <div className="upload-hint">JPG, JPEG or PNG, up to 5 MB</div>
        </label>
      )}

      {error && <p className="field-msg">{error}</p>}
    </div>
  );
}


