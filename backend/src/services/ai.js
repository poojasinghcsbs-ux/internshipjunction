import { env } from "../config/env.js";

const ROLE_KEYWORDS = {
  "Full-Stack Developer": ["react", "node.js", "typescript", "rest", "sql", "testing", "ci/cd", "docker", "system design", "git"],
  "Data Analyst": ["sql", "python", "tableau", "statistics", "excel", "dashboards", "etl", "a/b testing"],
  "Data Scientist": ["python", "pandas", "scikit-learn", "statistics", "machine learning", "feature engineering", "sql"],
  "Machine Learning Engineer": ["python", "pytorch", "mlops", "docker", "aws", "model serving", "feature engineering"],
  "Backend Developer": ["node.js", "sql", "rest", "redis", "docker", "testing", "authentication"],
  "Frontend Developer": ["react", "typescript", "css", "accessibility", "performance", "testing", "git"],
  "DevOps Engineer": ["kubernetes", "terraform", "ci/cd", "docker", "aws", "observability", "linux"],
  "UI/UX Designer": ["figma", "wireframing", "prototyping", "user research", "design systems", "accessibility"],
  "Product Manager": ["discovery", "roadmap", "metrics", "stakeholder", "prioritisation", "agile"],
  "Security Analyst": ["siem", "networking", "owasp", "linux", "incident response", "burp suite"],
};

function keywordListFor(role) {
  if (!role) return ROLE_KEYWORDS["Full-Stack Developer"];
  const exact = ROLE_KEYWORDS[role];
  if (exact) return exact;
  const found = Object.keys(ROLE_KEYWORDS).find((key) => key.toLowerCase().includes(String(role).toLowerCase()));
  return found ? ROLE_KEYWORDS[found] : ROLE_KEYWORDS["Full-Stack Developer"];
}

