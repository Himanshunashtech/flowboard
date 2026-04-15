import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Layout,
  Calendar,
  Target,
  Rocket,
  Search,
  ArrowRight,
  Filter,
  Bug,
  Code2,
  AlertTriangle,
  GitBranch,
  Zap,
  Sparkles,
  ShieldCheck,
  ClipboardList,
  FileText,
  Info
} from 'lucide-react';

// Template Assets (Moved to public/assets)
const taskImg = '/assets/templates/task_template.png';
const gettingStartedImg = '/assets/templates/getting_started.png';
const roadmapImg = '/assets/templates/roadmap.png';
const marketingImg = '/assets/templates/marketing.png';
const salesImg = '/assets/templates/sales.png';
const personalImg = '/assets/templates/personal.png';
const agileImg = '/assets/templates/agile.png';
const contentImg = '/assets/templates/content.png';

// Card Covers
const taskCardImg = '/assets/templates/cards/task_card.png';
const startedCardImg = '/assets/templates/cards/started_card.png';
const roadmapCardImg = '/assets/templates/cards/roadmap_card.png';
const marketingCardImg = '/assets/templates/cards/marketing_card.png';
const salesCardImg = '/assets/templates/cards/sales_card.png';
const personalCardImg = '/assets/templates/cards/personal_card.png';
const agileCardImg = '/assets/templates/cards/agile_card.png';
const contentCardImg = '/assets/templates/cards/content_card.png';
const inboxCardImg = '/assets/templates/cards/inbox_card.png';

// New Template Assets
const bugTrackerImg = '/assets/templates/bug_tracker_cover.png';
const bugTrackerCardImg = '/assets/templates/bug_tracker_card.png';
const apiDevImg = '/assets/templates/api_dev_cover.png';
const apiDevCardImg = '/assets/templates/api_dev_card.png';
const incidentImg = '/assets/templates/incident_response_cover.png';
const incidentCardImg = '/assets/templates/incident_response_card.png';
const openSourceImg = '/assets/templates/open_source_cover.png';
const openSourceCardImg = '/assets/templates/open_source_card_one.png';

