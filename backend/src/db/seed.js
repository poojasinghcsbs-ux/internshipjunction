import { query } from "../config/db.js";
import { mapUser } from "./mappers.js";
import { students, mentorUsers, adminUsers } from "../data/users.js";
import { courses } from "../data/courses.js";
import { internships } from "../data/internships.js";
import { fellowships } from "../data/fellowships.js";
import { jobs } from "../data/jobs.js";
import { mentors } from "../data/mentors.js";
import { projects as projectCatalog } from "../data/projects.js";
import { testimonials } from "../data/testimonials.js";

const DEMO_STUDENT_EMAIL = students[0].email;
const DAY = 86_400_000;
const json = (value) => JSON.stringify(value ?? []);

async function countRows(table, where = "", params = []) {
  const rows = await query(`SELECT COUNT(*) AS total FROM \`${table}\` ${where}`, params);
  return Number(rows[0]?.total ?? 0);
}

async function seedUsers() {
  for (const user of [...students, ...mentorUsers, ...adminUsers]) {
    const byEmail = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [user.email]);
    if (byEmail.length) continue;

    const byId = await query("SELECT id FROM users WHERE id = ? LIMIT 1", [user.id]);
    const values = [
      user.fullName,
      user.email,
      user.phone ?? null,
      user.passwordHash,
      user.role,
      user.headline ?? null,
      user.avatarUrl ?? null,
      user.mentorId ?? null,
      new Date(user.createdAt ?? Date.now()),
    ];

    if (byId.length) {
      await query(
        `INSERT INTO users
          (full_name, email, phone, password_hash, role, headline, avatar_url, mentor_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
    } else {
      await query(
        `INSERT INTO users
          (id, full_name, email, phone, password_hash, role, headline, avatar_url, mentor_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, ...values]
      );
    }
  }
}

