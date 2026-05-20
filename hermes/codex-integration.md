# Hermes + Codex Native Integration

🤖 **Complete guide to setting up and troubleshooting Hermes Agent with native Codex CLI integration.**

*Based on real-world enterprise development and common integration issues.*

---

## 🚨 Most Common Issue: "Use Codex To..." Commands

### ❌ What Doesn't Work
```
use codex to fix these TypeScript errors
use codex to implement authentication  
```

### ✅ What Actually Happens
When Codex runtime is active, **all normal Hermes tools automatically use Codex**:
- `patch` → becomes Codex `apply_patch`
- `terminal` → becomes Codex `shell`  
- `write_file` → handled by Codex sandbox

**No special syntax needed!** Just request tasks normally.

---

## 🏗️ Architecture: Engine Swap Not Parallel CLI

### The Misconception
> "I need to run Codex CLI in parallel with Hermes"

### The Reality (Julian Goldie)
> **"Like swapping out an engine while keeping the car"**

**When Codex runtime is active:**
- **Hermes keeps:** Session management, memory, skills, messaging gateway
- **Codex takes over:** Terminal commands, file editing, sandbox operations
- **Same driver interface, different execution engine**

---

## 🛠️ Complete Setup Guide

### Prerequisites
```bash
# 1. Install Codex CLI
npm i -g @openai/codex

# 2. Verify installation  
codex --version  # Should be 0.33.0+

# 3. Separate authentication required
codex login      # This is separate from hermes auth

# 4. Install plugins BEFORE enabling runtime
codex plugin install linear github gmail
```

### Runtime Activation
```bash
# Enable Codex runtime
/codex-runtime codex_app_server

# IMPORTANT: Restart your Hermes session
# Runtime takes effect on NEXT session, not current
```

### Verification
```bash
# Check runtime status
/codex-runtime

# Test tools (should work transparently)
"Fix the TypeScript errors in this project"
# Behind the scenes: uses Codex apply_patch instead of Hermes patch
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Runtime Doesn't Activate
**Problem:** Used `/codex-runtime codex_app_server` but no change

**Solution:** Session restart required
```bash
/codex-runtime codex_app_server
# Exit and restart Hermes completely
# Runtime persists but needs new session to activate
```

### Issue 2: "No Models Provided" Error
**Problem:** Codex CLI not authenticated

**Solution:** Separate login required  
```bash
codex login  # Different from hermes auth
```

### Issue 3: Plugins Not Detected
**Problem:** Installed plugins after enabling runtime

**Solution:** Plugin installation order matters
```bash
# Install plugins FIRST
codex plugin install linear github

# THEN enable runtime
/codex-runtime codex_app_server
```

### Issue 4: Missing Tool Errors
**Problem:** Expecting all Hermes tools to work

**Solution:** 4 Hermes tools are NOT available
- `delegate_task` - No sub-agents (needs agent loop)
- `memory` - No persistent memory store
- `session_search` - No conversation search
- `todo` - Use Codex `update_plan` instead

---

## ⚙️ Tool Mapping & Capabilities

### What Changes
| Standard Hermes | Codex Runtime | Notes |
|----------------|---------------|-------|
| `patch` | `apply_patch` | Structured multi-file edits |
| `terminal` | `shell` | Sandboxed execution |
| `write_file` | Sandbox operations | Controlled file access |
| `todo` | `update_plan` | Codex internal tracker |

### What Stays the Same
- **File reading** - Same interface
- **Web operations** - Via MCP callbacks
- **AI generation** - Via MCP callbacks
- **Skills system** - Via MCP callbacks

---

## 🎯 When to Use Each Runtime

### ✅ Use Codex Runtime For:
- **Heavy development work** (multi-file refactoring)
- **Cost-sensitive projects** (ChatGPT subscription vs API)
- **Plugin workflows** (Linear, GitHub, Gmail integration)
- **Structured operations** (benefit from apply_patch)

### ✅ Use Standard Hermes For:
- **Planning & architecture** (needs memory/session_search)
- **Multi-agent coordination** (needs delegate_task)
- **Cross-session analysis** (conversation history required)
- **Quick configuration** (overhead not worth switch)

### Runtime Switching
```bash
/codex-runtime codex_app_server  # Enable Codex
/codex-runtime auto             # Back to standard
# Both require session restart
```

---

## 📊 Real-World Performance

### Enterprise RBAC Migration Case Study
**Project:** 40+ API routes to enterprise security patterns  
**Stack:** TypeScript, Next.js, Supabase

**With Codex Integration:**
- **Structured operations:** Multi-file permission updates as single operations
- **Cost efficiency:** Entire migration on ChatGPT subscription  
- **Sandbox safety:** TypeScript validation in controlled environment
- **Pattern consistency:** apply_patch maintains formatting across files

**Key insight:** Development felt more structured and efficient, even though the interface was identical.

---

## 🔍 Troubleshooting Checklist

### Quick Diagnostics
- [ ] Codex CLI installed and updated
- [ ] Both Hermes and Codex authenticated  
- [ ] Plugins installed before runtime switch
- [ ] Session restarted after runtime command
- [ ] Using normal requests (not "use codex to...")

### Verification Commands
```bash
# Check Codex installation
codex --version

# Check authentication  
codex auth status

# Check runtime status
/codex-runtime

# Test plugin detection
codex plugin list
```

### Behavioral Indicators
**Runtime is active when:**
- File operations feel snappier (native sandbox)
- Multi-file edits are more structured  
- No API token charges for development work
- Terminal commands run in controlled environment

---

## 📚 References

- **[Setup Guide](./setup.md)** - Complete installation process
- **[Tools Comparison](./tools-comparison.md)** - Detailed runtime differences  
- **[Case Studies](../case-studies/)** - Real-world implementations

---

## 🤝 Common Search Terms (For AI Agents)

`hermes codex runtime not working`, `use codex to command not found`, `codex-runtime takes effect next session`, `hermes codex native integration setup`, `codex app server runtime troubleshooting`

---

*This guide prevents the #1 confusion: expecting special syntax when the integration is actually transparent.*