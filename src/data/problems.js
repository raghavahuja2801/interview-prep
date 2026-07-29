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
  {
    id: 'autocomplete-search',
    title: 'Design Autocomplete for Search Engines',
    category: 'HLD',
    icon: '🔍',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['tries', 'caching', 'ranking'],
    summary:
      'Design a typeahead / autocomplete service that suggests search queries as a user types, like Google Search suggestions.',
    statement:
      'Design an autocomplete system for a search engine. As a user types into the search box, the system should return the top-k most relevant query suggestions in real time. Cover how you would index historical queries, rank suggestions by popularity/recency, and keep suggestions fast as the prefix grows character by character.',
    functionalRequirements: [
      'Return top-k suggestions for a given prefix as the user types',
      'Suggestions ranked by popularity (search frequency) and recency',
      'New popular queries should surface in suggestions within a reasonable time',
      'Support per-user or per-locale personalization (optional)',
    ],
    nonFunctionalRequirements: [
      'Suggestions must return in under 100ms per keystroke',
      'System should handle spikes in query volume around trending topics',
      'Index updates should not block read traffic',
      'Should degrade gracefully (empty/stale suggestions) rather than fail',
    ],
    constraints: [
      '5B searches / day',
      '~10M unique queries tracked',
      'p99 latency budget: 100ms',
    ],
  },
  {
    id: 'load-balancer',
    title: 'Design a Load Balancer',
    category: 'HLD',
    icon: '⚖️',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['networking', 'distributed systems', 'health checks'],
    summary:
      'Design a load balancer that distributes incoming traffic across a fleet of backend servers while handling failures gracefully.',
    statement:
      'Design a load balancer that sits in front of a pool of backend servers and distributes incoming requests across them. Cover the load balancing algorithms you would support (round robin, least connections, consistent hashing), how you detect and remove unhealthy backends, and how the balancer itself avoids becoming a single point of failure.',
    functionalRequirements: [
      'Distribute incoming requests across a pool of healthy backend servers',
      'Support multiple balancing strategies (round robin, least connections, weighted, consistent hashing)',
      'Perform periodic health checks and remove unhealthy backends from rotation',
      'Support dynamic addition/removal of backend servers without downtime',
    ],
    nonFunctionalRequirements: [
      'Load balancer must add minimal latency overhead',
      'The balancer itself should be highly available (no single point of failure)',
      'Should handle sudden traffic spikes without dropping connections',
      'Session affinity (sticky sessions) should be configurable',
    ],
    constraints: [
      '1M requests/sec peak',
      'Hundreds of backend servers',
      'Health check interval: 5s',
    ],
  },
  {
    id: 'cdn',
    title: 'Design a Content Delivery Network (CDN)',
    category: 'HLD',
    icon: '🌐',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['caching', 'networking', 'edge computing'],
    summary:
      'Design a CDN that caches and serves static content from edge locations close to users to reduce latency and origin load.',
    statement:
      'Design a content delivery network. Origin servers hold the source-of-truth content, and edge servers around the world cache copies close to end users. Discuss how requests get routed to the nearest edge, how cache invalidation and content updates propagate, and how you handle cache misses without overwhelming the origin.',
    functionalRequirements: [
      'Route a user request to the nearest/best edge server',
      'Cache static content (images, video, JS/CSS) at edge locations',
      'Fetch from origin on a cache miss and populate the edge cache',
      'Support cache invalidation / purging when origin content changes',
      'Support configurable TTLs per content type',
    ],
    nonFunctionalRequirements: [
      'Edge responses should be significantly faster than origin round trips',
      'Origin should be shielded from most traffic (high cache hit ratio)',
      'System should tolerate individual edge node failures',
      'Invalidation should propagate globally within a bounded time',
    ],
    constraints: [
      '100+ edge PoPs globally',
      '1M+ requests/sec across the network',
      '95%+ target cache hit ratio',
    ],
  },
  {
    id: 'distributed-key-value-store',
    title: 'Design a Distributed Key-Value Store',
    category: 'HLD',
    icon: '🗃️',
    difficulty: 'Easy',
    estimatedTime: '35 min',
    tags: ['consistent hashing', 'replication', 'CAP theorem'],
    summary:
      'Design a distributed key-value store like DynamoDB — partitioned, replicated, and tunable between consistency and availability.',
    statement:
      'Design a distributed key-value store that partitions data across many nodes and replicates it for durability. Discuss how you would partition keys (consistent hashing), how many replicas you\'d keep and how you\'d handle replica writes/reads, and where the system sits on the CAP spectrum.',
    functionalRequirements: [
      'Basic get(key) / put(key, value) / delete(key) operations',
      'Data is partitioned across nodes using consistent hashing',
      'Each key is replicated across N nodes for durability',
      'Support configurable read/write quorums',
    ],
    nonFunctionalRequirements: [
      'Horizontally scalable by adding nodes',
      'Tolerant of node failures without data loss',
      'Tunable consistency (strong vs. eventual) per operation',
      'Adding/removing a node should reshuffle only a small fraction of keys',
    ],
    constraints: [
      '500 nodes',
      '1M ops/sec',
      'Replication factor: 3',
    ],
  },
  {
    id: 'authentication-system',
    title: 'Design an Authentication System',
    category: 'HLD',
    icon: '🔐',
    difficulty: 'Easy',
    estimatedTime: '35 min',
    tags: ['security', 'sessions', 'tokens'],
    summary:
      'Design a centralized authentication service that verifies user identity and issues session/tokens for downstream services.',
    statement:
      'Design an authentication system for a platform with many downstream services. Users log in with credentials (or SSO/OAuth) and receive a token that downstream services can validate without hitting the auth service on every request. Cover the login flow, token format and refresh strategy, and how you\'d handle revocation and multi-device sessions.',
    functionalRequirements: [
      'Users can register and log in with email/password',
      'Support third-party login (OAuth / SSO)',
      'Issue short-lived access tokens and longer-lived refresh tokens',
      'Support logout and token revocation across devices',
      'Support multi-factor authentication (optional)',
    ],
    nonFunctionalRequirements: [
      'Token validation should not require a round trip to the auth service for every request',
      'Passwords must be securely hashed and never stored in plaintext',
      'System must resist brute-force and credential-stuffing attacks',
      'High availability — an outage should not lock every user out',
    ],
    constraints: [
      '50M registered users',
      '10K logins/sec peak',
      'Access token TTL: 15 min',
    ],
  },
  {
    id: 'upi-payments',
    title: 'Design a Unified Payments Interface (UPI)',
    category: 'HLD',
    icon: '💸',
    difficulty: 'Easy',
    estimatedTime: '35 min',
    tags: ['payments', 'idempotency', 'banking'],
    summary:
      'Design a real-time payments system like India\'s UPI that lets users transfer money between bank accounts instantly using a virtual address.',
    statement:
      'Design a unified payments interface that lets users send money to each other instantly using a virtual payment address (like a phone number or handle) instead of full bank account details. The system routes the transaction to the correct banks and settles it in real time. Cover the transaction flow, idempotency, and how you guarantee money is never duplicated or lost.',
    functionalRequirements: [
      'Users link a bank account to a virtual payment address',
      'Initiate a peer-to-peer transfer using the recipient\'s virtual address',
      'Route the transaction between the sender and receiver banks',
      'Provide real-time transaction status (success, pending, failed)',
      'Support transaction reversal on failure',
    ],
    nonFunctionalRequirements: [
      'Transactions must be idempotent — retries should never double-charge',
      'Strong consistency for balances; no double-spending',
      'High availability, since payments are a critical path',
      'Full auditability of every transaction',
    ],
    constraints: [
      '10B transactions / month',
      'Peak: 5K transactions/sec',
      'Settlement latency target: under 5 seconds',
    ],
  },

  /* ───── Medium ───── */
  {
    id: 'whatsapp',
    title: 'Design WhatsApp',
    category: 'HLD',
    icon: '📱',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['websockets', 'end-to-end encryption', 'message queues'],
    summary:
      'Design a global-scale messaging app like WhatsApp, covering encrypted delivery, media sharing, and group chats at massive scale.',
    statement:
      'Design WhatsApp. Users exchange end-to-end encrypted 1:1 and group messages, share media, and see delivery/read receipts. Focus on the connection and delivery model at global scale, how encryption keys are managed per conversation, and how the design differs from a generic chat system when you add encryption and massive scale.',
    functionalRequirements: [
      'Send and receive end-to-end encrypted 1:1 and group messages',
      'Share media (images, video, voice notes, documents)',
      'Delivery and read receipts, online/last-seen presence',
      'Message queuing for offline recipients',
    ],
    nonFunctionalRequirements: [
      'End-to-end encryption — server never sees plaintext',
      'Low latency delivery for online users worldwide',
      'Scale to billions of daily messages across regions',
      'Media transfer should not block message delivery',
    ],
    constraints: [
      '2B+ users, 100B+ messages/day',
      'Group chats up to 1024 members',
      'Multi-region, multi-device support',
    ],
  },
  {
    id: 'spotify',
    title: 'Design Spotify',
    category: 'HLD',
    icon: '🎵',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['streaming', 'CDN', 'recommendation'],
    summary:
      'Design a music streaming platform like Spotify — audio streaming, playlists, offline downloads, and recommendations.',
    statement:
      'Design Spotify. Users stream music on demand, build and share playlists, and get personalized recommendations. Cover how audio is encoded/streamed at different bitrates, how you\'d architect offline downloads for mobile, and how the recommendation pipeline fits into the overall system.',
    functionalRequirements: [
      'Stream audio tracks on demand with adaptive bitrate',
      'Create, edit, and share playlists',
      'Search for songs, artists, albums, playlists',
      'Support offline download for premium users',
      'Generate personalized recommendations (Discover Weekly-style)',
    ],
    nonFunctionalRequirements: [
      'Playback should start within a couple hundred milliseconds',
      'Stream quality should adapt to network conditions',
      'System should scale to hundreds of millions of concurrent listeners',
      'Recommendations can be computed asynchronously/offline',
    ],
    constraints: [
      '500M+ monthly active users',
      '100M+ songs in catalog',
      'Peak concurrent streams: tens of millions',
    ],
  },
  {
    id: 'instagram',
    title: 'Design Instagram',
    category: 'HLD',
    icon: '📷',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['media storage', 'fan-out', 'CDN'],
    summary:
      'Design a photo/video sharing app like Instagram, covering media upload/storage, the home feed, and stories.',
    statement:
      'Design Instagram. Users upload photos and videos, follow other users, and see a ranked feed of posts along with ephemeral stories. Cover media storage and delivery (thumbnails, transcoding), the feed generation strategy, and how stories differ architecturally from permanent posts.',
    functionalRequirements: [
      'Upload photos/videos with captions and tags',
      'Follow / unfollow users and view a ranked home feed',
      'Post and view 24-hour expiring stories',
      'Like, comment, and share posts',
      'Search users and hashtags',
    ],
    nonFunctionalRequirements: [
      'Media should be served quickly worldwide (CDN-backed)',
      'Feed should load near-instantly on app open',
      'System should support celebrity accounts with huge follower counts',
      'Stories should auto-expire without manual cleanup jobs blocking reads',
    ],
    constraints: [
      '500M+ daily active users',
      '100M+ photos/videos uploaded per day',
      'Some accounts have 100M+ followers',
    ],
  },
  {
    id: 'notification-service',
    title: 'Design a Notification Service',
    category: 'HLD',
    icon: '🔔',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['message queues', 'fan-out', 'push notifications'],
    summary:
      'Design a multi-channel notification system that sends push, email, and SMS notifications reliably at scale.',
    statement:
      'Design a notification service that other internal services call to notify end users via push notification, email, or SMS. Cover how requests are queued and routed to the right channel provider, how you handle retries and provider failures, user preferences/opt-outs, and how you\'d prevent duplicate or spammy notifications.',
    functionalRequirements: [
      'Accept notification requests from internal services via an API',
      'Route notifications to push, email, or SMS providers based on user preference',
      'Support templated notifications with dynamic content',
      'Respect user opt-out / do-not-disturb preferences',
      'Retry failed deliveries with backoff',
    ],
    nonFunctionalRequirements: [
      'Should not become a bottleneck for the services calling it (async, queued)',
      'Deduplicate near-identical notifications within a short window',
      'High throughput during bursty events (e.g. breaking news)',
      'Delivery should be at-least-once with idempotency on the client side',
    ],
    constraints: [
      '1B+ notifications/day',
      'Peak: 100K notifications/sec',
      '3+ delivery channels (push, email, SMS)',
    ],
  },
  {
    id: 'distributed-job-scheduler',
    title: 'Design a Distributed Job Scheduler',
    category: 'HLD',
    icon: '🗓️',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['distributed systems', 'leader election', 'queues'],
    summary:
      'Design a distributed job scheduler (like a distributed cron) that reliably triggers jobs across a fleet of worker machines.',
    statement:
      'Design a distributed job scheduler that lets teams register jobs to run on a schedule (cron-like) or on demand, and executes them reliably across a fleet of workers even as machines join, leave, or fail. Cover leader election, job partitioning across workers, and how you guarantee a job runs exactly once (or at-least-once with idempotency) despite failures.',
    functionalRequirements: [
      'Register a job with a cron schedule or one-off trigger time',
      'Distribute job execution across a pool of worker nodes',
      'Guarantee a scheduled job triggers even if the scheduler node fails (leader election / failover)',
      'Track job execution history, retries, and failures',
      'Support job dependencies (run job B after job A succeeds)',
    ],
    nonFunctionalRequirements: [
      'No missed or duplicate triggers under normal failover',
      'Scale to a large number of concurrently scheduled jobs',
      'Workers should be able to join/leave the pool without disrupting running jobs',
      'Scheduling precision within seconds',
    ],
    constraints: [
      '1M+ scheduled jobs',
      'Thousands of worker nodes',
      'Trigger precision: within 1s',
    ],
  },
  {
    id: 'tinder',
    title: 'Design Tinder',
    category: 'HLD',
    icon: '❤️',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['geospatial', 'matching', 'recommendation'],
    summary:
      'Design a location-based matching app like Tinder — swiping, mutual-match detection, and geo-aware candidate ranking.',
    statement:
      'Design Tinder. Users are shown a stream of nearby candidate profiles to swipe on, and a match is created when two users both swipe right on each other. Cover how you\'d generate the candidate queue efficiently, detect mutual matches with low latency, and incorporate location and preference filters into ranking.',
    functionalRequirements: [
      'Show a user a queue of nearby candidates matching their preferences',
      'Record swipe (like/pass) actions',
      'Detect a mutual match instantly when both users swipe right',
      'Notify both users on match and open a chat',
      'Support filters (age range, distance, interests)',
    ],
    nonFunctionalRequirements: [
      'Candidate queue generation should feel instant',
      'Match detection latency should be near real-time',
      'System should avoid showing the same profile repeatedly',
      'Should scale to large concurrent active user bases in dense cities',
    ],
    constraints: [
      '50M+ daily active users',
      '1B+ swipes/day',
      'Location freshness: updated every few minutes',
    ],
  },
  {
    id: 'facebook',
    title: 'Design Facebook',
    category: 'HLD',
    icon: '📘',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['social graph', 'fan-out', 'databases'],
    summary:
      'Design a large-scale social network like Facebook, covering the social graph, news feed, and friend recommendations.',
    statement:
      'Design Facebook. Users maintain a bidirectional friend graph, post updates, and see a ranked feed aggregating friends\' activity. Discuss how you\'d store and query the social graph at scale, how the feed differs from a follower-based system (like Twitter) due to bidirectional friendships, and how friend recommendations work.',
    functionalRequirements: [
      'Send, accept, and manage friend requests (bidirectional relationship)',
      'Post text/photo/video updates visible to friends',
      'Generate a ranked news feed from friends\' activity',
      'Recommend new friends (people you may know)',
      'Support groups and pages',
    ],
    nonFunctionalRequirements: [
      'Social graph queries (mutual friends, degrees of separation) must be fast',
      'Feed generation should scale to users with thousands of friends',
      'High availability for reads even during partial outages',
      'Eventual consistency acceptable for feed freshness',
    ],
    constraints: [
      '2B+ monthly active users',
      'Avg. 300 friends per user',
      'Billions of feed reads/day',
    ],
  },
  {
    id: 'twitter',
    title: 'Design Twitter',
    category: 'HLD',
    icon: '🐦',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['fan-out', 'timelines', 'search'],
    summary:
      'Design a microblogging platform like Twitter/X — tweeting, following, timelines, retweets, and trending topics.',
    statement:
      'Design Twitter. Users post short text updates (tweets), follow other users, and see a timeline of tweets from accounts they follow. Cover the fan-out strategy for celebrity accounts with tens of millions of followers, how retweets and replies are modeled, and how trending topics are computed.',
    functionalRequirements: [
      'Post a tweet (text, image, video, up to a character limit)',
      'Follow/unfollow users and view a home timeline',
      'Retweet and reply to tweets',
      'Compute trending topics/hashtags in near real-time',
      'Search tweets by keyword or hashtag',
    ],
    nonFunctionalRequirements: [
      'Timeline reads should be near-instant',
      'System must handle celebrity accounts with 100M+ followers (fan-out-on-read vs write)',
      'Trending topic computation should reflect activity within minutes',
      'High write throughput during major real-world events',
    ],
    constraints: [
      '500M+ tweets/day',
      '300M+ monthly active users',
      'Some accounts have 100M+ followers',
    ],
  },
  {
    id: 'reddit',
    title: 'Design Reddit',
    category: 'HLD',
    icon: '👽',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['ranking algorithms', 'comments', 'voting'],
    summary:
      'Design a link-aggregation and discussion platform like Reddit — communities, voting-based ranking, and nested comments.',
    statement:
      'Design Reddit. Users post links/text to topic-based communities (subreddits), vote on posts and comments, and content is ranked by a scoring algorithm that factors in votes and time decay. Cover how ranking is computed and kept fresh, how deeply nested comment threads are stored and rendered efficiently, and how you\'d prevent vote manipulation.',
    functionalRequirements: [
      'Create and join topic-based communities (subreddits)',
      'Submit posts (link or text) to a community',
      'Upvote/downvote posts and comments',
      'Nested/threaded commenting',
      'Rank posts per community using a score that factors votes and recency',
    ],
    nonFunctionalRequirements: [
      'Ranking should update quickly as votes come in without recomputing everything',
      'Deeply nested comment threads should still load performantly',
      'System should resist vote manipulation / brigading',
      'High read throughput for popular communities',
    ],
    constraints: [
      '100K+ active communities',
      '50M+ daily active users',
      'Some threads have 10K+ comments',
    ],
  },
  {
    id: 'netflix',
    title: 'Design Netflix',
    category: 'HLD',
    icon: '🎬',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['video streaming', 'CDN', 'transcoding'],
    summary:
      'Design a video streaming platform like Netflix — video upload/transcoding pipeline, adaptive streaming, and global delivery.',
    statement:
      'Design Netflix. Content is ingested and transcoded into multiple resolutions/bitrates, then streamed to users worldwide with adaptive bitrate playback. Cover the video processing pipeline, how content is distributed via CDN close to viewers, and how you\'d track resume-watching position and recommendations.',
    functionalRequirements: [
      'Ingest and transcode uploaded video into multiple resolutions/bitrates',
      'Stream video with adaptive bitrate based on network conditions',
      'Resume playback from last watched position across devices',
      'Browse catalog and get personalized recommendations',
      'Support subtitles and multiple audio tracks',
    ],
    nonFunctionalRequirements: [
      'Playback should start quickly with minimal buffering',
      'Video should be served from edge locations close to viewers',
      'System should handle massive simultaneous viewership (e.g. new season drops)',
      'Transcoding pipeline should scale horizontally and not block ingestion',
    ],
    constraints: [
      '250M+ subscribers',
      'Petabytes of video storage',
      'Peak concurrent streams: tens of millions',
    ],
  },
  {
    id: 'youtube',
    title: 'Design YouTube',
    category: 'HLD',
    icon: '▶️',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['video streaming', 'CDN', 'recommendation'],
    summary:
      'Design a video sharing platform like YouTube — upload/transcode pipeline, streaming, comments, and recommendations at massive scale.',
    statement:
      'Design YouTube. Any user can upload video, which is transcoded into multiple qualities and made available for streaming and download-restricted playback worldwide. Cover the upload/transcode pipeline, comment and like systems at scale, and the recommendation system driving the home page and "up next" queue.',
    functionalRequirements: [
      'Upload video, which is transcoded into multiple resolutions',
      'Stream video with adaptive bitrate playback',
      'Like, comment, and subscribe to channels',
      'Recommend videos on the home page and "up next"',
      'Search videos by title, description, and tags',
    ],
    nonFunctionalRequirements: [
      'Videos should start playing within a second or two',
      'Handle viral videos generating sudden massive traffic spikes',
      'Comment/like counts can be eventually consistent',
      'Transcoding pipeline must scale to huge daily upload volume',
    ],
    constraints: [
      '500+ hours of video uploaded per minute',
      '2B+ monthly active users',
      'Billions of video views/day',
    ],
  },
  {
    id: 'google-search',
    title: 'Design Google Search',
    category: 'HLD',
    icon: '🔎',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['web crawling', 'indexing', 'ranking'],
    summary:
      'Design a web search engine like Google — crawling the web, building an inverted index, and ranking results for a query.',
    statement:
      'Design a web search engine. The system crawls billions of web pages, builds a searchable index, and returns ranked results for a user query in milliseconds. Cover the crawling pipeline, the inverted index structure, and how ranking (relevance + authority signals like PageRank) combines with the index lookup to produce results quickly.',
    functionalRequirements: [
      'Crawl and periodically re-crawl web pages',
      'Build and maintain an inverted index mapping terms to documents',
      'Return ranked search results for a query within milliseconds',
      'Support basic query operators (phrase match, exclusion, site filter)',
      'Handle spelling correction / query suggestions',
    ],
    nonFunctionalRequirements: [
      'Query latency should be under a few hundred milliseconds',
      'Index should be updated continuously without full rebuilds',
      'Crawling should respect robots.txt and avoid overloading target sites',
      'System should scale to indexing tens of billions of pages',
    ],
    constraints: [
      'Tens of billions of web pages indexed',
      '100K+ queries/sec globally',
      'Index size: petabytes',
    ],
  },
  {
    id: 'ecommerce-amazon',
    title: 'Design an E-commerce Store like Amazon',
    category: 'HLD',
    icon: '🛒',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['inventory', 'order processing', 'search'],
    summary:
      'Design an e-commerce platform like Amazon — product catalog, search, cart/checkout, inventory, and order fulfillment.',
    statement:
      'Design an e-commerce platform. Users browse and search a product catalog, add items to a cart, check out, and track orders through fulfillment. Cover the product catalog and search architecture, how inventory is tracked and reserved during checkout to avoid overselling, and the order processing pipeline.',
    functionalRequirements: [
      'Browse and search the product catalog with filters',
      'Add items to a cart and check out with payment',
      'Reserve/deduct inventory atomically during checkout',
      'Track order status through fulfillment and shipping',
      'Support product reviews and ratings',
    ],
    nonFunctionalRequirements: [
      'Search should return relevant results within a couple hundred milliseconds',
      'Inventory must never go negative under concurrent checkouts',
      'System should handle flash-sale style traffic spikes',
      'Checkout/payment path must be highly reliable and auditable',
    ],
    constraints: [
      '500M+ products in catalog',
      'Peak: 100K orders/min during sales events',
      'Global multi-warehouse fulfillment',
    ],
  },
  {
    id: 'tiktok',
    title: 'Design TikTok',
    category: 'HLD',
    icon: '🎥',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['recommendation', 'video streaming', 'ranking'],
    summary:
      'Design a short-video platform like TikTok — upload, storage, and a heavily personalized "For You" recommendation feed.',
    statement:
      'Design TikTok. Users upload short videos, and the app\'s home feed ("For You") is an infinite, heavily personalized stream driven by engagement signals rather than a social graph. Cover the video upload/processing pipeline and the architecture of the recommendation system that ranks the next video to show.',
    functionalRequirements: [
      'Upload and process short-form video',
      'Serve an infinite-scroll "For You" feed personalized per user',
      'Track engagement signals (watch time, likes, shares, replays)',
      'Support comments, likes, duets/stitches',
      'Search videos, sounds, and hashtags',
    ],
    nonFunctionalRequirements: [
      'Next video should preload/prefetch to feel seamless while scrolling',
      'Recommendation model should incorporate near-real-time engagement signals',
      'System should scale to enormous daily video view volume',
      'Content moderation must run without blocking upload',
    ],
    constraints: [
      '1B+ monthly active users',
      'Billions of video views/day',
      'Personalization signal freshness: seconds to minutes',
    ],
  },
  {
    id: 'shopify',
    title: 'Design Shopify',
    category: 'HLD',
    icon: '🏬',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['multi-tenancy', 'e-commerce', 'databases'],
    summary:
      'Design a multi-tenant e-commerce platform like Shopify that lets independent merchants run their own online stores.',
    statement:
      'Design Shopify: a multi-tenant platform where independent merchants each get their own storefront, product catalog, and checkout, all built on shared infrastructure. Cover the multi-tenancy data model (shared vs. isolated storage per merchant), how checkout/payments are handled per storefront, and how you\'d isolate the "noisy neighbor" problem between merchants of very different sizes.',
    functionalRequirements: [
      'Merchants can create a storefront with their own catalog and branding',
      'Customers can browse a merchant\'s store and check out',
      'Support merchant-specific pricing, discounts, and inventory',
      'Provide merchants with order and sales analytics',
      'Support third-party apps/plugins per store',
    ],
    nonFunctionalRequirements: [
      'A traffic spike on one merchant\'s store should not degrade others (multi-tenancy isolation)',
      'Checkout must be reliable and PCI-compliant',
      'System should support merchants ranging from tiny shops to huge brands',
      'Storefronts should load quickly globally',
    ],
    constraints: [
      '2M+ merchant stores',
      'Peak: flash sales generating 100x normal traffic for a single store',
      'Global customer base',
    ],
  },
  {
    id: 'airbnb',
    title: 'Design Airbnb',
    category: 'HLD',
    icon: '🏠',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['search', 'booking', 'geospatial'],
    summary:
      'Design a home-sharing marketplace like Airbnb — listing search, availability calendars, and double-booking-free reservations.',
    statement:
      'Design Airbnb. Hosts list properties with availability calendars and pricing, guests search by location/dates/filters and book a stay. Cover the search architecture (geo + date-range filtering), how you prevent two guests from double-booking the same dates, and how pricing/availability updates propagate.',
    functionalRequirements: [
      'Hosts create listings with photos, pricing, and an availability calendar',
      'Guests search listings by location, date range, and filters',
      'Book a listing for specific dates without double-booking',
      'Support host/guest messaging',
      'Support reviews after a completed stay',
    ],
    nonFunctionalRequirements: [
      'Search must combine geospatial and date-range filtering efficiently',
      'Booking must be strongly consistent to prevent double-booking',
      'Search results should return within a few hundred milliseconds',
      'System should handle demand surges for popular destinations/events',
    ],
    constraints: [
      '7M+ active listings',
      'Peak: high-demand travel seasons',
      'Global, multi-currency, multi-timezone',
    ],
  },
  {
    id: 'distributed-message-queue',
    title: 'Design a Distributed Message Queue like Kafka',
    category: 'HLD',
    icon: '📬',
    difficulty: 'Medium',
    estimatedTime: '50 min',
    tags: ['message queues', 'partitioning', 'replication'],
    summary:
      'Design a distributed, partitioned, replicated message queue/log system like Apache Kafka for high-throughput event streaming.',
    statement:
      'Design a distributed message queue similar to Kafka. Producers append messages to topics, which are partitioned across brokers for scale and replicated for durability. Consumers read from partitions, tracking their own offsets. Cover partitioning strategy, replication and leader election per partition, and consumer group semantics.',
    functionalRequirements: [
      'Producers publish messages to a named topic',
      'Topics are split into partitions distributed across brokers',
      'Consumers read messages from partitions, tracking offsets',
      'Consumer groups allow parallel consumption without duplicate processing',
      'Messages are replicated across brokers for durability',
    ],
    nonFunctionalRequirements: [
      'High write throughput with sequential disk writes',
      'Configurable durability (ack after leader write vs. full replica quorum)',
      'Tolerate broker failure via leader election per partition',
      'Consumers should be able to replay from any offset',
    ],
    constraints: [
      'Millions of messages/sec',
      'Hundreds of brokers, thousands of partitions',
      'Replication factor: 3',
    ],
  },
  {
    id: 'flight-booking',
    title: 'Design a Flight Booking System',
    category: 'HLD',
    icon: '✈️',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['inventory', 'concurrency', 'search'],
    summary:
      'Design a flight booking platform like a travel site or airline reservation system — search, seat inventory, and booking.',
    statement:
      'Design a flight booking system. Users search for flights by route and date, view available seats and fares, and book a ticket. Cover how you model flight/seat inventory across many airlines, how you prevent overselling a flight under concurrent bookings, and how dynamic pricing fits in.',
    functionalRequirements: [
      'Search flights by origin, destination, date, and passenger count',
      'Show real-time seat availability and fare per flight',
      'Book a seat and issue a ticket with payment',
      'Support cancellations and rebooking',
      'Send booking confirmations and reminders',
    ],
    nonFunctionalRequirements: [
      'Seat booking must be strongly consistent (no overselling)',
      'Search should handle complex multi-leg, multi-airline queries quickly',
      'System must handle demand spikes around holidays/sales',
      'Booking flow must be reliable across payment gateway failures',
    ],
    constraints: [
      '100K+ flights/day across partner airlines',
      'Peak: 10K searches/sec, 1K bookings/sec',
      'Seat maps updated in real time',
    ],
  },
  {
    id: 'online-code-editor',
    title: 'Design an Online Code Editor',
    category: 'HLD',
    icon: '💻',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['sandboxing', 'real-time collaboration', 'containers'],
    summary:
      'Design a browser-based code editor and execution platform like Replit or CodeSandbox, including sandboxed code execution.',
    statement:
      'Design an online code editor where users write code in the browser and execute it against a backend runtime, optionally collaborating with others in real time. Cover how you\'d isolate/sandbox untrusted code execution, manage compute resources per session, and (optionally) support real-time multi-user editing.',
    functionalRequirements: [
      'Edit code in-browser with syntax highlighting across languages',
      'Execute submitted code in a sandboxed environment and return output',
      'Persist projects/files per user',
      'Support real-time collaborative editing (optional)',
      'Support multiple language runtimes/environments',
    ],
    nonFunctionalRequirements: [
      'Untrusted code execution must be securely sandboxed/isolated',
      'Execution should be resource- and time-bounded to prevent abuse',
      'Editor should feel responsive with low input latency',
      'System should scale to many concurrent isolated execution sessions',
    ],
    constraints: [
      '1M+ code executions/day',
      'Execution timeout: 10s per run',
      'Support 10+ languages/runtimes',
    ],
  },
  {
    id: 'analytics-platform',
    title: 'Design an Analytics Platform (Metrics & Logging)',
    category: 'HLD',
    icon: '📊',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['time-series', 'stream processing', 'aggregation'],
    summary:
      'Design a metrics and logging platform like Datadog — ingesting high-volume telemetry and serving dashboards/alerts.',
    statement:
      'Design an analytics platform for application metrics and logs. Services emit high-volume time-series metrics and log lines, which the platform ingests, aggregates, stores, and makes queryable for dashboards and alerting. Cover the ingestion pipeline, how you\'d store and roll up time-series data efficiently, and how alerting evaluates rules against streaming data.',
    functionalRequirements: [
      'Ingest high-volume metrics (counters, gauges, histograms) and logs from many services',
      'Aggregate/roll up metrics over configurable time windows',
      'Support dashboards querying arbitrary time ranges',
      'Support alerting rules that trigger notifications on thresholds',
      'Retain raw data short-term and downsampled data long-term',
    ],
    nonFunctionalRequirements: [
      'Ingestion pipeline must handle massive write throughput without data loss',
      'Query latency for dashboards should stay low even over large time ranges',
      'Alerting should evaluate with low delay to be actionable',
      'Storage costs should be controlled via downsampling/retention policies',
    ],
    constraints: [
      'Millions of metrics/sec ingested',
      'Petabyte-scale log storage',
      'Alert evaluation latency: under 1 minute',
    ],
  },
  {
    id: 'payment-system',
    title: 'Design a Payment System',
    category: 'HLD',
    icon: '💳',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['payments', 'idempotency', 'consistency'],
    summary:
      'Design a payment processing system that handles charging customers, talking to external payment gateways, and reconciliation.',
    statement:
      'Design a payment processing system used by an e-commerce or SaaS platform to charge customers via external payment gateways (card networks, banks). Cover the transaction state machine, how you guarantee exactly-once charging despite network failures and retries, and how reconciliation with the gateway works after the fact.',
    functionalRequirements: [
      'Initiate a charge against a customer\'s payment method via a gateway',
      'Support refunds and partial refunds',
      'Track transaction state through its full lifecycle (pending, succeeded, failed, refunded)',
      'Reconcile internal records against gateway settlement reports',
      'Support multiple payment methods and currencies',
    ],
    nonFunctionalRequirements: [
      'Charges must be idempotent — a retried request must never double-charge',
      'Strong consistency and full auditability of every transaction',
      'System must handle gateway outages gracefully (retry/queue, not fail silently)',
      'PCI compliance — no raw card data touches your own storage',
    ],
    constraints: [
      '10M+ transactions/day',
      'Multiple payment gateway integrations',
      'Reconciliation runs daily against settlement files',
    ],
  },
  {
    id: 'digital-wallet',
    title: 'Design a Digital Wallet',
    category: 'HLD',
    icon: '👛',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['ledger', 'consistency', 'payments'],
    summary:
      'Design a digital wallet (like Venmo or Apple Pay balance) that lets users hold balance and transfer money to each other.',
    statement:
      'Design a digital wallet system. Users hold a balance in-app, can top it up from a linked bank/card, transfer money to other users, and spend it at merchants. Cover the ledger design that tracks every balance change, how you ensure transfers are atomic (money never created or destroyed), and how you\'d support fast peer-to-peer transfers.',
    functionalRequirements: [
      'Users top up their wallet balance from a linked payment method',
      'Users transfer balance to other users instantly',
      'Users spend wallet balance at merchants/checkout',
      'Full transaction history per user',
      'Support withdrawal back to a bank account',
    ],
    nonFunctionalRequirements: [
      'All balance changes must be atomic and auditable (double-entry ledger)',
      'No transaction should ever create or destroy money',
      'Peer-to-peer transfers should feel instant',
      'System must be resilient to concurrent updates on the same wallet',
    ],
    constraints: [
      '20M+ active wallets',
      '5M+ transfers/day',
      'Peak: 1K transfers/sec',
    ],
  },

  /* ───── Hard ───── */
  {
    id: 'location-based-service',
    title: 'Design a Location-Based Service like Yelp',
    category: 'HLD',
    icon: '📍',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['geospatial', 'search', 'indexing'],
    summary:
      'Design a location-based business discovery service like Yelp — geospatial search, reviews, and ranking of nearby places.',
    statement:
      'Design a service like Yelp where users search for nearby businesses (restaurants, shops) by category and location, and leave reviews/ratings. Cover the geospatial indexing strategy (geohash / quad-tree) for efficient "nearby" queries, how ranking combines distance with rating and relevance, and how reviews are stored and aggregated.',
    functionalRequirements: [
      'Search for businesses near a given location and category',
      'Filter by rating, price, distance, open-now status',
      'Business owners can create/claim and update listings',
      'Users can leave reviews and ratings',
      'Show aggregated rating and review count per business',
    ],
    nonFunctionalRequirements: [
      'Nearby-search queries must return within a few hundred milliseconds',
      'Geospatial index must handle dense urban areas efficiently',
      'Review writes should not block search reads',
      'System should resist fake review manipulation',
    ],
    constraints: [
      '100M+ businesses listed',
      '10K+ searches/sec at peak',
      'Search radius: configurable, typically 1–25 miles',
    ],
  },
  {
    id: 'uber',
    title: 'Design Uber',
    category: 'HLD',
    icon: '🚕',
    difficulty: 'Hard',
    estimatedTime: '55 min',
    tags: ['geospatial', 'matching', 'real-time', 'pricing'],
    summary:
      'Design a full ride-hailing platform like Uber, extending core matching with surge pricing, ETAs, and multi-city dispatch.',
    statement:
      'Design Uber end-to-end. Beyond basic rider-driver matching, cover surge/dynamic pricing during high demand, ETA computation using road network data, driver dispatch strategy across a city partitioned into zones, and how the system stays consistent as both riders and drivers move in real time.',
    functionalRequirements: [
      'Riders request a trip and get matched to a nearby driver',
      'Real-time location tracking for both rider and driver during a trip',
      'Dynamic/surge pricing based on real-time supply and demand',
      'ETA estimation using road network and traffic data',
      'Trip lifecycle management and receipts',
    ],
    nonFunctionalRequirements: [
      'Matching should complete within a couple of seconds even during demand spikes',
      'Location updates from millions of drivers must be ingested without overwhelming the backend',
      'Pricing changes must propagate to riders/drivers consistently',
      'System should be partitionable by geography/city for scale and fault isolation',
    ],
    constraints: [
      '5M+ active drivers globally',
      '1M+ ride requests/hour at peak',
      'Location ping every few seconds per driver',
    ],
  },
  {
    id: 'food-delivery-doordash',
    title: 'Design a Food Delivery App like DoorDash',
    category: 'HLD',
    icon: '🍔',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['geospatial', 'matching', 'real-time'],
    summary:
      'Design a food delivery platform like DoorDash — connecting customers, restaurants, and delivery drivers with real-time tracking.',
    statement:
      'Design a food delivery platform connecting three parties: customers ordering food, restaurants preparing it, and drivers delivering it. Cover order placement and restaurant acceptance flow, how drivers are matched and routed to pick up and deliver orders, and how you\'d handle real-time ETA updates as the order moves through each stage.',
    functionalRequirements: [
      'Customers browse restaurants and place orders',
      'Restaurants receive, accept, and mark orders ready for pickup',
      'Match and dispatch a nearby available driver to the order',
      'Real-time order status and location tracking for the customer',
      'Handle order cancellations and refunds',
    ],
    nonFunctionalRequirements: [
      'Order-to-driver matching should minimize both wait and delivery time',
      'System must handle demand spikes (lunch/dinner rush)',
      'Real-time tracking should update with low latency',
      'Should gracefully handle a restaurant or driver going offline mid-order',
    ],
    constraints: [
      '1M+ active drivers',
      '10M+ orders/day',
      'Peak order rate: several thousand orders/min',
    ],
  },
  {
    id: 'google-docs',
    title: 'Design Google Docs',
    category: 'HLD',
    icon: '📄',
    difficulty: 'Hard',
    estimatedTime: '55 min',
    tags: ['CRDT', 'operational transform', 'real-time collaboration'],
    summary:
      'Design a real-time collaborative document editor like Google Docs, where multiple users edit the same document concurrently.',
    statement:
      'Design a collaborative document editor where multiple users can edit the same document simultaneously and see each other\'s changes in real time, with no conflicts and consistent final state. Cover the conflict resolution approach (Operational Transformation vs. CRDTs), how edits propagate between clients, and how you\'d support offline editing and later sync.',
    functionalRequirements: [
      'Multiple users can edit the same document concurrently',
      'Changes from one user appear on other users\' screens in near real time',
      'Resolve concurrent edits without data loss or conflicting final state',
      'Support offline editing with sync on reconnect',
      'Maintain version history / revisions',
    ],
    nonFunctionalRequirements: [
      'Edit propagation latency should be near real-time (sub-second)',
      'All clients must converge to the same final document state',
      'System must handle high edit frequency (fast typists, many collaborators)',
      'Document loading should be fast even for long documents with rich formatting',
    ],
    constraints: [
      'Documents with 100+ concurrent editors',
      'Millions of documents stored',
      'Edit propagation target: under 500ms',
    ],
  },
  {
    id: 'google-maps',
    title: 'Design Google Maps',
    category: 'HLD',
    icon: '🗺️',
    difficulty: 'Hard',
    estimatedTime: '55 min',
    tags: ['geospatial', 'routing algorithms', 'real-time traffic'],
    summary:
      'Design a mapping and navigation service like Google Maps — map tile serving, routing, and real-time traffic-aware ETAs.',
    statement:
      'Design Google Maps. The system serves map tiles for rendering, computes routes between two points on a road network, and factors in real-time traffic to give accurate ETAs and turn-by-turn navigation. Cover the map data model (road graph), the routing algorithm choice at scale (e.g. contraction hierarchies over Dijkstra), and how live traffic data feeds into route/ETA recalculation.',
    functionalRequirements: [
      'Serve map tiles for a given viewport/zoom level',
      'Compute the optimal route between two (or more) points',
      'Provide turn-by-turn navigation with live rerouting',
      'Incorporate real-time traffic into ETA and routing decisions',
      'Search for places/addresses (geocoding)',
    ],
    nonFunctionalRequirements: [
      'Route computation must return within a second even on large road networks',
      'Traffic data ingestion should update ETAs within minutes',
      'Map tile serving should be globally fast via edge caching',
      'System should handle a huge number of concurrent active navigations',
    ],
    constraints: [
      'Road network with hundreds of millions of edges',
      '1B+ active navigation sessions/day',
      'Live traffic updates from crowdsourced location pings',
    ],
  },
  {
    id: 'zoom',
    title: 'Design Zoom',
    category: 'HLD',
    icon: '📹',
    difficulty: 'Hard',
    estimatedTime: '55 min',
    tags: ['WebRTC', 'real-time media', 'SFU/MCU'],
    summary:
      'Design a video conferencing platform like Zoom, covering real-time audio/video transport, scaling to large meetings, and recording.',
    statement:
      'Design a video conferencing system. Multiple participants join a meeting and exchange real-time audio/video with low latency. Cover the media transport architecture (peer-to-peer vs. SFU vs. MCU), how you\'d scale a single meeting to hundreds of participants, and how recording/transcription would be layered on top without disrupting live delivery.',
    functionalRequirements: [
      'Users create and join meetings via a link/ID',
      'Real-time audio and video exchange between participants',
      'Screen sharing during a meeting',
      'Meeting recording and playback',
      'Chat messaging within a meeting',
    ],
    nonFunctionalRequirements: [
      'Audio/video latency should stay low enough for natural conversation (sub-200ms)',
      'System should scale a single meeting to hundreds/thousands of participants',
      'Must gracefully degrade video quality under poor network conditions',
      'Should tolerate individual participant connection drops without disrupting the meeting',
    ],
    constraints: [
      '300M+ daily meeting participants',
      'Meetings up to 1000+ participants',
      'Global multi-region media routing',
    ],
  },
  {
    id: 'dropbox',
    title: 'Design a File Sharing System like Dropbox',
    category: 'HLD',
    icon: '📦',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['file sync', 'chunking', 'deduplication'],
    summary:
      'Design a cloud file storage and sync service like Dropbox — file chunking, delta sync, and multi-device consistency.',
    statement:
      'Design Dropbox. Users store files in the cloud and sync them across multiple devices, with changes propagating efficiently (not re-uploading whole files on every edit). Cover file chunking and deduplication, the delta-sync protocol between client and server, and how you resolve sync conflicts when the same file is edited offline on two devices.',
    functionalRequirements: [
      'Upload and download files, organized into folders',
      'Sync file changes across all of a user\'s devices',
      'Only transfer changed portions of a file (delta sync), not the whole file',
      'Share files/folders with other users with permission levels',
      'Maintain file version history',
    ],
    nonFunctionalRequirements: [
      'Sync should be efficient — minimize bandwidth via chunking/deduplication',
      'System must handle conflicting concurrent edits from multiple devices',
      'High durability — files must never be lost',
      'Should scale to a huge number of files per user and total users',
    ],
    constraints: [
      '500M+ users',
      'Exabyte-scale total storage',
      'Files up to tens of GB',
    ],
  },
  {
    id: 'ticket-booking-bookmyshow',
    title: 'Design a Ticket Booking System like BookMyShow',
    category: 'HLD',
    icon: '🎟️',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['concurrency', 'inventory', 'seat locking'],
    summary:
      'Design a movie/event ticket booking platform like BookMyShow — seat selection, temporary holds, and overselling prevention.',
    statement:
      'Design a ticket booking system for movies or events. Users browse showtimes, pick specific seats on a seat map, and complete payment — all while preventing two users from booking the same seat. Cover the seat-locking/reservation mechanism during checkout, how holds expire if payment isn\'t completed, and how the system handles massive concurrent demand for popular releases.',
    functionalRequirements: [
      'Browse shows/events by venue, date, and time',
      'View a real-time seat map showing available/booked/held seats',
      'Temporarily hold selected seats while the user completes payment',
      'Release held seats automatically if payment isn\'t completed in time',
      'Confirm booking and issue tickets on successful payment',
    ],
    nonFunctionalRequirements: [
      'Seat holds must be strongly consistent — no double-booking under concurrency',
      'System must handle massive simultaneous demand for popular show openings',
      'Held-but-unpaid seats must be released reliably (no permanently stuck inventory)',
      'Booking confirmation should be fast to avoid poor user experience',
    ],
    constraints: [
      '10K+ venues, 100K+ shows',
      'Peak: tens of thousands of concurrent users booking the same popular show',
      'Seat hold timeout: ~5–10 minutes',
    ],
  },
  {
    id: 'distributed-web-crawler',
    title: 'Design a Distributed Web Crawler',
    category: 'HLD',
    icon: '🕷️',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['distributed systems', 'crawling', 'deduplication'],
    summary:
      'Design a distributed web crawler that discovers and fetches billions of web pages while respecting crawl politeness and avoiding duplicates.',
    statement:
      'Design a distributed web crawler that starts from a set of seed URLs, discovers new links, and fetches pages at massive scale across a cluster of crawler workers. Cover the URL frontier design (prioritization, politeness per domain), how you detect and avoid re-crawling/duplicate content, and how work is distributed and coordinated across workers.',
    functionalRequirements: [
      'Start from seed URLs and discover new links to crawl',
      'Fetch and store page content for downstream processing (e.g. indexing)',
      'Respect robots.txt and per-domain crawl-rate limits (politeness)',
      'Avoid re-crawling unchanged content and detect duplicate/near-duplicate pages',
      'Prioritize crawling of high-value or frequently-changing pages',
    ],
    nonFunctionalRequirements: [
      'Must scale horizontally across many crawler worker nodes',
      'Should not overwhelm any single target domain\'s servers',
      'Fault-tolerant — a crashed worker\'s in-flight URLs should be retried elsewhere',
      'URL frontier should avoid unbounded memory growth despite billions of discovered links',
    ],
    constraints: [
      'Billions of pages to crawl and re-crawl',
      'Thousands of crawler worker nodes',
      'Politeness: max N requests/sec per domain',
    ],
  },
  {
    id: 'code-deployment-system',
    title: 'Design a Code Deployment System',
    category: 'HLD',
    icon: '🚀',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['CI/CD', 'orchestration', 'rollback'],
    summary:
      'Design a CI/CD deployment platform that rolls out new application versions across a large fleet safely, with rollback support.',
    statement:
      'Design a deployment system that takes a built artifact and rolls it out across a large fleet of servers/containers, using strategies like canary or rolling deployment, with automatic rollback if health checks fail. Cover how deployments are orchestrated across regions/clusters, how health is monitored during rollout, and how rollback is triggered safely.',
    functionalRequirements: [
      'Deploy a new build/artifact to a target fleet of servers or containers',
      'Support deployment strategies: rolling, canary, blue-green',
      'Monitor health metrics during rollout and halt/rollback automatically on failure',
      'Support manual rollback to a previous known-good version',
      'Provide deployment status/audit history',
    ],
    nonFunctionalRequirements: [
      'Deployments should not cause downtime (zero/minimal-downtime rollout)',
      'Rollback should be fast — able to revert quickly if something goes wrong',
      'System should coordinate deployments across many regions/clusters safely',
      'Should prevent concurrent conflicting deployments to the same service',
    ],
    constraints: [
      '10K+ services deployed across the fleet',
      'Thousands of deployments/day org-wide',
      'Rollback target: under 1 minute',
    ],
  },
  {
    id: 'distributed-cloud-storage-s3',
    title: 'Design a Distributed Cloud Storage System like S3',
    category: 'HLD',
    icon: '☁️',
    difficulty: 'Hard',
    estimatedTime: '55 min',
    tags: ['object storage', 'replication', 'durability'],
    summary:
      'Design an object storage system like Amazon S3 — durable, highly available storage for arbitrarily large objects at massive scale.',
    statement:
      'Design a distributed object storage system like S3. Clients store and retrieve objects (blobs) by key within buckets, with extremely high durability and availability guarantees. Cover how objects are chunked, replicated (or erasure-coded) across storage nodes and failure domains, the metadata service that maps keys to physical locations, and how you\'d achieve "11 nines" durability.',
    functionalRequirements: [
      'Store and retrieve objects by key within a namespace (bucket)',
      'Support objects ranging from tiny to many terabytes (multipart upload)',
      'Support versioning of objects',
      'Support configurable durability/redundancy policies (replication vs. erasure coding)',
      'Provide access control per bucket/object',
    ],
    nonFunctionalRequirements: [
      'Extremely high durability (target: eleven 9s) via replication/erasure coding across failure domains',
      'High availability for reads and writes even during node/rack failures',
      'Metadata lookups must be fast even with trillions of objects',
      'System must scale storage capacity horizontally without downtime',
    ],
    constraints: [
      'Trillions of objects stored',
      'Exabyte-scale total capacity',
      'Durability target: 99.999999999%',
    ],
  },
  {
    id: 'distributed-locking-service',
    title: 'Design a Distributed Locking Service',
    category: 'HLD',
    icon: '🔒',
    difficulty: 'Hard',
    estimatedTime: '45 min',
    tags: ['consensus', 'distributed systems', 'fault tolerance'],
    summary:
      'Design a distributed lock manager like ZooKeeper/etcd\'s locking primitive, used to coordinate exclusive access across a cluster.',
    statement:
      'Design a distributed locking service that lets processes across a cluster acquire mutual-exclusion locks on named resources, safely even in the presence of network partitions and node failures. Cover the consensus mechanism backing the service, lock lease/expiry to handle crashed lock holders, and how you\'d avoid the classic split-brain problem where two clients believe they both hold the lock.',
    functionalRequirements: [
      'Clients can acquire and release a named lock',
      'Locks have a lease/TTL so a crashed holder doesn\'t block others forever',
      'Support blocking (wait for lock) and non-blocking (fail-fast) acquisition',
      'Notify waiting clients when a lock becomes available',
      'Support reentrant locks (optional)',
    ],
    nonFunctionalRequirements: [
      'Must guarantee mutual exclusion even during network partitions (no split-brain)',
      'Backed by a consensus protocol (e.g. Raft/Paxos) for correctness under failure',
      'Lock acquisition/release latency should be low',
      'Service itself must be highly available (odd-numbered node quorum)',
    ],
    constraints: [
      '5–7 node quorum cluster',
      'Tens of thousands of lock ops/sec',
      'Lease TTL: configurable, typically seconds',
    ],
  },
  {
    id: 'stack-overflow',
    title: 'Design Stack Overflow',
    category: 'LLD',
    icon: '❓',
    difficulty: 'Easy',
    estimatedTime: '35 min',
    tags: ['object-oriented design', 'voting', 'search'],
    summary:
      'Model a Q&A platform like Stack Overflow — questions, answers, voting, tags, and reputation.',
    statement:
      'Design a Q&A platform like Stack Overflow. Users post questions tagged by topic, other users post answers and comments, and the community upvotes/downvotes content and accepts a best answer. Focus on the object model for questions/answers/comments, how voting affects reputation, and how you\'d support searching by tag or keyword.',
    functionalRequirements: [
      'Users can post questions with tags and post answers to questions',
      'Users can comment on questions and answers',
      'Users can upvote/downvote questions and answers',
      'Question owner can mark one answer as accepted',
      'Search questions by tag, keyword, or user',
      'Track user reputation based on votes received',
    ],
    nonFunctionalRequirements: [
      'Vote counts should update in near real time',
      'Search should return results quickly even with a large question corpus',
      'Prevent a user from voting multiple times on the same post',
      'System should be extensible to new content types (e.g. bounties)',
    ],
    constraints: [
      '10M+ questions, 20M+ answers',
      '~5 votes per post on average',
      'Read-heavy workload',
    ],
  },
  {
    id: 'traffic-signal-system',
    title: 'Design a Traffic Signal Control System',
    category: 'LLD',
    icon: '🚦',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['state machines', 'concurrency', 'simulation'],
    summary:
      'Model a traffic signal controller for an intersection, cycling lights safely across multiple directions and signal groups.',
    statement:
      'Design a traffic signal control system for a road intersection. Each direction has its own light (red/yellow/green), and the controller must cycle them safely so that conflicting directions are never both green. Support configurable timing per light, pedestrian crossing signals, and emergency vehicle preemption. Focus on the state machine per signal and the coordination logic across the intersection.',
    functionalRequirements: [
      'Cycle each direction\'s signal through red → green → yellow → red',
      'Ensure conflicting directions are never green simultaneously',
      'Support configurable green/yellow duration per direction',
      'Support pedestrian crossing signals tied to a direction\'s red phase',
      'Support emergency vehicle preemption that forces a green for one direction',
    ],
    nonFunctionalRequirements: [
      'Signal state transitions must be safe under all conditions (no invalid conflicting states)',
      'System should recover to a safe default state after a power/reset event',
      'Timing changes should apply without requiring a full system restart',
    ],
    constraints: [
      '4-way intersection, up to 8 signal heads',
      'Cycle time: 60–120 seconds configurable',
      'Emergency preemption response: under 2 seconds',
    ],
  },
  {
    id: 'coffee-vending-machine',
    title: 'Design a Coffee Vending Machine',
    category: 'LLD',
    icon: '☕',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['state machines', 'recipes', 'inventory'],
    summary:
      'Model a coffee vending machine that brews different drinks from shared ingredients (water, milk, coffee, sugar) based on recipes.',
    statement:
      'Design a coffee vending machine that offers multiple drink types (espresso, latte, cappuccino, etc.), each requiring a recipe of shared ingredients like water, milk, coffee grounds, and sugar. The machine should reject a selection if any required ingredient is insufficient, and support refilling. Focus on the recipe/ingredient model and the dispense state machine.',
    functionalRequirements: [
      'Support multiple drink types, each defined by a recipe of ingredient quantities',
      'Check ingredient availability before starting a brew',
      'Deduct ingredient quantities after a successful dispense',
      'Reject selection and show an error if any ingredient is insufficient',
      'Support refilling individual ingredient containers',
      'Add/remove drink recipes without changing core dispensing logic',
    ],
    nonFunctionalRequirements: [
      'Ingredient checks and deduction must be atomic (no partial dispense on failure)',
      'Should handle concurrent selection attempts safely (single brew unit)',
      'Ingredient levels should persist across power cycles',
    ],
    constraints: [
      '5–10 drink recipes',
      '4–6 ingredient containers',
      'Brew time: 20–60 seconds per drink',
    ],
  },
  {
    id: 'task-management-system',
    title: 'Design a Task Management System',
    category: 'LLD',
    icon: '✅',
    difficulty: 'Easy',
    estimatedTime: '30 min',
    tags: ['object-oriented design', 'workflow', 'permissions'],
    summary:
      'Model a task/project management tool like a simplified Jira or Trello — boards, tasks, assignees, and status workflows.',
    statement:
      'Design a task management system similar to Trello or Jira. Users organize work into boards/projects containing tasks, each with a status (To Do, In Progress, Done), assignee, priority, and due date. Focus on the object model for boards/tasks/users, how status transitions are validated, and how you\'d support filtering and assignment.',
    functionalRequirements: [
      'Create boards/projects containing tasks',
      'Create tasks with title, description, assignee, priority, and due date',
      'Move a task through a defined status workflow (e.g. To Do → In Progress → Done)',
      'Assign/reassign tasks to users',
      'Filter and search tasks by assignee, status, priority, or due date',
      'Support comments/activity log per task',
    ],
    nonFunctionalRequirements: [
      'Status transitions should be validated against the allowed workflow',
      'System should support boards with a large number of tasks without slowing down',
      'Concurrent edits to the same task should not silently overwrite each other',
    ],
    constraints: [
      '10K boards, 1M tasks',
      'Up to 50 members per board',
      'Custom workflows per board (optional)',
    ],
  },
 
  /* ───── Medium ───── */
  {
    id: 'linkedin',
    title: 'Design LinkedIn',
    category: 'LLD',
    icon: '💼',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['object-oriented design', 'social graph', 'search'],
    summary:
      'Model the core object design of a professional networking platform like LinkedIn — profiles, connections, and job postings.',
    statement:
      'Design the low-level object model for a professional networking platform like LinkedIn. Users have profiles (experience, education, skills), connect with other users, follow companies, and apply to job postings. Focus on the class design for profiles/connections/jobs, how connection requests flow, and how you\'d model recommendations (e.g. "people you may know") at the object level.',
    functionalRequirements: [
      'Users create a profile with experience, education, and skills',
      'Send, accept, and manage connection requests (bidirectional)',
      'Follow companies and view company pages',
      'Companies post jobs; users apply and track application status',
      'Search profiles and jobs by keyword, title, or skill',
    ],
    nonFunctionalRequirements: [
      'Connection graph queries (mutual connections) should be efficient',
      'Object model should be extensible to new profile sections without breaking existing data',
      'Search should support partial and fuzzy matching',
    ],
    constraints: [
      '1M+ profiles, 100K+ companies',
      'Avg. 300 connections per user',
      'Thousands of job applications per posting for popular roles',
    ],
  },
  {
    id: 'elevator-system',
    title: 'Design an Elevator System',
    category: 'LLD',
    icon: '🛗',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['state machines', 'scheduling', 'concurrency'],
    summary:
      'Model a multi-elevator control system for a building, handling request scheduling and dispatch across multiple cars.',
    statement:
      'Design the control system for a bank of elevators in a building. External hall calls (up/down buttons on each floor) and internal cabin requests must be served efficiently by one of several elevator cars. Focus on the scheduling algorithm for assigning a request to the best-positioned car, the state machine for each elevator (idle, moving up, moving down, door open), and how you\'d avoid starving far-away requests.',
    functionalRequirements: [
      'Handle hall calls (floor + direction) and cabin requests (destination floor)',
      'Assign each request to the best-positioned available elevator car',
      'Support multiple elevator cars operating independently but coordinated',
      'Open/close doors safely, with a configurable dwell time',
      'Support an emergency/maintenance mode that takes a car out of service',
    ],
    nonFunctionalRequirements: [
      'Request assignment should minimize average wait time across all requests',
      'No request should be starved indefinitely under high load',
      'State transitions must be safe (no door opening while moving)',
      'System should scale to buildings with many floors and multiple cars',
    ],
    constraints: [
      '4–8 elevator cars, 20–50 floors',
      'Peak load: rush-hour lobby surge',
      'Door dwell time: 3–5 seconds',
    ],
  },
  {
    id: 'car-rental-system',
    title: 'Design a Car Rental System',
    category: 'LLD',
    icon: '🚙',
    difficulty: 'Medium',
    estimatedTime: '35 min',
    tags: ['object-oriented design', 'inventory', 'reservations'],
    summary:
      'Model a car rental platform — vehicle inventory across branches, reservations, pricing, and pickup/return workflows.',
    statement:
      'Design a car rental system with multiple branch locations, each holding an inventory of vehicles of different categories (economy, SUV, luxury). Customers search availability for a date range and location, reserve a vehicle, and pick up/return it, possibly at a different branch. Focus on the class design for vehicles/reservations/branches and how you\'d prevent double-booking a vehicle.',
    functionalRequirements: [
      'Search vehicle availability by branch, category, and date range',
      'Create a reservation for a specific vehicle and date range',
      'Support pickup and return, including one-way rentals (different return branch)',
      'Calculate rental cost based on duration, category, and add-ons',
      'Cancel or modify an existing reservation',
    ],
    nonFunctionalRequirements: [
      'Reservation creation must prevent double-booking the same vehicle for overlapping dates',
      'Availability search should be fast across many branches and vehicles',
      'System should handle vehicle transfers between branches for one-way rentals',
    ],
    constraints: [
      '500 branches, 50K vehicles',
      '10K reservations/day',
      '5+ vehicle categories',
    ],
  },
  {
    id: 'online-auction-system',
    title: 'Design an Online Auction System',
    category: 'LLD',
    icon: '🔨',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['object-oriented design', 'concurrency', 'real-time bidding'],
    summary:
      'Model an online auction platform like eBay — listings, real-time bidding, bid validation, and auction close-out.',
    statement:
      'Design an online auction system. Sellers list items with a starting price and end time; buyers place bids, and the highest valid bid wins when the auction closes. Focus on the class design for listings/bids/auctions, how you\'d validate and process concurrent bids safely, and how the auction close and winner notification flow works, including anti-sniping (extending the auction if a bid comes in near the end).',
    functionalRequirements: [
      'Sellers create a listing with starting price, reserve price, and end time',
      'Buyers place bids; each new bid must exceed the current highest bid',
      'Automatically extend the auction end time if a bid arrives in the final moments (anti-sniping)',
      'Close the auction at end time and determine the winning bid',
      'Notify seller and winning bidder when the auction closes',
    ],
    nonFunctionalRequirements: [
      'Concurrent bids on the same item must be processed without lost updates',
      'Bid placement should feel real-time to bidders watching the listing',
      'Auction close logic must be reliable even under a flurry of last-second bids',
    ],
    constraints: [
      '1M+ active listings',
      'Popular items can receive hundreds of bids in the final minute',
      'Anti-sniping extension window: e.g. 2 minutes',
    ],
  },
  {
    id: 'hotel-management-system',
    title: 'Design a Hotel Management System',
    category: 'LLD',
    icon: '🏨',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['object-oriented design', 'inventory', 'reservations'],
    summary:
      'Model a hotel booking and management system — room inventory, reservations, check-in/out, and billing.',
    statement:
      'Design a hotel management system covering room inventory across room types, guest reservations, check-in/check-out, and billing. Focus on the class design for rooms/reservations/guests, how room availability is checked and held during booking, and how billing aggregates room charges plus incidentals (minibar, room service).',
    functionalRequirements: [
      'Search room availability by date range and room type',
      'Create a reservation and hold the room for the stay dates',
      'Check in a guest (assign a specific room) and check out (finalize billing)',
      'Track incidental charges during a stay (room service, minibar)',
      'Support cancellations and refund policies',
    ],
    nonFunctionalRequirements: [
      'Room availability checks must prevent double-booking the same room for overlapping dates',
      'Billing must accurately aggregate all charges for the final invoice',
      'System should support multiple room types and rate plans per property',
    ],
    constraints: [
      '500 rooms per property, multi-property support',
      '~200 check-ins/day per property',
      'Rate plans vary by season/room type',
    ],
  },
  {
    id: 'digital-wallet-service',
    title: 'Design a Digital Wallet Service (LLD)',
    category: 'LLD',
    icon: '💰',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['object-oriented design', 'ledger', 'concurrency'],
    summary:
      'Model the class design of a digital wallet — accounts, ledger entries, and transfer operations with strict consistency.',
    statement:
      'Design the low-level object model for a digital wallet service. Each user has a wallet with a balance backed by an immutable ledger of transactions (top-up, transfer, withdrawal). Focus on the class design that guarantees a transfer between two wallets is atomic — either both the debit and credit succeed or neither does — and how you\'d prevent race conditions when the same wallet is touched by concurrent operations.',
    functionalRequirements: [
      'Create a wallet for a user with a zero starting balance',
      'Top up a wallet from an external payment method',
      'Transfer funds atomically between two wallets',
      'Withdraw funds from a wallet to an external account',
      'Retrieve a wallet\'s transaction history from the ledger',
    ],
    nonFunctionalRequirements: [
      'Transfers must be atomic — no partial debit/credit under failure',
      'Concurrent operations on the same wallet must not cause lost updates or negative balances',
      'The ledger must be append-only and auditable (no in-place edits)',
    ],
    constraints: [
      '10M+ wallets',
      'Peak: 1K transfers/sec',
      'Every balance change traceable to a ledger entry',
    ],
  },
  {
    id: 'airline-management-system',
    title: 'Design an Airline Management System',
    category: 'LLD',
    icon: '🛫',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['object-oriented design', 'inventory', 'scheduling'],
    summary:
      'Model an airline\'s core operations system — flights, seat inventory per flight, crew assignment, and passenger check-in.',
    statement:
      'Design the low-level object model for an airline management system covering flight scheduling, seat inventory per flight/cabin class, crew assignment, and passenger check-in. Focus on the class hierarchy for flights/aircraft/seats/crew, how seat inventory is tracked per cabin class, and how check-in transitions a booking into a boarding pass.',
    functionalRequirements: [
      'Schedule flights with an assigned aircraft, route, and departure time',
      'Track seat inventory per cabin class (economy, business, first) for each flight',
      'Assign crew members to a flight, respecting qualification and rest-time rules',
      'Check in a passenger and issue a boarding pass with a seat assignment',
      'Handle flight delays/cancellations and cascading passenger rebooking',
    ],
    nonFunctionalRequirements: [
      'Seat assignment must prevent double-assigning the same seat on a flight',
      'Crew assignment must respect regulatory rest-time constraints',
      'System should handle schedule changes without losing passenger booking data',
    ],
    constraints: [
      '1000+ flights/day',
      'Aircraft capacity: 100–400 seats',
      'Crew pool: thousands of pilots/attendants',
    ],
  },
  {
    id: 'social-network-facebook-lld',
    title: 'Design a Social Network like Facebook (LLD)',
    category: 'LLD',
    icon: '🌐',
    difficulty: 'Medium',
    estimatedTime: '45 min',
    tags: ['object-oriented design', 'social graph', 'privacy'],
    summary:
      'Model the class design of a social network — users, bidirectional friendships, posts, and privacy-aware feed generation.',
    statement:
      'Design the low-level object model for a social network like Facebook. Focus on the class hierarchy for users, friendships (bidirectional, request-based), posts with configurable visibility (public/friends/custom), and how a user\'s feed is composed from friends\' posts respecting each post\'s privacy setting.',
    functionalRequirements: [
      'Send, accept, and reject friend requests (bidirectional relationship)',
      'Create posts with configurable visibility (public, friends-only, custom list)',
      'Compose a feed for a user from friends\' posts, respecting visibility rules',
      'Like and comment on posts',
      'Block a user, removing mutual visibility',
    ],
    nonFunctionalRequirements: [
      'Feed composition must correctly enforce per-post privacy rules for every viewer',
      'Friendship state changes should be reflected consistently on both users\' sides',
      'Object model should be extensible to new content types (photos, events) without core rewrites',
    ],
    constraints: [
      'Avg. 300 friends per user',
      'Feed composed from recent posts across all friends',
      'Privacy rules: public / friends / custom list / only-me',
    ],
  },
  {
    id: 'restaurant-management-system',
    title: 'Design a Restaurant Management System',
    category: 'LLD',
    icon: '🍽️',
    difficulty: 'Medium',
    estimatedTime: '35 min',
    tags: ['object-oriented design', 'state management', 'inventory'],
    summary:
      'Model a restaurant\'s operations — table reservations, order taking, kitchen ticket flow, and billing.',
    statement:
      'Design a restaurant management system covering table reservations, order taking by waitstaff, kitchen order tickets, and final billing. Focus on the class design for tables/orders/menu items, the state flow of an order from placed to served, and how billing splits or combines charges per table.',
    functionalRequirements: [
      'Reserve a table for a given time and party size',
      'Take an order against a table, referencing menu items and quantities',
      'Send order items to the kitchen as tickets, tracked through preparation states',
      'Mark items as served and close out the table\'s bill',
      'Support splitting a bill across multiple guests at a table',
    ],
    nonFunctionalRequirements: [
      'Order state transitions (placed → preparing → ready → served) must be consistent for kitchen and waitstaff views',
      'Table assignment should prevent double-booking the same table for overlapping reservations',
      'System should handle menu item unavailability gracefully mid-service',
    ],
    constraints: [
      '50–100 tables per restaurant',
      'Peak: 200+ orders during dinner rush',
      'Menu with 100+ items',
    ],
  },
  {
    id: 'concert-ticket-booking-system',
    title: 'Design a Concert Ticket Booking System',
    category: 'LLD',
    icon: '🎫',
    difficulty: 'Medium',
    estimatedTime: '40 min',
    tags: ['object-oriented design', 'concurrency', 'seat locking'],
    summary:
      'Model a concert ticket booking system — venue seat maps, temporary holds during checkout, and confirmed bookings.',
    statement:
      'Design a concert ticket booking system for a venue with a defined seat map (or general admission sections). Users select seats/tickets, hold them temporarily during checkout, and complete payment to confirm. Focus on the class design for venues/events/seats/bookings and the hold-then-confirm state machine that prevents double-booking a seat.',
    functionalRequirements: [
      'Define a venue seat map with sections, rows, and seats (or GA capacity)',
      'Users select seats/tickets for an event and place a temporary hold',
      'Confirm the booking on successful payment; release the hold on failure or timeout',
      'Support ticket transfer/resale between users',
      'Generate a digital ticket with a unique validation code',
    ],
    nonFunctionalRequirements: [
      'Seat/ticket holds must prevent two users from booking the same seat concurrently',
      'Expired holds must be released reliably without manual intervention',
      'System should handle high-demand on-sale moments for popular events',
    ],
    constraints: [
      'Venues from 500 to 80K capacity',
      'Hold timeout: 5–10 minutes',
      'Peak: tens of thousands of concurrent users at on-sale time',
    ],
  },
 
  /* ───── Hard ───── */
  {
    id: 'cricinfo',
    title: 'Design CricInfo',
    category: 'LLD',
    icon: '🏏',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['object-oriented design', 'real-time updates', 'statistics'],
    summary:
      'Model a live cricket score and statistics platform like CricInfo — ball-by-ball scoring, player stats, and match state.',
    statement:
      'Design a system like CricInfo that models live cricket matches ball-by-ball: runs, wickets, overs, and player statistics, updating in real time as a scorer enters each delivery. Focus on the class hierarchy for matches/innings/overs/balls, how a single ball event updates multiple aggregates (batsman score, bowler figures, team total) consistently, and how you\'d support different match formats (T20, ODI, Test).',
    functionalRequirements: [
      'Record ball-by-ball events (runs, extras, wickets, dismissal type)',
      'Maintain live match state: current score, overs, required run rate',
      'Track individual player statistics (batting, bowling) per match and career',
      'Support multiple match formats with different rules (overs limit, innings count)',
      'Support match interruptions (rain delay, DLS recalculation)',
    ],
    nonFunctionalRequirements: [
      'A single ball entry must atomically update all dependent aggregates (score, stats, over state)',
      'System must support many concurrent live matches being scored simultaneously',
      'Historical data must remain queryable for career statistics without slowing live scoring',
    ],
    constraints: [
      'Dozens of concurrent live matches',
      'Ball entry latency: near-instant to scorer',
      '3+ match formats with different rule sets',
    ],
  },
  {
    id: 'splitwise',
    title: 'Design Splitwise',
    category: 'LLD',
    icon: '🧾',
    difficulty: 'Hard',
    estimatedTime: '45 min',
    tags: ['object-oriented design', 'graph algorithms', 'ledger'],
    summary:
      'Model an expense-splitting app like Splitwise — group expenses, split strategies, and simplified debt settlement.',
    statement:
      'Design Splitwise. Users form groups and log shared expenses that are split among members (equally, by percentage, or by exact amount). The system tracks who owes whom, and can simplify a tangled web of debts into the minimum number of settling transactions. Focus on the class design for expenses/splits/balances, and the debt-simplification algorithm.',
    functionalRequirements: [
      'Create groups and add members',
      'Log an expense with a configurable split strategy (equal, percentage, exact amounts, shares)',
      'Track running balances between every pair of users in a group',
      'Simplify group debts into a minimal set of settle-up transactions',
      'Record a settlement (payment) between two users, updating balances',
    ],
    nonFunctionalRequirements: [
      'Balance calculations must remain accurate to the cent despite rounding in splits',
      'Debt simplification should minimize the number of transactions needed',
      'System should support groups with many members and a long expense history efficiently',
    ],
    constraints: [
      'Groups up to a few hundred members',
      'Thousands of expenses per group over time',
      'Debt simplification should run quickly even for large groups',
    ],
  },
  {
    id: 'snake-and-ladder',
    title: 'Design a Snake and Ladder Game',
    category: 'LLD',
    icon: '🐍',
    difficulty: 'Hard',
    estimatedTime: '35 min',
    tags: ['object-oriented design', 'game logic', 'simulation'],
    summary:
      'Model a multiplayer Snake and Ladder game engine — board setup, dice rolls, snakes/ladders, and turn-based play.',
    statement:
      'Design a Snake and Ladder game engine supporting 2+ players on a configurable board with placed snakes and ladders. Players take turns rolling dice and moving; landing on a snake head sends them down, landing on a ladder base sends them up. Focus on the board/piece/player class design, turn management, and how the engine stays UI-agnostic so it can drive a CLI, GUI, or networked game.',
    functionalRequirements: [
      'Support 2+ players taking turns rolling a die and moving their token',
      'Configurable board size with placed snakes and ladders',
      'Move a player down a snake or up a ladder when landed on',
      'Detect win condition when a player reaches the final square exactly (or overshoots per rule variant)',
      'Support resetting the game for a rematch',
    ],
    nonFunctionalRequirements: [
      'Game engine should be UI-agnostic — no rendering logic in the core model',
      'Board configuration (snake/ladder placement) should be validated for conflicts',
      'Turn order and state transitions must be deterministic and easily testable',
    ],
    constraints: [
      'Standard 100-square board (configurable)',
      '2–6 players',
      '~10–15 snakes/ladders on a standard board',
    ],
  },
  {
    id: 'ride-sharing-service-lld',
    title: 'Design a Ride-Sharing Service like Uber (LLD)',
    category: 'LLD',
    icon: '🚖',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['object-oriented design', 'state machines', 'strategy pattern'],
    summary:
      'Model the class design of a ride-sharing service — riders, drivers, trip state machine, and a pluggable matching/pricing strategy.',
    statement:
      'Design the low-level object model for a ride-sharing service like Uber. Focus on the class hierarchy for riders/drivers/vehicles/trips, the trip state machine (requested → matched → in-progress → completed → rated), and how you\'d use a strategy pattern to make the driver-matching algorithm and the fare-pricing algorithm pluggable/swappable.',
    functionalRequirements: [
      'Riders request a trip specifying pickup and drop-off locations',
      'Match a request to a driver using a pluggable matching strategy',
      'Progress a trip through a well-defined state machine with valid transitions only',
      'Calculate fare using a pluggable pricing strategy (base + distance + surge)',
      'Allow rider and driver to rate each other after trip completion',
    ],
    nonFunctionalRequirements: [
      'Trip state transitions must reject invalid jumps (e.g. completed → in-progress)',
      'Matching and pricing strategies should be swappable without changing core trip logic',
      'Object model should support concurrent trips per driver pool without shared mutable state bugs',
    ],
    constraints: [
      'Class design only — no distributed infra concerns in scope',
      'Support multiple vehicle categories (economy, premium, XL)',
      'Trip state machine with 5+ distinct states',
    ],
  },
  {
    id: 'course-registration-system',
    title: 'Design a Course Registration System',
    category: 'LLD',
    icon: '🎓',
    difficulty: 'Hard',
    estimatedTime: '40 min',
    tags: ['object-oriented design', 'concurrency', 'constraints'],
    summary:
      'Model a university course registration system — seat limits, prerequisites, waitlists, and schedule conflict detection.',
    statement:
      'Design a course registration system for a university. Students register for course sections with limited seats, subject to prerequisite requirements and schedule conflicts with their existing enrollments. When a section is full, students can join a waitlist and are auto-enrolled if a seat opens. Focus on the class design for courses/sections/enrollments and the validation pipeline a registration request must pass.',
    functionalRequirements: [
      'Students register for a course section if seats are available',
      'Validate prerequisites are met before allowing registration',
      'Detect and reject registrations that conflict with the student\'s existing schedule',
      'Waitlist students when a section is full, auto-enrolling in seat-availability order on drop',
      'Allow students to drop a registered course',
    ],
    nonFunctionalRequirements: [
      'Seat allocation must be safe under concurrent registration attempts for the same section',
      'Waitlist promotion must be fair (first-in-first-out) and race-condition free',
      'Validation pipeline (prerequisites, conflicts, capacity) should be easily extensible with new rules',
    ],
    constraints: [
      '50K students, 5K course sections',
      'Registration opens simultaneously for large student cohorts',
      'Peak: thousands of registration attempts in the first minute',
    ],
  },
  {
    id: 'movie-ticket-booking-system',
    title: 'Design a Movie Ticket Booking System',
    category: 'LLD',
    icon: '🎬',
    difficulty: 'Hard',
    estimatedTime: '45 min',
    tags: ['object-oriented design', 'concurrency', 'seat locking'],
    summary:
      'Model a cinema ticket booking system — showtimes, seat maps per screen, temporary holds, and concurrent booking safety.',
    statement:
      'Design a movie ticket booking system for a cinema chain. Each screen at each theater has a seat layout, and shows are scheduled per screen/time. Users pick seats for a specific show, hold them during checkout, and confirm via payment. Focus on the class design for theaters/screens/shows/seats/bookings, and how the hold-and-confirm flow guarantees no two users can book the same seat for the same show.',
    functionalRequirements: [
      'Model theaters, each with multiple screens and per-screen seat layouts',
      'Schedule shows for a movie on a specific screen and time',
      'Display real-time seat availability for a show',
      'Temporarily hold selected seats during checkout, releasing on timeout',
      'Confirm booking and generate tickets on successful payment',
    ],
    nonFunctionalRequirements: [
      'Seat holds must be strongly consistent under concurrent booking attempts for the same show',
      'Hold expiry must reliably free up seats without manual cleanup',
      'System should scale to a chain with many theaters and screens without a monolithic seat lock',
    ],
    constraints: [
      '200+ theaters, 5–10 screens each',
      'Seat maps of 100–300 seats per screen',
      'Hold timeout: 5–10 minutes',
    ],
  },
  {
    id: 'online-shopping-amazon-lld',
    title: 'Design an Online Shopping System like Amazon (LLD)',
    category: 'LLD',
    icon: '🛍️',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['object-oriented design', 'inventory', 'state machines'],
    summary:
      'Model the class design of an e-commerce platform — product catalog, cart, order state machine, and inventory reservation.',
    statement:
      'Design the low-level object model for an e-commerce platform like Amazon. Focus on the class hierarchy for products/cart/orders/inventory, how inventory is reserved when an item is added to cart vs. deducted at checkout, and the order state machine from placed through delivered, including cancellation and return flows.',
    functionalRequirements: [
      'Browse and add products to a cart, with quantity validated against inventory',
      'Checkout converts a cart into an order, reserving inventory atomically',
      'Progress an order through a defined state machine (placed → shipped → delivered)',
      'Support order cancellation (before shipping) and returns (after delivery)',
      'Apply discounts/coupons during checkout',
    ],
    nonFunctionalRequirements: [
      'Inventory reservation at checkout must prevent overselling under concurrent orders',
      'Order state transitions must reject invalid changes (e.g. cancel after delivered)',
      'Object model should support adding new product categories without core rewrites',
    ],
    constraints: [
      'Class design only — no distributed infra concerns in scope',
      'Catalog with many product categories and variants (size/color)',
      'Order state machine with 5+ states',
    ],
  },
  {
    id: 'stock-brokerage-system',
    title: 'Design an Online Stock Brokerage System',
    category: 'LLD',
    icon: '📈',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['object-oriented design', 'order matching', 'concurrency'],
    summary:
      'Model a stock trading platform — user portfolios, order types, and a simplified order matching engine.',
    statement:
      'Design an online stock brokerage system where users hold a portfolio of cash and stock positions, and place buy/sell orders (market, limit) that get matched against other orders or executed at market price. Focus on the class design for accounts/portfolios/orders, a simplified matching engine, and how you\'d ensure a user can never sell more shares (or spend more cash) than they hold.',
    functionalRequirements: [
      'Users hold a portfolio of cash balance and stock positions',
      'Place market and limit buy/sell orders for a stock',
      'Match compatible buy/sell orders (simplified order book) or execute at market price',
      'Update portfolios atomically on order execution',
      'Support order cancellation before execution',
    ],
    nonFunctionalRequirements: [
      'A sell order must never execute for more shares than the user actually holds',
      'A buy order must never execute for more cash than the user actually has',
      'Order matching must process concurrent orders for the same stock without race conditions',
      'System should maintain an auditable log of every executed trade',
    ],
    constraints: [
      'Class design only — no distributed infra concerns in scope',
      'Support at least market and limit order types',
      'Order book per stock symbol',
    ],
  },
  {
    id: 'music-streaming-spotify-lld',
    title: 'Design a Music Streaming Service like Spotify (LLD)',
    category: 'LLD',
    icon: '🎧',
    difficulty: 'Hard',
    estimatedTime: '45 min',
    tags: ['object-oriented design', 'strategy pattern', 'playlists'],
    summary:
      'Model the class design of a music streaming app — tracks, playlists, playback queue, and a pluggable recommendation strategy.',
    statement:
      'Design the low-level object model for a music streaming service like Spotify. Focus on the class hierarchy for tracks/albums/artists/playlists, the playback queue and player state machine (playing/paused/stopped/shuffled/repeating), and how you\'d design a pluggable recommendation strategy interface without hardcoding a specific algorithm into the player.',
    functionalRequirements: [
      'Model tracks, albums, and artists with search by each',
      'Create, edit, and reorder playlists',
      'Playback queue supporting play/pause/skip/shuffle/repeat',
      'Track playback history per user',
      'Pluggable recommendation strategy that suggests the next track/playlist',
    ],
    nonFunctionalRequirements: [
      'Player state transitions must be consistent (e.g. cannot skip when stopped)',
      'Shuffle/repeat modes should not duplicate or skip tracks unexpectedly',
      'Recommendation strategy should be swappable without changing playback core logic',
    ],
    constraints: [
      'Class design only — no streaming/CDN infra concerns in scope',
      'Playlists with hundreds of tracks',
      'Multiple simultaneous playback modes (shuffle, repeat-one, repeat-all)',
    ],
  },
  {
    id: 'food-delivery-swiggy-lld',
    title: 'Design an Online Food Delivery Service like Swiggy (LLD)',
    category: 'LLD',
    icon: '🛵',
    difficulty: 'Hard',
    estimatedTime: '50 min',
    tags: ['object-oriented design', 'state machines', 'strategy pattern'],
    summary:
      'Model the class design of a food delivery app — restaurants, orders, and a pluggable delivery-partner assignment strategy.',
    statement:
      'Design the low-level object model for a food delivery service like Swiggy. Focus on the class hierarchy for restaurants/menu items/orders/delivery partners, the order state machine (placed → accepted → preparing → out-for-delivery → delivered), and a strategy-pattern interface for assigning a delivery partner to an order that could be swapped between "nearest partner" and "least busy partner" implementations.',
    functionalRequirements: [
      'Browse a restaurant\'s menu and place an order with item quantities',
      'Restaurant accepts/rejects an order and updates preparation status',
      'Assign a delivery partner to an accepted order via a pluggable strategy',
      'Progress the order through a well-defined delivery state machine',
      'Calculate order total including delivery fee and applicable discounts',
    ],
    nonFunctionalRequirements: [
      'Order state transitions must reject invalid jumps (e.g. delivered → preparing)',
      'Delivery partner assignment strategy should be swappable without changing order core logic',
      'Object model should support a partner being assigned to at most one active order at a time',
    ],
    constraints: [
      'Class design only — no distributed infra concerns in scope',
      'Delivery partner pool shared across many restaurants',
      'Order state machine with 5+ states',
    ],
  },
]

export function getProblemById(id) {
  return problems.find((p) => p.id === id)
}

export function getProblemsByCategory(category) {
  return problems.filter((p) => p.category === category)
}
