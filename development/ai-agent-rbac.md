# AI Agent RBAC Security Patterns

🔐 **Enterprise security frameworks for AI applications with role-based access control.**

*Comprehensive patterns for securing AI agents in multi-tenant environments.*

---

## 🎯 Overview

### Challenge
AI agents require sophisticated permission systems to operate safely in enterprise environments while maintaining multi-tenant isolation and compliance requirements.

### Approach  
**Role-Based Access Control (RBAC)** adapted for AI agent operations with:
- **Permission boundaries** for agent actions
- **Multi-tenant isolation** for SaaS platforms
- **Audit logging** for compliance tracking
- **Dynamic permissions** for context-aware access

---

## 🏗️ RBAC Architecture for AI

### Permission Hierarchy
```
Platform Level (Super Admin)
  ↓
Company Level (Tenant)
  ↓  
Team Level (Business Unit)
  ↓
User Level (Individual)
  ↓
AI Agent Level (Automated Actions)
```

### Core Permission Types
```typescript
// Platform permissions
PLATFORM_ADMIN_ACCESS = 'platform.admin.access'
PLATFORM_SYSTEM_MONITOR = 'platform.system.monitor'

// Company permissions  
COMPANY_VIEW = 'company.view'
COMPANY_SETTINGS_MANAGE = 'company.settings.manage'
COMPANY_AI_AGENTS_MANAGE = 'company.ai.agents.manage'

// Team permissions
TEAM_VIEW = 'team.view'
TEAM_MEMBERS_MANAGE = 'team.members.manage'
TEAM_AI_DELEGATE = 'team.ai.delegate'

// AI Agent permissions
AI_AGENT_FILE_READ = 'ai.agent.file.read'
AI_AGENT_FILE_WRITE = 'ai.agent.file.write'
AI_AGENT_API_CALL = 'ai.agent.api.call'
AI_AGENT_SYSTEM_ACCESS = 'ai.agent.system.access'
```

---

## 🤖 AI Agent Permission Framework

### Agent Authentication
```typescript
interface AIAgentContext {
  agentId: string;
  userId: string;        // User who delegated to agent
  companyId: string;     // Tenant isolation
  teamId?: string;       // Team scope (optional)
  sessionId: string;     // Session tracking
  permissions: string[]; // Inherited permissions
  restrictions: {        // Additional constraints
    fileAccess: string[];
    apiEndpoints: string[];
    timeWindow: { start: Date; end: Date };
    maxOperations: number;
  };
}
```

### Permission Inheritance
```typescript
// AI agents inherit permissions from delegating user
// but with additional restrictions for safety

async function createAIAgentContext(
  userId: string,
  delegationScope: 'team' | 'company' | 'personal'
): Promise<AIAgentContext> {
  // 1. Get user permissions
  const userPermissions = await getUserPermissions(userId);
  
  // 2. Apply AI agent restrictions
  const agentPermissions = userPermissions.filter(permission => 
    AI_SAFE_PERMISSIONS.includes(permission)
  );
  
  // 3. Add scope-specific restrictions
  const restrictions = getDelegationRestrictions(delegationScope);
  
  return {
    agentId: generateAgentId(),
    userId,
    permissions: agentPermissions,
    restrictions,
    // ...
  };
}
```

---

## 🛡️ Security Patterns

### 1. Least Privilege Principle
```typescript
// AI agents start with minimal permissions
// Grant additional permissions only as needed

const DEFAULT_AI_PERMISSIONS = [
  'ai.agent.file.read',      // Read project files
  'team.view',               // View team information
  'company.view'             // View company information
];

// Restricted by default
const PRIVILEGED_PERMISSIONS = [
  'ai.agent.file.write',     // Modify files
  'ai.agent.system.access',  // System commands
  'team.members.manage',     // Team management
  'company.settings.manage'  // Company settings
];
```

### 2. Time-Bounded Access
```typescript
interface TemporaryPermission {
  permission: string;
  grantedAt: Date;
  expiresAt: Date;
  grantedBy: string;
  reason: string;
}

// Grant temporary elevated access
async function grantTemporaryPermission(
  agentId: string,
  permission: string,
  durationMinutes: number,
  reason: string
): Promise<void> {
  const tempPermission: TemporaryPermission = {
    permission,
    grantedAt: new Date(),
    expiresAt: new Date(Date.now() + durationMinutes * 60000),
    grantedBy: getCurrentUserId(),
    reason
  };
  
  await storeTemporaryPermission(agentId, tempPermission);
  
  // Auto-revoke when expired
  schedulePermissionRevocation(agentId, permission, tempPermission.expiresAt);
}
```

