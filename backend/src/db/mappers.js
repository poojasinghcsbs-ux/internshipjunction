export function iso(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function json(value, fallback = []) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function bool(value) {
  return Boolean(value);
}

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    passwordHash: row.password_hash,
    headline: row.headline,
    avatarUrl: row.avatar_url,
    mentorId: row.mentor_id,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapMentor(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    avatarUrl: row.avatar_url,
    expertise: json(row.expertise),
    experienceYears: row.experience_years,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    bio: row.bio,
    linkedin: row.linkedin,
    availability: row.availability,
    isFeatured: bool(row.is_featured),
  };
}

export function mapLesson(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    duration: row.duration,
    isPreview: bool(row.is_preview),
  };
}

export function mapModule(row, lessons = []) {
  return {
    id: row.id,
    title: row.title,
    lessons,
  };
}

export function mapCourse(row, { mentor = null, modules, reviews, related } = {}) {
  if (!row) return null;
  const course = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    level: row.level,
    mode: row.mode,
    thumbnail: row.thumbnail,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    studentsCount: row.students_count,
    duration: row.duration,
    technologies: json(row.technologies),
    shortDescription: row.short_description,
    overview: row.overview,
    outcomes: json(row.outcomes),
    prerequisites: json(row.prerequisites),
    audience: json(row.audience),
    certification: row.certification,
    careerOutcomes: json(row.career_outcomes),
    isFeatured: bool(row.is_featured),
    status: row.status,
    mentorId: row.mentor_id,
    createdAt: iso(row.created_at),
    mentor,
  };
  if (modules !== undefined) course.modules = modules;
  if (reviews !== undefined) course.reviews = reviews;
  if (related !== undefined) course.related = related;
  return course;
}

export function mapInternship(row, mentor = null) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    domain: row.domain,
    level: row.level,
    mode: row.mode,
    duration: row.duration,
    stipend: row.stipend,
    location: row.location,
    thumbnail: row.thumbnail,
    skills: json(row.skills),
    shortDescription: row.short_description,
    overview: row.overview,
    eligibility: json(row.eligibility),
    roadmap: json(row.roadmap),
    perks: json(row.perks),
    certification: row.certification,
    applicationDeadline: iso(row.application_deadline)?.slice(0, 10) ?? null,
    status: row.status,
    openings: row.openings,
    applicantsCount: row.applicants_count,
    mentorId: row.mentor_id,
    isFeatured: bool(row.is_featured),
    mentor,
  };
}

export function mapFellowship(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    domain: row.domain,
    cohort: row.cohort,
    startDate: iso(row.start_date)?.slice(0, 10) ?? null,
    duration: row.duration,
    seats: row.seats,
    seatsLeft: row.seats_left,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    thumbnail: row.thumbnail,
    shortDescription: row.short_description,
    overview: row.overview,
    highlights: json(row.highlights),
    curriculum: json(row.curriculum),
    mentors: json(row.mentors),
    careerSupport: json(row.career_support),
    isFeatured: bool(row.is_featured),
  };
}

export function mapJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    company: row.company,
    companyLogo: row.company_logo,
    location: row.location,
    remote: bool(row.remote),
    experience: row.experience,
    salaryMin: Number(row.salary_min),
    salaryMax: Number(row.salary_max),
    type: row.type,
    skills: json(row.skills),
    description: row.description,
    responsibilities: json(row.responsibilities),
    requirements: json(row.requirements),
    postedAt: iso(row.posted_at),
    status: row.status,
    applicantsCount: row.applicants_count,
  };
}

export function mapProjectCatalog(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
    difficulty: row.difficulty,
    description: row.description,
    requirements: json(row.requirements),
    skills: json(row.skills),
    estimatedHours: row.estimated_hours,
  };
}

export function mapTestimonial(row) {
  if (!row) return null;
  return {
    id: row.id,
    author: row.author,
    role: row.role,
    rating: row.rating,
    content: row.content,
    createdAt: iso(row.created_at),
  };
}

export function mapEnrollment(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    programType: row.program_type,
    programId: row.program_id,
    title: row.title,
    thumbnail: row.thumbnail,
    plan: row.plan,
    progress: row.progress,
    status: row.status,
    enrolledAt: iso(row.enrolled_at),
  };
}

export function mapUserProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    catalogId: row.catalog_id,
    title: row.title,
    courseSlug: row.course_slug,
    courseTitle: row.course_title,
    difficulty: row.difficulty,
    description: row.description,
    requirements: json(row.requirements),
    skills: json(row.skills),
    estimatedHours: row.estimated_hours,
    status: row.status,
    repoUrl: row.repo_url,
    submissionUrl: row.submission_url,
    feedback: row.feedback,
    score: row.score,
    submittedAt: iso(row.submitted_at),
  };
}

