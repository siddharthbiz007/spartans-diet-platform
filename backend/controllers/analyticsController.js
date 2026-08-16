import { query } from "../db/database.js";

export async function getDietitianAnalytics(req, res) {
  try {
    const dietitianId = req.user.id;

    const totalPatients = await query.get("SELECT COUNT(*) as count FROM patients WHERE dietitian_id = ?", [dietitianId]);
    const assessedPatients = await query.get("SELECT COUNT(*) as count FROM patients WHERE dietitian_id = ? AND dosha IS NOT NULL AND dosha != ''", [dietitianId]);
    const activePlans = await query.get(`SELECT COUNT(*) as count FROM diet_plans dp JOIN patients p ON dp.patient_id = p.id WHERE p.dietitian_id = ? AND dp.status = "Active"`, [dietitianId]);
    const onlineClients = await query.get("SELECT COUNT(*) as count FROM patients WHERE dietitian_id = ? AND client_id IS NOT NULL", [dietitianId]);

    const doshaRows = await query.all("SELECT dosha, COUNT(*) as count FROM patients WHERE dietitian_id = ? AND dosha IS NOT NULL AND dosha != '' GROUP BY dosha ORDER BY count DESC", [dietitianId]);

    const conditionRows = await query.all("SELECT health_conditions FROM patients WHERE dietitian_id = ? AND health_conditions IS NOT NULL AND health_conditions != ''", [dietitianId]);
    const conditionCount = {};
    conditionRows.forEach(row => {
      (row.health_conditions || "").split(",").map(s => s.trim()).filter(Boolean).forEach(cond => {
        if (cond && cond !== "None") conditionCount[cond] = (conditionCount[cond] || 0) + 1;
      });
    });
    const topConditions = Object.entries(conditionCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

    const monthlyPlans = await query.all(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM diet_plans dp JOIN patients p ON dp.patient_id = p.id WHERE p.dietitian_id = ? GROUP BY month ORDER BY month DESC LIMIT 6`, [dietitianId]);

    res.json({
      totalPatients: totalPatients.count,
      assessedPatients: assessedPatients.count,
      activePlans: activePlans.count,
      onlineClients: onlineClients.count,
      doshaDistribution: doshaRows,
      topConditions,
      monthlyPlans: monthlyPlans.reverse(),
    });
  } catch (err) {
    console.error("getDietitianAnalytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics." });
  }
}