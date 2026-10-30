# PHASE 1 - AI CORE FOUNDATION
## Building Centralized AI Infrastructure

**Duration:** 2-3 weeks  
**Blocking:** All future phases  
**Critical:** YES

---

## 🎯 PHASE 1 OBJECTIVES

1. Create abstracted AIProvider interface (not hardcoded Claude everywhere)
2. Implement safe Gemini integration with free-tier optimization
3. Add comprehensive error handling, validation, logging
4. Build AI task execution engine
5. Create database models for AI tracking
6. Implement token budgeting & request deduplication
7. Add monitoring & alerting

---

## 📊 PHASE 1 DATABASE SCHEMA

Add these models to `prisma/schema.prisma`:

```prisma
// ============ AI INFRASTRUCTURE ============

/// Provider configuration and secrets
model AIProvider {
  id            String    @id @default(cuid())
  name          String    @unique  // "gemini", "openai", "local"
  displayName   String
  
  // Configuration
  config        Json      // Provider-specific config
  apiKey        String    @db.Text  // Encrypted
  isActive      Boolean   @default(true)
  priority      Int       @default(0)  // Fallback order
  
  // Rate limiting
  rateLimit     Int       @default(100) // requests per minute
  tokenBudget   Int       @default(1000000) // tokens per day
  
  // Tracking
  totalRequests Int       @default(0)
  failedRequests Int      @default(0)
  totalTokens   Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([isActive])
}

/// AI Agent definitions and capabilities
model AIAgent {
  id              String    @id @default(cuid())
  name            String    @unique
  displayName     String
  version         String    @default("1.0.0")
  description     String    @db.Text
  
  // Capabilities
  capabilities    String[]  // JSON array of capabilities
  systemPrompt    String    @db.Text
  
  // Configuration
  provider        String    // "gemini", "openai", etc.
  model           String    // "gemini-1.5-pro", etc.
  temperature     Float     @default(0.7)
  maxTokens       Int       @default(2000)
  
  // Tools & Permissions
  tools           String[]  // Available tools
  permissions     String[]  // Required permissions
  riskLevel       String    @default("low") // low, medium, high, critical
  
  // Status
  isActive        Boolean   @default(true)
  requiresApproval Boolean  @default(false)
  
  // Tracking
  totalTasks      Int       @default(0)
  successfulTasks Int       @default(0)
  failedTasks     Int       @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([isActive])
  @@index([riskLevel])
}

/// AI Task execution tracking
model AITask {
  id              String    @id @default(cuid())
  
  // Task metadata
  userId          String
  organizationId  String
  clientId        String?
  projectId       String?
  
  // Agent info
  agent           String    // Agent name/ID
  provider        String    // "gemini", etc.
  model           String    // Model used
  
  // Input/Output
  input           String    @db.Text
  inputTokens     Int       @default(0)
  
  // Result
  status          String    @default("queued") // queued, running, waiting_approval, completed, failed, cancelled
  result          String    @db.Text
  outputTokens    Int       @default(0)
  
  // Error tracking
  error           String?   @db.Text
  errorCode       String?
  retryCount      Int       @default(0)
  
  // Metadata
  confidence      Float?    // 0.0-1.0
  reasoning       String?   @db.Text // Brief explanation of decision
  
  // Timing
  queuedAt        DateTime  @default(now())
  startedAt       DateTime?
  completedAt     DateTime?
  
  // Approval
  requiresApproval Boolean  @default(false)
  approvedBy      String?   // User ID
  approvedAt      DateTime?
  
  // Audit trail
  requestId       String    @unique
  traceId         String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([organizationId])
  @@index([status])
  @@index([createdAt])
  @@index([requestId])
}

/// Evidence for AI decisions
model AIEvidence {
  id              String    @id @default(cuid())
  
  taskId          String    // Related AI task
  
  // Source information
  source          String    // "observed", "api", "database", "user_input"
  sourceType      String    // "website", "api_response", "database_query", etc.
  sourceUrl       String?
  sourceData      String    @db.Text
  
  // Metadata
  confidence      Float     @default(0.5) // 0.0-1.0
  timestamp       DateTime  @default(now())
  freshness       Int       @default(0) // seconds old
  
  // Classification
  evidenceType    String    @default("unknown") // observed, estimated, inferred, unknown
  
  // Tracking
  used            Boolean   @default(false)
  weight          Float     @default(1.0) // Importance in decision
  
  createdAt       DateTime  @default(now())

  @@index([taskId])
  @@index([evidenceType])
  @@index([confidence])
}

/// AI decisions and reasoning
model AIDecision {
  id              String    @id @default(cuid())
  
  taskId          String    @unique
  
  // Request context
  userRequest     String    @db.Text
  context         String    @db.Text // Relevant context
  
  // Decision process
  agentsConsidered String[]
  agentSelected   String
  
  toolsCalled     String    @db.Text // JSON array
  evidenceUsed    String[]  // Evidence IDs used
  
  // Reasoning
  reasoning       String    @db.Text
  alternatives    String    @db.Text // JSON: other options considered
  
  // Decision metadata
  confidence      Float     @default(0.5)
  riskLevel       String    @default("unknown")
  
  // Approval tracking
  requiresApproval Boolean  @default(false)
  approvalReason  String?
  approvedBy      String?
  approvalDate    DateTime?
  
  // Execution
  actionTaken     String?   @db.Text
  actionResult    String?   @db.Text
  outcome         String?   // success, partial, failed, manual_override
  
  // Feedback
  feedback        String?   @db.Text
  feedbackScore   Int?      // 1-5 rating
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([taskId])
  @@index([approvalReason])
  @@index([outcome])
}

/// AI Token tracking and budgeting
model AITokenLog {
  id              String    @id @default(cuid())
  
  provider        String    // "gemini", etc.
  model           String
  
  // Token usage
  inputTokens     Int
  outputTokens    Int
  totalTokens     Int
  
  // Metadata
  taskId          String?
  userId          String?
  organizationId  String?
  
  // Cost (if applicable)
  estimatedCost   Float?
  
  // Timestamp
  timestamp       DateTime  @default(now())

  @@index([provider])
  @@index([timestamp])
  @@index([organizationId])
}

/// AI Cache for deduplication
model AICache {
  id              String    @id @default(cuid())
  
  // Cache key
  hash            String    @unique @db.VarChar(64)
  provider        String
  model           String
  
  // Cached result
  prompt          String    @db.Text
  response        String    @db.Text
  
  // Metadata
  tokens          Int
  ttl             DateTime  // Time to live
  hitCount        Int       @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([hash])
  @@index([ttl])
}

/// AI Rate limiting
model AIRateLimit {
  id              String    @id @default(cuid())
  
  userId          String
  provider        String
  
  requestCount    Int       @default(0)
  windowStart     DateTime
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, provider])
  @@index([windowStart])
}

/// AI Error tracking
model AIError {
  id              String    @id @default(cuid())
  
  taskId          String?
  provider        String
  
  errorCode       String
  errorMessage    String    @db.Text
  errorDetails    String    @db.Text
  
  // Stack trace
  stackTrace      String?   @db.Text
  
  // Context
  userId          String?
  context         String    @db.Text
  
  // Resolution
  resolved        Boolean   @default(false)
  resolvedAt      DateTime?
  resolution      String?   @db.Text
  
  createdAt       DateTime  @default(now())

  @@index([errorCode])
  @@index([resolved])
  @@index([createdAt])
}
```

