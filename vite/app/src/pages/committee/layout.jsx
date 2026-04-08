import { NavLink, Outlet } from "react-router-dom";
import AppHeader from "../../components/appHeader.jsx";
import "../../components/employee.css";

export default function CommitteeLayout() {
  return (
    <div className="employee-shell">
      <AppHeader>
        <NavLink to="/committee/evaluate" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Įvertinti veiklas
        </NavLink>
        <NavLink to="/committee/results" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Įvertinimai
        </NavLink>
        <NavLink  to="/committee/calculate" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Skaičiuoklė
        </NavLink>
        <NavLink to="/committee/limits" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Limitų nustatymas
        </NavLink>
      </AppHeader>

      <main className="employee-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          © {new Date().getFullYear()} Goda Stungurytė, ISKS'22. Visos teisės saugomos.
        </div>
      </footer>
    </div>
  );
}