### 3. Operation Approval Gates
```typescript
// Critical operations require human approval
const APPROVAL_REQUIRED_ACTIONS = [
  'file.delete',
  'user.invite', 
  'team.delete',
  'company.settings.modify',
  'payment.process'
];

async function checkApprovalRequired(
  agentContext: AIAgentContext,
  action: string,
  target: string
): Promise<boolean> {
  if (APPROVAL_REQUIRED_ACTIONS.includes(action)) {
    return await requestUserApproval(
      agentContext.userId,
      `AI agent wants to ${action} on ${target}`,
      { timeoutMinutes: 5 }
    );
  }
  return true;
}
```

---

## 🔍 Multi-Tenant Security

### Tenant Isolation
```typescript
// Ensure AI agents respect tenant boundaries
async function enforceTenatIsolation(
  agentContext: AIAgentContext,
  requestedResource: string
): Promise<boolean> {
  // 1. Extract resource company ID
  const resourceCompanyId = extractCompanyId(requestedResource);
  
  // 2. Verify agent has access to this company
  if (resourceCompanyId !== agentContext.companyId) {
    await logSecurityViolation(agentContext, 'tenant_boundary_violation', {
      requestedResource,
      agentCompany: agentContext.companyId,
      resourceCompany: resourceCompanyId
    });
    return false;
  }
  
  return true;
}
```

### Resource Scoping
```typescript
// Scope AI agent database queries to tenant
function scopeQueryToTenant<T>(
  query: QueryBuilder<T>,
  agentContext: AIAgentContext
): QueryBuilder<T> {
  return query.where('company_id', agentContext.companyId);
}

// Usage in AI agent operations
async function getTeamMembers(
  agentContext: AIAgentContext,
  teamId: string
): Promise<User[]> {
  // Automatically scoped to agent's company
  return await scopeQueryToTenant(
    db.select().from('users').where('team_id', teamId),
    agentContext
  ).execute();
}
```

---

## 📊 Audit & Compliance

### Comprehensive Audit Logging
```typescript
interface AIAgentAuditEvent {
  eventId: string;
  timestamp: Date;
  agentId: string;
  userId: string;           // Delegating user
  companyId: string;        // Tenant
  action: string;           // What the agent did
  resource: string;         // What it acted upon
  permission: string;       // Permission used
  result: 'success' | 'denied' | 'error';
  context: {
    sessionId: string;
    userAgent: string;
    ipAddress: string;
    requestId: string;
  };
  metadata: Record<string, any>;
}

async function logAIAgentAction(
  agentContext: AIAgentContext,
  action: string,
  resource: string,
  result: 'success' | 'denied' | 'error',
  metadata: Record<string, any> = {}
): Promise<void> {
  const auditEvent: AIAgentAuditEvent = {
    eventId: generateEventId(),
    timestamp: new Date(),
    agentId: agentContext.agentId,
    userId: agentContext.userId,
    companyId: agentContext.companyId,
    action,
    resource,
    permission: getCurrentPermission(action),
    result,
    context: getRequestContext(),
    metadata
  };
  
  await storeAuditEvent(auditEvent);
  
  // Real-time monitoring for security events
  if (result === 'denied') {
    await alertSecurityTeam(auditEvent);
  }
}
```

### Compliance Reporting
```typescript
// Generate compliance reports for auditors
async function generateAIComplianceReport(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<ComplianceReport> {
  const agentEvents = await getAIAgentEvents(companyId, startDate, endDate);
  
  return {
    period: { startDate, endDate },
    summary: {
      totalAgentOperations: agentEvents.length,
      deniedOperations: agentEvents.filter(e => e.result === 'denied').length,
      uniqueAgents: new Set(agentEvents.map(e => e.agentId)).size,
      privilegedOperations: agentEvents.filter(e => 
        PRIVILEGED_OPERATIONS.includes(e.action)
      ).length
    },
    securityEvents: agentEvents.filter(e => e.result === 'denied'),
    permissionUsage: analyzePermissionUsage(agentEvents),
    recommendations: generateSecurityRecommendations(agentEvents)
  };
}
```

---

## 🚀 Implementation Patterns

