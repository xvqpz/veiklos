import "../../components/employee.css";

export default function ManagerPage() {
  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Vadybininko langas</h1>
        </div>
      </header>

      <main className="page-content">
        <section className="card employee-card">
          <div className="card-body">
            <h2>Šiame darbalaukyje galėsite:</h2>
            <ul style={{ paddingLeft: "1.25rem", marginBottom: "1.5rem" }}>
              <li>Pridėti arba pašalinti darbuotojo teises prie sistemos.</li>
              <li>Peržiūrėti ir patvirtinti arba atmesti darbuotojų užregistruotas.</li>
              <li>Filtruoti darbuotojų veiklas ir eksportuoti jas į Excel dokumentą.</li>
              <li>Sukurti arba pašalinti naujas temas ir potemes.</li>
            </ul>

            <div>
              <div className="info-box">
                <span> Susidūrus su techninėmis kliūtimis parašykite el. laišką adresu:</span>
                <br />
                <a href="mailto:vu.veiklu.registravimas@gmail.com" style={{ fontWeight: 600 }}>
                  vu.veiklu.registravimas@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
