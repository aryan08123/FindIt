import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import ItemImage from "./ItemImage";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/helpers";

export default function ItemCard({ item }) {
  return (
    <article className="item-card">
      <div className="item-card-media">
        <ItemImage path={item.imageUrl} alt={item.itemName} />
        <div className="item-card-badges">
          <StatusBadge status={item.itemType} />
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="item-card-body">
        <span className="item-card-category">{item.category}</span>
        <h3>{item.itemName}</h3>
        <p className="item-card-desc">{item.description}</p>
        <ul className="item-card-meta">
          <li><MapPin size={14} /> {item.location}</li>
          <li><Calendar size={14} /> {formatDate(item.reportedDate)}</li>
        </ul>
        <Link to={`/items/${item.id}`} className="btn btn-outline btn-sm btn-block">
          View Details
        </Link>
      </div>
    </article>
  );
}
