import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileText } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ItemForm from "../components/ItemForm";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";
import itemService from "../services/itemService";
import { errorMessage } from "../utils/helpers";

export default function EditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    itemService
      .get(id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.status === 404
              ? "This report no longer exists."
              : errorMessage(err),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Loader text="Loading report…" />;

  if (error) {
    return (
      <div className="alert alert-error">
        {error} <Link to="/my-reports">Back to My Reports</Link>
      </div>
    );
  }

  if (!item.ownedByMe || item.status !== "ACTIVE") {
    return (
      <EmptyState
        icon={FileText}
        title="This report cannot be edited"
        message="Only your own active reports can be edited."
        action={
          <Link to="/my-reports" className="btn btn-primary">
            Back to My Reports
          </Link>
        }
      />
    );
  }

  const handleSubmit = async (values, file, removeImage) => {
    await itemService.update(item.id, values, file, removeImage);
    toast.success("Report updated successfully.");
    navigate("/my-reports");
  };

  return (
    <>
      <PageHeader
        title={`Edit ${item.itemType === "LOST" ? "lost" : "found"} report`}
        subtitle="Update the details and save your changes."
      />
      <ItemForm
        type={item.itemType}
        initial={{
          itemName: item.itemName ?? "",
          category: item.category ?? "",
          description: item.description ?? "",
          reportedDate: item.reportedDate ?? "",
          location: item.location ?? "",
          contactInfo: item.contactInfo ?? "",
          additionalDetails: item.additionalDetails ?? "",
        }}
        existingImage={item.imageUrl}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate("/my-reports")}
      />
    </>
  );
}


