const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

function buildEvaluationPrompt(problem, messages) {
  const category = problem.category === 'LLD' ? 'Low-Level Design' : 'High-Level Design'

  // Format the conversation transcript
  const transcript = messages
    .map((m) => {
      const label = m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'
      return `## ${label}\n${m.content}`
    })
    .join('\n\n')

  return `You are a senior engineering manager evaluating a candidate's performance in a ${category} interview.

## Critical Scoring Rules

- **Score distribution must be realistic.** 7/10 means the candidate is hire-ready. 9/10 means exceptional. Very few candidates score above 7.
- **Short interviews must be penalized harshly.** Count the number of CANDIDATE turns in the transcript:
  - 0–1 candidate turns → max score 2/10 (barely any material to evaluate)
  - 2–3 candidate turns → max score 4/10 (only scratched the surface)
  - 4–5 candidate turns → max score 6/10 (started covering material but no depth)
  - 6+ candidate turns → can score up to 10/10 (had enough exchanges to demonstrate depth)
- **A candidate who only answered 2–3 questions cannot demonstrate breadth or depth.**
- **Do not inflate scores.** Be stringent. Real interview loops have a low pass rate.

## Problem

**${problem.title}**
${problem.statement}

Functional requirements:
${problem.functionalRequirements.map((r) => `- ${r}`).join('\n')}

Non-functional requirements:
${problem.nonFunctionalRequirements.map((r) => `- ${r}`).join('\n')}
${problem.constraints ? `\nConstraints:\n${problem.constraints.map((c) => `- ${c}`).join('\n')}` : ''}

## Interview Transcript

${transcript}

## Evaluation

Evaluate the candidate's performance. Be specific, reference their actual answers, and be honest about weak areas. Format your response in **markdown** with the following sections:

### Overall Score (X/10)

A single overall score and a 1-2 sentence summary. Follow the scoring rules above strictly.

### Strengths (2-3 bullet points)

What did the candidate do well? Be specific.

### Areas for Improvement (2-3 bullet points)

Where did they fall short? What would a stronger candidate have done differently?

### Key Takeaways (2-3 bullet points)

Actionable advice for the candidate to improve before their next interview.

Be fair but rigorous. The evaluation should feel like real feedback from a senior engineer who conducted the interview.`
}

export async function getEvaluation({ problem, messages }) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured on the server')
  }

  const systemPrompt = buildEvaluationPrompt(problem, messages)

  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Please evaluate this interview thoroughly.' },
      ],
      temperature: 0.4,
      max_tokens: 4096,
      stream: false,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`DeepSeek evaluation API error ${res.status}: ${errBody}`)
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content

  if (!reply) {
    throw new Error('DeepSeek returned an empty evaluation')
  }

  return reply
}
