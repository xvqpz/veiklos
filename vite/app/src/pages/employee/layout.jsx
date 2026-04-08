import { NavLink, Outlet } from "react-router-dom";
import AppHeader from "../../components/appHeader.jsx";
import "../../components/employee.css";

export default function EmployeeLayout() {
  return (
    <div className="employee-shell">
      <AppHeader>
        <NavLink to="/employee/new" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Nauja veikla
        </NavLink>
        <NavLink to="/employee/my" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Mano veiklos
        </NavLink>
        <NavLink to="/employee/export" className={({ isActive }) =>
            "employee-nav-link" + (isActive ? " is-active" : "")
          }
        >
          Eksportas
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
