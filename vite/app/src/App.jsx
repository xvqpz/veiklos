import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import "./components/appLayout.css";
import vuLogo from "./assets/VU logo.png";

// manager pages
import ManagerPage from "./pages/manager/index.jsx";
import ManagerLayout from "./pages/manager/layout.jsx";
import RolesPage from "./pages/manager/roles.jsx";
import ManagerReviewPage from "./pages/manager/review.jsx";
import ManagerExportPage from "./pages/manager/export.jsx";
import ThemesPage from "./pages/manager/themes.jsx";

// employee pages
import EmployeePage from "./pages/employee/index.jsx";
import EmployeeLayout from "./pages/employee/layout.jsx";
import NewActivity from "./pages/employee/newActivity.jsx";
import MyActivities from "./pages/employee/myActivities.jsx";
import ExportPage from "./pages/employee/export.jsx";

// committee pages
import CommitteePage from "./pages/committee/index.jsx";
import CommitteeLayout from "./pages/committee/layout.jsx";
import EvaluatePage from "./pages/committee/evaluate.jsx";
import ResultsPage from "./pages/committee/results.jsx";
import LimitsPage from "./pages/committee/limits.jsx";
import CalculatePage from "./pages/committee/calculate.jsx";

const UNIVERSITY_TENANT_ID = "82c51a82-548d-43ca-bcf9-bf4b7eb1d012";

const roleToPath = (role) => {
  switch (role) {
    case "Vadybininkas":  return "/manager";
    case "Komisijos narys":  return "/committee";
    case "Darbuotojas": return "/employee";
    default: return "/";
  }
};

function useIdToken() {
  const { instance, accounts } = useMsal();
  return async () => {
    const account = accounts[0];
    const resp = await instance.acquireTokenSilent({ ...loginRequest, account });
    return resp.idToken;
  };
}

/* SignIn */

function SignIn() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const signIn = () => {
    instance.loginPopup(loginRequest).catch((err) => {
      console.error(err);
      alert("Login failed: " + (err?.message || err));
    });
  };

  if (isAuthenticated) return null;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img
          src={vuLogo}
          alt="Vilniaus universiteto logotipas"
          className="auth-logo"
        />

        <h1 className="auth-title">Bendro prisijungimo sistema</h1>
        <p className="auth-subtitle">
          Paslaugai reikalingas Jūsų tapatybės patvirtinimas.
        </p>

        <button
          onClick={signIn}
          className="btn btn-primary auth-button"
        >
          Prisijungti
        </button>
      </div>

      <footer className="app-footer">
        <div className="app-footer-inner">
          © {new Date().getFullYear()} ISKS'22 Goda Stungurytė. Visos teisės saugomos.
        </div>
      </footer>
    </div>
  );
}

/* role picker */

function RolePickerModal({ roles, initial, onConfirm }) {
  const [sel, setSel] = useState(initial || roles[0] || "");

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="modal-title">Pasirinkite rolę</h2>
        <p className="modal-text">
          Pasirinkite rolę, su kuria tęsite veiklą sistemoje.
        </p>

        <select
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          className="field-select modal-select"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button
            onClick={() => onConfirm(sel)}
            className="btn btn-primary"
          >
            Patvirtinti
          </button>
        </div>
      </div>
    </div>
  );
}

/* homegate */

function HomeGate() {
  const isAuthenticated = useIsAuthenticated();
  const activeRole = localStorage.getItem("activeRole") || "";

  if (!isAuthenticated) return <SignIn />; // not logged in → sign in
  if (activeRole) return <Navigate to={roleToPath(activeRole)} replace />;

  return <Profile />;
}

/* profile */

