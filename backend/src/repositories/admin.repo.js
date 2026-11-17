import { query } from "../config/db.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function getAnalytics() {
  const [studentRows, appRows, jobAppRows, orderRows, enrollRows, completedRows, auditRows, monthlyRows, categoryRows] =
    await Promise.all([
      query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'"),
      query("SELECT COUNT(*) AS total FROM applications"),
      query("SELECT COUNT(*) AS total FROM job_applications"),
      query(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS revenue,
                SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid
         FROM orders`
      ),
      query("SELECT COUNT(*) AS total FROM enrollments"),
      query("SELECT COUNT(*) AS total FROM enrollments WHERE status = 'completed'"),
      query(
        "SELECT COUNT(DISTINCT user_id) AS total FROM audit_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
      ),
      query(
        `SELECT YEAR(created_at) AS year, MONTH(created_at) AS month, SUM(amount) AS revenue
         FROM orders
         WHERE status = 'paid' AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY YEAR(created_at), MONTH(created_at)
         ORDER BY year ASC, month ASC`
      ),
      query(
        `SELECT c.category, COUNT(*) AS count
         FROM enrollments e
         INNER JOIN courses c ON c.id = e.program_id
         WHERE e.program_type = 'course'
         GROUP BY c.category
         ORDER BY count DESC`
      ),
    ]);

  const students = Number(studentRows[0]?.total ?? 0);
  const totalOrders = Number(orderRows[0]?.total ?? 0);
  const paidOrders = Number(orderRows[0]?.paid ?? 0);
  const totalEnrollments = Number(enrollRows[0]?.total ?? 0);
  const revenue = Number(orderRows[0]?.revenue ?? 0);

  const revenueMap = new Map(
    monthlyRows.map((row) => [`${row.year}-${row.month}`, Number(row.revenue ?? 0)])
  );
  const revenueByMonth = [];
  const now = new Date();
  for (let index = 11; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    revenueByMonth.push({
      month: MONTHS[date.getMonth()],
      revenue: revenueMap.get(key) ?? 0,
    });
  }

  return {
    revenue,
    students,
    enrollments: totalEnrollments,
    completionRate: totalEnrollments
      ? Math.round((Number(completedRows[0]?.total ?? 0) / totalEnrollments) * 100)
      : 0,
    internshipApplications: Number(appRows[0]?.total ?? 0),
    jobApplications: Number(jobAppRows[0]?.total ?? 0),
    conversionRate: totalOrders ? Number(((paidOrders / totalOrders) * 100).toFixed(1)) : 0,
    activeUsers: Number(auditRows[0]?.total ?? 0) || students,
    revenueByMonth,
    enrollmentsByCategory: categoryRows.map((row) => ({
      category: row.category,
      count: Number(row.count),
    })),
  };
}
