export const problems = [
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener',
    category: 'HLD',
    icon: '🔗',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['api design', 'databases', 'hashing'],
    summary:
      'Design a service like Bitly that turns long URLs into short, shareable links and redirects visitors back to the original.',
    statement:
      'Your interviewer wants you to design a URL shortening service. Users submit a long URL and receive a short alias. Visiting the short link redirects the visitor to the original URL. Walk through the API, data model, and the encoding scheme you would use to generate short codes, then discuss how the system scales.',
    functionalRequirements: [
      'Given a long URL, generate a unique short URL',
      'Given a short URL, redirect the user to the original long URL',
      'Users can optionally pick a custom alias',
      'Links can expire after a configurable time period',
    ],
    nonFunctionalRequirements: [
      'Redirects should feel instantaneous (low latency)',
      'The system should be highly available — a shortener that is down is useless',
      'Short codes should not be easily guessable in sequence',
      'The system should be resilient to hot links (celebrity effect)',
    ],
    constraints: [
      '100M new links created / day',
      '10:1 read/write ratio',
      '7 char short code',
      '5 year data retention',
    ],
  },
  {
    id: 'rate-limiter',
    title: 'Design a Rate Limiter',
    category: 'HLD',
    icon: '⏱️',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['distributed systems', 'algorithms', 'caching'],
    summary:
      'Design a rate limiting service that throttles clients hammering an API, and discuss the tradeoffs between different throttling algorithms.',
    statement:
      'Design a rate limiter that can be dropped in front of an API to protect it from being overwhelmed by a single client. Consider it as a standalone service other teams can call before processing a request. Cover the algorithm choice, where state lives, and how the limiter behaves across a fleet of servers.',
    functionalRequirements: [
      'Limit the number of requests a client can make in a given time window',
      'Different limits for different API endpoints or client tiers',
      'Clients receive a clear signal (status code + headers) when throttled',
      'Limits can be updated by admins without a redeploy',
    ],
    nonFunctionalRequirements: [
      'The limiter itself must add minimal latency',
      'Must work correctly across a horizontally scaled fleet of API servers',
      'Should fail open or closed predictably if the limiter store goes down',
      'Accuracy vs. memory/compute tradeoffs should be explicit',
    ],
    constraints: [
      '50K requests/sec peak traffic',
      'Sub-5ms overhead budget',
      'Multi-region deployment',
    ],
  },
  {
    id: 'news-feed',
    title: 'Design a News Feed',
    category: 'HLD',
    icon: '📰',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['fan-out', 'databases', 'caching'],
    summary:
      'Design the system behind a social feed like Twitter/X or Instagram, where users see a ranked stream of posts from people they follow.',
    statement:
      'Design a news feed system for a social network. Users follow other users, and when they open the app they see a feed of recent posts from the people they follow. Discuss how posts get from a writer to a reader\'s feed, how you would rank or order them, and how the design changes for users with millions of followers.',
    functionalRequirements: [
      'Users can post text, images, or short videos',
      'Users can follow / unfollow other users',
      'A user\'s feed shows posts from accounts they follow, most relevant first',
      'Feed supports infinite scroll / pagination',
    ],
    nonFunctionalRequirements: [
      'Feed loads should feel near-instant on app open',
      'System must handle celebrity accounts with 50M+ followers',
      'Eventual consistency is acceptable for feed freshness',
      'Highly available for reads, even during partial outages',
    ],
    constraints: [
      '500M daily active users',
      '5B posts read / day',
      'Avg. 200 follows per user',
      'Some accounts have 50M+ followers',
    ],
  },
  {
    id: 'chat-system',
    title: 'Design a Chat System',
    category: 'HLD',
    icon: '💬',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['websockets', 'real-time', 'message queues'],
    summary:
      'Design a real-time messaging system like WhatsApp or Slack, covering delivery guarantees, presence, and group chats.',
    statement:
      'Design a one-on-one and group chat system. Messages should be delivered in real time when both parties are online, and queued for delivery when a recipient is offline. Cover the connection model, message ordering and delivery guarantees, and how you would support group conversations at scale.',
    functionalRequirements: [
      'Users can send 1:1 and group messages in real time',
      'Messages are delivered even if the recipient is offline (queued)',
      'Read receipts and typing indicators',
      'Message history is retrievable when a user opens a conversation',
    ],
    nonFunctionalRequirements: [
      'Low latency delivery for online users (sub-second)',
      'At-least-once delivery with client-side dedup, or exactly-once',
      'Ordering should be consistent within a conversation',
      'System should scale to millions of concurrent connections',
    ],
    constraints: [
      '20M concurrent connected users',
      '1M messages/sec at peak',
      'Group chats up to 500 members',
    ],
  },
  {
    id: 'distributed-cache',
    title: 'Design a Distributed Cache',
    category: 'HLD',
    icon: '🗄️',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['consistent hashing', 'replication', 'memory systems'],
    summary:
      'Design a distributed, in-memory key-value cache like Redis or Memcached that scales horizontally across many nodes.',
    statement:
      'Design a distributed caching layer that sits in front of a slower backing datastore. It should scale horizontally, survive node failures, and let you add or remove nodes without a full cache wipe. Discuss data partitioning, replication, eviction, and how clients discover the right node to talk to.',
    functionalRequirements: [
      'Standard get / set / delete key-value operations',
      'Configurable eviction policy (e.g. LRU) when memory is full',
      'Time-to-live (TTL) support per key',
      'Adding or removing a node should only reshuffle a small fraction of keys',
    ],
    nonFunctionalRequirements: [
      'Sub-millisecond read/write latency',
      'Horizontally scalable to hundreds of nodes',
      'Tolerant of individual node failure without full data loss',
      'Hot keys should not overload a single node',
    ],
    constraints: [
      '10TB of hot data',
      '2M ops/sec',
      '~200 cache nodes',
      'p99 latency under 1ms',
    ],
  },
  {
    id: 'ride-sharing',
    title: 'Design a Ride-Sharing Service',
    category: 'HLD',
    icon: '🚗',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['geospatial', 'matching', 'real-time'],
    summary:
      'Design the core of a ride-hailing platform like Uber: matching nearby riders and drivers in real time and tracking trips.',
    statement:
      'Design a ride-sharing platform. Riders request a trip, the system finds a nearby available driver, and both parties track the trip in real time until drop-off. Focus on how you\'d model and query location data efficiently, how matching works, and how the system stays consistent as driver locations change every few seconds.',
    functionalRequirements: [
      'Riders can request a ride and see nearby available drivers',
      'System matches a rider with a suitable nearby driver',
      'Both rider and driver see live location updates during a trip',
      'Trip lifecycle (requested → matched → in progress → completed) is tracked',
    ],
    nonFunctionalRequirements: [
      'Matching should happen within a couple of seconds',
      'Location updates need to be frequent but not overwhelm the backend',
      'System should handle regional demand spikes (e.g. concerts, weather)',
      'Strong consistency for trip state; eventual consistency acceptable for ETAs',
    ],
    constraints: [
      '5M active drivers',
      'Location ping every 4 seconds per driver',
      '1M ride requests/hour at peak',
    ],
  },
  /* ───── LLD Problems ───── */
  {
    id: 'parking-lot',
    title: 'Design a Parking Lot',
    category: 'LLD',
    icon: '🅿️',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['object-oriented design', 'state management', 'enums'],
    summary:
      'Design an object-oriented parking lot system that handles multiple vehicle types, spot allocation, and fee calculation.',
    statement:
      'Design a parking lot system. The lot has multiple levels, each with a fixed number of spots of different sizes (small, medium, large). Different vehicle types (motorcycle, car, bus) require different spot sizes. A ticket is issued at entry and fees are calculated on exit. Walk through the class hierarchy, spot assignment strategy, and fee calculation model.',
    functionalRequirements: [
      'Multiple parking levels, each with configurable spot capacity per size',
      'Assign the first available spot matching the vehicle type on entry',
      'Issue a ticket with entry timestamp and assigned spot',
      'Calculate fee on exit based on duration and vehicle type',
      'Display available spots per level / size on a board',
    ],
    nonFunctionalRequirements: [
      'Spot assignment should be O(1) or near-constant per level',
      'Handle concurrent entry / exit safely (no double-booking)',
      'Support adding new vehicle types without rewriting core logic',
    ],
    constraints: [
      '10 levels, ~200 spots per level',
      '3 vehicle types, 3 spot sizes',
      'Peak throughput: 60 entry/exit events per minute per level',
    ],
  },
  {
    id: 'library-management',
    title: 'Design a Library Management System',
    category: 'LLD',
    icon: '📚',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['object-oriented design', 'relationships', 'search'],
    summary:
      'Model a library with books, members, and borrowing — covering search, reservations, and due-date management.',
    statement:
      'Design a library management system. Members can search the catalog by title, author, or genre; borrow available copies; reserve checked-out books; and return them. The system tracks due dates, charges fines for late returns, and notifies members when a reserved book becomes available. Focus on the object model and the borrowing lifecycle.',
    functionalRequirements: [
      'Members can search books by title, author, or genre',
      'Members can borrow an available copy of a book',
      'Members can reserve a book if all copies are checked out',
      'System charges a fine for late returns (per-day)',
      'Notify a member when their reserved copy becomes available',
    ],
    nonFunctionalRequirements: [
      'Search should return results within a second',
      'Handle concurrent reservations and borrows without race conditions',
      'Fine calculation should be accurate even across system restarts',
    ],
    constraints: [
      '10K members, 100K book titles',
      'Avg. 3 copies per title',
      '1,000 transactions / day',
    ],
  },
  {
    id: 'atm-machine',
    title: 'Design an ATM Machine',
    category: 'LLD',
    icon: '🏧',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['state machines', 'security', 'concurrency'],
    summary:
      'Design the software for an ATM — card authentication, account selection, cash dispensing, and deposit handling.',
    statement:
      'Design the software that runs inside an ATM. A user inserts a card, enters a PIN, selects an account, and performs transactions: cash withdrawal, balance inquiry, or deposit. The ATM communicates with a banking backend. Cover the state machine for the user flow, the transaction model, and how you handle concurrent access to accounts.',
    functionalRequirements: [
      'Authenticate user via card number and PIN (max 3 attempts)',
      'Support checking / savings account selection',
      'Allow cash withdrawal (check balance, dispense)',
      'Allow balance inquiry',
      'Allow cash / check deposit (envelope model)',
      'Print a receipt on request',
    ],
    nonFunctionalRequirements: [
      'PIN must never be logged or stored in plaintext',
      'Session locks card after 3 failed PIN attempts',
      'Handle network failures mid-transaction (rollback or retry)',
      'Complete a withdrawal within 10 seconds or abort',
    ],
    constraints: [
      '5M cardholders, 20K ATMs nationwide',
      '~200 transactions / ATM / day',
      'Cash cassette holds ~2K bills per denomination',
    ],
  },
  {
    id: 'chess-game',
    title: 'Design a Chess Game',
    category: 'LLD',
    icon: '♟️',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['object-oriented design', 'game rules', 'validation'],
    summary:
      'Model a two-player chess game with full rule enforcement — move validation, check / checkmate detection, and piece hierarchy.',
    statement:
      'Design a chess game for two human players on the same device. The system should enforce all standard rules: piece movement, turn order, check detection, checkmate, and stalemate. Also support pawn promotion, castling, and en passant. Focus on the piece class hierarchy, the board model, and how validation flows from a move request to an updated board state.',
    functionalRequirements: [
      'Two players alternate turns; white moves first',
      'All 6 piece types with correct movement rules',
      'Detect check, checkmate, and stalemate',
      'Support special moves: castling, en passant, pawn promotion',
      'Track captured pieces and move history',
    ],
    nonFunctionalRequirements: [
      'Board state validation must be instant (sub-millisecond per move)',
      'Immutable board representation after each move (undo-friendly)',
      'Extensible to support new pieces or variants without breaking the game loop',
    ],
    constraints: [
      'Standard 8×8 board',
      '32 pieces at game start',
      'Average game ~40 moves',
    ],
  },
  {
    id: 'vending-machine',
    title: 'Design a Vending Machine',
    category: 'LLD',
    icon: '🥤',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['state machines', 'inventory', 'finite automata'],
    summary:
      'Model a vending machine that handles product selection, payment (cash / card), change dispensing, and inventory tracking.',
    statement:
      'Design a vending machine. A customer inserts money or taps a card, selects a product, and the machine dispenses it along with any change. The machine tracks inventory per slot and rejects selections for out-of-stock items. Model the states — idle, coin insertion, product selection, dispensing — and how you handle partial credit, insufficient change, and cancelled transactions.',
    functionalRequirements: [
      'Accept coins and bills (denominations configurable per machine)',
      'Support card / contactless payment',
      'Display product name and price per slot',
      'Dispense product and change when sufficient funds are inserted',
      'Reject transactions when insufficient change is available',
      'Vend selected item, update inventory, and return to idle state',
    ],
    nonFunctionalRequirements: [
      'State transitions must be safe under concurrent button presses',
      'Cannot dispense product or change without completed payment',
      'Inventory counts must remain accurate after power loss (persist periodically)',
    ],
    constraints: [
      '~30 product slots, ~10 items per slot',
      '5 coin / bill denominations accepted',
      'Peak usage: 10 transactions / minute',
    ],
  },
  {
    id: 'lru-cache',
    title: 'Design an LRU Cache',
    category: 'LLD',
    icon: '⚡',
    difficulty: 'Medium',
    estimatedTime: '35 min',
    tags: ['data structures', 'concurrency', 'memory systems'],
    summary:
      'Design a thread-safe Least Recently Used (LRU) cache with configurable capacity, eviction, and TTL support.',
    statement:
      'Design an in-memory LRU (Least Recently Used) cache. It stores key-value pairs up to a fixed capacity. When the cache is full, the least recently accessed entry is evicted. Implement get and put operations, both O(1) average. Support optional TTL per entry and make the cache safe for concurrent access from multiple threads. Discuss the data structure tradeoffs and how you would extend it to a distributed setting.',
    functionalRequirements: [
      'get(key) returns value or null; marks entry as recently used',
      'put(key, value) inserts or updates; evicts LRU entry if at capacity',
      'Configurable max capacity, settable at construction',
      'Optional TTL per entry — expired entries are evicted lazily on access',
      'Thread-safe for concurrent reads and writes',
    ],
    nonFunctionalRequirements: [
      'Both get and put must be O(1) average time',
      'Memory overhead per entry should be minimal',
      'Eviction policy must be deterministic and testable',
    ],
    constraints: [
      'Capacity: 1K — 1M entries',
      'Key size: ~32 bytes, Value size: up to 1MB',
      'Read-heavy workload (90:1 read/write ratio)',
    ],
  },
  {
    id: 'logging-framework',
    title: 'Design a Logging Framework',
    category: 'LLD',
    icon: '📝',
    difficulty: 'Easy',
    estimatedTime: '25 min',
    tags: ['design patterns', 'singleton', 'strategy pattern'],
    summary:
      'Design an extensible logging library with multiple log levels, output sinks, and configurable formatting.',
    statement:
      'Design a logging framework that applications can use to log messages at different severity levels (DEBUG, INFO, WARN, ERROR). Logs can go to multiple destinations — console, file, database, or a remote service — each configurable at runtime. Support a flexible formatting strategy and allow the minimum log level to be set per sink. Walk through the class hierarchy, the pattern choices (Singleton for the logger, Strategy for sinks and formatters), and thread safety.',
    functionalRequirements: [
      'Support multiple log levels: DEBUG, INFO, WARN, ERROR, FATAL',
      'Messages can be sent to multiple sinks simultaneously (console, file, DB, remote)',
      'Each sink has its own configurable minimum log level threshold',
      'Pluggable formatting (plain text, JSON, custom) per sink',
      'Configuration can be updated at runtime without restart',
    ],
    nonFunctionalRequirements: [
      'Logging overhead should be minimal when the message is below the threshold',
      'Must be thread-safe — concurrent calls from different threads should not interleave',
      'Sinks should not block the application thread (async flushing where possible)',
    ],
    constraints: [
      '10K+ log calls / second under peak load',
      'Support 5+ different sink types',
      'Operates in memory-constrained environments (e.g., 64MB heap)',
    ],
  },
  {
    id: 'task-scheduler',
    title: 'Design a Task Scheduler',
    category: 'LLD',
    icon: '⏰',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['concurrency', 'priority queue', 'threading'],
    summary:
      'Design a scheduled task executor that runs callbacks at specified times or intervals, with priority support and graceful shutdown.',
    statement:
      'Design a task scheduler library. Clients can submit tasks to run at a specific time (one-shot), repeatedly on a fixed interval, or with a given priority. The scheduler uses a pool of worker threads to execute tasks. Cover how you store and order pending tasks, how worker threads pick up the next task to run, and how you handle graceful shutdown — completing in-flight tasks while draining the queue without accepting new ones.',
    functionalRequirements: [
      'Schedule a one-shot task to run at a specific time (absolute or delay)',
      'Schedule a recurring task with a fixed rate or fixed delay',
      'Support priority ordering — higher priority tasks run before lower ones',
      'Cancel a scheduled task by ID before it executes',
      'Graceful shutdown: finish executing tasks, stop accepting new ones',
    ],
    nonFunctionalRequirements: [
      'Task execution must not block the scheduling of other tasks',
      'Timer precision should be within tens of milliseconds',
      'Minimize context-switching overhead when the queue is idle',
    ],
    constraints: [
      '10K scheduled tasks at any time',
      '4–16 worker threads (configurable)',
      'Peak submission rate: 500 tasks / second',
    ],
  },
  {
    id: 'pub-sub-system',
    title: 'Design a Pub-Sub Messaging System',
    category: 'LLD',
    icon: '📡',
    difficulty: 'Hard',
    estimatedTime: '45 min',
    tags: ['observer pattern', 'async messaging', 'event-driven'],
    summary:
      'Design an in-process pub-sub message bus with topic filtering, subscriber groups, and delivery guarantees.',
    statement:
      'Design an in-process publish-subscribe message bus. Publishers send messages to named topics. Subscribers register interest in one or more topics and receive messages asynchronously. Support wildcard topic matching (e.g., "events.*"), subscriber groups for competing consumers, and configurable delivery guarantees (at-most-once / at-least-once). Discuss the threading model, how you handle slow subscribers (back-pressure), and how subscribers can subscribe / unsubscribe at runtime without affecting delivery.',
    functionalRequirements: [
      'Publish a message to a topic; all matching subscribers receive it',
      'Subscribe to a topic with optional wildcard pattern matching',
      'Subscriber groups — only one subscriber per group receives the message',
      'Configurable delivery guarantee per subscription (at-most-once / at-least-once)',
      'Unsubscribe at runtime without disrupting other subscribers',
    ],
    nonFunctionalRequirements: [
      'Publishing should not block the publisher (async delivery)',
      'Slow subscribers must not starve other subscribers of the same topic',
      'Subscriber callbacks must not block the internal message dispatch loop',
      'Minimal overhead when no subscribers are registered for a topic',
    ],
    constraints: [
      '10K+ topics, 100K+ subscribers',
      '50K messages / second peak throughput',
      'Subscriber callback budget: < 100ms per message before back-pressure applied',
    ],
  },
  {
    id: 'tic-tac-toe',
    title: 'Design a Tic-Tac-Toe Game',
    category: 'LLD',
    icon: '❌',
    difficulty: 'Easy',
    estimatedTime: '20 min',
    tags: ['object-oriented design', 'game logic', 'validation'],
    summary:
      'Build a tic-tac-toe game engine with win detection, board validation, and an extensible move strategy.',
    statement:
      'Design a tic-tac-toe game engine that can be used by a CLI, GUI, or web frontend. Two players take turns placing their mark (X or O) on a 3×3 grid. The engine must detect a win (three in a row, column, or diagonal), a draw (board full with no winner), and reject invalid moves. Keep the board logic decoupled from any UI so the same engine can drive a bot player, a local game, or a networked match in the future.',
    functionalRequirements: [
      'Two players alternate placing X and O on a 3×3 board',
      'Detect win conditions: row, column, or diagonal',
      'Detect a draw when the board is full with no winner',
      'Reject invalid moves (cell already occupied, game already over)',
      'Reset the board for a new game without recreating the object',
    ],
    nonFunctionalRequirements: [
      'Board validation and win detection must be O(1) or O(board size)',
      'Game state should be immutable after each move (snapshot pattern)',
      'Engine should be UI-agnostic — no rendering logic in the model',
    ],
    constraints: [
      'Standard 3×3 board',
      '2 players, ~9 moves per game',
      'No external dependencies required for the engine',
    ],
  },
]

export function getProblemById(id) {
  return problems.find((p) => p.id === id)
}

export function getProblemsByCategory(category) {
  return problems.filter((p) => p.category === category)
}