---

## 📁 FILE STRUCTURE TO CREATE

```
lib/
├── ai/
│   ├── AIProvider.ts          // Abstract interface
│   ├── providers/
│   │   ├── GeminiProvider.ts  // Gemini implementation
│   │   ├── MockProvider.ts    // Fallback for testing
│   │   └── ProviderRegistry.ts
│   ├── validation/
│   │   ├── schemas.ts         // Zod schemas for AI output
│   │   └── validators.ts      // Validation functions
│   ├── cache/
│   │   └── AICache.ts         // Request deduplication
│   ├── rateLimit/
│   │   └── RateLimiter.ts     // Token & request limiting
│   ├── logging/
│   │   └── AILogger.ts        // Structured logging
│   ├── errors/
│   │   └── AIError.ts         // Custom error classes
│   └── types.ts               // TypeScript interfaces

app/
├── api/
│   └── ai/
│       ├── task/
│       │   └── route.ts       // POST: Create AI task
│       ├── status/
│       │   └── [id]/route.ts  // GET: Task status
│       ├── cache/
│       │   └── route.ts       // Cache management
│       ├── tokens/
│       │   └── route.ts       // Token tracking
│       └── health/
│           └── route.ts       // Provider health check

services/
├── ai/
│   ├── AITaskEngine.ts        // Task execution
│   ├── AIValidator.ts         // Output validation
│   └── AIMonitoring.ts        // Metrics & alerts

utils/
├── ai/
│   ├── tokenCounter.ts        // Count tokens
│   ├── promptCompressor.ts    // Compress prompts
│   └── helpers.ts             // Utility functions
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1a: AIProvider Abstraction (Day 1-2)

- [ ] Create `lib/ai/types.ts` with interfaces:
  ```typescript
  interface AIProvider {
    name: string
    initialize(): Promise<void>
    generateText(prompt, options): Promise<AIResponse>
    validateOutput(output): Promise<ValidationResult>
    trackTokens(input, output): Promise<void>
  }
  ```

- [ ] Create `lib/ai/AIProvider.ts` base class
- [ ] Create `lib/ai/ProviderRegistry.ts` to manage multiple providers
- [ ] Add error classes in `lib/ai/errors/`
- [ ] Add TypeScript types in `lib/ai/types.ts`

### Phase 1b: Gemini Integration (Day 2-3)

- [ ] Create `lib/ai/providers/GeminiProvider.ts`:
  - Initialize with API key (from env, not hardcoded)
  - Implement generateText() using Google Generative AI SDK
  - Add structured output support
  - Add timeout handling (30 seconds max)
  - Add retry logic with exponential backoff
  - Add error handling for rate limits

- [ ] Implement safety features:
  - Safety settings (BLOCK_NONE initially, can be adjusted)
  - Content filter configuration
  - Prompt injection prevention

- [ ] Add free-tier optimization:
  - Request deduplication (check cache first)
  - Prompt compression (remove unnecessary whitespace)
  - Token counting (estimate before sending)
  - Batch processing support
  - Rule-based fallback (deterministic processing for simple cases)

### Phase 1c: Validation & Error Handling (Day 3-4)

- [ ] Create `lib/ai/validation/schemas.ts`:
  ```typescript
  const AIResponseSchema = z.object({
    content: z.string(),
    confidence: z.number().min(0).max(1).optional(),
    reasoning: z.string().optional(),
    ...
  })
  ```

- [ ] Create `lib/ai/validation/validators.ts`:
  - validateJSON()
  - validateSchema()
  - validateBusinessRules()
  - validatePermissions()

- [ ] Create error handling:
  - AIProviderError
  - AIValidationError
  - AIRateLimitError
  - AITimeoutError
  - AIAuthenticationError

### Phase 1d: Caching & Rate Limiting (Day 4-5)

- [ ] Implement request deduplication:
  - Hash prompt
  - Check cache
  - Return if found
  - Otherwise, request from provider

- [ ] Implement rate limiting:
  - Track requests per minute
  - Track tokens per day
  - Block if limit exceeded
  - Queue for later execution

- [ ] Implement token budgeting:
  - Calculate estimated tokens
  - Check budget before request
  - Reject if would exceed
  - Track actual usage

### Phase 1e: Logging & Monitoring (Day 5-6)

- [ ] Create structured logging:
  - Log all AI requests
  - Log all validations
  - Log all errors
  - Include trace IDs

- [ ] Add metrics:
  - Request count
  - Success rate
  - Average tokens
  - Average latency
  - Error rate

- [ ] Create health check endpoint:
  - Test provider connectivity
  - Report token usage
  - Report error rate

### Phase 1f: Database Migration (Day 6)

- [ ] Create Prisma migration:
  ```bash
  npx prisma migrate dev --name add_ai_core_foundation
  npx prisma generate
  ```

- [ ] Seed initial data:
  - Create AIProvider records
  - Create AIAgent records
  - Set up default configuration

### Phase 1g: API Routes (Day 6-7)

- [ ] Create `app/api/ai/task/route.ts`:
  - POST: Create AI task
  - Validate input
  - Queue for execution
  - Return task ID

- [ ] Create `app/api/ai/status/[id]/route.ts`:
  - GET: Check task status
  - Return result if complete

- [ ] Create `app/api/ai/health/route.ts`:
  - GET: Provider health
  - Return metrics

### Phase 1h: Testing (Day 7)

- [ ] Unit tests:
  - AIProvider interface
  - GeminiProvider
  - Validation schemas
  - Error handling

- [ ] Integration tests:
  - End-to-end task execution
  - Caching behavior
  - Rate limiting
  - Error recovery

- [ ] API tests:
  - POST /api/ai/task
  - GET /api/ai/status/[id]
  - GET /api/ai/health

---

## 🔒 SAFETY REQUIREMENTS

### Never Do:
- ❌ Hardcode API keys in code
- ❌ Trust AI output without validation
- ❌ Exceed rate limits
- ❌ Spend more tokens than budgeted
- ❌ Skip permission checks
- ❌ Ignore errors
- ❌ Run untested AI features

### Always Do:
- ✅ Store secrets in environment variables
- ✅ Validate all AI output
- ✅ Log all requests
- ✅ Check permissions before action
- ✅ Implement graceful fallbacks
- ✅ Monitor token usage
- ✅ Test thoroughly
- ✅ Handle errors explicitly

---

## 📈 SUCCESS METRICS

Phase 1 is complete when:

- [ ] All database migrations run successfully
- [ ] AIProvider interface working with Gemini
- [ ] Validation schemas pass all tests
- [ ] Caching reduces duplicate requests by >50%
- [ ] Rate limiting prevents quota violations
- [ ] Logging captures all events
- [ ] Error handling covers all failure modes
- [ ] API routes functional
- [ ] Unit test coverage >90%
- [ ] Integration tests all pass
- [ ] Performance acceptable (<2s per request)

---

## 🚀 NEXT PHASE

After Phase 1 completion:
- **Phase 2:** Master AI Orchestrator (dependencies on Phase 1)
- **Phase 3:** Knowledge Brain (depends on Phase 1)

**Do NOT start Phase 2 until Phase 1 is 100% complete and tested.**

---

## 📋 BLOCKERS & RISKS

### Potential Blockers:
1. **Gemini API quota issues** → Use mock provider as fallback
2. **Database migration fails** → Rollback plan required
3. **Performance issues** → Add caching & optimization
4. **Token overflow** → Implement budgeting
5. **Validation too strict** → Relax rules for non-critical fields

### Mitigation:
- All critical paths have fallbacks
- All database changes are reversible
- All features have manual overrides
- Comprehensive error handling
- Extensive testing before production

---

**PHASE 1 START DATE:** [To be confirmed after Phase 0 verification]

**PHASE 1 ESTIMATED COMPLETION:** 2-3 weeks from start

**Next Review:** Weekly progress check-ins
