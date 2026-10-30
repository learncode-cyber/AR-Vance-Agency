# AI Worker / Agent Audit

Method: every AI-related route and agent class in the repository was located by search, its caller traced, and its provider/database use checked. Statuses follow the master-prompt legend.

## Operational agents (registry-based, with runner)
Source: lib/ai/agents/registry.ts + runner.ts. Entry: POST /api/ai/agents/run (manage_ai) or queued job `ai.agent.run`.
Each agent has an explicit tool allowlist; each tool checks the calling user's permission, validates input/output with Zod, enforces a timeout, and writes an audit log.

| Agent | Tools | Status |
|---|---|---|
| lead_intelligence | crm.search_leads, crm.lead_stats, analytics.lead_trend | Code VERIFIED (unit, mocked model); live model UNVERIFIED |
| analytics | analytics.lead_trend, crm.lead_stats | Code VERIFIED (unit); live model UNVERIFIED |
| content_strategy | content.list_posts, services.list | Code VERIFIED (unit); live model UNVERIFIED |
| seo_advisor | content.list_posts, services.list | Code VERIFIED (unit); live model UNVERIFIED |
| business_audit | none (reasoning only) | Code VERIFIED (unit); live model UNVERIFIED |
| proposal_drafter | services.list | Code VERIFIED (unit); live model UNVERIFIED |

Verified in unit tests: tool allowlist enforcement, permission denial, invalid input rejection, timeout, output-schema enforcement, retry/fail-closed, step limit, token accounting, prompt-injection framing of tool results.

## Class-based agents (services/agents, 26 classes)
Called from: /api/agents/{prospects,audit,content,leads,seo} (all require the AI session with manage_ai) and the job handler.
- LeadIntelligenceAgent, ProspectingAgent, SEOIntelligenceEngine, ContentEngine, BusinessAuditAgent — code present, call the model provider; **UNVERIFIED** (no live provider, no integration tests).
- The remaining 21 classes (e.g. QAAgent, SecurityAgent, PricingAgent, ForecastingEngine, MetaAdsIntelligenceAgent, GoogleAdsIntelligenceAgent, ClientSuccessManagerAgent, SalesAssistantAgent…) are **not reachable from any route or job** — they are dormant code. Status: **UNVERIFIED / not exposed**. They are not advertised as working features.

## Stub routes (now honest)
- /api/ai/predictions, /api/ai/recommendations, /api/ai/sentiment, /api/ai/chatbot — previously returned empty success; now HTTP 501 "not implemented" (admin-only). Status: NOT IMPLEMENTED.
- /api/ai/workflow/* — create/status/list wired to the orchestrator; status UNVERIFIED end-to-end (orchestrator has no live provider run).

## Public chat
- /api/chat — rate-limited (30/hour/IP); returns 503 when no AI key is configured. With a key, the live path is UNVERIFIED.

## Homepage claim
"24 AI agents" was removed. The homepage now refers to "AI-assisted agency tools". Verified operational agents: 6 (registry). The homepage lists six cards; Prospecting and Sales Assistant cards map to class-based agents that are UNVERIFIED.

## Blocking item
Live provider execution for every agent requires a Gemini API key (GEMINI_API_KEY). Without it, no agent can be marked live-verified.
