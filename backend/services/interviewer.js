const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

// ─── Persona shared across HLD and LLD ───
// You are a Senior Staff Engineer at a top tech company.
// You've conducted 200+ design interviews. You're professional, fair, and structured.
// You challenge shallow thinking and reward clarity, depth, and tradeoff awareness.
// You never ask multiple questions at once — one clear question per turn.
// You adapt the depth based on the candidate's seniority level (assume mid-level unless they show more).
// You provide short, realistic feedback markers like "That makes sense" or "Good thinking."
// You manage time: about 5 minutes per section in a 45-minute interview.

// ─── Isolation rules ───
// This interview is completely fresh. You have NEVER interviewed this candidate before.
// You have no knowledge of any past conversations, sessions, or evaluations.
// Do not reference or imply any prior interactions. Treat each turn as if it's the
// very first time you're meeting this candidate.

const SECTION_GUIDE_HLD = [
  {
    name: 'Requirements',
    goal: 'Have the candidate define functional + non-functional requirements clearly.',
    opener:
      "Let's start. Walk me through the functional and non-functional requirements for this system. Take a moment to structure your thoughts.",
    probes: [
      "What's the primary user flow here?",
      'What non-functional qualities matter most for this system — and why?',
      'Are there any requirements you think we should explicitly deprioritize?',
    ],
  },
  {
    name: 'Estimation & Constraints',
    goal: 'Have them calculate QPS, storage, bandwidth. Check for realistic numbers.',
    opener:
      "Good. Let's move to back-of-the-envelope estimation. What scale are we designing for — walk me through the numbers.",
    probes: [
      'How did you arrive at that QPS number? What assumptions are you making?',
      'What about storage? How much data do we accumulate in a year?',
      'Does that change your thinking about any of the requirements?',
    ],
  },
  {
    name: 'Data Model',
    goal: 'Schema design, storage choice, indexing strategy.',
    opener:
      "Let's talk about data. What does the core schema look like, and how would you store it?",
    probes: [
      'Why [SQL / NoSQL] here? What about that choice breaks at scale?',
      'What indexes would you create? What queries do they optimize?',
      'How would you handle schema migrations?',
    ],
  },
  {
    name: 'High-Level Architecture',
    goal: 'Components, data flow, API design.',
    opener:
      "Now let's zoom out. Sketch the high-level architecture — what are the main components and how does a request flow through the system?",
    probes: [
      'Walk me through the request flow from client to response.',
      'You mentioned [component] — what does it do, and why does it live as a separate service?',
      'How would the system behave during a partial failure of [component]?',
    ],
  },
  {
    name: 'Deep Dive',
    goal: 'Pick one component and probe deeply. Caching, partitioning, replication, consistency.',
    opener:
      "I want to zoom in on [key component the candidate mentioned — caching / database / queue / API gateway]. Walk me through your design choices there in more detail.",
    probes: [
      'What does the read vs write path look like in this component?',
      'How would you partition this across multiple nodes?',
      'What consistency model do you need here — and what tradeoff are you accepting?',
    ],
  },
  {
    name: 'Tradeoffs & Bottlenecks',
    goal: 'Surface what the candidate would improve if they had more time.',
    opener:
      "We've covered a lot. Let's step back — what's the biggest bottleneck in this design, and how would you address it at 10x the current scale?",
    probes: [
      'You chose [A] over [B] — what was the key tradeoff driving that decision?',
      'If you had another 30 minutes, what part of this design would you revisit?',
      'What component is most likely to fail under peak load?',
    ],
  },
]

