import { thumb } from "../utils/placeholder.js";

function mentor(index, data) {
  return {
    id: index + 1,
    name: data.name,
    role: data.role,
    company: data.company,
    avatarUrl: thumb(data.name, data.name.split(" ")[0] + " " + data.name.split(" ")[1]),
    expertise: data.expertise,
    experienceYears: data.experienceYears,
    rating: data.rating,
    reviewsCount: data.reviewsCount,
    bio: data.bio,
    linkedin: data.linkedin ?? "https://www.linkedin.com/in/internshipjunction-mentor",
    availability: data.availability,
    isFeatured: Boolean(data.isFeatured),
  };
}

export const mentors = [
  mentor(0, {
    name: "Aarav Mehta", role: "Principal Full-Stack Engineer", company: "Nimbus Systems", expertise: ["React", "Node.js", "System Design"], experienceYears: 12, rating: 4.9, reviewsCount: 412, bio: "I have shipped products used by millions and love helping engineers think in systems. I focus on clean architecture and interview readiness.", availability: "Mon, Wed, Fri · 7-9 PM IST", isFeatured: true,
  }),
  mentor(1, {
    name: "Priya Nair", role: "Senior Data Scientist", company: "Quantify Labs", expertise: ["Python", "Machine Learning", "Statistics"], experienceYears: 9, rating: 4.8, reviewsCount: 356, bio: "Data storyteller at heart. I turn messy datasets into models that drive real business decisions and mentor learners into analyst roles.", availability: "Tue, Thu · 8-10 PM IST", isFeatured: true,
  }),
  mentor(2, {
    name: "Rohan Verma", role: "ML Platform Lead", company: "Aether AI", expertise: ["PyTorch", "MLOps", "Docker"], experienceYears: 11, rating: 4.9, reviewsCount: 298, bio: "I build ML platforms that serve predictions at scale. Expect hands-on, no-fluff sessions on productionising models.", availability: "Sat, Sun · 10 AM-1 PM IST", isFeatured: true,
  }),
  mentor(3, {
    name: "Sneha Kulkarni", role: "Lead Product Designer", company: "Form & Function", expertise: ["Figma", "Design Systems", "UX Research"], experienceYears: 8, rating: 4.8, reviewsCount: 233, bio: "Design is empathy plus craft. I help designers build portfolios that get callbacks and products users genuinely enjoy.", availability: "Mon, Thu · 6-8 PM IST", isFeatured: true,
  }),
  mentor(4, {
    name: "Imran Sheikh", role: "Cloud Solutions Architect", company: "Skygrid Cloud", expertise: ["AWS", "Terraform", "Kubernetes"], experienceYears: 13, rating: 4.7, reviewsCount: 210, bio: "I have architected cloud platforms across fintech and healthcare. I teach cloud through real architecture labs and reviews.", availability: "Wed, Sun · 7-9 PM IST",
  }),
  mentor(5, {
    name: "Ananya Reddy", role: "Security Engineering Manager", company: "Fortress Sec", expertise: ["AppSec", "SIEM", "Threat Detection"], experienceYears: 10, rating: 4.8, reviewsCount: 187, bio: "Blue team by day, CTF enthusiast by night. I help learners build a real security mindset with hands-on labs.", availability: "Tue, Sat · 8-10 PM IST",
  }),
  mentor(6, {
    name: "Karthik Iyer", role: "Growth Marketing Lead", company: "ReachPeak", expertise: ["SEO", "Performance Marketing", "Analytics"], experienceYears: 8, rating: 4.6, reviewsCount: 165, bio: "I have managed crores in ad spend. I teach marketing as a system of measurable experiments, not guesswork.", availability: "Mon, Fri · 7-9 PM IST",
  }),
  mentor(7, {
    name: "Meera Joshi", role: "Product Coach and Advisor", company: "Northstar Product", expertise: ["Product Strategy", "Roadmapping", "Metrics"], experienceYears: 14, rating: 4.9, reviewsCount: 204, bio: "Former PM leader who shipped zero-to-one products. I coach PMs on discovery, prioritisation and storytelling.", availability: "Thu, Sat · 6-8 PM IST", isFeatured: true,
  }),
  mentor(8, {
    name: "Vikram Singh", role: "DevOps Consultant", company: "PipelineWorks", expertise: ["Kubernetes", "CI/CD", "Observability"], experienceYears: 9, rating: 4.7, reviewsCount: 149, bio: "I automate everything. My sessions focus on reliable pipelines, observability and calm incident response.", availability: "Wed, Sun · 9-11 AM IST",
  }),
  mentor(9, {
    name: "Fatima Ansari", role: "Finance and Analytics Lead", company: "Meridian Capital", expertise: ["Financial Modeling", "Valuation", "Power BI"], experienceYears: 11, rating: 4.7, reviewsCount: 132, bio: "I bridge finance and analytics. I teach modelling the way it is actually done on the desk, with clean Excel discipline.", availability: "Tue, Thu · 8-10 PM IST",
  }),
];