export const TEMPLATES = [
  {
    id: 'premium-inbox',
    name: 'Premium Inbox Manager',
    description: 'A high-impact capture system for ultra-fast task organization.',
    category: 'basic',
    coverImage: inboxCardImg,
    longDescription: `The Premium Inbox Manager is designed for high-velocity environments where information flows from every direction. Inspired by "Getting Things Done" (GTD) principles, this template provides a dedicated processing engine for your tasks, ideas, and missions. 
    
    The board utilizes a high-contrast chromatic palette to help you mentally separate task states. The "Getting Started" list (Purple) acts as your primary capture zone. Use it to dump every thought, link, or request before it clutter your focus. From there, move items to "To-do" (Yellow) once they are defined, then into "Doing" (Green) for active execution. Finally, "Done" (White) serves as your archive of victories.
    
    This template is optimized for use with FlowBoard's inbound email and mobile capture features. By centralizing all your inbound requests here, you reduce the cognitive load of checking multiple apps. Treat your Inbox as a sacred space—process it daily, keep it organized, and let the colors guide your path to peak productivity.`,
    icon: Zap,
    color: 'bg-orange-50 text-orange-600',
    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#E0C3FC' },
      { title: 'To-do', color: '#FAD9A1' },
      { title: 'Doing', color: '#C6F1D6' },
      { title: 'Done', color: '#FFFFFF' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '📥 Capture Everything',
        coverImage: inboxCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Save anything from email, websites, and other apps directly into this list. Use the central Inbox as your raw capture zone.' }] }] }
      },
      {
        listTitle: 'To-do',
        title: 'Define the Mission',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Once an item is captured, add due dates, priority labels, and details here.' }] }] }
      }
    ]
  },
  {
    id: 'task-template',
    name: 'Task Template',
    description: 'A clean, high-performance workflow for daily task execution.',
    category: 'basic',
    coverImage: taskImg,
    longDescription: `Mastering daily execution requires a balance between speed and precision. This Task Template is built on the pillars of modern productivity: Clarity, Prioritization, and Momentum. 
    
    The workflow is designed to reduce decision fatigue. By segregating tasks into Getting Started, To Do, Doing, and Done, you create a visual gradient of progress. The "Getting Started" list serves as your landing zone—use it to capture raw ideas before they are refined. Once a task is ready for execution, move it to "To Do" and assign a priority level. 
    
    For maximum efficiency, we recommend the "Single Task Focus" method: only move one card into the "Doing" column at a time. This prevents context switching and ensures that you are giving your full cognitive energy to the mission at hand. Use the card description to break down complex tasks into smaller, actionable sub-tasks. 
    
    Collaboration is at the heart of this template. Assign cards to team members and use the comment section to keep conversations in context. This eliminates the need for messy email chains and fragmented messaging. As you complete tasks, move them to "Done" to build psychological momentum. 
    
    For advanced users, this template supports automation. You can set rules to automatically move cards based on due dates or label changes. This allows you to spend less time managing the board and more time executing the work that matters. Remember, a board is only as good as the data you put into it—keep it updated and let it be your single source of truth for all operational tasks.`,
    icon: ClipboardList,
    color: 'bg-slate-100 text-slate-600',
    background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#94a3b8' },
      { title: 'To Do', color: '#38bdf8' },
      { title: 'Doing', color: '#818cf8' },
      { title: 'Done', color: '#2dd4bf' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '👋 Welcome to your Task Board!',
        coverImage: taskCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This board is optimized for execution. Move tasks from To Do to Doing when you start working on them.' }] }] }
      },
      {
        listTitle: 'To Do',
        title: 'Define your first mission',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Click on this card to add details, labels, or a location.' }] }] }
      },
      {
        listTitle: 'Doing',
        title: 'Your current focus',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Focus on one card at a time for maximum productivity.' }] }] }
      }
    ]
  },
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the core features of FlowBoard with this interactive guide.',
    category: 'basic',
    coverImage: gettingStartedImg,
    longDescription: `Welcome to FlowBoard! This interactive guide is designed to transform you from a beginner to a power user in under five minutes. FlowBoard is more than just a project management tool; it's a versatile engine for your team's creativity and execution.
    
    The board is structured in three phases: Discovery, Feature Tour, and Mastery. Start in the "Getting Started" list. Here, you'll learn the basic anatomy of a card—how to add titles, descriptions, and custom fields. Cards are the fundamental units of work; they hold all the context, attachments, and conversations related to a specific task.
    
    Next, move to the "Features Tour". This is where FlowBoard's true power shines. Experiment with "Locations" to pin your tasks to the map, or try the "Analytics" view to see a bird's eye view of your team's velocity. You'll also find cards explaining how to use "Power-ups" like Automations and Calendar integration. 
    
    Collaboration is seamless in FlowBoard. Try inviting a teammate using the "Share" button in the header. You'll see their cursors move in real-time as they interact with the board. Communication happens inside the cards via comments, ensuring that everyone is on the same page without the clutter of external apps.
    
    Finally, check out the "Next Steps" list. This list is a launchpad for your first real projects. We provide templates for everything from Marketing to Scrum, but this guide ensures you have the foundational skills to build anything from scratch. Explore keyboard shortcuts like "C" for new cards and "F" for global filters. Your journey to master-level productivity starts right here.`,
    icon: Sparkles,
    color: 'bg-indigo-100 text-indigo-600',
    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    listStyle: 'glass',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#fbbf24' },
      { title: 'Features Tour', color: '#f472b6' },
      { title: 'Next Steps', color: '#60a5fa' },
      { title: 'Mastery', color: '#34d399' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '📍 Using Locations',
        coverImage: startedCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'You can now add real-world locations to any card using the Location Selector.' }] }] }
      },
      {
        listTitle: 'Features Tour',
        title: '⚙️ Power-up with Automations',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Open the "Automations" tab to create rules that automate your workflow.' }] }] }
      },
      {
        listTitle: 'Next Steps',
        title: '🚀 Create your first custom field',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Go to Board Settings to define structured data for your cards.' }] }] }
      }
    ]
  },
  {
    id: 'product-roadmap',
    name: 'Product Roadmap',
    description: 'Perfect for agile teams tracking features and releases.',
    category: 'basic',
    coverImage: roadmapImg,
    longDescription: `Building great products requires a clear vision and a disciplined roadmap. This template is designed for product managers and engineering teams who need to balance long-term strategy with short-term execution. 
    
    The roadmap is divided into iterative stages: Backlog, Discovery, Ready for Dev, In Progress, and Done. The "Backlog" is your library of ideas—every feature request and bug report should live here initially. During your weekly grooming sessions, move high-priority items into "Discovery" for technical and design validation. 
    
    Once an item is fully defined and estimated, it moves to "Ready for Dev". This acts as the buffer for your engineering team, ensuring they always have high-context work waiting for them. The "In Progress" list is the heart of the engine—use it to track active development and identify bottlenecks early. 
    
    Integration is key to a successful roadmap. Use FlowBoard's "Dependencies" feature to map out how features rely on each other. This prevents timeline slips and ensures that your team is always moving in the right sequence. The "Timeline View" is particularly useful for presenting the roadmap to stakeholders, providing a visual representation of your release schedule.
    
    For multi-team collaboration, use labels to distinguish between "Core Platform", "UX", and "Backend" tasks. This allows for granular filtering, so everyone can focus on their specific area while maintaining visibility of the overall goal. As features are launched, move them to "Done" and celebrate the team's wins. This template is designed to grow with your product, from MVP to Enterprise scale.`,
    icon: Rocket,
    color: 'bg-teal-100 text-teal-600',
    background: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: [
      { title: 'Strategic Goal', color: '#2dd4bf' },
      { title: 'Product Backlog', color: '#a7f3d0' },
      { title: 'In Discovery', color: '#fef08a' },
      { title: 'In Development', color: '#fb923c' },
      { title: 'Done', color: '#ffffff' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Roadmap Guide', coverImage: roadmapCardImg, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use this board to visualize your product strategy. Move items from Backlog to Discovery as they are defined.' }] }] } },
      { listTitle: 'Product Backlog', title: 'Implement Dark Mode UI', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Review accessibility guidelines for dark mode palette.' }] }] } }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Launch',
    description: 'Coordinate multi-channel campaigns with ease.',
    category: 'basic',
    coverImage: marketingImg,
    longDescription: `In the world of marketing, synchronization is everything. A single launch often involves creative assets, ad operations, and social media coordination across multiple channels. This template is your command center for ensuring every gear in the machine is turning in unison.
    
    Start by defining your "Channel Strategy". Every card here should represent a specific platform—Instagram, LinkedIn, Email, or Search. Attach your strategy documents and target metrics directly to the cards. This ensures that the creative team knows exactly who they are designing for and what the goals are.
    
    As assets are created, move them into "Creative Assets". FlowBoard's high-resolution attachment previews make it easy to review designs, videos, and copy without leaving the app. Use the "Editorial Review" label to signal that a piece is ready for final approval. 
    
    "Ad Operations" is where the technical setup happens. Track your pixel placements, budget allocations, and landing page URLs here. Once a campaign goes live, move it to "Live / Published". This gives the whole team real-time visibility into what is currently in market.
    
    The final piece of the puzzle is "Performance Tracking". Use custom fields to log weekly clicks, impressions, and conversions. Over time, this board becomes a historical archive of your marketing wins and learnings. By keeping all your campaign data in one place, you can quickly pivot your strategy based on what the numbers are telling you. This template is built for speed and adaptability in a fast-paced digital landscape.`,
    icon: Target,
    color: 'bg-pink-100 text-pink-600',
    background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
    listStyle: 'solid',
    cardStyle: 'shadowed',
    lists: [
      { title: 'Getting Started', color: '#fda4af' },
      { title: 'Channel Strategy', color: '#67e8f9' },
      { title: 'Creative Assets', color: '#fcd34d' },
      { title: 'Ad Operations', color: '#ffffff' },
      { title: 'Live / Published', color: '#34d399' },
      { title: 'Performance Tracking', color: '#ffffff' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Campaign Blueprint', coverImage: marketingCardImg, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Track all your creative assets and ad operations. Ensure the Channel Strategy is finalized before moving to Creative.' }] }] } },
      { listTitle: 'Channel Strategy', title: 'Instagram Story Series', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Plan 3-part sequence focused on product benefits.' }] }] } }
    ]
  },
  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline',
    description: 'Track leads through your customized sales funnel.',
    category: 'basic',
    coverImage: salesImg,
    longDescription: `A healthy sales pipeline is the lifeblood of any growing business. This template is designed to provide maximum transparency into your sales funnel, allowing you to identify opportunities and move deals toward "Won / Closed" with efficiency.
    
    The funnel follows a standard sales journey: Incoming Leads, Qualification, Proposal Sent, Negotiation, and Closed. "Incoming Leads" is your catch-all for every potential interest. Whether it's a website form submission or a LinkedIn outreach, it starts here. 
    
    Stage two is "Qualification". This is where you determine if a lead has the budget, authority, and need for your product. Use custom fields like "Potential Deal Value" and "Lead Source" to track the quality of your pipeline. High-value leads should be prioritized using FlowBoard's priority labels. 
    
    In the "Proposal" and "Negotiation" phases, communication is critical. Use the comment section on each card to log every call, email, and meeting. This ensures that even if a team member is away, anyone can step in and understand the exact status of the deal. Attach contract drafts and pricing sheets directly to the card for easy access. 
    
    Finally, move won deals to "Won / Closed" and celebrate the revenue! For lost deals, move them to an "Archive" list but be sure to log the "Reason for Loss"—this data is invaluable for improving your sales strategy in the future. The "Analytics Dashboard" view is your best friend here, providing real-time conversion rates and pipeline health metrics. This template turns your sales process into a predictable, data-driven machine.`,
    icon: ShieldCheck,
    color: 'bg-emerald-100 text-emerald-600',
    background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
    listStyle: 'solid',
    cardStyle: 'compact',
    lists: [
      { title: 'Getting Started', color: '#fef08a' },
      { title: 'Incoming Leads', color: '#ffffff' },
      { title: 'Qualification', color: '#ffffff' },
      { title: 'Proposal Sent', color: '#ffffff' },
      { title: 'In Negotiation', color: '#a7f3d0' },
      { title: 'Won / Closed', color: '#6ee7b7' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Pipeline Best Practices', coverImage: salesCardImg, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Move leads through the funnel as conversations progress. Use labels to indicate lead priority or deal size.' }] }] } },
      { listTitle: 'Incoming Leads', title: 'Acme Corp Inquiry', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Initial inquiry via website. 50+ seats potential.' }] }] } }
    ]
  },
  {
    id: 'personal-tasks',
    name: 'Personal Planner',
    description: 'Stay organized with a clean, daily task tracker.',
    category: 'basic',
    coverImage: personalImg,
    longDescription: `Modern life is complex, and maintaining mental clarity requires a structured system for managing personal responsibilities. The Personal Planner template is built on the principles of "Deep Work" and "Digital Minimalism," providing a serene environment for your daily focus.
    
    The board is structured around a temporal workflow: Today’s Focus, Upcoming, Someday / Maybe, and Archive. Start your morning in the "Upcoming" list. Move only 3-5 tasks into "Today’s Focus". Research shows that limiting your daily priorities leads to higher completion rates and reduced stress. 
    
    Tasks that are important but not urgent belong in "Someday / Maybe". This is your "Brain Dump" area—get ideas out of your head and onto the board to free up cognitive bandwidth. Periodically review this list during your weekly reflection to see if any items should be promoted to active status. 
    
    "Archive / Done" is not just a trash can; it's a history of your personal growth. Seeing a long list of completed tasks at the end of the week provides a significant dopamine boost and reinforces positive productivity habits. Use the "Checklist" feature within cards for things like grocery lists or multi-step errands. 
    
    For those who travel or commute, the "Location" feature is a game-changer. Tag tasks with physical locations so you can see exactly what needs to be done when you're in a specific part of town. This template is your personal assistant, designed to help you live a more intentional and organized life.`,
    icon: Zap,
    color: 'bg-green-100 text-green-600',
    background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    listStyle: 'solid',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#c084fc' },
      { title: 'Today’s Focus', color: '#ffffff' },
      { title: 'Upcoming', color: '#86efac' },
      { title: 'Someday / Maybe', color: '#ffffff' },
      { title: 'Archive / Done', color: '#d1d5db' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Plan Your Day', coverImage: personalCardImg, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Start every morning by moving tasks from "Upcoming" to "Today’s Focus". Focus on one thing at a time.' }] }] } },
      { listTitle: 'Upcoming', title: 'Renew Gym Membership', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Check for annual discount rates.' }] }] } }
    ]
  },
  {
    id: 'agile-scrub',
    name: 'Agile Scrub',
    description: 'A fast-paced Scrum variant for high-velocity teams.',
    category: 'basic',
    coverImage: agileImg,
    longDescription: `Agile Scrub is a high-octane variant of traditional Scrum, optimized for teams that need to move fast without breaking things. This template replaces complex meetings with visual transparency and automated workflows. 
    
    The engine runs on four cylinders: Sprint Backlog, Development, Code Review, and QA Testing. Every card in the "Sprint Backlog" must have a clear "Definition of Done" in the description. This prevents scope creep and ensures that developers have everything they need to start work immediately. 
    
    As code is written, cards move to "Code Review". This is a critical checkpoint for quality. Use FlowBoard's "Assignment" feature to notify reviewers, and use comments for peer feedback. Once the code is merged, it moves to "QA Testing". Here, your QA team (or automated bots) can run their battery of tests and log bugs directly as sub-cards or checklists. 
    
    Velocity is tracked using custom fields for "Story Points". At a glance, the board tells you if the sprint is on track or if a bottleneck is forming in the review stage. The "Sprint Manager" tool allows you to close sprints and automatically migrate rollover tasks to the next period. 
    
    This template also integrates with your CI/CD pipeline. Use Automations to move cards to "Deployed" once the production build is successful. This provides a clear, real-time audit trail of what is currently live in your environment. For teams that value speed and technical excellence, the Agile Scrub template is the ultimate performance-tuning tool.`,
    icon: ClipboardList,
    color: 'bg-blue-100 text-blue-600',
    background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
    listStyle: 'solid',
    cardStyle: 'compact',
    lists: [
      { title: 'Getting Started', color: '#94a3b8' },
      { title: 'Sprint Backlog', color: '#ffffff' },
      { title: 'Development', color: '#38bdf8' },
      { title: 'Code Review', color: '#ffffff' },
      { title: 'QA Testing', color: '#fbbf24' },
      { title: 'Deployed', color: '#4ade80' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Sprint Protocol', coverImage: agileCardImg, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Only move cards into "Development" that have a clear definition of done.' }] }] } },
      { listTitle: 'Sprint Backlog', title: 'API Authentication Layer', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Implement JWT with 24h expiration.' }] }] } }
    ]
  },
  {
    id: 'content-pipeline',
    name: 'Content Production',
    description: 'Track assets from drafting to final publication.',
    coverImage: contentImg,
    longDescription: `In a saturated digital landscape, quality content is king. The Content Production template is a comprehensive editorial suite for bloggers, YouTubers, and corporate marketing teams. It ensures that every piece of content—from a quick tweet to a 2,000-word whitepaper—flows through a rigorous quality control system.
    
    The journey starts in the "Idea Bank". This is your creative reservoir. Don't worry about quality here; just capture every headline and topic that comes to mind. Once an idea is greenlit, move it to "In Drafting". Use the Rich Text editor inside FlowBoard cards to write your content directly, or link to external docs.
    
    "Editorial Review" is the stage where the magic happens. Move cards here for a final polish, SEO optimization, and fact-checking. Attach high-resolution images and social media snippets to the card to keep all assets bundled together. 
    
    In the "Final Polish" stage, use custom fields to track "Target Keywords" and "Internal Links". This ensures that every piece is technically optimized before it goes live. Once published, move the card to "Published" and set a "Repurpose Date" using the calendar feature. Content shouldn't just be created once; it should be reused and updated over time. 
    
    The "Calendar View" in FlowBoard is particularly powerful for this template, providing a visual editorial calendar that helps you maintain a consistent publishing cadence. This template takes the chaos out of content creation, turning it into a professional, scalable production line.`,
    icon: FileText,
    color: 'bg-amber-100 text-amber-600',
    background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    listStyle: 'solid',
    cardStyle: 'shadowed',
    lists: [
      { title: 'Getting Started', color: '#fb7185' },
      { title: 'Idea Bank', color: '#fef3c7' },
      { title: 'In Drafting', color: '#ffffff' },
      { title: 'Editorial Review', color: '#ffffff' },
      { title: 'Final Polish', color: '#fbbf24' },
      { title: 'Published', color: '#34d399' }
    ],
    initialCards: [
      { listTitle: 'Getting Started', title: 'Content Guide', coverImage: contentCardImg, description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use the Idea Bank to store future topics. Move to Drafting once research is complete.' }] }] } },
      { listTitle: 'Idea Bank', title: 'Top 10 Productivity Hacks', description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Focus on time-blocking and digital minimalism.' }] }] } }
    ]
  },
  {
    id: 'bug-tracker',
    name: 'Bug Tracker',
    description: 'Triage, reproduce, and squash bugs with a structured workflow.',
    category: 'developer',
    coverImage: bugTrackerImg,
    longDescription: `Shipping quality software means having an airtight system for catching and resolving issues before they reach your users. The Bug Tracker template is a battle-hardened workflow for engineering teams who treat every defect as a first-class citizen.`,
    icon: Bug,
    color: 'bg-red-50 text-red-600',
    background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
    listStyle: 'solid',
    cardStyle: 'compact',
    lists: [
      { title: 'Getting Started', color: '#94a3b8' },
      { title: 'Reported', color: '#fca5a5' },
      { title: 'Triaged', color: '#fdba74' },
      { title: 'In Fix', color: '#818cf8' },
      { title: 'In Review', color: '#38bdf8' },
      { title: 'Verified / Closed', color: '#4ade80' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '🐛 Bug Triage Protocol',
        coverImage: bugTrackerCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Label every bug with a Priority (P0–P3) and attach reproduction steps before moving it to Triaged.' }] }] }
      },
      {
        listTitle: 'Reported',
        title: 'Login token expires too early',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Users report being logged out after ~10 mins of inactivity. Expected: 24h session.' }] }] }
      }
    ]
  },
  {
    id: 'api-development',
    name: 'API Development',
    description: 'Design, build, and ship REST or GraphQL APIs end-to-end.',
    category: 'developer',
    coverImage: apiDevImg,
    longDescription: `Great APIs are designed before they are built. The API Development template enforces a rigorous design-first workflow that keeps your team aligned from the first endpoint sketch to the final production deploy.`,
    icon: Code2,
    color: 'bg-violet-50 text-violet-600',
    background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
    listStyle: 'glass',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#94a3b8' },
      { title: 'Design', color: '#c4b5fd' },
      { title: 'Development', color: '#818cf8' },
      { title: 'Testing', color: '#fbbf24' },
      { title: 'Documentation', color: '#38bdf8' },
      { title: 'Released', color: '#4ade80' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '⚡ API Dev Workflow',
        coverImage: apiDevCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Attach your OpenAPI spec to each endpoint card in Design before moving to Development. No spec = no start.' }] }] }
      },
      {
        listTitle: 'Design',
        title: 'POST /auth/token',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'JWT-based auth endpoint. Accepts email + password. Returns access + refresh token pair.' }] }] }
      }
    ]
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    description: 'Detect, contain, and resolve production incidents fast.',
    category: 'developer',
    coverImage: incidentImg,
    longDescription: `When production goes down, every second counts. The Incident Response template is an operational war room designed to cut through the chaos, align your team instantly, and drive every incident to resolution with a clear audit trail.`,
    icon: AlertTriangle,
    color: 'bg-orange-50 text-orange-600',
    background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
    listStyle: 'solid',
    cardStyle: 'compact',
    lists: [
      { title: 'Getting Started', color: '#94a3b8' },
      { title: 'Detected', color: '#fca5a5' },
      { title: 'Investigating', color: '#fb923c' },
      { title: 'Mitigating', color: '#fbbf24' },
      { title: 'Monitoring', color: '#38bdf8' },
      { title: 'Post-Mortem', color: '#e2e8f0' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '🚨 Incident Runbook',
        coverImage: incidentCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Create a card the moment an alert fires. Assign a SEV level (1–3) and an Incident Commander immediately.' }] }] }
      },
      {
        listTitle: 'Detected',
        title: '[SEV2] Elevated 5xx on /checkout',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Error rate 12% above baseline. Started ~14:22 UTC. Payment service suspected.' }] }] }
      }
    ]
  },
  {
    id: 'open-source',
    name: 'Open Source Project',
    description: 'Manage contributions, issues, and releases for OSS projects.',
    category: 'developer',
    coverImage: openSourceImg,
    longDescription: `Running an open source project is equal parts engineering and community management. The Open Source Project template gives maintainers a structured system to handle the unpredictable, asynchronous nature of community contributions—without burning out.`,
    icon: GitBranch,
    color: 'bg-cyan-50 text-cyan-600',
    background: 'linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)',
    listStyle: 'glass',
    cardStyle: 'modern',
    lists: [
      { title: 'Getting Started', color: '#94a3b8' },
      { title: 'Community Issues', color: '#67e8f9' },
      { title: 'Accepted / Backlog', color: '#ffffff' },
      { title: 'In Progress', color: '#818cf8' },
      { title: 'PR Review', color: '#fbbf24' },
      { title: 'Released', color: '#4ade80' }
    ],
    initialCards: [
      {
        listTitle: 'Getting Started',
        title: '🌐 OSS Maintainer Guide',
        coverImage: openSourceCardImg,
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Label incoming issues within 48h. Use "good first issue" to funnel contributors. Every PR must reference an issue card.' }] }] }
      },
      {
        listTitle: 'Community Issues',
        title: 'Feature: Dark mode support',
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Requested by 23 users. Would require theming refactor across 4 components.' }] }] }
      }
    ]
  }
];

