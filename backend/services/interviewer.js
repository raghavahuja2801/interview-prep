const DEEPSEEK_BASE = 'https://api.deepseek.com/v1'

// ─── Shared persona rules ───
// You are a Senior Staff Engineer at a top-tier tech company (think Google/Meta/Amazon).
// You've conducted 200+ system design interviews across all levels (E4–E7+).
// You are professional, direct, and structured — not friendly, not hostile.
// You sound like a real engineer who has done this many times.
// You never ask multiple questions in one turn. One clear question per message.
// You adapt to the candidate's level naturally — if they're strong, go deeper; if they're struggling, give hints.
// You use realistic interview language, not "we'll use a message queue" generic textbook answers.
// You do NOT evaluate or score during the interview — you assess through probing.
// You manage time naturally: "Let's move to the next area — we should cover the data model."

// ─── Isolation rules ───
// This interview is completely fresh. You have never interviewed this candidate before.
// Treat each turn as if it's the very first time you're meeting this candidate.

const SECTION_GUIDE_HLD = [
  {
    name: 'Requirements',
    goal: 'Have them scope the problem clearly before designing anything.',
    opener:
      "Let's start. Walk me through — what are the functional and non-functional requirements you see for this system? Take a minute to structure your thinking.",
    probes: [
      "What's the primary user flow from end to end?",
      'What non-functional properties matter most here — and why those specifically?',
      'Is there anything you think we should explicitly deprioritize or consider out of scope?',
    ],
  },
  {
    name: 'Estimation & Constraints',
    goal: 'Realistic ballpark numbers for QPS, storage, bandwidth. Check assumptions.',
    opener:
      "Alright, let's talk scale. Walk me through the back-of-the-envelope numbers — what kind of traffic, storage, and bandwidth are we looking at?",
    probes: [
      'How did you arrive at that QPS number — what assumptions are baked into it?',
      'How much new data do we generate per month? Does that change your storage choice?',
      'Are there any constraints in those numbers that would reshape the architecture?',
    ],
  },
  {
    name: 'Data Model',
    goal: 'Schema, storage engine, indexing. Justify the choice.',
    opener:
      "Let's talk data. What does the core schema look like, and how would you store it?",
    probes: [
      'Why [SQL / NoSQL] here? Walk me through when that choice starts to creak under load.',
      'What indexes do you create? What read/write patterns do they optimize?',
      'How do you handle schema evolution without downtime?',
    ],
  },
  {
    name: 'High-Level Architecture',
    goal: 'Components, data flow, service boundaries.',
    opener:
      "Good. Now zoom out — sketch the high-level architecture. What are the main components, and how does a request flow through them?",
    probes: [
      'Walk me through the request path from client to storage and back.',
      'You mentioned [component] — what does it own, and why is it a separate service rather than a library?',
      'What happens if [component] goes down mid-request?',
    ],
  },
  {
    name: 'Deep Dive',
    goal: 'Pick one component and probe hard. Caching, partitioning, replication, consistency tradeoffs.',
    opener:
      "I want to zoom in on [component they mentioned — caching layer, database, queue, API gateway, etc.]. Walk me through your design decisions there in more detail.",
    probes: [
      'What does the read path look like through this component? What about the write path?',
      'If we need to shard this across 100 nodes, how do you partition the data?',
      'What consistency model does this part of the system need — and what tradeoff are you making by choosing it?',
    ],
  },
  {
    name: 'Tradeoffs & Bottlenecks',
    goal: 'Identify the weakest link and what they would improve.',
    opener:
      "We've covered a lot of ground. Let's step back — what's the most likely bottleneck in this design at 10x scale, and how would you address it?",
    probes: [
      'You chose [A] over [B] earlier — what was the key tradeoff, and did you consider the operational cost of that choice?',
      'If we had another 20 minutes, what part of the design would you revisit and why?',
      'Which component is most likely to fail under a traffic spike, and what mitigations are in place?',
    ],
  },
]

const SECTION_GUIDE_LLD = [
  {
    name: 'Requirements & Scope',
    goal: 'Clarify the boundaries of the system before writing any code.',
    opener:
      "Let's start. Walk me through what this system needs to do — what are the key use cases, and what's explicitly out of scope?",
    probes: [
      'Who are the actors in this system, and what actions does each one perform?',
      'What does the happy path look like from start to finish?',
      "Anything you'd like to explicitly deprioritize or defer?",
    ],
  },
  {
    name: 'Core Entities & Relationships',
    goal: 'Classes, enums, interfaces, relationships. Clean abstractions.',
    opener:
      "Let's talk about the core model. What are the key classes or entities, and how do they relate to each other?",
    probes: [
      "What are the core attributes and behaviors of [key class] — what does its public interface look like?",
      'Is this an inheritance or composition relationship? Walk me through why.',
      'What enums or value objects would you define up front?',
    ],
  },
  {
    name: 'APIs & Interfaces',
    goal: 'Method signatures, contracts, error handling, extensibility.',
    opener:
      "Now define the public interface. What methods does the core system expose, and what contracts do they enforce?",
    probes: [
      'Give me the method signatures — params, return types, and exceptions. Be specific.',
      'What error cases does the caller need to handle?',
      'How would you extend this interface for a new use case without breaking existing callers?',
    ],
  },
  {
    name: 'Design Patterns',
    goal: 'Patterns applied intentionally, not by rote.',
    opener:
      'Are there any design patterns that naturally fit here? Walk me through which ones and why.',
    probes: [
      "You mentioned [pattern] — what specific problem does it solve in this context? Don't just name it; apply it.",
      'What alternative pattern did you consider and reject?',
      'Show me how this pattern manifests in your class diagram — what are the concrete classes?',
    ],
  },
  {
    name: 'State Management & Concurrency',
    goal: 'State transitions, thread safety, race conditions, coordination.',
    opener:
      "Let's talk about state. How does state flow through this system, and what guarantees do you need around concurrent access?",
    probes: [
      'What are the key state transitions? Walk me through a state machine if applicable.',
      'If two threads or users call this method simultaneously, what breaks?',
      'How do you protect shared state without over-engineering locking? Is there a lock-free approach?',
    ],
  },
  {
    name: 'Implementation Walkthrough',
    goal: 'Write or pseudocode a core method. Test edge cases.',
    opener:
      "Let's see some code. Walk me through the implementation of the most important method in this system.",
    probes: [
      'What data structures did you choose for this method, and why those?',
      'Walk me through the edge cases — null inputs, empty state, concurrent calls.',
      'If this method needed to handle 10x the load, what would you refactor?',
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
    return `You are a Senior Staff Engineer at a top-tier tech company conducting a low-level design interview. You've led 200+ design rounds. You are sharp, structured, and fair — you push for depth without being abrasive.

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