function Profile() {
  const { accounts, instance } = useMsal();
  const getIdToken = useIdToken();
  const navigate = useNavigate();

  const [checked, setChecked] = useState(false);
  const [session, setSession] = useState(null);
  const [initDone, setInitDone] = useState(false);
  const [activeRole, setActiveRole] = useState(
    () => localStorage.getItem("activeRole") || ""
  );
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  const account = accounts[0];
  const tenantId = account?.idTokenClaims?.tid;

  const signOut = async () => {
    const active = instance.getActiveAccount?.() || accounts[0];
    await instance.logoutPopup({ account: active, mainWindowRedirectUri: "/" });
    instance.setActiveAccount?.(null);
    localStorage.removeItem("activeRole");
  };

  // tenant check
  useEffect(() => {
    if (!account) return;
    if (tenantId && tenantId !== UNIVERSITY_TENANT_ID) {
      instance.logoutPopup().finally(() => {
        alert("Leidžiamos tik Vilniaus Universiteto paskyros.");
      });
    } else {
      setChecked(true);
    }
  }, [account, tenantId, instance]);

  // fetch session (user + roles)
  useEffect(() => {
    if (!checked || initDone) return;
    (async () => {
      try {
        const idToken = await getIdToken();
        const res = await fetch("/api/session/init", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error(`Init ${res.status}`);
        const data = await res.json();
        setSession(data);

        const roleNames = (data.roles || []).map((r) => r.name);

        if (roleNames.length === 1 && !activeRole) {
          const r = roleNames[0];
          setActiveRole(r);
          localStorage.setItem("activeRole", r);
          navigate(roleToPath(r), { replace: true });
        } else if (roleNames.length > 1 && !activeRole) {
          setNeedsRoleSelection(true);
        }
      } catch (e) {
        console.error("session init failed:", e);
      } finally {
        setInitDone(true);
      }
    })();
  }, [checked, initDone, getIdToken, activeRole, navigate]);

  // persist active role
  useEffect(() => {
    if (activeRole) localStorage.setItem("activeRole", activeRole);
  }, [activeRole]);

  if (!account || !checked) {
    return (
      <div className="page page-centered">
        <div className="card">
          <div className="card-body">Kraunama…</div>
        </div>
      </div>
    );
  }

  const roles = (session?.roles || []).map((r) => r.name);

  const confirmRole = (role) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
    setNeedsRoleSelection(false);
    navigate(roleToPath(role), { replace: true });
  };

  if (needsRoleSelection) {
    return (
      <div className="page">
        <RolePickerModal
          roles={roles}
          initial={roles[0]}
          onConfirm={confirmRole}
        />
      </div>
    );
  }
}

function RoleRoute({ required, children }) {
  const isAuthenticated = useIsAuthenticated();
  const activeRole = localStorage.getItem("activeRole") || "";
  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (required?.length && !required.includes(activeRole)) {
    return (
      <div className="page page-centered">
        <div className="card role-error">
          <h2 className="card-title">Netinkama rolė</h2>
          <div className="card-body">
            Dabartinė aktyvi rolė:{" "}
            <b>{activeRole || "(rolė nepasirinkta)"}</b>
          </div>
        </div>
      </div>
    );
  }
  return children;
}

/* App root */

function RoutesRoot() {
  return (
    <Routes>
      <Route path="/" element={<HomeGate />} />

      <Route
        path="/manager"
        element={
          <RoleRoute required={["Vadybininkas"]}>
            <ManagerLayout />
          </RoleRoute>
        }
      >
        <Route index element={<ManagerPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="review" element={<ManagerReviewPage />} />
        <Route path="export" element={<ManagerExportPage />} />
        <Route path="themes" element={<ThemesPage />} />
      </Route>

      <Route
        path="/committee"
        element={
          <RoleRoute required={["Komisijos narys"]}>
            <CommitteeLayout />
          </RoleRoute>
        }
      >
        <Route index element={<CommitteePage />} />
        <Route path="evaluate" element={<EvaluatePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="limits" element={<LimitsPage />} />
        <Route path="calculate" element={<CalculatePage />} />
      </Route>

      <Route
        path="/employee"
        element={
          <RoleRoute required={["Darbuotojas"]}>
            <EmployeeLayout />
          </RoleRoute>
        }
      >
        <Route index element={<EmployeePage />} />
        <Route path="new" element={<NewActivity />} />
        <Route path="my" element={<MyActivities />} />
        <Route path="export" element={<ExportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutesRoot />
    </BrowserRouter>
  );
}
