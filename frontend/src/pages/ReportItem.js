import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ItemForm from "../components/ItemForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import itemService from "../services/itemService";

export default function ReportItem({ type }) {
  const isLost = type === "LOST";
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (values, file) => {
    if (isLost) await itemService.reportLost(values, file);
    else await itemService.reportFound(values, file);
    toast.success(`${isLost ? "Lost" : "Found"} item reported successfully.`);
    navigate("/my-reports");
  };

  return (
    <>
      <PageHeader
        title={isLost ? "Report a lost item" : "Report a found item"}
        subtitle={
          isLost
            ? "Tell us what you lost so that others can recognise it."
            : "Describe what you found so that the owner can claim it."
        }
      />
      <ItemForm
        key={type}
        type={type}
        initial={isLost ? { contactInfo: user.email } : {}}
        submitLabel={isLost ? "Report lost item" : "Report found item"}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/dashboard")}
      />
    </>
  );
}


