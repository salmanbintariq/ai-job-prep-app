import '../style/interview.scss'
import { useState } from 'react'

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_REPORT = {
  matchScore: 88,
  technicalQuestions: [
    {
      question: 'Explain JWT refresh token rotation and why it is important for security.',
      intention: 'Assess understanding of secure authentication patterns and token lifecycle management.',
      answer: 'Refresh token rotation means issuing a new refresh token every time an access token is refreshed, and invalidating the old one. This prevents replay attacks — if a refresh token is stolen and used, the legitimate user\'s next request will fail because their token was already rotated, alerting the system to a potential breach.',
    },
    {
      question: 'What is the difference between state and props in React? When would you use Context API?',
      intention: 'Evaluate core React knowledge and understanding of data flow patterns.',
      answer: 'Props are immutable data passed from parent to child. State is mutable data managed within a component. Context API is used when you need to share data across many components at different nesting levels without prop drilling — like authentication state, theme, or language settings.',
    },
    {
      question: 'How does MongoDB indexing work and when should you use it?',
      intention: 'Assess database optimization knowledge and practical experience.',
      answer: 'MongoDB indexes store a small portion of data in an easy-to-traverse form. Without an index, MongoDB does a collection scan. You should index fields that are frequently queried, used in sort operations, or used in joins ($lookup). Avoid over-indexing as it slows down write operations.',
    },
    {
      question: 'Explain the Node.js event loop and how it handles async operations.',
      intention: 'Test understanding of Node.js internals and non-blocking I/O model.',
      answer: 'Node.js runs on a single thread using an event loop. When an async operation is called (like a DB query), it is offloaded to libuv thread pool. When complete, the callback is pushed to the event queue and picked up by the event loop when the call stack is empty. This is why Node.js can handle thousands of concurrent connections without blocking.',
    },
    {
      question: 'What are SOLID principles? Give an example of Single Responsibility Principle.',
      intention: 'Evaluate OOP design knowledge and ability to write maintainable code.',
      answer: 'SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. SRP means a class should have only one reason to change. Example: A UserService class should only handle user business logic — not also handle email sending. Email logic belongs in an EmailService. This makes each class easier to test and maintain.',
    },
  ],
  behavioralQuestions: [
    {
      question: 'Tell me about a time you faced a difficult technical bug. How did you approach it?',
      intention: 'Assess problem-solving methodology, debugging skills, and resilience.',
      answer: 'Use the STAR method. Situation: Describe the bug and its impact. Task: What was your responsibility. Action: How you systematically debugged — logs, isolating the issue, forming hypotheses. Result: What you fixed and what you learned. Show that you are methodical, not random.',
    },
    {
      question: 'How do you handle disagreements with a teammate about technical decisions?',
      intention: 'Evaluate communication, collaboration, and professional maturity.',
      answer: 'Acknowledge their perspective first. Present your reasoning with data or examples, not opinions. Suggest a proof-of-concept if the debate continues. Be willing to defer to the more experienced person while documenting your concern. The goal is the best outcome for the product, not winning the argument.',
    },
    {
      question: 'Describe how you prioritize tasks when working on multiple things at once.',
      intention: 'Assess time management, organizational skills, and ability to work under pressure.',
      answer: 'I use impact vs effort matrix — high impact, low effort tasks first. I communicate with stakeholders early if deadlines are at risk. I break large tasks into smaller milestones and use tools like GitHub issues or Notion to track progress. I also time-block my calendar to protect focus time.',
    },
    {
      question: 'Tell me about a project you are most proud of and why.',
      intention: 'Understand what motivates the candidate and how they measure their own success.',
      answer: 'Pick a project that shows growth or creativity. Describe what problem it solved, your specific contribution, challenges you overcame, and the outcome. Mention what you learned. Enthusiasm here is genuine signal — talk about something you actually care about.',
    },
    {
      question: 'Where do you see yourself in 2 to 3 years?',
      intention: 'Assess ambition, self-awareness, and alignment with company growth opportunities.',
      answer: 'Be specific but realistic. Mention technical growth (system design, TypeScript, cloud), team contribution (mentoring juniors, leading small features), and alignment with the company (growing with the product). Avoid generic answers like "I want to be a senior developer" — say what kind of problems you want to be solving.',
    },
  ],
  preparationPlan: [
    {
      day: 1,
      focus: 'React Core Concepts',
      tasks: [
        'Review useState, useEffect, useContext hooks',
        'Practice prop drilling vs Context API',
        'Build a small counter app with context',
        'Read React reconciliation and virtual DOM',
      ],
    },
    {
      day: 2,
      focus: 'Node.js and Express.js APIs',
      tasks: [
        'Review Express middleware chain',
        'Practice building RESTful routes',
        'Revise error handling middleware',
        'Understand event loop with async/await',
      ],
    },
    {
      day: 3,
      focus: 'MongoDB and Database Design',
      tasks: [
        'Review mongoose schemas and validation',
        'Practice aggregation pipeline',
        'Understand indexing and when to use it',
        'Compare MongoDB vs MySQL use cases',
      ],
    },
    {
      day: 4,
      focus: 'JavaScript ES6 and DSA Basics',
      tasks: [
        'Review closures, promises, async/await',
        'Practice array methods (map, filter, reduce)',
        'Solve 3 easy LeetCode problems',
        'Review time complexity basics',
      ],
    },
    {
      day: 5,
      focus: 'Authentication and Security',
      tasks: [
        'Review JWT access and refresh token flow',
        'Understand bcrypt hashing rounds',
        'Practice explaining token rotation',
        'Review HTTP-only cookie security',
      ],
    },
    {
      day: 6,
      focus: 'Skill Gap Focus — TypeScript and Testing',
      tasks: [
        'Complete TypeScript basics tutorial (2 hours)',
        'Write a simple typed Express route',
        'Learn Jest basics — describe, it, expect',
        'Write unit test for a utility function',
      ],
    },
    {
      day: 7,
      focus: 'Mock Interview and Final Review',
      tasks: [
        'Do a full mock interview with a friend or record yourself',
        'Review all technical questions from this report',
        'Prepare 3 STAR stories for behavioral questions',
        'Research TechSolve Pakistan — products, team, culture',
      ],
    },
  ],
  skillGaps: [
    { skill: 'TypeScript', severity: 'high' },
    { skill: 'Docker / AWS', severity: 'high' },
    { skill: 'Jest / Testing', severity: 'high' },
    { skill: 'CI/CD Pipelines', severity: 'medium' },
    { skill: 'System Design', severity: 'medium' },
  ],
}

