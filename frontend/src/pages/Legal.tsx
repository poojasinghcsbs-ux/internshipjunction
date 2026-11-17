import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { useSeo } from "@/lib/hooks/use-seo";

const content = {
  privacy: {
    title: "Privacy Policy",
    intro:
      "Your privacy matters. This policy explains what information InternshipJunction collects, how we use it and the choices you have.",
    sections: [
      { heading: "Information we collect", body: "We collect information you provide directly such as your name, email, phone number and profile details, along with learning activity like course progress, project submissions and assessment results. We also collect limited technical data such as device and usage information to keep the platform secure and improve it." },
      { heading: "How we use your information", body: "We use your information to deliver courses, mentorship, internships and career services, to personalise your learning, to issue certificates, to process payments and to communicate important updates. We never sell your personal data." },
      { heading: "Cookies and analytics", body: "We use essential cookies for authentication and to keep you logged in. Analytics cookies help us understand aggregate usage. You can control cookies through your browser settings." },
      { heading: "Data sharing", body: "We share data only with service providers who help us operate the platform (for example payment processors and cloud hosting) under strict confidentiality, or when required by law." },
      { heading: "Data retention and security", body: "We retain your data for as long as your account is active and as needed to meet legal obligations. We use encryption in transit, hashed passwords and access controls to protect your information." },
      { heading: "Your rights", body: "You may access, update or delete your account information from your profile settings, or by contacting us. You can also opt out of marketing communications at any time." },
      { heading: "Contact", body: "For privacy questions, email privacy@InternshipJunction.example and our team will respond promptly." },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    intro:
      "These terms govern your use of the InternshipJunction platform, courses, internships, fellowships and career services.",
    sections: [
      { heading: "Acceptance of terms", body: "By creating an account or using InternshipJunction, you agree to these terms. If you do not agree, please do not use the platform." },
      { heading: "Accounts", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Provide accurate information and keep it up to date." },
      { heading: "Courses and content", body: "Course materials are provided for your personal learning. You may not copy, resell or redistribute content without written permission. Access durations and live session schedules are listed on each program page." },
      { heading: "Payments and refunds", body: "Prices are listed in Indian Rupees and include applicable taxes where stated. Refunds are governed by our refund policy: a 7-day window on Pro and Advanced plans, subject to fair-use limits." },
      { heading: "Certificates", body: "Certificates are issued on meeting completion criteria and can be verified publicly. We may revoke certificates obtained through academic dishonesty or misuse." },
      { heading: "Acceptable use", body: "You agree not to misuse the platform, including attempting to disrupt services, scraping data, or harassing mentors and other learners." },
      { heading: "Limitation of liability", body: "InternshipJunction provides educational services and career support but does not guarantee employment. To the maximum extent permitted by law, our liability is limited to the amount you paid for the relevant program." },
      { heading: "Changes to terms", body: "We may update these terms from time to time. Continued use after changes constitutes acceptance of the revised terms." },
    ],
  },
};

export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const doc = content[kind];
  useSeo({
    title: doc.title,
    description: doc.intro,
    canonicalPath: kind === "privacy" ? "/privacy-policy" : "/terms-and-conditions",
  });

  return (
    <div>
      <PageHero title={doc.title} description={`Last updated ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`} breadcrumbs={[{ label: "Home", to: "/" }, { label: doc.title }]} />
      <Section className="pb-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <p className="text-sm leading-relaxed text-muted-foreground">{doc.intro}</p>
          {doc.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