async function seedMentors() {
  const rows = await query("SELECT * FROM mentors ORDER BY id ASC");
  const byName = new Map(rows.map((row) => [row.name, row.id]));

  for (const mentor of mentors) {
    if (byName.has(mentor.name)) continue;
    const result = await query(
      `INSERT INTO mentors
        (name, role, company, avatar_url, expertise, experience_years, rating, reviews_count,
         bio, linkedin, availability, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mentor.name,
        mentor.role,
        mentor.company,
        mentor.avatarUrl ?? null,
        json(mentor.expertise),
        Number(mentor.experienceYears ?? 0),
        Number(mentor.rating ?? 0),
        Number(mentor.reviewsCount ?? 0),
        mentor.bio ?? null,
        mentor.linkedin ?? null,
        mentor.availability ?? null,
        mentor.isFeatured ? 1 : 0,
      ]
    );
    byName.set(mentor.name, result.insertId);
  }
  return byName;
}

async function seedCourses(mentorIdByName) {
  const courseRows = new Map();

  for (const course of courses) {
    const existing = await query("SELECT id, slug, title, thumbnail FROM courses WHERE slug = ? LIMIT 1", [
      course.slug,
    ]);

    let courseId;
    if (existing.length) {
      courseId = existing[0].id;
    } else {
      const mentorName = mentors[course.mentorId - 1]?.name;
      const mentorId = mentorIdByName.get(mentorName) ?? null;
      const result = await query(
        `INSERT INTO courses
          (slug, title, category, level, mode, thumbnail, price, original_price, rating,
           reviews_count, students_count, duration, technologies, short_description, overview,
           outcomes, prerequisites, audience, certification, career_outcomes, mentor_id,
           is_featured, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.slug,
          course.title,
          course.category,
          course.level,
          course.mode,
          course.thumbnail,
          Number(course.price ?? 0),
          Number(course.originalPrice ?? 0),
          Number(course.rating ?? 0),
          Number(course.reviewsCount ?? 0),
          Number(course.studentsCount ?? 0),
          course.duration,
          json(course.technologies),
          course.shortDescription,
          course.overview,
          json(course.outcomes),
          json(course.prerequisites),
          json(course.audience),
          course.certification,
          json(course.careerOutcomes),
          mentorId,
          course.isFeatured ? 1 : 0,
          course.status ?? "active",
          new Date(course.createdAt ?? Date.now()),
        ]
      );
      courseId = result.insertId;
    }

    courseRows.set(course.slug, {
      id: courseId,
      slug: course.slug,
      title: course.title,
      thumbnail: course.thumbnail,
    });

    const moduleCount = await countRows("course_modules", "WHERE course_id = ?", [courseId]);
    if (moduleCount === 0) {
      for (const [moduleIndex, module] of (course.modules ?? []).entries()) {
        const moduleResult = await query(
          "INSERT INTO course_modules (course_id, title, position) VALUES (?, ?, ?)",
          [courseId, module.title, moduleIndex]
        );
        for (const [lessonIndex, lesson] of (module.lessons ?? []).entries()) {
          await query(
            `INSERT INTO lessons (module_id, title, type, duration, is_preview, position)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              moduleResult.insertId,
              lesson.title,
              lesson.type ?? "video",
              lesson.duration ?? null,
              lesson.isPreview ? 1 : 0,
              lessonIndex,
            ]
          );
        }
      }
    }
  }
  return courseRows;
}

async function seedInternships(mentorIdByName) {
  const rows = new Map();
  for (const internship of internships) {
    const existing = await query("SELECT id FROM internships WHERE slug = ? LIMIT 1", [
      internship.slug,
    ]);
    let id;
    if (existing.length) {
      id = existing[0].id;
    } else {
      const mentorName = mentors[internship.mentorId - 1]?.name;
      const mentorId = mentorIdByName.get(mentorName) ?? null;
      const result = await query(
        `INSERT INTO internships
          (slug, title, domain, level, mode, duration, stipend, location, thumbnail, skills,
           short_description, overview, eligibility, roadmap, perks, certification,
           application_deadline, status, openings, applicants_count, mentor_id, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          internship.slug,
          internship.title,
          internship.domain,
          internship.level,
          internship.mode,
          internship.duration,
          internship.stipend,
          internship.location,
          internship.thumbnail,
          json(internship.skills),
          internship.shortDescription,
          internship.overview,
          json(internship.eligibility),
          json(internship.roadmap),
          json(internship.perks),
          internship.certification,
          internship.applicationDeadline ?? null,
          internship.status ?? "open",
          Number(internship.openings ?? 0),
          Number(internship.applicantsCount ?? 0),
          mentorId,
          internship.isFeatured ? 1 : 0,
        ]
      );
      id = result.insertId;
    }
    rows.set(internship.slug, { id, title: internship.title, thumbnail: internship.thumbnail });
  }
  return rows;
}

async function seedFellowships() {
  const rows = new Map();
  for (const fellowship of fellowships) {
    const existing = await query("SELECT id FROM fellowships WHERE slug = ? LIMIT 1", [
      fellowship.slug,
    ]);
    let id;
    if (existing.length) {
      id = existing[0].id;
    } else {
      const result = await query(
        `INSERT INTO fellowships
          (slug, title, domain, cohort, start_date, duration, seats, seats_left, price,
           original_price, thumbnail, short_description, overview, highlights, curriculum,
           mentors, career_support, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fellowship.slug,
          fellowship.title,
          fellowship.domain,
          fellowship.cohort,
          fellowship.startDate ?? null,
          fellowship.duration,
          Number(fellowship.seats ?? 0),
          Number(fellowship.seatsLeft ?? 0),
          Number(fellowship.price ?? 0),
          Number(fellowship.originalPrice ?? 0),
          fellowship.thumbnail,
          fellowship.shortDescription,
          fellowship.overview,
          json(fellowship.highlights),
          json(fellowship.curriculum),
          json(fellowship.mentors),
          json(fellowship.careerSupport),
          fellowship.isFeatured ? 1 : 0,
        ]
      );
      id = result.insertId;
    }
    rows.set(fellowship.slug, { id, title: fellowship.title, thumbnail: fellowship.thumbnail });
  }
  return rows;
}

async function seedJobs() {
  const rows = new Map();
  for (const job of jobs) {
    const existing = await query("SELECT id FROM jobs WHERE slug = ? LIMIT 1", [job.slug]);
    let id;
    if (existing.length) {
      id = existing[0].id;
    } else {
      const result = await query(
        `INSERT INTO jobs
          (slug, title, company, company_logo, location, remote, experience, salary_min,
           salary_max, type, skills, description, responsibilities, requirements, posted_at,
           status, applicants_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.slug,
          job.title,
          job.company,
          job.companyLogo ?? null,
          job.location,
          job.remote ? 1 : 0,
          job.experience,
          Number(job.salaryMin ?? 0),
          Number(job.salaryMax ?? 0),
          job.type,
          json(job.skills),
          job.description,
          json(job.responsibilities),
          json(job.requirements),
          new Date(job.postedAt ?? Date.now()),
          job.status ?? "open",
          Number(job.applicantsCount ?? 0),
        ]
      );
      id = result.insertId;
    }
    rows.set(job.slug, { id, title: job.title, company: job.company });
  }
  return rows;
}

async function seedProjectCatalog(courseRows) {
  const rows = new Map();
  for (const project of projectCatalog) {
    const existing = await query("SELECT id FROM project_catalog WHERE title = ? LIMIT 1", [
      project.title,
    ]);
    let id;
    if (existing.length) {
      id = existing[0].id;
    } else {
      const course = [...courseRows.values()].find((item) => item.title === project.courseTitle);
      const result = await query(
        `INSERT INTO project_catalog
          (title, course_slug, course_title, difficulty, description, requirements, skills, estimated_hours)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          project.title,
          course?.slug ?? null,
          project.courseTitle ?? null,
          project.difficulty,
          project.description,
          json(project.requirements),
          json(project.skills),
          Number(project.estimatedHours ?? 0),
        ]
      );
      id = result.insertId;
    }
    rows.set(project.title, { id, ...project });
  }
  return rows;
}

async function seedTestimonials() {
  if ((await countRows("testimonials")) > 0) return;
  for (const [index, testimonial] of testimonials.entries()) {
    await query(
      `INSERT INTO testimonials (author, role, rating, content, is_featured, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        testimonial.author,
        testimonial.role,
        Number(testimonial.rating ?? 5),
        testimonial.content,
        index < 4 ? 1 : 0,
        new Date(testimonial.createdAt ?? Date.now()),
      ]
    );
  }
}

async function seedCoupons() {
  if ((await countRows("coupons")) > 0) return;
  const coupons = [
    ["JUNCTION10", "percent", 10, 2000, "10% off, up to ₹2000"],
    ["NEWYEAR25", "percent", 25, 5000, "25% off, up to ₹5000"],
    ["FLAT1000", "flat", 1000, 1000, "Flat ₹1000 off"],
  ];
  for (const [code, type, value, maxDiscount, description] of coupons) {
    await query(
      `INSERT INTO coupons (code, type, value, max_discount, active, description)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [code, type, value, maxDiscount, description]
    );
  }
}

async function seedMentorSessions(mentorIdByName) {
  if ((await countRows("mentor_sessions")) > 0) return;
  const titles = ["Project review", "Career guidance", "Mock interview", "Doubt clearing", "Portfolio feedback"];
  for (const [index, mentor] of mentors.slice(0, 5).entries()) {
    const mentorId = mentorIdByName.get(mentor.name);
    if (!mentorId) continue;
    await query(
      `INSERT INTO mentor_sessions (mentor_id, mentor_name, title, scheduled_at, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        mentorId,
        mentor.name,
        titles[index],
        new Date(Date.now() + (index + 1) * DAY),
        index % 2 === 0 ? "upcoming" : "completed",
      ]
    );
  }
}

async function seedCommunity(usersByName) {
  if ((await countRows("community_posts")) > 0) return;

  const posts = [
    { author: "Aarav Mehta", role: "mentor", title: "How I would learn full-stack in 2026", content: "Focus on fundamentals first, then build relentlessly. Ship one small project every two weeks and get feedback. Consistency beats intensity.", tags: ["career", "web-development"] },
    { author: "Priya Nair", role: "mentor", title: "Understanding window functions in SQL", content: "Window functions let you compute running totals, ranks and moving averages without collapsing rows. Here is a breakdown with examples.", tags: ["sql", "data"] },
    { author: "Sneha Patil", role: "student", title: "My design fellowship experience so far", content: "Week 3 of the design fellowship and the weekly critiques are intense but so worth it. My Figma skills have jumped.", tags: ["ui-ux", "fellowship"] },
    { author: "Rahul Desai", role: "student", title: "Deploying a model with FastAPI in 20 minutes", content: "Sharing my notes from the ML engineering track on wrapping a scikit-learn model in a FastAPI endpoint and containerising it.", tags: ["machine-learning", "devops"] },
    { author: "Meera Joshi", role: "mentor", title: "PM interview: how to answer prioritisation questions", content: "Always anchor on impact, effort and confidence. Show your reasoning out loud and be comfortable with tradeoffs.", tags: ["product", "interview"] },
    { author: "Ishita Banerjee", role: "student", title: "Ran my first live ad campaign!", content: "Set up a small budget Google Ads campaign as part of the marketing internship and got a 3.2x ROAS. Happy to share what worked.", tags: ["marketing", "growth"] },
    { author: "Vikram Singh", role: "mentor", title: "Stop guessing: add observability first", content: "Before optimising, measure. Logs, metrics and traces will tell you exactly where the bottleneck is.", tags: ["devops", "backend"] },
    { author: "Ananya Bose", role: "student", title: "Built a RAG chatbot over my course notes", content: "Used embeddings and a vector store to build a study assistant. It answers questions from all my lesson PDFs.", tags: ["ai", "project"] },
    { author: "Imran Sheikh", role: "mentor", title: "Cloud cost traps to avoid as a beginner", content: "NAT gateways, idle load balancers and unmanaged logs will silently eat your budget. Set billing alerts from day one.", tags: ["cloud", "aws"] },
    { author: "Karan Malhotra", role: "student", title: "From support role to product manager", content: "Sharing my journey of switching into PM using the accelerator program. Happy to answer questions.", tags: ["career", "product"] },
  ];

  const fallbackUser = usersByName.get(students[0].fullName);
  const postIds = [];
  for (const [index, post] of posts.entries()) {
    const user = usersByName.get(post.author) ?? fallbackUser;
    const result = await query(
      `INSERT INTO community_posts
        (user_id, author, author_role, title, content, tags, likes, comments_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)`,
      [
        user.id,
        post.author,
        post.role,
        post.title,
        post.content,
        json(post.tags),
        new Date(Date.now() - (index + 1) * 6 * 3_600_000),
      ]
    );
    postIds.push(result.insertId);
  }

  const commenters = students.slice(1, 8).map((student) => usersByName.get(student.fullName)).filter(Boolean);
  const comments = [
    "This is exactly what I needed this week. Thanks for sharing!",
    "Saved this. The part about building every two weeks really resonates.",
    "Could you share a sample repository for this?",
  ];
  for (const postId of postIds.slice(0, 5)) {
    for (const [index, commenter] of commenters.slice(0, 2).entries()) {
      await query(
        `INSERT INTO community_comments (post_id, user_id, author, author_role, content)
         VALUES (?, ?, ?, ?, ?)`,
        [postId, commenter.id, commenter.fullName, commenter.role, comments[index]]
      );
    }
    await query("UPDATE community_posts SET comments_count = 2 WHERE id = ?", [postId]);
  }

  const demo = usersByName.get(students[0].fullName);
  for (const postId of postIds.slice(0, 3)) {
    await query("INSERT IGNORE INTO community_likes (post_id, user_id) VALUES (?, ?)", [
      postId,
      demo.id,
    ]);
    await query(
      "UPDATE community_posts SET likes = (SELECT COUNT(*) FROM community_likes WHERE post_id = ?) WHERE id = ?",
      [postId, postId]
    );
  }
}

async function seedCommunityEngagement(usersByName) {
  const postRows = await query("SELECT id FROM community_posts ORDER BY id ASC LIMIT 5");
  if (!postRows.length) return;

  if ((await countRows("community_comments")) === 0) {
    const commenters = students
      .slice(1, 8)
      .map((student) => usersByName.get(student.fullName))
      .filter(Boolean);
    const comments = [
      "This is exactly what I needed this week. Thanks for sharing!",
      "Saved this. The part about building every two weeks really resonates.",
      "Could you share a sample repository for this?",
    ];
    for (const post of postRows) {
      for (const [index, commenter] of commenters.slice(0, 2).entries()) {
        await query(
          `INSERT INTO community_comments (post_id, user_id, author, author_role, content)
           VALUES (?, ?, ?, ?, ?)`,
          [post.id, commenter.id, commenter.fullName, commenter.role, comments[index]]
        );
      }
    }
  }

  const demo = usersByName.get(students[0].fullName);
  if (demo && (await countRows("community_likes")) === 0) {
    for (const post of postRows.slice(0, 3)) {
      await query("INSERT IGNORE INTO community_likes (post_id, user_id) VALUES (?, ?)", [
        post.id,
        demo.id,
      ]);
    }
  }

  await query(
    `UPDATE community_posts p
     SET comments_count = (SELECT COUNT(*) FROM community_comments c WHERE c.post_id = p.id),
         likes = (SELECT COUNT(*) FROM community_likes l WHERE l.post_id = p.id)`
  );
}

async function seedOrders() {
  if ((await countRows("orders")) > 0) return;
  const studentRows = await query(
    "SELECT id FROM users WHERE role = 'student' ORDER BY id ASC LIMIT 5"
  );
  if (!studentRows.length) return;
  const seeds = [
    { program: "Full-Stack Career Fellowship", amount: 89999, status: "paid", days: 30 },
    { program: "Data Science with Python", amount: 12999, status: "paid", days: 21 },
    { program: "AI Engineering Fellowship", amount: 94999, status: "pending", days: 2 },
    { program: "UI/UX Product Design", amount: 9999, status: "paid", days: 15 },
    { program: "AWS Cloud Architect", amount: 11999, status: "refunded", days: 40 },
  ];
  for (const [index, order] of seeds.entries()) {
    const student = studentRows[index % studentRows.length];
    await query(
      `INSERT INTO orders
        (user_id, program, base_amount, discount, amount, provider, status, created_at)
       VALUES (?, ?, ?, 0, ?, 'razorpay', ?, ?)`,
      [
        student.id,
        order.program,
        order.amount,
        order.amount,
        order.status,
        new Date(Date.now() - order.days * DAY),
      ]
    );
  }
}

async function seedDemoStudent(usersByName, courseRows, internshipRows, fellowshipRows, jobRows, projectRows, mentorIdByName) {
  const student = usersByName.get(students[0].fullName);
  if (!student) return;
  const userId = student.id;
  const seed = 1;
  const courseA = courseRows.get(courses[seed % courses.length].slug);
  const courseB = courseRows.get(courses[(seed + 3) % courses.length].slug);
  const courseC = courseRows.get(courses[(seed + 1) % courses.length].slug);
  const internship = internshipRows.get(internships[seed % internships.length].slug);
  const fellowship = fellowshipRows.get(fellowships[seed % fellowships.length].slug);

  if ((await countRows("enrollments", "WHERE user_id = ?", [userId])) === 0) {
    const enrollments = [
      [courseA, "course", 62, "pro", "active"],
      [courseB, "course", 18, "self-paced", "active"],
      [internship, "internship", 40, "pro", "active"],
      [fellowship, "fellowship", 12, "advanced", "active"],
    ];
    for (const [program, type, progress, plan, status] of enrollments) {
      if (!program) continue;
      await query(
        `INSERT INTO enrollments
          (user_id, program_type, program_id, title, thumbnail, plan, progress, status, enrolled_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          type,
          program.id,
          program.title,
          program.thumbnail ?? null,
          plan,
          progress,
          status,
          new Date(Date.now() - 30 * DAY),
        ]
      );
    }
  }

  if ((await countRows("user_projects", "WHERE user_id = ?", [userId])) === 0) {
    const picked = [
      projectRows.get(projectCatalog[seed % projectCatalog.length].title),
      projectRows.get(projectCatalog[(seed + 5) % projectCatalog.length].title),
      projectRows.get(projectCatalog[(seed + 9) % projectCatalog.length].title),
    ].filter(Boolean);
    const statuses = ["in-progress", "submitted", "not-started"];
    for (const [index, project] of picked.entries()) {
      const course = [...courseRows.values()].find((item) => item.title === project.courseTitle);
      await query(
        `INSERT INTO user_projects
          (user_id, catalog_id, title, course_slug, course_title, difficulty, description,
           requirements, skills, estimated_hours, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          project.id,
          project.title,
          course?.slug ?? null,
          project.courseTitle ?? null,
          project.difficulty ?? null,
          project.description ?? null,
          json(project.requirements),
          json(project.skills),
          Number(project.estimatedHours ?? 0),
          statuses[index],
          statuses[index] === "submitted" ? new Date(Date.now() - 2 * DAY) : null,
        ]
      );
    }
  }

  if ((await countRows("certificates", "WHERE user_id = ?", [userId])) === 0 && courseC) {
    await query(
      `INSERT INTO certificates
        (certificate_id, user_id, student_name, program, program_type, grade, status, issued_at)
       VALUES (?, ?, ?, ?, 'course', 'Distinction', 'valid', ?)`,
      [
        `IJ-2026-${String(userId).padStart(4, "0")}-DS`,
        userId,
        student.fullName,
        courseC.title,
        new Date(Date.now() - 30 * DAY),
      ]
    );
  }

  if ((await countRows("job_applications", "WHERE user_id = ?", [userId])) === 0) {
    const pickedJobs = [
      [jobRows.get(jobs[seed % jobs.length].slug), "applied", 12],
      [jobRows.get(jobs[(seed + 4) % jobs.length].slug), "shortlisted", 20],
      [jobRows.get(jobs[(seed + 8) % jobs.length].slug), "interview", 32],
    ];
    for (const [job, status, days] of pickedJobs) {
      if (!job) continue;
      await query(
        `INSERT INTO job_applications
          (user_id, job_id, job_title, company, status, resume_url, applied_at)
         VALUES (?, ?, ?, ?, ?, NULL, ?)`,
        [userId, job.id, job.title, job.company, status, new Date(Date.now() - days * DAY)]
      );
    }
  }

  if ((await countRows("saved_jobs", "WHERE user_id = ?", [userId])) === 0) {
    for (const index of [(seed + 2) % jobs.length, (seed + 6) % jobs.length]) {
      const job = jobRows.get(jobs[index].slug);
      if (job) {
        await query("INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)", [userId, job.id]);
      }
    }
  }

  if ((await countRows("ats_reports", "WHERE user_id = ?", [userId])) === 0) {
    const sections = [
      { name: "Keywords", score: 64, note: "Add role-specific keywords such as REST, CI/CD and unit testing." },
      { name: "Formatting", score: 88, note: "Clean single-column layout parses well." },
      { name: "Experience", score: 62, note: "Quantify achievements with numbers and outcomes." },
      { name: "Projects", score: 74, note: "Add tech stack and a live link for each project." },
      { name: "Skills", score: 68, note: "Group skills by category for readability." },
    ];
    const suggestions = [
      { issue: "Weak summary", before: "Enthusiastic developer looking for opportunities.", after: "Full-stack developer with 6 shipped projects and 840+ hours of hands-on training; built a MERN app serving 2k users." },
      { issue: "No metrics", before: "Improved website performance.", after: "Improved Lighthouse performance score from 62 to 96 by optimising bundles and images." },
      { issue: "Generic skills list", before: "HTML, CSS, JS, React, Node", after: "Frontend: React, TypeScript · Backend: Node.js, Express · Data: PostgreSQL, MongoDB" },
    ];
    await query(
      `INSERT INTO ats_reports
        (user_id, file_name, target_role, overall_score, sections, missing_keywords,
         recommended_skills, suggestions, summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        "resume_v2.pdf",
        "Full-Stack Developer",
        71,
        json(sections),
        json(["unit testing", "CI/CD", "REST", "system design", "Docker"]),
        json(["TypeScript", "Testing", "System Design", "Docker"]),
        json(suggestions),
        "Your resume is ATS-friendly but can rank higher by adding measurable impact and role-specific keywords.",
        new Date(Date.now() - 6 * DAY),
      ]
    );
  }

  if ((await countRows("mock_interviews", "WHERE user_id = ?", [userId])) === 0) {
    const interviewer = mentors[seed % mentors.length];
    const questions = [
      { question: "Explain the Virtual DOM and reconciliation in React.", answer: "Described the virtual DOM as an in-memory representation and reconciliation via diffing. Mentioned keys.", score: 78, feedback: "Strong explanation. Add how keys affect reconciliation efficiency." },
      { question: "How would you design the database for a blog with comments?", answer: "Outlined posts, users, comments tables with foreign keys.", score: 60, feedback: "Add indexing strategy and discuss N+1 query avoidance." },
      { question: "Tell me about a challenging project.", answer: "Described a group project with tight deadlines.", score: 66, feedback: "Use STAR and highlight measurable outcomes." },
    ];
    await query(
      `INSERT INTO mock_interviews
        (user_id, role, technology, experience, type, interviewer, score, strengths,
         weaknesses, recommendation, questions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        "Full-Stack Developer",
        "React & Node.js",
        "Fresher",
        "Technical + HR",
        interviewer.name,
        68,
        json(["Clear communication", "Good React fundamentals", "Structured problem solving"]),
        json(["Shallow database knowledge", "No mention of testing", "Rambling answers under time pressure"]),
        "Practice 3 system design basics and 5 SQL questions. Use the STAR method and keep answers under 90 seconds.",
        json(questions),
        new Date(Date.now() - 4 * DAY),
      ]
    );
  }

  if ((await countRows("notifications", "WHERE user_id = ?", [userId])) === 0) {
    const notificationSeeds = [
      ["Enrollment confirmed", `You are now enrolled in ${fellowship?.title ?? "your program"}.`, "enrollment", 0, 1],
      ["Live class reminder", "Your live class on System Design starts in 2 hours.", "class", 0, 2],
      ["Mentor responded", `${mentors[seed % mentors.length].name} replied to your project question.`, "mentor", 1, 48],
      ["Assignment due", "Submit the REST API assignment before Friday.", "assignment", 0, 72],
      ["Certificate generated", "Your certificate for Data Analytics is ready to download.", "certificate", 1, 120],
    ];
    for (const [title, message, type, read, hoursAgo] of notificationSeeds) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, message, type, read, new Date(Date.now() - hoursAgo * 3_600_000)]
      );
    }
  }

  if ((await countRows("class_sessions", "WHERE user_id = ?", [userId])) === 0) {
    const classSeeds = [
      ["Advanced React Patterns", courses[0].title, mentors[0].name, 2],
      ["SQL Window Functions", courses[10]?.title ?? courses[0].title, mentors[1].name, 26],
      ["System Design: Scaling APIs", courses[0].title, mentors[8].name, 50],
    ];
    for (const [title, course, mentorName, hoursAhead] of classSeeds) {
      await query(
        `INSERT INTO class_sessions
          (user_id, title, course, mentor, starts_at, join_url, status)
         VALUES (?, ?, ?, ?, ?, ?, 'upcoming')`,
        [
          userId,
          title,
          course,
          mentorName,
          new Date(Date.now() + hoursAhead * 3_600_000),
          `https://meet.internshipjunction.com/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        ]
      );
    }
  }

  if ((await countRows("assignments", "WHERE user_id = ?", [userId])) === 0) {
    const assignmentSeeds = [
      ["Build a REST API", courses[0].title, 3],
      ["Sales Dashboard", courses[10]?.title ?? courses[0].title, 5],
      ["Churn Prediction Notebook", courses[1]?.title ?? courses[0].title, 8],
    ];
    for (const [title, course, daysAhead] of assignmentSeeds) {
      await query(
        `INSERT INTO assignments (user_id, title, course, due_date, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [userId, title, course, new Date(Date.now() + daysAhead * DAY)]
      );
    }
  }

  if ((await countRows("messages", "WHERE recipient_id = ?", [userId])) === 0) {
    const messages = [
      ["Great progress on your project. Focus on adding tests next.", mentors[seed % mentors.length].name, 1],
      ["Let's review your resume before the mock interview.", mentors[0].name, 24],
    ];
    for (const [message, mentorName, hoursAgo] of messages) {
      const mentorId = mentorIdByName.get(mentorName) ?? null;
      const senderEmail = mentorUsers.find((user) => user.fullName === mentorName)?.email;
      const sender = senderEmail
        ? (await query("SELECT id FROM users WHERE email = ? LIMIT 1", [senderEmail]))[0]
        : null;
      await query(
        `INSERT INTO messages (sender_id, recipient_id, mentor_id, sender_name, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [
          sender?.id ?? null,
          userId,
          mentorId,
          mentorName,
          message,
          new Date(Date.now() - hoursAgo * 3_600_000),
        ]
      );
    }
  }

  if ((await countRows("mentor_questions", "WHERE student_id = ?", [userId])) === 0) {
    const questions = [
      ["How do I structure a large React app?", courses[0].title, "open", null],
      ["When should I use a window function vs a join?", courses[10]?.title ?? courses[0].title, "open", null],
      ["My model is overfitting. What should I try first?", courses[1]?.title ?? courses[0].title, "answered", "Start with regularisation, then add cross-validation and simplify the model before collecting more data."],
    ];
    for (const [question, course, status, answer] of questions) {
      await query(
        `INSERT INTO mentor_questions
          (student_id, student_name, mentor_id, course, question, answer, status, created_at, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          student.fullName,
          mentorIdByName.get(mentors[seed % mentors.length].name) ?? null,
          course,
          question,
          answer,
          status,
          new Date(Date.now() - 2 * 3_600_000),
          answer ? new Date(Date.now() - 3_600_000) : null,
        ]
      );
    }
  }

  if ((await countRows("resumes", "WHERE user_id = ?", [userId])) === 0) {
    const resumeData = {
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      headline: student.headline,
      summary: "Full-stack developer with hands-on experience building and deploying MERN applications.",
      skills: ["React", "Node.js", "TypeScript", "SQL", "Docker"],
      experience: [],
      education: [{ school: "InternshipJunction Academy", degree: "Full-Stack Web Development", year: "2026" }],
    };
    await query(
      "INSERT INTO resumes (user_id, title, template, data) VALUES (?, ?, ?, ?)",
      [userId, "Full-Stack Developer Resume", "modern", json(resumeData)]
    );
  }

  if ((await countRows("applications", "WHERE user_id = ?", [userId])) === 0) {
    if (internship) {
      await query(
        `INSERT INTO applications
          (application_number, user_id, kind, program_id, slug, applicant_name, email, phone,
           college, degree, graduation_year, duration, status, cover_letter, applied_at)
         VALUES (?, ?, 'internship', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'shortlisted', ?, ?)`,
        [
          `IJ-APP-${String(userId).padStart(6, "0")}`,
          userId,
          internship.id,
          internships[seed % internships.length].slug,
          student.fullName,
          student.email,
          student.phone,
          "InternshipJunction Academy",
          "B.Tech Computer Science",
          "2026",
          internships[seed % internships.length].duration,
          "I am excited to apply my skills in a real project and learn from mentors.",
          new Date(Date.now() - 9 * DAY),
        ]
      );
    }
    if (fellowship) {
      await query(
        `INSERT INTO applications
          (application_number, user_id, kind, program_id, slug, applicant_name, email, phone,
           status, motivation, applied_at)
         VALUES (?, ?, 'fellowship', ?, ?, ?, ?, ?, 'applied', ?, ?)`,
        [
          `IJ-APP-${String(userId + 1).padStart(6, "0")}`,
          userId,
          fellowship.id,
          fellowships[seed % fellowships.length].slug,
          student.fullName,
          student.email,
          student.phone,
          "I want to build production-grade projects with mentor support and transition into a full-time role.",
          new Date(Date.now() - 4 * DAY),
        ]
      );
    }
  }

  const completed = await countRows("lesson_progress", "WHERE user_id = ?", [userId]);
  if (completed === 0 && courseA) {
    const lessons = await query(
      `SELECT l.id, l.module_id FROM lessons l
       INNER JOIN course_modules m ON m.id = l.module_id
       WHERE m.course_id = ?
       ORDER BY m.position ASC, l.position ASC
       LIMIT 6`,
      [courseA.id]
    );
    for (const lesson of lessons) {
      await query(
        `INSERT IGNORE INTO lesson_progress (user_id, course_id, lesson_id, completed_at)
         VALUES (?, ?, ?, ?)`,
        [userId, courseA.id, lesson.id, new Date(Date.now() - Math.random() * 7 * DAY)]
      );
    }
  }
}

export async function seedDatabase() {
  await seedUsers();
  const mentorIdByName = await seedMentors();
  const courseRows = await seedCourses(mentorIdByName);
  const internshipRows = await seedInternships(mentorIdByName);
  const fellowshipRows = await seedFellowships();
  const jobRows = await seedJobs();
  const projectRows = await seedProjectCatalog(courseRows);
  await seedTestimonials();
  await seedCoupons();
  await seedMentorSessions(mentorIdByName);
  await seedOrders();

  const userRows = await query("SELECT * FROM users ORDER BY id ASC");
  const usersByName = new Map(userRows.map((user) => [user.full_name, mapUser(user)]));
  await seedCommunity(usersByName);
  await seedCommunityEngagement(usersByName);
  await seedDemoStudent(
    usersByName,
    courseRows,
    internshipRows,
    fellowshipRows,
    jobRows,
    projectRows,
    mentorIdByName
  );

  const counts = await Promise.all([
    countRows("users"),
    countRows("courses"),
    countRows("internships"),
    countRows("fellowships"),
    countRows("jobs"),
    countRows("project_catalog"),
    countRows("enrollments"),
    countRows("community_posts"),
  ]);
  console.log(
    `[db] Seed ready (users ${counts[0]}, courses ${counts[1]}, internships ${counts[2]}, ` +
      `fellowships ${counts[3]}, jobs ${counts[4]}, projects ${counts[5]}, ` +
      `enrollments ${counts[6]}, community posts ${counts[7]}).`
  );
}
