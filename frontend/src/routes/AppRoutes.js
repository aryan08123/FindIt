import { Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "../components/RouteGuards";
import AppLayout from "../components/AppLayout";
import Landing from "../pages/Landing";
import BrowseItems from "../pages/BrowseItems";
import ItemDetails from "../pages/ItemDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import StudentDashboard from "../pages/StudentDashboard";
import ReportItem from "../pages/ReportItem";
import EditReport from "../pages/EditReport";
import MyReports from "../pages/MyReports";
import MyClaims from "../pages/MyClaims";
import AdminDashboard from "../pages/AdminDashboard";
import AdminReports from "../pages/AdminReports";
import AdminClaims from "../pages/AdminClaims";
import AdminUsers from "../pages/AdminUsers";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/browse" element={<BrowseItems />} />

      {/* Only for visitors who are not logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Any logged-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/items/:id" element={<ItemDetails />} />
      </Route>

      {/* Student area */}
      <Route element={<ProtectedRoute role="STUDENT" />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/report/lost" element={<ReportItem type="LOST" />} />
          <Route path="/report/found" element={<ReportItem type="FOUND" />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/my-reports/:id/edit" element={<EditReport />} />
          <Route path="/my-claims" element={<MyClaims />} />
        </Route>
      </Route>

      {/* Admin area */}
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}


