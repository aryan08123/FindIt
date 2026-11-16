import { useState } from "react";
import { ImageOff } from "lucide-react";
import { imageSrc } from "../utils/helpers";

export default function ItemImage({ path, alt }) {
  const src = imageSrc(path);
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className="img-placeholder"
        role="img"
        aria-label="No image available"
      >
        <ImageOff size={32} />
        <span>No image</span>
      </div>
    );
  }
  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
  );
}

