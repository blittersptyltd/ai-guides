# Hermes Agent Setup & Configuration

🛠️ **Complete installation and configuration guide for Hermes Agent development environment.**

*Production-ready setup with security, performance, and integration considerations.*

---

## 🚀 Quick Start

### System Requirements
- **OS:** Linux (Ubuntu/Debian recommended) or macOS
- **Node.js:** 18+ (20+ recommended)  
- **Python:** 3.9+ (for local skills and utilities)
- **Git:** For version control and skill management

### Basic Installation
```bash
# Install Hermes Agent
npm install -g hermes-agent

# Initialize configuration
hermes init

# Authenticate with provider
hermes auth
```

---

## 🔧 Essential Configuration

### Model Provider Setup
```yaml
# ~/.hermes/config.yaml
model:
  provider: anthropic  # or openai, openrouter
  model: claude-sonnet-4
  # context_length: null  # auto-detect recommended

auxiliary:
  provider: anthropic
  model: claude-sonnet-4  # match main for consistency
```

### Memory & Session Management
```yaml
# Session database and memory
sessions:
  database_path: ~/.hermes/sessions.db
  max_size: 1000000  # 1GB limit

memory:
  max_entries: 100
  compression_threshold: 4000
```

### Platform Integration
```yaml
# Enable messaging platforms
platforms:
  telegram:
    enabled: true
    token: YOUR_BOT_TOKEN
  
  discord:
    enabled: false
    
  local:
    enabled: true  # Always keep for development
```

---

## 🛡️ Security Configuration

### Environment Variables
```bash
# ~/.hermes/.env
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
HERMES_TELEGRAM_TOKEN=your_bot_token

# Linear integration (optional)
LINEAR_API_KEY=your_linear_key

# GitHub integration (optional)  
GITHUB_TOKEN=your_github_token
```

### Permissions & Safety
```yaml
# config.yaml security settings
safety:
  confirm_dangerous_commands: true
  sandbox_file_operations: true
  max_file_size: 10485760  # 10MB

execution:
  timeout_seconds: 180
  max_memory_mb: 512
```

---

## 📁 Directory Structure

### Standard Layout
```
~/.hermes/
├── config.yaml           # Main configuration
├── .env                 # Environment secrets  
├── sessions.db          # Session history
├── skills/              # Custom skills
│   ├── software-development/
│   ├── devops/
│   └── productivity/
├── cache/               # Temporary files
├── logs/                # Debug logs
└── hermes-agent/        # Core installation
    ├── website/docs/    # Documentation
    └── plugins/         # Available plugins
```

### Skills Organization
```
~/.hermes/skills/
├── category/
│   ├── skill-name/
│   │   ├── SKILL.md     # Main skill content
│   │   ├── references/  # Supporting docs
│   │   ├── templates/   # Code templates
│   │   └── scripts/     # Automation scripts
```

---

## 🔌 Integration Setup

### Linear Project Management
```bash
# Get Linear API key from https://linear.app/settings/api
export LINEAR_API_KEY=lin_api_...

# Test connection
hermes linear test-connection
```

### GitHub Development  
```bash
# Install GitHub CLI
curl -fsSL https://cli.github.com/install.sh | sh

# Authenticate
gh auth login

# Configure for Hermes
hermes github setup
```

### Obsidian Knowledge Base
```bash
# Set vault path for knowledge management
export OBSIDIAN_VAULT_PATH=/path/to/vault

# Test access
hermes obsidian test-access
```

---

## 🎯 Development Workflow Setup

### Local Development
```bash
# Create development workspace
mkdir ~/ai-projects
cd ~/ai-projects

# Initialize Hermes project context
hermes workspace init

# Configure project-specific settings
hermes config set workdir $(pwd)
```

### Version Control Integration
```bash
# Configure git for Hermes commits
git config user.name "Hermes Agent"
git config user.email "hermes@yourdomain.com"

# Setup commit signing (optional)
hermes git setup-signing
```

### Terminal Integration
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.hermes/bin:$PATH"

# Enable command completion
eval "$(hermes completion)"
```

---

## 🚀 Performance Optimization

### Context Management
```yaml
# Optimize for large projects
model:
  context_strategy: adaptive
  compression_enabled: true
  max_context_tokens: 200000  # Match model capacity
```

### Caching Strategy
```yaml
cache:
  enabled: true
  max_size_mb: 1024
  ttl_hours: 24
  
  # Cache expensive operations
  skills: true
  web_search: true
  file_analysis: true
```

### Resource Limits
```yaml
execution:
  max_concurrent_processes: 4
  file_watch_limit: 1000
  memory_threshold_mb: 2048
```

---

## 🔍 Troubleshooting Setup

### Common Issues

**1. Authentication Errors**
```bash
# Clear and re-authenticate
hermes auth clear
hermes auth login

# Verify provider access
hermes test-connection
```

**2. Permission Denied**
```bash
# Fix file permissions
chmod 755 ~/.hermes
chmod 600 ~/.hermes/.env

# Reset configuration
hermes config reset
```

**3. Skills Not Loading**
```bash
# Refresh skills cache
hermes skills refresh

# Validate skill format
hermes skills validate skill-name
```

### Debug Mode
```bash
# Enable verbose logging
export HERMES_DEBUG=true

# Run with debug output
hermes --verbose --log-level debug

# Check logs
tail -f ~/.hermes/logs/hermes.log
```

---

## 📊 Health Monitoring

### System Health Check
```bash
# Run comprehensive health check
hermes doctor

# Check specific components
hermes health database
hermes health providers
hermes health integrations
```

### Performance Monitoring
```bash
# Monitor resource usage
hermes stats

# Session database health
hermes sessions health

# Skill performance metrics
hermes skills stats
```

---

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update Hermes Agent
npm update -g hermes-agent

# Update skills
hermes skills update-all

# Backup before updates
hermes backup create
```

### Configuration Migration
```bash
# Backup current config
cp ~/.hermes/config.yaml ~/.hermes/config.backup

# Migrate to new version
hermes config migrate

# Validate migration
hermes config validate
```

---

## 📚 Next Steps

### Essential Skills to Install
```bash
# Core development skills
hermes skills install software-development/codex-native
hermes skills install github/pr-workflow
hermes skills install devops/linear-tracking

# Productivity skills  
hermes skills install obsidian/note-taking
hermes skills install productivity/todo-management
```

### Integration Guides
- **[Codex Integration](./codex-integration.md)** - Native Codex CLI setup
- **[Tools Comparison](./tools-comparison.md)** - Runtime selection guide
- **[Enterprise Deployment](../development/enterprise-deployment.md)** - Production setup

---

*This setup provides a robust foundation for enterprise AI development workflows.*