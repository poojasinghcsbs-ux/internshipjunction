import { Router } from "express";
import authRoutes from "./auth.routes.js";
import publicRoutes from "./public.routes.js";
import courseRoutes from "./courses.routes.js";
import internshipRoutes from "./internships.routes.js";
import fellowshipRoutes from "./fellowships.routes.js";
import jobRoutes from "./jobs.routes.js";
import studentRoutes from "./student.routes.js";
import communityRoutes from "./community.routes.js";
import enrollmentRoutes from "./enrollment.routes.js";
import mentorRoutes from "./mentor.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use(publicRoutes);
router.use("/courses", courseRoutes);
router.use("/internships", internshipRoutes);
router.use("/fellowships", fellowshipRoutes);
router.use("/jobs", jobRoutes);
router.use("/community", communityRoutes);
router.use(enrollmentRoutes);
router.use(studentRoutes);
router.use("/mentor", mentorRoutes);
router.use("/admin", adminRoutes);

export default router;
