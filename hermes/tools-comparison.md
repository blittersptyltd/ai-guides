# Hermes Runtime Tools Comparison

⚙️ **Detailed comparison of Standard Hermes vs Codex Runtime capabilities, performance, and use cases.**

*Choose the right runtime for your development needs.*

---

## 🎯 Quick Decision Matrix

| Use Case | Standard Hermes | Codex Runtime | Winner |
|----------|----------------|---------------|---------|
| Multi-file refactoring | ✅ Good | 🚀 **Excellent** | Codex |
| Planning & architecture | 🚀 **Excellent** | ❌ Limited | Hermes |  
| Cost-sensitive development | ⚠️ API charges | 🚀 **Subscription** | Codex |
| Multi-agent coordination | 🚀 **Full support** | ❌ Not available | Hermes |
| Plugin-heavy workflows | ⚠️ Manual | 🚀 **Native** | Codex |
| Cross-session analysis | 🚀 **Full history** | ❌ No memory | Hermes |

---

## 🛠️ Tool Availability Comparison

### Standard Hermes Tools

**✅ Full Tool Suite Available:**
- `delegate_task` - Sub-agent spawning and coordination
- `memory` - Persistent cross-session memory store  
- `session_search` - Full conversation history search
- `todo` - Task management and tracking
- `patch` / `write_file` - File operations via Hermes
- `terminal` - Shell commands via Hermes wrapper
- `web_search` / `web_extract` - Web operations
- `browser_*` - Full browser automation
- `vision_analyze` / `image_generate` - AI generation
- All specialized tools (Linear, GitHub, etc.) via integrations

### Codex Runtime Tools

**✅ Codex Built-in Tools:**
- `shell` - Native terminal in sandbox environment
- `apply_patch` - Structured multi-file editing
- `update_plan` - Internal project planning
- `view_image` - Image analysis for development
- `web_search` - Built-in search capabilities

**✅ Native Codex Plugins (Auto-detected):**
- Linear - Issue tracking and project management
- GitHub - Repository operations and CI/CD
- Gmail/Calendar/Outlook - Communication workflows  
- Canva - Design and creative tools

**✅ Hermes Callback Tools (Via MCP):**
- `web_extract` - Web content extraction
- `browser_*` - Browser automation (callback to Hermes)
- `vision_analyze` / `image_generate` - AI generation (callback)
- `skill_view` / `skills_list` - Knowledge access (callback)

**❌ Not Available in Codex Runtime:**
- `delegate_task` - Sub-agents (requires agent loop context)
- `memory` - Persistent memory (agent context required) 
- `session_search` - History search (agent context required)
- `todo` - Use `update_plan` instead

---

## 🏗️ Architecture Differences

### Standard Hermes Architecture
```
User Request
    ↓
Hermes Agent (orchestrator)
    ↓
Tool Selection & Execution
    ↓  
Result Processing & Memory
    ↓
Response with Full Context
```

**Characteristics:**
- **Monolithic agent** - Single process handles everything
- **Full context** - Complete session and memory access
- **Tool flexibility** - Can use any available tool
- **Memory persistence** - Cross-session knowledge retention

### Codex Runtime Architecture  
```
User Request
    ↓
Hermes Agent (session manager)
    ↓
Codex CLI (execution engine)
    ↓
Native Tools + Plugin Ecosystem
    ↓
MCP Callbacks to Hermes (when needed)
    ↓
Response via Codex with Hermes orchestration
```

**Characteristics:**
- **Hybrid system** - Hermes orchestrates, Codex executes
- **Execution sandboxing** - Controlled environment
- **Plugin ecosystem** - Native integrations
- **Limited context** - MCP callbacks for complex operations

---

## ⚡ Performance Characteristics

### Development Operations

| Operation | Standard Hermes | Codex Runtime | Notes |
|-----------|----------------|---------------|--------|
| **File editing** | Multiple `patch` calls | Single `apply_patch` | Codex: atomic multi-file |
| **Terminal commands** | `terminal` tool wrapper | Native `shell` | Codex: direct execution |
| **TypeScript compilation** | Manual coordination | Integrated validation | Codex: built-in checks |
| **Git operations** | Shell command chains | Structured workflows | Codex: optimized patterns |

### Resource Usage

| Resource | Standard Hermes | Codex Runtime | Impact |
|----------|----------------|---------------|--------|
| **API tokens** | High (all operations) | Low (callbacks only) | 💰 Cost savings |
| **Memory usage** | Higher (full context) | Lower (sandboxed) | 🔧 Efficiency |  
| **Startup time** | Fast (single process) | Slower (runtime switch) | ⏱️ Initial overhead |
| **Execution speed** | Variable | Consistent (sandbox) | 📊 Predictability |

### Cost Analysis

**Standard Hermes:**
- **All operations** consume API tokens
- **Claude/GPT API charges** for development work
- **Higher cost** for iterative development
- **Flexible model** selection

