export const BLOG_POSTS = {
  'velocity-is-the-only-metric': {
    title: 'Why velocity is the only metric.',
    category: 'Product',
    date: 'April 10, 2026',
    author: 'Alex Rivera',
    authorRole: 'Founder & CEO',
    authorImg: '/assets/marketing/lead_alex.png',
    image: '/assets/marketing/blog_featured.png',
    readTime: '15 min',
    content: `
      <p class="lead">In the modern tech landscape, speed isn't just an advantage—it's a survival mechanism. We break down why the fastest teams always win, and how to build a culture that moves at lightspeed.</p>

      <h2>The Acceleration Paradox</h2>
      <p>Ten years ago, a team could spend six months on a "discovery phase" before writing a single line of production code. Today, that discovery phase is happening in real-time, in production, with millions of users providing instant feedback loops. The risk is no longer "shipping the wrong thing slowly," it is "shipping anything at all while your competitors evolve three generations past you."</p>

      <p>Velocity is often misunderstood as "working harder" or "writing more code." In reality, velocity is the vector of speed plus direction. A team that writes 10,000 lines of code a day but has to rewrite 9,000 of them tomorrow has zero velocity. A team that writes 100 lines of code that move the product 1% closer to the user's core need has infinite velocity compared to the first team.</p>

      <h2>The Cost of Hesitation</h2>
      <p>Every day that a decision is delayed is a day of compound interest lost. In product development, decisions have a half-life. A decision made today with 70% of the information is almost always better than a decision made in two weeks with 90% of the information. Why? Because the two weeks of learning you gain from being "wrong early" is worth significantly more than the 20% information gap.</p>

      <blockquote>"Most decisions should probably be made with somewhere around 70% of the information you wish you had. If you wait for 90%, in most cases, you’re probably being slow." — Jeff Bezos</blockquote>

      <h2>Building for Flow</h2>
      <p>At FlowBoard, we measure velocity not by story points, but by the "Inspiration to Production" (ITP) time. How long does it take for an engineer to have an idea, validate it, and see it in the hands of a user? If that time is measured in weeks, your organization has a terminal case of friction. If it's measured in hours, you are unstoppable.</p>

      <p>To achieve this, we had to eliminate the traditional gatekeepers. Engineers at FlowBoard have high agency—they don't ask for permission to improve the product; they are expected to move the needle every day. Our technical stack—Supabase, Next.js, and Vercel—is chosen specifically because it removes infrastructure as a bottleneck. We focus on the product, while the platform handles the plumbing.</p>

      <h2>The Human Element</h2>
      <p>High velocity requires high trust. You cannot move fast if you are looking over your shoulder. We hire "practitioners"—people who are masters of their craft and possess a natural instinct for the "next right move." When you put a group of practitioners together and give them a clear mission, velocity happens naturally.</p>

      <p>However, velocity without rest is just burnout. We emphasize "sprint and recovery" cycles. High-intensity execution followed by deep reflection and rest. You can't maintain lightspeed indefinitely; you must have the discipline to power down, recalibrate, and then launch again.</p>

      <h2>Conclusion</h2>
      <p>As we move further into the age of AI-assisted development, raw output will become commoditized. The only thing that will differentiate successful teams is their ability to decide and execute with precision. Velocity will be the only metric that separates the frontiers from the forgotten.</p>
    `
  },
  'scaling-realtime-supabase': {
    title: 'Scaling Real-time State with Supabase',
    category: 'Engineering',
    date: 'April 8, 2026',
    author: 'Jane Doe',
    authorRole: 'Backend Lead',
    authorImg: '/assets/marketing/lead_sofia.png',
    image: '/assets/marketing/blog_engineering.png',
    readTime: '12 min',
    content: `
      <p class="lead">Achieving sub-50ms latency for board updates across thousands of concurrent users requires more than just a powerful database—it requires a fundamental reimagining of state synchronization.</p>

      <h2>The Challenge of Presence</h2>
      <p>In a collaborative tool like FlowBoard, "Real-time" isn't a feature; it's the core experience. When one user moves a card, every other user on that board needs to see that movement instantly. If there is a delay of even 200ms, the experience starts to feel "disconnected" and "laggy."</p>

      <p>Traditional polling or even standard WebSocket implementations often struggle at scale when the complexity of the data being synchronized increases. We needed a system that could handle high-frequency updates (cursors, typing indicators, card movements) while maintaining absolute data integrity in Postgres.</p>

      <h2>Postgres as the Source of Truth</h2>
      <p>We chose Supabase because it allows us to treat Postgres as an event bus. Using **Realtime (Walrus)**, we can listen to changes in the Write-Ahead Log (WAL) and broadcast them to clients. However, simply listening to the WAL isn't enough for a complex board with hundreds of cards and dozens of lists.</p>

      <p>We implemented a tiered synchronization strategy:</p>
      <ul>
        <li><strong>High Frequency (Ephemeral):</strong> Cursor positions and active selections are broadcast via Broadcast channels, bypassing the database entirely for speed.</li>
        <li><strong>Medium Frequency (Persistent):</strong> Card moves and content edits are committed to Postgres, and and clients are notified via WAL replication.</li>
        <li><strong>Low Frequency (Background):</strong> Metadata updates and audit logs are processed via background triggers to keep the main user thread unblocked.</li>
      </ul>

      <h2>Optimizing the Pipeline</h2>
      <p>To keep latency sub-50ms, we had to optimize every hop in the network. We utilize Supabase's Edge Functions to handle heavy computations (like calculating complex permissions) closer to the user. This reduces the round-trip time to our core database cluster.</p>

      <p>Additionally, we use Postgres **Row Level Security (RLS)** as a first-class citizen in our real-time filters. This ensures that users only receive updates for the boards they are authorized to see, drastically reducing the "noisy neighbor" problem in our replication slots.</p>

      <h2>The Future: Local-First</h2>
      <p>While our current Supabase-centric architecture is highly performant, we are exploring a "Local-First" approach using CRDTs (Conflict-free Replicated Data Types). This would allow FlowBoard to work completely offline, with the Supabase connection acting as a transparent synchronization layer when the user comes back online.</p>

      <p>Scaling real-time systems is a journey of constant refinement. By standing on the shoulders of Postgres and Supabase, we've built a foundation that can support the next generation of collaborative teams.</p>
    `
  },
  'psychology-of-glassmorphism': {
    title: 'The Psychology of Glassmorphism',
    category: 'Design',
    date: 'March 25, 2026',
    author: 'John Smith',
    authorRole: 'Product Designer',
    authorImg: '/assets/marketing/lead_marcus.png',
    image: '/assets/marketing/blog_design.png',
    readTime: '8 min',
    content: `
      <p class="lead">Depth, transparency, and micro-interactions aren't just aesthetic choices—they are cognitive tools used to reduce complexity and increase user focus.</p>

      <h2>Visual Hierarchy in 3D</h2>
      <p>In traditional flat design, everything exists on the same Z-plane. This requires the user to process "importance" using only size and color. In the FlowBoard design system, we use **Glassmorphism** to introduce a third dimension: Depth.</p>

      <p>By using frosted glass effects (white/10 background with backdrop-blur), we create layers of information. The "Active Board" feels like it sits on top of the "Workspace," which in turn sits on top of the "Desktop." This visual layering maps directly to how the human brain processes physical objects—we instinctively know which layer is the most relevant because it is "closest" to us.</p>

      <h2>Reducing Cognitive Load</h2>
      <p>Transparency allows the user to maintain context. In FlowBoard, when you open a card's details, the board behind it remains slightly visible but blurred. This "persistence of context" means the brain doesn't have to "flush its cache" when a modal opens. You still know exactly where you are and what you were doing before the modal appeared.</p>

      <p>This reduces the psychological cost of "drilling down" into details. It encourages exploration because the "way back" is always visually present.</p>

      <h2>The Role of Micro-interactions</h2>
      <p>Glassmorphism truly comes alive through interaction. When you hover over a card, the shadow deepens and the blur intensity shifts. These subtle animations provide immediate bio-feedback: "You are interacting with this object." This creates a "Flow" state where the interface feels like a natural extension of the user's intent.</p>

      <p>We also use "Chromatic Glows"—subtle colorful lights behind cards—to indicate priority or status. These glows interact with the glass layers, creating a vibrant, premium feel that makes the administrative task of moving cards feel like "painting with light."</p>

      <h2>Conclusion</h2>
      <p>Good design is invisible. By leveraging the principles of physics and psychology, we've created an interface that doesn't just look beautiful, but actually makes people better at their jobs. Flow isn't just a product name; it's the mental state we design for every day.</p>
    `
  },
  'work-life-flow': {
    title: 'Work-Life Flow: Beyond Balance',
    category: 'Culture',
    date: 'March 10, 2026',
    author: 'Alice Wonderland',
    authorRole: 'People Ops',
    authorImg: '/assets/marketing/lead_elena.png',
    image: '/assets/marketing/blog_culture.png',
    readTime: '15 min',
    content: `
      <p class="lead">How our team maintains high throughput while prioritizing mental well-being, async communication, and flexible hours in a remote-first world.</p>

      <h2>Balance is a Myth</h2>
      <p>The term "Work-Life Balance" implies that work and life are two opposing forces on a scale. If you give to one, you must take from the other. At FlowBoard, we prefer the concept of **Work-Life Flow**. We believe that work is a part of life, and when managed correctly, it should energize rather than deplete you.</p>

      <p>Flow means that you have the agency to decide when, where, and how you do your best work. For some, that's a 4-hour block of deep work at 5:00 AM. For others, it's a series of collaborative bursts interspersed with personal time throughout the day.</p>

      <h2>The Async First Mandate</h2>
      <p>Meetings are the greatest threat to Flow. Every scheduled meeting is a brick in a wall that blocks productivity. We are an "Async First" company. This means that if a conversation can happen in a FlowBoard comment or a video update (Loom), it *should* happen there.</p>

      <p>By defaulting to asynchronous communication, we protect everyone's "Deep Work" time. This allows our team members to live across 14 time zones without feeling like they need to be "on" at 3:00 AM for a status update. We value output over "green dots" on a status bar.</p>

      <h2>Mental Health as Infrastructure</h2>
      <p>Psychological safety is the bedrock of performance. We provide unlimited mental health support to all team members and encourage "Low-Battery Days"—no-questions-asked time off when you need to recharge your cognitive energy.</p>

      <p>We also believe that physical space matters. Even though we are remote-first, we provide every team member with a generous budget to build their "Flow Sanctum"—the physical environment where they feel most inspired and comfortable.</p>

      <h2>Conclusion</h2>
      <p>The future of work isn't about working from home; it's about working from a state of well-being. By building a culture that respects the human "Flow," we not only build a better product, but we also build a more sustainable and fulfilled team.</p>
    `
  },
  'future-of-visual-pm': {
    title: 'The Future of Visual Project Management',
    category: 'Product',
    date: 'February 28, 2026',
    author: 'Alex Rivera',
    authorRole: 'CEO & Founder',
    authorImg: '/assets/marketing/lead_alex.png',
    image: '/assets/marketing/blog_product.png',
    readTime: '10 min',
    content: `
      <p class="lead">Our roadmap for 2026 and why we believe AI won\'t replace project managers, but will instead give them superpowers to focus on strategic execution.</p>

      <h2>The End of Data Entry</h2>
      <p>For decades, project management has been synonymous with "updating the tracker." Project managers spend 70% of their time chasing status updates and 30% actually managing projects. In 2026, those numbers will flip.</p>

      <p>With the integration of **Autonomous Card Agents** in FlowBoard, the board will update itself. By monitoring code commits, Slack conversations, and document edits, our AI engine can predict a project's status and flag bottlenecks before they happen. The "tracker" becomes a "prophet," not a "ledger."</p>

      <h2>Holographic Collaboration</h2>
      <p>We are currently prototyping **Spatial Flow**—a VR/AR extension for FlowBoard. Imagine walking into a literal 3D "war room" where your project boards are physical objects you can move with your hands. This isn't just science fiction; it's the next logical step for visual thinkers who need to see the "shape" of their work to understand it fully.</p>

      <h2>AI as a Strategic Co-pilot</h2>
      <p>AI will not decide *what* to build, but it will help you decide *when* to build it. Our upcoming "Velocity Predictor" uses historical team data to provide probabilistic timelines for complex missions. It can suggest resource re-allocations in real-time to ensure your most critical goals are met.</p>

      <h2>The Human Core</h2>
      <p>Despite all the technological advancements, the core of project management remains human. Empathy, leadership, and vision cannot be automated. FlowBoard's mission is to remove all the administrative friction so that humans can focus on the only thing that matters: The Mission.</p>

      <p>Join us as we build the tools for the next frontier of human collaboration.</p>
    `
  }
};