export function mapCertificate(row) {
  if (!row) return null;
  return {
    id: row.id,
    certificateId: row.certificate_id,
    userId: row.user_id,
    studentName: row.student_name,
    program: row.program,
    programType: row.program_type,
    grade: row.grade,
    status: row.status,
    issuedAt: iso(row.issued_at),
  };
}

export function mapApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    applicationNumber: row.application_number,
    userId: row.user_id,
    kind: row.kind,
    programId: row.program_id,
    slug: row.slug,
    applicantName: row.applicant_name,
    email: row.email,
    phone: row.phone,
    college: row.college,
    degree: row.degree,
    graduationYear: row.graduation_year,
    duration: row.duration,
    linkedinUrl: row.linkedin_url,
    status: row.status,
    coverLetter: row.cover_letter,
    portfolioUrl: row.portfolio_url,
    motivation: row.motivation,
    appliedAt: iso(row.applied_at),
  };
}

export function mapJobApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    company: row.company,
    status: row.status,
    resumeUrl: row.resume_url,
    coverLetter: row.cover_letter,
    appliedAt: iso(row.applied_at),
  };
}

export function mapAtsReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fileName: row.file_name,
    targetRole: row.target_role,
    overallScore: row.overall_score,
    sections: json(row.sections),
    missingKeywords: json(row.missing_keywords),
    recommendedSkills: json(row.recommended_skills),
    suggestions: json(row.suggestions),
    summary: row.summary,
    createdAt: iso(row.created_at),
  };
}

export function mapResume(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    template: row.template,
    data: json(row.data, {}),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapMockInterview(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    technology: row.technology,
    experience: row.experience,
    type: row.type,
    interviewer: row.interviewer,
    score: row.score,
    strengths: json(row.strengths),
    weaknesses: json(row.weaknesses),
    recommendation: row.recommendation,
    questions: json(row.questions, []),
    createdAt: iso(row.created_at),
  };
}

export function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: bool(row.is_read),
    createdAt: iso(row.created_at),
  };
}

export function mapCommunityPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    author: row.author,
    authorRole: row.author_role,
    title: row.title,
    content: row.content,
    tags: json(row.tags),
    likes: row.likes,
    commentsCount: row.comments_count,
    liked: bool(row.liked),
    createdAt: iso(row.created_at),
  };
}

export function mapCommunityComment(row) {
  if (!row) return null;
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    author: row.author,
    authorRole: row.author_role,
    content: row.content,
    createdAt: iso(row.created_at),
  };
}

export function mapOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    program: row.program,
    programType: row.program_type,
    programId: row.program_id,
    plan: row.plan,
    baseAmount: Number(row.base_amount),
    discount: Number(row.discount),
    amount: Number(row.amount),
    couponCode: row.coupon_code,
    provider: row.provider,
    razorpayOrderId: row.provider_order_id,
    razorpayPaymentId: row.provider_payment_id,
    simulated: bool(row.simulated),
    status: row.status,
    createdAt: iso(row.created_at),
  };
}

export function mapCoupon(row) {
  if (!row) return null;
  return {
    code: row.code,
    type: row.type,
    value: Number(row.value),
    maxDiscount: Number(row.max_discount),
    active: bool(row.active),
    description: row.description,
  };
}

export function mapMentorSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    mentorId: row.mentor_id,
    mentor: row.mentor_name,
    title: row.title,
    scheduledAt: iso(row.scheduled_at),
    status: row.status,
  };
}

export function mapClassSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    course: row.course,
    mentor: row.mentor,
    startsAt: iso(row.starts_at),
    joinUrl: row.join_url,
    status: row.status,
  };
}

export function mapAssignment(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    course: row.course,
    dueDate: iso(row.due_date),
    status: row.status,
    submittedAt: iso(row.submitted_at),
  };
}

export function mapMentorQuestion(row) {
  if (!row) return null;
  return {
    id: row.id,
    studentId: row.student_id,
    student: row.student_name,
    mentorId: row.mentor_id,
    course: row.course,
    question: row.question,
    answer: row.answer,
    status: row.status,
    createdAt: iso(row.created_at),
    answeredAt: iso(row.answered_at),
  };
}

export function mapMessage(row) {
  if (!row) return null;
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    mentorId: row.mentor_id,
    from: row.sender_name,
    message: row.message,
    read: bool(row.is_read),
    createdAt: iso(row.created_at),
  };
}

export function mapAuditLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    meta: json(row.meta, {}),
    createdAt: iso(row.created_at),
  };
}