**Codex Runtime:**
- **Development work** uses ChatGPT subscription
- **Only callbacks** consume API tokens  
- **Fixed subscription** cost regardless of usage
- **OpenAI ecosystem** only

---

## 🎯 Use Case Recommendations

### ✅ Choose Standard Hermes For:

**Planning & Architecture**
```
Requirements: memory, session_search, cross-session analysis
Example: "Analyze our past 3 RBAC discussions and create implementation plan"
Why: Needs full conversation history and persistent knowledge
```

**Multi-Agent Workflows**
```
Requirements: delegate_task, sub-agent coordination
Example: "Research authentication patterns while I work on the database schema"  
Why: Parallel workstreams need independent agent processes
```

**Cross-Session Projects**
```
Requirements: memory persistence, historical context
Example: Long-running projects spanning weeks with evolving requirements
Why: Maintains context and decisions across multiple sessions
```

**Model Flexibility**
```
Requirements: Different models for different tasks
Example: Claude for reasoning, GPT for code, local models for privacy
Why: Not locked to OpenAI ecosystem
```

### ✅ Choose Codex Runtime For:

**Heavy Development Work**
```
Requirements: Multi-file operations, structured editing
Example: "Migrate 40 API routes to new authentication pattern"
Why: apply_patch handles complex refactoring as atomic operations
```

**Cost-Sensitive Projects**  
```
Requirements: Long development sessions, iterative work
Example: Extended debugging or large-scale implementation
Why: Fixed ChatGPT subscription vs per-token API charges
```

**Plugin-Heavy Workflows**
```
Requirements: Linear, GitHub, Gmail integration
Example: "Create Linear issue, implement fix, open PR, notify team"
Why: Native plugin ecosystem vs manual API integrations
```

**Sandbox Safety Requirements**
```
Requirements: Controlled execution, file safety
Example: Experimental code, unknown dependencies, security testing
Why: Isolated execution environment with permissions control
```

---

## 🔄 Runtime Switching Strategies

### Development Lifecycle Approach
```bash
# Phase 1: Planning (Standard Hermes)
/codex-runtime auto
"Analyze requirements and create implementation plan"

# Phase 2: Implementation (Codex Runtime)  
/codex-runtime codex_app_server
# Restart session
"Implement the authentication system across all routes"

# Phase 3: Review (Standard Hermes)
/codex-runtime auto  
"Review implementation against original requirements and document learnings"
```

### Task-Based Switching
```bash
# For memory-intensive tasks
/codex-runtime auto
"What did we decide about database schemas in our last 3 sessions?"

# For development-intensive tasks  
/codex-runtime codex_app_server
"Implement the database migration with proper error handling"
```

### Cost-Optimization Strategy
```bash
# Use Codex for token-heavy operations
/codex-runtime codex_app_server
# All file operations, terminal work, iterative debugging

# Switch back for planning/analysis
/codex-runtime auto
# Memory searches, strategic decisions, multi-agent coordination
```

---

## 📊 Real-World Performance Data

### Enterprise RBAC Migration Case Study

**Project:** 40+ API routes, TypeScript/Next.js/Supabase
**Timeline:** 3-hour development session

**Standard Hermes Approach (Estimated):**
- **File operations:** 25+ individual `patch` calls
- **API token usage:** ~15,000 tokens for development
- **Context switching:** Manual coordination between files
- **Cost:** $8-12 in API charges

**Codex Runtime Approach (Actual):**
- **File operations:** 3 structured `apply_patch` operations  
- **API token usage:** ~2,000 tokens for callbacks only
- **Execution:** Atomic multi-file operations
- **Cost:** ChatGPT subscription (no additional charges)

**Key insight:** 60% faster development, 85% cost reduction, better consistency.

---

## 🔧 Troubleshooting Runtime Issues

### Common Switching Problems

**"Runtime not changing"**
- **Cause:** Session not restarted after `/codex-runtime` command  
- **Solution:** Always restart Hermes session after runtime changes

**"Tools behaving differently"**  
- **Cause:** Tool mapping differences not understood
- **Solution:** Review tool mapping table above

**"Missing functionality"**
- **Cause:** Trying to use Hermes-only tools in Codex runtime
- **Solution:** Switch runtime or use alternative approach

### Performance Issues

**"Codex runtime slower than expected"**
- **Diagnostics:** Check Codex CLI version, plugin conflicts
- **Solution:** Update Codex, disable unnecessary plugins

**"Standard Hermes using too many tokens"**
- **Diagnostics:** Review conversation length, tool usage patterns  
- **Solution:** Use compression, shorter sessions, switch to Codex for development

---

## 📚 Related Guides

- **[Codex Integration Setup](./codex-integration.md)** - Complete setup process
- **[Hermes Configuration](./setup.md)** - Base installation guide
- **[Enterprise Deployment](../development/enterprise-deployment.md)** - Production considerations

---

*Choose the runtime that matches your task characteristics, not just your preferences.*