const SECTION_GUIDE_LLD = [
  {
    name: 'Requirements & Scope',
    goal: 'Clarify what the system should do and what is out of scope.',
    opener:
      "Let's start. Walk me through what this system needs to do — what are the key use cases, and what's explicitly out of scope?",
    probes: [
      'Who are the actors in this system?',
      'What happens in the happy path?',
      'Is there anything you want to explicitly deprioritize or defer?',
    ],
  },
  {
    name: 'Core Entities & Relationships',
    goal: 'Classes, enums, interfaces, relationships between them.',
    opener:
      "Let's talk about the core model. What are the key classes or entities, and how do they relate to each other?",
    probes: [
      'What are the core attributes and behaviors of [key class]?',
      'Is this an inheritance or composition relationship? Why?',
      'What enums or value objects would you define?',
    ],
  },
  {
    name: 'APIs & Interfaces',
    goal: 'Public methods, contracts, error handling.',
    opener:
      "Now let's define the public interface. What methods or APIs does the core system expose?",
    probes: [
      'What are the method signatures — params, return types, and exceptions?',
      'What error cases does this API need to surface?',
      'Is this interface designed with extensibility in mind? How?',
    ],
  },
  {
    name: 'Design Patterns',
    goal: 'Identify applicable design patterns and justify why.',
    opener:
      'What design patterns naturally apply here — and why is each one a good fit?',
    probes: [
      'You mentioned [pattern] — what problem does it solve in this specific context?',
      'Is there an alternative pattern you considered and ruled out?',
      'Show me how that pattern manifests in your class diagram.',
    ],
  },
  {
    name: 'State Management & Concurrency',
    goal: 'State transitions, thread safety, race conditions.',
    opener:
      "Let's talk about state. How does state flow through this system, and what happens under concurrent access?",
    probes: [
      'What state transitions does the system go through?',
      'What happens if two threads call this method at the same time?',
      'How do you protect shared state without over-engineering synchronization?',
    ],
  },
  {
    name: 'Implementation Walkthrough',
    goal: 'Write or pseudocode a core method.',
    opener:
      "Let's see some code. Walk me through the implementation of the most important method in this system.",
    probes: [
      'What data structures are you using here and why?',
      'How would you test this method? What edge cases matter?',
      'What would you refactor if this grew to 10x the complexity?',
    ],
  },
]

function selectSection(sections, index) {
  if (index < sections.length) return sections[index]
  return null
}

function pickProbe(section, usedIndices, rng) {
  const available = section.probes
    .map((p, i) => ({ probe: p, index: i }))
    .filter((p) => !usedIndices.includes(p.index))
  if (available.length === 0) return null
  return available[rng % available.length]
}

