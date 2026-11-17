import { Router } from "express";
import { getCourseBySlug } from "../repositories/catalog.repo.js";
import {
  buildDashboard,
  createAtsReport,
  createMockInterview,
  createNotification,
  createResume,
  getLessonProgress,
  getUserProject,
  listAssignments,
  listAtsReports,
  listCertificates,
  listClasses,
  listEnrollments,
  listMessagesForUser,
  listMockInterviews,
  listNotifications,
  listResumes,
  listUserProjects,
  markAllNotificationsRead,
  markNotificationRead,
  submitUserProject,
} from "../repositories/learning.repo.js";
import { listJobApplications, listSavedJobs } from "../repositories/career.repo.js";
import { updateUser } from "../repositories/users.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate } from "../middleware/auth.js";
import {
  analyzeResume,
  evaluateInterview,
  generateInterviewQuestions,
  careerRecommendations,
  aiEnabled,
} from "../services/ai.js";

const router = Router();
router.use(authenticate);

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    res.json(await buildDashboard(req.user));
  })
);

router.get(
  "/enrollments",
  asyncHandler(async (req, res) => {
    res.json(await listEnrollments(req.user.id));
  })
);

router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    res.json(await listUserProjects(req.user.id));
  })
);

router.post(
  "/projects/:id/submit",
  asyncHandler(async (req, res) => {
    const project = await getUserProject(req.params.id, req.user.id);
    if (!project) throw ApiError.notFound("Project not found.");
    const { repoUrl, submissionUrl, description } = req.body ?? {};
    if (!repoUrl && !submissionUrl) {
      throw ApiError.badRequest("Provide a repository URL or a live URL.");
    }
    const updated = await submitUserProject(project.id, req.user.id, {
      repoUrl,
      submissionUrl,
      description,
    });
    await audit(req.user.id, "submit", "project", updated.id);
    res.json(updated);
  })
);

router.get(
  "/certificates",
  asyncHandler(async (req, res) => {
    res.json(await listCertificates(req.user.id));
  })
);

router.get(
  "/job-applications",
  asyncHandler(async (req, res) => {
    res.json(await listJobApplications(req.user.id));
  })
);

router.get(
  "/saved-jobs",
  asyncHandler(async (req, res) => {
    res.json(await listSavedJobs(req.user.id));
  })
);

router.get(
  "/ats/reports",
  asyncHandler(async (req, res) => {
    res.json(await listAtsReports(req.user.id));
  })
);

router.post(
  "/ats/analyze",
  asyncHandler(async (req, res) => {
    const { resumeText, targetRole, fileName } = req.body ?? {};
    const text = resumeText ?? "";
    if (!text || text.trim().length < 40) {
      throw ApiError.badRequest("Paste your resume text (at least 40 characters) to analyze.");
    }
    const analysis = await analyzeResume({ text, targetRole });
    const report = await createAtsReport({
      userId: req.user.id,
      fileName: fileName ?? "pasted-resume.txt",
      targetRole: targetRole ?? "Full-Stack Developer",
      overallScore: analysis.overallScore,
      sections: analysis.sections,
      missingKeywords: analysis.missingKeywords,
      recommendedSkills: analysis.recommendedSkills,
      suggestions: analysis.suggestions,
      summary: analysis.summary,
    });
    res.status(201).json(report);
  })
);

router.get(
  "/resumes",
  asyncHandler(async (req, res) => {
    res.json(await listResumes(req.user.id));
  })
);

router.post(
  "/resumes",
  asyncHandler(async (req, res) => {
    const resume = await createResume({
      userId: req.user.id,
      title: req.body?.title ?? "Untitled Resume",
      template: req.body?.template ?? "modern",
      data: req.body?.data ?? {},
    });
    await audit(req.user.id, "save", "resume", resume.id);
    res.status(201).json(resume);
  })
);

router.get(
  "/mock-interviews",
  asyncHandler(async (req, res) => {
    res.json(await listMockInterviews(req.user.id));
  })
);