### Route Protection for AI Agents
```typescript
// Protect API routes with AI agent context
export async function withAIAgentAuth<T>(
  request: Request,
  requiredPermission: string,
  handler: (agentContext: AIAgentContext) => Promise<T>
): Promise<Response> {
  try {
    // 1. Extract AI agent context from request
    const agentContext = await extractAIAgentContext(request);
    
    // 2. Verify agent has required permission
    if (!agentContext.permissions.includes(requiredPermission)) {
      await logAIAgentAction(agentContext, 'access_denied', 
        `${request.method} ${request.url}`, 'denied');
      return new Response('Insufficient permissions', { status: 403 });
    }
    
    // 3. Check tenant isolation
    if (!await enforceTenatIsolation(agentContext, request.url)) {
      return new Response('Tenant access violation', { status: 403 });
    }
    
    // 4. Execute handler with agent context
    const result = await handler(agentContext);
    
    // 5. Log successful operation
    await logAIAgentAction(agentContext, request.method.toLowerCase(),
      request.url, 'success');
    
    return NextResponse.json(result);
    
  } catch (error) {
    await logAIAgentAction(agentContext, 'error', request.url, 'error', {
      error: error.message
    });
    throw error;
  }
}
```

### Permission Middleware
```typescript
// Middleware for AI agent permission checking
export function requireAIPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const agentContext = req.aiAgentContext;
    
    if (!agentContext) {
      return res.status(401).json({ error: 'No AI agent context' });
    }
    
    if (!agentContext.permissions.includes(permission)) {
      logAIAgentAction(agentContext, 'permission_denied', 
        `${req.method} ${req.path}`, 'denied');
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

---

## ⚙️ Dynamic Permissions

### Context-Aware Access
```typescript
// Permissions that change based on context
async function getDynamicPermissions(
  agentContext: AIAgentContext,
  resource: string
): Promise<string[]> {
  const basePermissions = agentContext.permissions;
  const dynamicPermissions = [];
  
  // Time-based permissions
  const currentHour = new Date().getHours();
  if (currentHour >= 9 && currentHour <= 17) {
    dynamicPermissions.push('ai.agent.business_hours_access');
  }
  
  // Resource-based permissions
  if (await isResourceOwnedByUser(resource, agentContext.userId)) {
    dynamicPermissions.push('ai.agent.owner_access');
  }
  
  // Team-based permissions
  if (await isUserTeamLead(agentContext.userId, agentContext.teamId)) {
    dynamicPermissions.push('ai.agent.team_lead_access');
  }
  
  return [...basePermissions, ...dynamicPermissions];
}
```

### Adaptive Security
```typescript
// Increase security requirements based on risk
async function assessOperationRisk(
  agentContext: AIAgentContext,
  operation: string,
  target: string
): Promise<'low' | 'medium' | 'high'> {
  const factors = {
    // Operation risk
    operationRisk: OPERATION_RISK_MAP[operation] || 'low',
    
    // Target sensitivity
    targetSensitivity: await getResourceSensitivity(target),
    
    // Agent history
    agentHistory: await getAgentRiskScore(agentContext.agentId),
    
    // Time context
    timeRisk: isOutsideBusinessHours() ? 'medium' : 'low'
  };
  
  return calculateOverallRisk(factors);
}

// Apply additional security for high-risk operations
async function applyRiskBasedSecurity(
  agentContext: AIAgentContext,
  operation: string,
  target: string
): Promise<boolean> {
  const risk = await assessOperationRisk(agentContext, operation, target);
  
  switch (risk) {
    case 'low':
      return true; // Proceed normally
      
    case 'medium':
      // Require additional verification
      return await verifyUserPresence(agentContext.userId);
      
    case 'high':
      // Require explicit approval + MFA
      return await requireMFAApproval(agentContext.userId, operation, target);
  }
}
```

---

## 📚 Related Patterns

### Integration with Existing Systems
- **[Enterprise Deployment](./enterprise-deployment.md)** - Production RBAC setup
- **[Multi-Tenant Architecture](./multi-tenant-patterns.md)** - SaaS isolation patterns
- **[Audit Logging](./audit-logging.md)** - Compliance frameworks

### Case Studies
- **[RBAC Migration](../case-studies/rbac-migration.md)** - Real-world implementation
- **[AI Agent Security](../case-studies/ai-security-audit.md)** - Security assessment

### Tools & Utilities  
- **[RBAC Validation Tools](../tools/validation/rbac-checker.ts)** - Automated testing
- **[Permission Analysis](../tools/scripts/permission-audit.ts)** - Security gap analysis

---

*AI agent RBAC requires careful balance between automation capabilities and security constraints.*