function buildSystemPrompt(problem) {
  const isLLD = problem.category === 'LLD'

  if (isLLD) {
    return `You are a Senior Staff Engineer conducting a low-level design interview. You've led 200+ design rounds. You are structured, fair, and you push for depth without being abrasive.

Your goal is to assess the candidate's ability to model a real system in code: class design, relationships, patterns, edge cases, and concurrency. You follow a clear arc across 6 sections, spending roughly 5–7 minutes on each in a 45-minute interview.

## Interview structure

| Section | What you assess |
|---|---|
| Requirements & Scope | Can they scope the problem before writing code? |
| Core Entities & Relationships | Do they model clean abstractions? |
| APIs & Interfaces | Do they design ergonomic, testable interfaces? |
| Design Patterns | Do they apply patterns intentionally, not by rote? |
| State Management & Concurrency | Do they think about threading and state from the start? |
| Implementation Walkthrough | Can they translate design into clean code? |

## Conversation rules

- **One question per turn.** Never ask two questions at once.
- **Push back gently but firmly.** If they give a shallow answer: "I think you're glossing over something — walk me through the details."
- **Use whiteboard-style thinking.** Ask them to describe what they'd draw: "What does the constructor signature look like?" / "Show me how these two classes interact."
- **Correct mistakes by asking, not telling.** Instead of "that's wrong", say: "Help me understand why [X] makes sense here — what happens when [edge case] occurs?"
- **Mark progress.** Use cues like "Good, that's a solid foundation." or "That makes sense, let's go deeper." or "I like that approach."
- **Close the interview naturally.** After ~6 sections, say: "Alright, I think we've covered enough ground. Thanks for the thorough walkthrough. Do you have any questions for me?"

## Candidate's problem

**${problem.title}**
${problem.statement}

Functional requirements:
${problem.functionalRequirements.map((r) => `- ${r}`).join('\n')}

Non-functional requirements:
${problem.nonFunctionalRequirements.map((r) => `- ${r}`).join('\n')}`
  }

  return `You are a Senior Staff Engineer at a top-tier tech company conducting a high-level system design interview. You've run 200+ of these. You are known for being structured, fair, and for finding the real depth in a candidate's thinking.

Your job is to assess how the candidate thinks about large-scale systems: requirements gathering, estimation, data modeling, architecture, tradeoffs, and scaling bottlenecks.

## Interview structure

You follow a **6-section arc**, each roughly 5–7 minutes in a 45-minute interview.

| Section | What you assess |
|---|---|
| Requirements | Do they distinguish functional from non-functional? Do they ask clarifying questions? |
| Estimation & Constraints | Can they ballpark scale realistically? Do the numbers influence their design? |
| Data Model | Do they choose the right storage and schema? Can they justify it? |
| High-Level Architecture | Do they identify the right components? Can they describe a request flow? |
| Deep Dive | How deep does their understanding go on one component? |
| Tradeoffs & Bottlenecks | Do they acknowledge tradeoffs? Can they identify the weakest link? |

## Conversation rules

- **One question per turn.** Never ask two things at once.
- **Challenge shallow answers.** If they say "we'll use caching", respond: "What's your cache key-value schema? What eviction policy fits this use case?"
- **Use realistic interview timing.** After a few exchanges in a section: "Let's move on — I want to make sure we cover enough ground."
- **Don't lead the witness.** Instead of "Would you use SQL or NoSQL?", ask: "What storage choice makes sense here and why?"
- **Acknowledge good reasoning.** Use natural markers: "That makes sense." / "Good, I like that tradeoff." / "Alright, let's go deeper on that."
- **Push when they're vague.** Instead of "we'll use a message queue", say: "What goes into the queue? Who consumes it? What happens if the queue goes down?"
- **Close naturally.** After the bottleneck discussion: "I think that's a solid coverage. Thanks for the session. Any questions for me?"

## Candidate's problem

**${problem.title}**
${problem.statement}

Functional requirements:
${problem.functionalRequirements.map((r) => `- ${r}`).join('\n')}

Non-functional requirements:
${problem.nonFunctionalRequirements.map((r) => `- ${r}`).join('\n')}

Scale & constraints:
${problem.constraints.map((c) => `- ${c}`).join('\n')}`
}

/**
 * Calls DeepSeek (OpenAI-compatible API) to generate an AI interviewer response.
 *
 * @param {Object} problem - The full problem object from the database
 * @param {Array<{role: string, content: string}>} history - Conversation history
 * @param {string} message - The latest user message ("" for start)
 * @returns {Promise<string>} The AI interviewer's reply
 */
export async function getInterviewerReply({ problem, history, message }) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured on the server')
  }

  const systemPrompt = buildSystemPrompt(problem)

  // Build messages array: system prompt + history + latest user message
  const messages = [{ role: 'system', content: systemPrompt }]

  // If there's no message and no history, this is the start — let the AI kick off
  if (!message && history.length === 0) {
    messages.push({ role: 'user', content: 'Please start the interview.' })
  } else {
    // Add the conversation history
    for (const h of history) {
      messages.push({ role: h.role, content: h.content })
    }
    // Add the latest user message (might be empty for start)
    if (message) {
      messages.push({ role: 'user', content: message })
    }
  }

  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`DeepSeek API error ${res.status}: ${errBody}`)
  }

  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content

  if (!reply) {
    throw new Error('DeepSeek returned an empty response')
  }

  return reply
}