const TemplateGallery = ({ isOpen, onClose, onSelect }) => {
  const [activeCategory, setActiveCategory] = React.useState('basic');

  const filteredTemplates = TEMPLATES.filter(t =>
    activeCategory === 'all' || t.category === activeCategory
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_32px_120px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-10 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-6 bg-bg-secondary/30">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-brand-primary/10 rounded-xl">
                    <Sparkles className="text-brand-primary" size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-text-primary tracking-tight">Forge your workspace</h2>
                </div>
                <p className="text-sm text-text-tertiary font-medium">Select a blueprint to provision your board in seconds.</p>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-border-light shadow-sm self-start md:self-center">
                <button
                  onClick={() => setActiveCategory('basic')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'basic' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-text-tertiary hover:bg-bg-secondary'}`}
                >
                  Basic Shells
                </button>
                <button
                  onClick={() => setActiveCategory('developer')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'developer' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-text-tertiary hover:bg-bg-secondary'}`}
                >
                  Developer Core
                </button>
              </div>

              <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-border-light absolute top-10 right-10 md:static">
                <X size={24} className="text-text-tertiary" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 custom-scrollbar bg-white">
              <AnimatePresence mode='popLayout'>
                {filteredTemplates.map((template, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className="group relative rounded-2xl border border-border-light bg-white hover:border-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all cursor-pointer overflow-hidden flex flex-col"
                  >
                    {/* Cover Image Header */}
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={template.coverImage}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <div className={`p-3 rounded-2xl ${template.color} shadow-lg`}>
                          {template.icon ? <template.icon size={20} /> : <Layout size={20} />}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <h3 className="text-lg font-bold text-white leading-tight">{template.name}</h3>
                        <div className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded text-[8px] font-black uppercase tracking-widest text-white border border-white/10">
                          {template.lists.length} Lists
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 gap-4">
                      <p className="text-xs text-text-tertiary leading-relaxed font-medium line-clamp-2">{template.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {template.lists.slice(0, 3).map(list => {
                          const title = typeof list === 'string' ? list : list.title;
                          return (
                            <span key={title} className="px-2 py-0.5 bg-bg-secondary/80 rounded-full text-[8px] font-bold text-text-secondary uppercase tracking-tight">
                              {title}
                            </span>
                          );
                        })}
                        {template.lists.length > 3 && (
                          <span className="px-2 py-0.5 bg-bg-secondary/80 rounded-full text-[8px] font-bold text-text-tertiary uppercase tracking-tight">
                            +{template.lists.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-light group-hover:border-brand-primary/20">
                        <div className="flex items-center gap-2">
                          <Info size={12} className="text-brand-primary opacity-40" />
                          <span className="text-[9px] font-black uppercase text-text-tertiary">Premium Guide Incl.</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(template);
                          }}
                          className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
                        >
                          Use
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-8 bg-bg-secondary/30 border-t border-border-light text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary/50">
                Select a template to automatically configure lists and start working.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TemplateGallery;