// ── Nav Items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'technical',
    label: 'Technical Questions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: 'behavioral',
    label: 'Behavioral Questions',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'roadmap',
    label: 'Road Map',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
const severityClass = {
  high: 'skill-tag--high',
  medium: 'skill-tag--medium',
  low: 'skill-tag--low',
}

const scoreLabel = (score) => {
  if (score >= 80) return 'Strong match for this role'
  if (score >= 60) return 'Good match — some gaps'
  return 'Needs improvement'
}

const scoreClass = (score) => {
  if (score >= 80) return 'score--high'
  if (score >= 60) return 'score--medium'
  return 'score--low'
}

// ── Sub Components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false) // ✅ accordion

  return (
    <div className={`q-card ${open ? 'q-card--open' : ''}`}>
      <div className='q-card__header' onClick={() => setOpen(!open)}>
        <span className='q-card__index'>Q{index + 1}</span>
        <p className='q-card__question'>{item.question}</p>
        <span className={`q-card__chevron ${open ? 'q-card__chevron--up' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>

      {open && (
        <div className='q-card__body'>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--intention'>Intention</span>
            <p>{item.intention}</p>
          </div>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const RoadMapDay = ({ day }) => (
  <div className='roadmap-day'>
    <div className='roadmap-day__header'>
      <span className='roadmap-day__badge'>Day {day.day}</span>
      <h3 className='roadmap-day__focus'>{day.focus}</h3>
    </div>
    <ul className='roadmap-day__tasks'>
      {day.tasks.map((task, i) => (
        <li key={i}>
          <span className='roadmap-day__bullet' />
          {task}
        </li>
      ))}
    </ul>
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical') // ✅ active tab state

  const report = MOCK_REPORT

  // ✅ Active section ka content
  const renderContent = () => {
    if (activeNav === 'technical') {
      return (
        <section>
          <div className='content-header'>
            <h2>Technical Questions</h2>
            <span className='content-header__count'>
              {report.technicalQuestions.length} questions
            </span>
          </div>
          <div className='q-list'>
            {report.technicalQuestions.map((item, i) => (
              <QuestionCard key={i} item={item} index={i} />
            ))}
          </div>
        </section>
      )
    }

    if (activeNav === 'behavioral') {
      return (
        <section>
          <div className='content-header'>
            <h2>Behavioral Questions</h2>
            <span className='content-header__count'>
              {report.behavioralQuestions.length} questions
            </span>
          </div>
          <div className='q-list'>
            {report.behavioralQuestions.map((item, i) => (
              <QuestionCard key={i} item={item} index={i} />
            ))}
          </div>
        </section>
      )
    }

    if (activeNav === 'roadmap') {
      return (
        <section>
          <div className='content-header'>
            <h2>Preparation Roadmap</h2>
            <span className='content-header__count'>
              {report.preparationPlan.length} days
            </span>
          </div>
          <div className='roadmap-list'>
            {report.preparationPlan.map((day, i) => (
              <RoadMapDay key={i} day={day} />
            ))}
          </div>
        </section>
      )
    }
  }

  return (
    <div className='interview-page'>
      <div className='interview-layout'>

        {/* ── Left Nav ── */}
        <nav className='interview-nav'>
          <div className='nav-content'>
            <p className='interview-nav__label'>Sections</p>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                type='button'
                onClick={() => setActiveNav(item.id)} // ✅ tab switch
              >
                <span className='interview-nav__icon'>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <button className='button primary-button' type='button'>
            <svg height='0.8rem' style={{ marginRight: '0.8rem' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z" />
            </svg>
            Download Resume
          </button>
        </nav>

        <div className='interview-divider' />

        {/* ── Center Content ── */}
        <main className='interview-content'>
          {renderContent()} {/* ✅ dynamic content */}
        </main>

        <div className='interview-divider' />

        {/* ── Right Sidebar ── */}
        <aside className='interview-sidebar'>

          {/* Match Score */}
          <div className='match-score'>
            <p className='match-score__label'>Match Score</p>
            <div className={`match-score__ring ${scoreClass(report.matchScore)}`}>
              <span className='match-score__value'>{report.matchScore}</span>
              <span className='match-score__pct'>%</span>
            </div>
            <p className='match-score__sub'>{scoreLabel(report.matchScore)}</p>
          </div>

          <div className='sidebar-divider' />

          {/* Skill Gaps */}
          <div className='skill-gaps'>
            <p className='skill-gaps__label'>Skill Gaps</p>
            <div className='skill-gaps__list'>
              {report.skillGaps.map((gap, i) => (
                <span
                  key={i}
                  className={`skill-tag ${severityClass[gap.severity]}`}
                >
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  )
}

export default Interview