import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config/api";
import { Search, Leaf } from "lucide-react";

const DOSHA_COLORS = {
  Vata:  { bg: "rgba(100,149,237,0.10)", border: "#a0b8f0" },
  Pitta: { bg: "rgba(220,90,40,0.10)",   border: "#f0a080" },
  Kapha: { bg: "rgba(46,125,50,0.10)",   border: "#88bb8a" },
};
const EFFECT_BADGE = { Pacifies: "Pacifies", Aggravates: "Aggravates", Neutral: "Neutral" };
const EFFECT_COLOR = { Pacifies: "#2e7d32", Aggravates: "#c62828", Neutral: "#888" };

export default function FoodDatabase() {
  const { token } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDosha, setFilterDosha] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRasa, setFilterRasa] = useState("All");

  useEffect(() => { fetchFoods(); }, []);

  async function fetchFoods() {
    try {
      const res = await fetch(`${API_URL}/foods`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setFoods(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const categories = ["All", ...new Set(foods.map(f => f.category).filter(Boolean))];
  const rasaOptions = ["All", ...new Set(
    foods.flatMap(f => (f.ayurvedic_properties?.rasa || "").split(",").map(r => r.trim()).filter(Boolean))
  )].sort();

  const filtered = foods.filter(food => {
    const matchSearch = !search || food.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || food.category === filterCategory;
    const matchRasa = filterRasa === "All" || (food.ayurvedic_properties?.rasa || "").toLowerCase().includes(filterRasa.toLowerCase());
    const matchDosha = filterDosha === "All" || food[`${filterDosha.toLowerCase()}_effect`] === "Pacifies";
    return matchSearch && matchCategory && matchRasa && matchDosha;
  });

  const clearFilters = () => { setSearch(""); setFilterDosha("All"); setFilterCategory("All"); setFilterRasa("All"); };
  const activeFilterCount = [filterDosha, filterCategory, filterRasa].filter(v => v !== "All").length + (search ? 1 : 0);

  return (
    <div className="fade-in" style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--primary-dark)", marginBottom: "0.4rem" }}>
          Ayurvedic Food Database
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Browse and filter foods by Dosha suitability, taste (Rasa), and category.
          {foods.length > 0 && <span style={{ marginLeft: "0.5rem", fontWeight: 600, color: "var(--primary-color)" }}>{foods.length} foods indexed</span>}
        </p>
      </div>

      <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <Search size={18} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input type="text" className="form-control" placeholder="Search food by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "2.6rem", fontSize: "1rem" }} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Best For Dosha</div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {["All", "Vata", "Pitta", "Kapha"].map(d => (
                <button key={d} onClick={() => setFilterDosha(d)} style={{ padding: "0.35rem 0.9rem", borderRadius: "999px", border: `1.5px solid ${filterDosha === d ? "var(--primary-color)" : "var(--border-color)"}`, background: filterDosha === d ? "var(--primary-color)" : "white", color: filterDosha === d ? "white" : "var(--text-main)", fontWeight: filterDosha === d ? 700 : 400, fontSize: "0.85rem", cursor: "pointer" }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Category</div>
            <select className="form-control form-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: "auto", minWidth: "140px", fontSize: "0.88rem" }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Taste (Rasa)</div>
            <select className="form-control form-select" value={filterRasa} onChange={e => setFilterRasa(e.target.value)} style={{ width: "auto", minWidth: "140px", fontSize: "0.88rem" }}>
              {rasaOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <div style={{ alignSelf: "flex-end" }}>
              <button onClick={clearFilters} style={{ padding: "0.35rem 0.9rem", borderRadius: "8px", border: "1px solid var(--border-color)", background: "white", color: "var(--text-muted)", fontSize: "0.83rem", cursor: "pointer" }}>
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>
      </div>

      {!loading && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Showing <strong>{filtered.length}</strong> of {foods.length} foods
          {filterDosha !== "All" && <span> best for <strong>{filterDosha}</strong></span>}
        </p>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>Loading food database...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          No foods match. <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--primary-color)", cursor: "pointer", textDecoration: "underline" }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {filtered.map(food => {
            const props = food.ayurvedic_properties || {};
            return (
              <div key={food.id} className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--primary-dark)" }}>{food.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{food.category}</div>
                  </div>
                  <Leaf size={18} style={{ color: "var(--primary-color)", flexShrink: 0 }} />
                </div>
                <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem" }}>
                  {[{ label: "Cal", value: food.calories, color: "#f57c00" }, { label: "Pro", value: `${food.protein}g`, color: "#1565c0" }, { label: "Carb", value: `${food.carbohydrates}g`, color: "#558b2f" }, { label: "Fat", value: `${food.fat}g`, color: "#6a1b9a" }].map(({ label, value, color }) => (
                    <div key={label} style={{ flex: 1, background: "#f4f7f5", borderRadius: "8px", padding: "0.3rem 0.4rem", textAlign: "center" }}>
                      <div style={{ color, fontWeight: 700, fontSize: "0.88rem" }}>{value}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{label}</div>
                    </div>
                  ))}
                </div>
                {props.rasa && (
                  <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    <span style={{ fontWeight: 600, color: "var(--primary-dark)" }}>Rasa:</span> {props.rasa} | <span style={{ fontWeight: 600, color: "var(--primary-dark)" }}>Virya:</span> {props.virya} | <span style={{ fontWeight: 600, color: "var(--primary-dark)" }}>Guna:</span> {props.guna}
                  </div>
                )}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {[{ dosha: "Vata", effect: food.vata_effect }, { dosha: "Pitta", effect: food.pitta_effect }, { dosha: "Kapha", effect: food.kapha_effect }].map(({ dosha, effect }) => (
                    <span key={dosha} style={{ fontSize: "0.73rem", fontWeight: 600, padding: "0.2rem 0.55rem", borderRadius: "999px", background: DOSHA_COLORS[dosha]?.bg, border: `1px solid ${DOSHA_COLORS[dosha]?.border}`, color: EFFECT_COLOR[effect] || "#888" }}>
                      {dosha}: {EFFECT_BADGE[effect] || effect}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}