async function callOpenAI(messages, { json = true } = {}) {
  const response = await fetch(`${env.ai.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ai.apiKey}`,
    },
    body: JSON.stringify({
      model: env.ai.model,
      messages,
      temperature: 0.4,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`AI provider error: ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

export function aiEnabled() {
  return env.ai.enabled && Boolean(env.ai.apiKey);
}

export async function analyzeResume({ text, targetRole }) {
  const keywords = keywordListFor(targetRole);
  const lower = String(text ?? "").toLowerCase();
  const matched = keywords.filter((k) => lower.includes(k));
  const missing = keywords.filter((k) => !lower.includes(k));

  const wordCount = lower.split(/\s+/).filter(Boolean).length;
  const hasNumbers = /\d/.test(lower);
  const hasSections = ["experience", "education", "skills", "projects"].filter((s) => lower.includes(s)).length;

  const keywordScore = Math.round((matched.length / keywords.length) * 100);
  const formatScore = Math.min(95, 55 + Math.min(wordCount, 400) / 10 + hasSections * 5);
  const experienceScore = hasNumbers ? 78 : 56;
  const projectScore = lower.includes("project") ? 76 : 48;
  const skillsScore = Math.round((matched.length / Math.max(6, keywords.length)) * 100) + 20;
  const overall = Math.round(
    keywordScore * 0.3 + Math.min(formatScore, 100) * 0.2 + experienceScore * 0.2 + projectScore * 0.15 + Math.min(skillsScore, 100) * 0.15
  );

  const heuristic = {
    overallScore: Math.max(35, Math.min(96, overall)),
    targetRole: targetRole ?? "Full-Stack Developer",
    summary:
      missing.length === 0
        ? "Strong, ATS-friendly resume with relevant keywords. Tighten impact statements to stand out further."
        : `Resume is parseable but missing ${missing.length} role-specific keywords. Add measurable impact to rank higher.`,
    sections: [
      { name: "Keywords", score: keywordScore, note: missing.length ? `Add: ${missing.slice(0, 5).join(", ")}` : "Great keyword coverage." },
      { name: "Formatting", score: Math.round(Math.min(formatScore, 100)), note: hasSections >= 3 ? "Well-structured sections detected." : "Add clear Experience, Education, Skills and Projects headings." },
      { name: "Experience", score: experienceScore, note: hasNumbers ? "Good use of metrics." : "Quantify achievements with numbers and outcomes." },
      { name: "Projects", score: projectScore, note: lower.includes("project") ? "Projects section present." : "Add 2-3 projects with tech stack and links." },
      { name: "Skills", score: Math.round(Math.min(skillsScore, 100)), note: "Group skills by category for readability." },
    ],
    missingKeywords: missing.slice(0, 8),
    recommendedSkills: missing.slice(0, 5).map((m) => m.replace(/\b\w/g, (c) => c.toUpperCase())),
    suggestions: [
      { issue: "Impact statements", before: "Worked on a web application.", after: "Built a MERN web app serving 2,000+ users, cutting page load time by 40%." },
      { issue: "Keyword alignment", before: "Used databases.", after: `Used SQL and PostgreSQL for data modelling, indexing and query optimisation.` },
      { issue: "Skills formatting", before: "HTML CSS JS React Node", after: "Frontend: React, TypeScript, CSS · Backend: Node.js, Express · Data: SQL, MongoDB" },
    ],
  };

  if (!aiEnabled()) return heuristic;

  try {
    const result = await callOpenAI([
      { role: "system", content: "You are an expert ATS resume analyzer. Respond with strict JSON." },
      {
        role: "user",
        content: `Analyze this resume for the role "${targetRole ?? "Full-Stack Developer"}". Return JSON with keys: overallScore (0-100), summary (string), sections (array of {name, score, note}), missingKeywords (string[]), recommendedSkills (string[]), suggestions (array of {issue, before, after}).\n\nResume:\n${String(text).slice(0, 12000)}`,
      },
    ]);
    return { ...heuristic, ...result };
  } catch {
    return heuristic;
  }
}

const QUESTION_BANK = {
  Technical: [
    "Explain the event loop and how asynchronous JavaScript works.",
    "How would you design the database schema for a social feed?",
    "What is the difference between SQL and NoSQL, and when would you choose each?",
    "How do you ensure your API is secure from common attacks?",
    "Describe how you would optimise a slow page or query.",
  ],
  HR: [
    "Tell me about yourself and why this role.",
    "Where do you see yourself in three years?",
    "Why should we hire you over other candidates?",
    "What are your salary expectations?",
    "How do you handle feedback?",
  ],
  Behavioral: [
    "Describe a time you disagreed with a teammate. How did you handle it?",
    "Tell me about a project you are proud of.",
    "Describe a failure and what you learned.",
    "How do you prioritise when everything is urgent?",
    "Give an example of when you took initiative.",
  ],
};

export async function generateInterviewQuestions({ role, technology, experience, type }) {
  const types = type && type !== "Mixed" ? [type] : ["Technical", "HR", "Behavioral"];
  const heuristic = {
    role,
    technology,
    experience,
    type: type ?? "Mixed",
    questions: types.flatMap((category) =>
      QUESTION_BANK[category].slice(0, 3).map((question) => ({ category, question }))
    ),
  };

  if (!aiEnabled()) return heuristic;

  try {
    const result = await callOpenAI([
      { role: "system", content: "You are a senior technical interviewer. Respond with strict JSON." },
      {
        role: "user",
        content: `Generate 8 interview questions for role "${role}", technology "${technology}", experience "${experience}", interview type "${type ?? "Mixed"}". Return JSON { questions: [{ category, question }] } where category is one of Technical, HR, Behavioral.`,
      },
    ]);
    if (Array.isArray(result.questions) && result.questions.length) {
      return { ...heuristic, questions: result.questions };
    }
    return heuristic;
  } catch {
    return heuristic;
  }
}

export async function evaluateInterview({ role, questions, answers }) {
  const answered = answers.filter((a) => a && a.trim().length > 10);
  const avgLength = answered.length ? answered.reduce((s, a) => s + a.split(/\s+/).length, 0) / answered.length : 0;
  const coverage = answered.length / Math.max(1, questions.length);
  const score = Math.round(Math.min(92, 40 + coverage * 30 + Math.min(avgLength, 80) / 4));

  const heuristic = {
    score,
    strengths: [
      coverage > 0.6 ? "Answered most questions confidently" : "Attempted core questions",
      avgLength > 25 ? "Provided detailed responses" : "Responses were concise",
      "Good structure in answers",
    ],
    weaknesses: [
      coverage < 0.8 ? "Some questions were left unanswered" : "Could add more real examples",
      "Use more measurable outcomes",
      "Tighten answers to under 90 seconds",
    ],
    recommendation:
      "Practice 2 mock interviews per week, record yourself and focus on structured STAR answers with concrete metrics.",
    evaluations: questions.map((q, index) => {
      const answer = answers[index] ?? "";
      const words = answer.trim() ? answer.trim().split(/\s+/).length : 0;
      const qScore = words > 40 ? 80 : words > 15 ? 64 : 40;
      return {
        question: q.question ?? q,
        answer,
        score: qScore,
        feedback: words > 40 ? "Strong, detailed answer. Add a concrete metric." : "Answer is brief. Expand with a real example and outcome.",
      };
    }),
  };

  if (!aiEnabled()) return heuristic;

  try {
    const result = await callOpenAI([
      { role: "system", content: "You are an interview coach. Respond with strict JSON." },
      {
        role: "user",
        content: `Evaluate this mock interview for "${role}". Return JSON { score (0-100), strengths (string[]), weaknesses (string[]), recommendation (string), evaluations: [{question, answer, score, feedback}] }.\n\n${JSON.stringify(questions.map((q, i) => ({ question: q.question ?? q, answer: answers[i] ?? "" })))}`,
      },
    ]);
    return { ...heuristic, ...result };
  } catch {
    return heuristic;
  }
}

export async function careerRecommendations({ skills = [], interests = [], targetRole }) {
  const heuristic = {
    targetRole: targetRole ?? "Full-Stack Developer",
    recommendedRoles: ["Full-Stack Developer", "Frontend Engineer", "Backend Developer"].filter(Boolean),
    skillGaps: ["Testing", "System Design", "Docker"],
    nextSteps: [
      "Build two portfolio projects aligned to your target role",
      "Complete a mock interview and act on the feedback",
      "Optimise your resume with the ATS checker",
    ],
  };
  if (!aiEnabled()) return heuristic;
  try {
    const result = await callOpenAI([
      { role: "system", content: "You are a career advisor. Respond with strict JSON." },
      { role: "user", content: `Given skills ${skills.join(", ")}, interests ${interests.join(", ")}, target ${targetRole ?? "unknown"}, return JSON { targetRole, recommendedRoles (string[]), skillGaps (string[]), nextSteps (string[]) }.` },
    ]);
    return { ...heuristic, ...result };
  } catch {
    return heuristic;
  }
}
