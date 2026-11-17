import { Router } from "express";
import { getMentor, mentorCourses, listTestimonials } from "../repositories/catalog.repo.js";
import {
  listReviewableProjects,
  reviewUserProject,
} from "../repositories/learning.repo.js";
import {
  answerMentorQuestion,
  countReviewableProjects,
  getMentorQuestion,
  listMentorClasses,
  listMentorMessages,
  listMentorQuestions,
  listMentorSessions,
  listStudentSummaries,
} from "../repositories/mentor.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireRole("mentor"));

function mentorIdFor(user) {
  return user.mentorId ?? 1;
}

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const mentorId = mentorIdFor(req.user);
    const [courses, students, sessions, mentor, pendingReviews] = await Promise.all([
      mentorCourses(mentorId),
      listStudentSummaries(12),
      listMentorSessions(mentorId),
      getMentor(mentorId),
      countReviewableProjects(),
    ]);

    res.json({
      stats: {
        students: students.length,
        courses: courses.length,
        pendingReviews,
        sessions: sessions.length,
        rating: mentor?.rating ?? 4.8,
      },
      courses: courses.map((course) => ({
        id: course.id,
        slug: course.slug,
        title: course.title,
        students: course.studentsCount,
        rating: course.rating,
        status: course.status,
      })),
      students: students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        progress: student.progress,
      })),
      upcomingSessions: sessions.slice(0, 5),
    });
  })
);

router.get(
  "/students",
  asyncHandler(async (_req, res) => {
    res.json(await listStudentSummaries(20));
  })
);

router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    res.json(await mentorCourses(mentorIdFor(req.user)));
  })
);

router.get(
  "/classes",
  asyncHandler(async (req, res) => {
    res.json(await listMentorClasses(mentorIdFor(req.user)));
  })
);

router.get(
  "/projects",
  asyncHandler(async (_req, res) => {
    res.json(await listReviewableProjects());
  })
);

router.post(
  "/projects/:id/review",
  asyncHandler(async (req, res) => {
    const { decision, feedback, score } = req.body ?? {};
    const valid = ["approved", "changes-requested", "completed"];
    if (!valid.includes(decision)) {
      throw ApiError.badRequest("Decision must be approved, changes-requested or completed.");
    }
    const project = await reviewUserProject(req.params.id, { decision, feedback, score });
    if (!project) throw ApiError.notFound("Project not found.");
    await audit(req.user.id, "review", "project", project.id, { decision });
    res.json(project);
  })
);

router.get(
  "/questions",
  asyncHandler(async (_req, res) => {
    res.json(await listMentorQuestions());
  })
);

router.post(
  "/questions/:id/answer",
  asyncHandler(async (req, res) => {
    const answer = String(req.body?.answer ?? "").trim();
    if (!answer) throw ApiError.badRequest("Answer cannot be empty.");
    const question = await getMentorQuestion(req.params.id);
    if (!question) throw ApiError.notFound("Question not found.");
    const answered = await answerMentorQuestion(question.id, answer);
    await audit(req.user.id, "answer", "mentor_question", question.id);
    res.json(answered);
  })
);

router.get(
  "/messages",
  asyncHandler(async (req, res) => {
    res.json(await listMentorMessages(mentorIdFor(req.user)));
  })
);

router.get(
  "/sessions",
  asyncHandler(async (req, res) => {
    res.json(await listMentorSessions(mentorIdFor(req.user)));
  })
);

router.get(
  "/reviews",
  asyncHandler(async (_req, res) => {
    const testimonials = await listTestimonials();
    res.json(
      testimonials.slice(0, 8).map((testimonial) => ({
        id: testimonial.id,
        student: testimonial.author,
        rating: testimonial.rating,
        comment: testimonial.content,
        createdAt: testimonial.createdAt,
      }))
    );
  })
);

export default router;