router.post(
  "/mock-interviews/questions",
  asyncHandler(async (req, res) => {
    const { role, technology, experience, type } = req.body ?? {};
    if (!role || !technology) throw ApiError.badRequest("Role and technology are required.");
    const generated = await generateInterviewQuestions({ role, technology, experience, type });
    const questions = (generated.questions ?? []).map((item) =>
      typeof item === "string" ? item : item.question
    );
    res.json({ ...generated, questions, aiPowered: aiEnabled() });
  })
);

router.post(
  "/mock-interviews/evaluate",
  asyncHandler(async (req, res) => {
    const { role, technology, experience, type, questions, answers } = req.body ?? {};
    if (!Array.isArray(questions) || !questions.length) {
      throw ApiError.badRequest("Questions are required.");
    }
    const evaluation = await evaluateInterview({ role, questions, answers: answers ?? [] });
    const evaluations = evaluation.evaluations ?? evaluation.questions ?? [];
    const interview = await createMockInterview({
      userId: req.user.id,
      role: role ?? "General",
      technology: technology ?? "General",
      experience: experience ?? "Fresher",
      type: type ?? "Mixed",
      interviewer: req.user.fullName,
      score: evaluation.score,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      recommendation: evaluation.recommendation,
      questions: evaluations,
    });
    await createNotification({
      userId: req.user.id,
      title: "Mock interview evaluated",
      message: `You scored ${interview.score}/100 on your ${role} mock interview.`,
      type: "interview",
    });
    res.status(201).json({ ...interview, questions: evaluations });
  })
);

router.post(
  "/career-recommendations",
  asyncHandler(async (req, res) => {
    res.json(await careerRecommendations(req.body ?? {}));
  })
);

router.get(
  "/notifications",
  asyncHandler(async (req, res) => {
    res.json(await listNotifications(req.user.id));
  })
);

router.post(
  "/notifications/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await markNotificationRead(req.params.id, req.user.id);
    if (!notification) throw ApiError.notFound("Notification not found.");
    res.json(notification);
  })
);

router.post(
  "/notifications/read-all",
  asyncHandler(async (req, res) => {
    await markAllNotificationsRead(req.user.id);
    res.json({ message: "All notifications marked as read." });
  })
);

router.get(
  "/classes",
  asyncHandler(async (req, res) => {
    const classes = await listClasses(req.user.id);
    res.json(classes.filter((item) => item.status !== "cancelled"));
  })
);

router.get(
  "/assignments",
  asyncHandler(async (req, res) => {
    const assignments = await listAssignments(req.user.id);
    res.json(assignments.filter((item) => item.status === "pending"));
  })
);

router.get(
  "/mentor-messages",
  asyncHandler(async (req, res) => {
    res.json(await listMessagesForUser(req.user.id));
  })
);

router.get(
  "/course-player/:slug",
  asyncHandler(async (req, res) => {
    const course = await getCourseBySlug(req.params.slug);
    if (!course) throw ApiError.notFound("Course not found.");
    const totalLessons = (course.modules ?? []).reduce(
      (sum, module) => sum + (module.lessons?.length ?? 0),
      0
    );
    const progressRows = await getLessonProgress(req.user.id, course.id);
    const completedLessons = progressRows.length;
    const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const flatLessons = (course.modules ?? []).flatMap((module) => module.lessons ?? []);
    res.json({
      course: { slug: course.slug, title: course.title, thumbnail: course.thumbnail },
      modules: course.modules,
      progress: {
        completedLessons,
        percent,
        lastLessonId: progressRows.at(-1)?.lesson_id ?? flatLessons[0]?.id ?? null,
      },
    });
  })
);

router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    const { passwordHash, ...safe } = req.user;
    res.json(safe);
  })
);

router.put(
  "/profile",
  asyncHandler(async (req, res) => {
    const { fullName, phone, headline, avatarUrl } = req.body ?? {};
    const updated = await updateUser(req.user.id, { fullName, phone, headline, avatarUrl });
    const { passwordHash, ...safe } = updated;
    res.json(safe);
  })
);

export default router;
