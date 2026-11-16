import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Hash, Lock, Mail, User } from "lucide-react";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { useToast } from "../context/ToastContext";
import authService from "../services/authService";
import { errorMessage, fieldErrorsOf } from "../utils/helpers";

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;   // same rule as the backend

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Electrical",
  "Mechanical",
  "Civil",
  "Business Administration",
  "Arts & Sciences",
];

const EMPTY = {
  fullName: "",
  email: "",
  studentId: "",
  department: "",
  password: "",
  confirmPassword: "",
};

function validate(v) {
  const e = {};
  if (!v.fullName.trim()) e.fullName = "Full name is required";
  else if (v.fullName.trim().length > 100) e.fullName = "Full name must be at most 100 characters";

  if (!v.email.trim()) e.email = "College email is required";
  else if (!EMAIL_RULE.test(v.email.trim())) e.email = "Enter a valid email address";

  if (!v.studentId.trim()) e.studentId = "Student ID is required";
  if (!v.department.trim()) e.department = "Department is required";

  if (!v.password) e.password = "Password is required";
  else if (!PASSWORD_RULE.test(v.password))
    e.password = "Use 8-72 characters with at least one letter and one number";

  if (!v.confirmPassword) e.confirmPassword = "Please confirm your password";
  else if (v.password !== v.confirmPassword) e.confirmPassword = "Passwords do not match";
  return e;
}

export default function Register() {
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      await authService.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        studentId: form.studentId.trim(),
        department: form.department.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Account created successfully! Please log in.");
      navigate("/login", { replace: true, state: { registeredEmail: form.email.trim() } });
    } catch (err) {
      const fieldErrs = fieldErrorsOf(err);
      if (Object.keys(fieldErrs).length) setErrors(fieldErrs);
      setServerError(errorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordToggle = (
    <button
      type="button"
      className="input-action"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <aside className="auth-aside">
          <h1>Join the FindIt community</h1>
          <p>One account lets you report lost items, post what you found and claim what is yours.</p>
          <ul className="auth-points">
            <li><User size={28} /> Free for every student</li>
            <li><Hash size={28} /> Your student ID keeps reports trustworthy</li>
            <li><Lock size={28} /> Passwords are securely hashed</li>
          </ul>
        </aside>

        <section className="auth-main">
          <div className="auth-card auth-card-wide">
            <h2>Create your account</h2>
            <p className="auth-sub">You are registering as a Student.</p>

            {serverError && <div className="alert alert-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <FormField
                  className="field-full"
                  label="Full name"
                  name="fullName"
                  icon={User}
                  placeholder="Your full name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />
                <FormField
                  className="field-full"
                  label="College email"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="name@college.edu"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                />
                <FormField
                  label="Student ID"
                  name="studentId"
                  icon={Hash}
                  placeholder="e.g. CS2021045"
                  value={form.studentId}
                  onChange={handleChange}
                  error={errors.studentId}
                />
                <FormField
                  label="Department"
                  name="department"
                  icon={GraduationCap}
                  placeholder="Select or type"
                  list="department-options"
                  value={form.department}
                  onChange={handleChange}
                  error={errors.department}
                />
                <datalist id="department-options">
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
                <FormField
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  hint="8-72 characters, with a letter and a number"
                  rightSlot={passwordToggle}
                />
                <FormField
                  label="Confirm password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="Repeat the password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </div>

              <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                {submitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="auth-switch">
              Already registered? <Link to="/login">Log in</Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}


