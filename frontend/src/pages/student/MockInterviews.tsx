import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mic, Sparkles, Play, Loader2, Trophy, Target, TrendingUp, Lightbulb } from "lucide-react";
import { DashboardPageHeader } from "@/components/layout/dashboard-shell";
import { QueryState } from "@/components/common/query-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { useMockInterviews } from "@/lib/queries";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import type { MockInterview } from "@/lib/types";

interface GeneratedQuestions {
  questions: string[];
  aiPowered?: boolean;
}

interface Evaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  questions?: { question: string; answer: string; score: number; feedback: string }[];
}

export default function MockInterviews() {
  const history = useMockInterviews();
  const queryClient = useQueryClient();

  const [stage, setStage] = useState<"setup" | "interview" | "result">("setup");
  const [role, setRole] = useState("Frontend Developer");
  const [technology, setTechnology] = useState("React");
  const [experience, setExperience] = useState("Fresher");
  const [type, setType] = useState("Technical");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [activeQuestion, setActiveQuestion] = useState(0);

  const generate = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<GeneratedQuestions>("/mock-interviews/questions", { role, technology, experience, type });
      return data;
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setActiveQuestion(0);
      setStage("interview");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const evaluate = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<Evaluation>("/mock-interviews/evaluate", { role, technology, experience, type, questions, answers });
      return data;
    },
    onSuccess: (data) => {
      setEvaluation(data);
      setStage("result");
      queryClient.invalidateQueries({ queryKey: ["mock-interviews"] });
      toast.success("Interview evaluated!");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function reset() {
    setStage("setup");
    setEvaluation(null);
    setQuestions([]);
    setAnswers([]);
  }

  function loadPast(interview: MockInterview) {
    setEvaluation({
      score: interview.score,
      strengths: interview.strengths,
      weaknesses: interview.weaknesses,
      recommendation: interview.recommendation,
      questions: interview.questions,
    });
    setRole(interview.role);
    setTechnology(interview.technology);
    setStage("result");
  }

  return (
    <div>
      <DashboardPageHeader
        title="Mock interviews"
        description="Practice role-specific interviews and get instant AI-powered feedback."
        action={stage !== "setup" ? <Button variant="outline" onClick={reset}>New interview</Button> : undefined}
      />

      {stage === "setup" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mic className="size-5" /></span>
              <div>
                <h2 className="text-base font-semibold">Start a mock interview</h2>
                <p className="text-xs text-muted-foreground">Answer a few questions and receive structured feedback.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label>Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Developer" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Technology</Label>
                <Input value={technology} onChange={(e) => setTechnology(e.target.value)} placeholder="e.g. Node.js" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Experience</Label>
                <Select value={experience} onChange={(e) => setExperience(e.target.value)}>
                  <option>Fresher</option>
                  <option>0-1 years</option>
                  <option>1-3 years</option>
                  <option>3+ years</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Interview type</Label>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option>Technical</option>
                  <option>Behavioral</option>
                  <option>Mixed</option>
                </Select>
              </div>
            </div>
            <Button variant="gradient" size="lg" loading={generate.isPending} onClick={() => generate.mutate()}>
              <Sparkles className="size-4" /> Generate questions
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">Recent attempts</h2>
            <QueryState isLoading={history.isLoading} isError={history.isError} error={history.error} onRetry={() => history.refetch()}>
              <div className="mt-4 flex flex-col gap-2">
                {(history.data ?? []).map((interview) => (
                  <button key={interview.id} type="button" onClick={() => loadPast(interview)} className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted">
                    <div>
                      <p className="text-sm font-medium">{interview.role} · {interview.technology}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(interview.createdAt)} · {interview.type}</p>
                    </div>
                    <Badge variant={interview.score >= 75 ? "success" : interview.score >= 50 ? "warning" : "destructive"}>{interview.score}</Badge>
                  </button>
                ))}
                {(history.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No attempts yet — your results will show here.</p>}
              </div>
            </QueryState>
          </Card>
        </div>
      )}

      {stage === "interview" && (
        <div className="mx-auto max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Question {activeQuestion + 1} of {questions.length}</Badge>
              <span className="text-xs text-muted-foreground">{role} · {technology}</span>
            </div>
            <Progress value={((activeQuestion + 1) / questions.length) * 100} className="mt-3 h-1.5" />
            <h2 className="mt-5 text-lg font-semibold">{questions[activeQuestion]}</h2>
            <Textarea
              className="mt-4"
              rows={6}
              value={answers[activeQuestion]}
              onChange={(e) => setAnswers(answers.map((a, i) => (i === activeQuestion ? e.target.value : a)))}
              placeholder="Type your answer here..."
            />
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" disabled={activeQuestion === 0} onClick={() => setActiveQuestion(activeQuestion - 1)}>Previous</Button>
              {activeQuestion < questions.length - 1 ? (
                <Button variant="gradient" onClick={() => setActiveQuestion(activeQuestion + 1)}>Next question</Button>
              ) : (
                <Button variant="gradient" loading={evaluate.isPending} onClick={() => evaluate.mutate()}><Play className="size-4" /> Finish & evaluate</Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {stage === "result" && evaluation && (
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <Card className="p-6 text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Trophy className="size-8" /></span>
            <h2 className="mt-3 text-2xl font-bold">{evaluation.score}/100</h2>
            <p className="text-sm text-muted-foreground">{role} · {technology} · {type}</p>
            <Progress value={evaluation.score} className="mx-auto mt-4 max-w-sm" />
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">{evaluation.recommendation}</p>
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><TrendingUp className="size-4 text-success" /> Strengths</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {evaluation.strengths.map((s, i) => <li key={i} className="flex gap-2"><Target className="mt-0.5 size-4 shrink-0 text-success" /> {s}</li>)}
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Lightbulb className="size-4 text-amber-500" /> Areas to improve</h3>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {evaluation.weaknesses.map((s, i) => <li key={i} className="flex gap-2"><Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" /> {s}</li>)}
              </ul>
            </Card>
          </div>

          {evaluation.questions && evaluation.questions.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold">Question breakdown</h3>
              <div className="mt-3 flex flex-col gap-3">
                {evaluation.questions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{q.question}</p>
                      <Badge variant={q.score >= 75 ? "success" : q.score >= 50 ? "warning" : "destructive"}>{q.score}</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{q.feedback}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Button variant="gradient" onClick={reset}>Start another interview</Button>
        </div>
      )}

      {generate.isPending && stage === "setup" && (
        <div className="mx-auto mt-6 flex max-w-md items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" /> Preparing tailored interview questions...
        </div>
      )}
    </div>
  );
}
