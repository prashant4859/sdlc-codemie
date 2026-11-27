# CodeMie Assistants Quick Reference

## Setup

```powershell
# Load shortcuts in current session
. .\assistant-shortcuts.ps1

# Add to your PowerShell profile for permanent access
echo ". C:\Users\prashant_chauhan\Desktop\AI_AGENTS_PROJECT\codemie\assistant-shortcuts.ps1" >> $PROFILE
. $PROFILE
```

## Available Assistants (9)

### 1. **Developer Assistant** (`dev-assist`)
- **ID:** `35b11d1e-c70d-4076-9d41-7dd99b4f3cb1`
- **Purpose:** Implements Jira stories from Implementation Plans, HLD, and LLD
- **Toolkits:** Jira, Confluence, Git, GitHub, Codebase Tools
- **Example:**
  ```powershell
  dev-assist "Implement story TP-1 in the sdlc-codemie repo"
  ```

### 2. **Design Architect** (`design-assist`)
- **ID:** `14f1e7c4-a940-4ca8-aed8-d5ec156a4ad7`
- **Purpose:** Converts implementation plans into HLD and LLD documents
- **Toolkits:** Jira, Confluence, Git, GitHub, Codebase Tools
- **Example:**
  ```powershell
  design-assist "Create HLD and LLD for TP-2 implementation plan"
  ```

### 3. **Implementation Planning Agent** (`plan-assist`)
- **ID:** `77f64e75-bf5b-4c33-8195-79e17bd9ab58`
- **Purpose:** Turns Jira stories into implementation plans and publishes to Confluence/GitHub
- **Toolkits:** Jira, Confluence, Git, GitHub, Codebase Tools
- **Example:**
  ```powershell
  plan-assist "Create implementation plan for TP-3"
  ```

### 4. **BA Story Drafter** (`ba-assist`)
- **ID:** `51953f43-337a-43dd-9166-1497f5a12e08`
- **Purpose:** Drafts Jira sub-tasks from requirement artifacts
- **Toolkits:** Jira, Confluence, Git, GitHub, Codebase Tools
- **Example:**
  ```powershell
  ba-assist "Draft sub-task from requirement gaps report for TP-4"
  ```

### 5. **Requirement Gap Analyst** (`gap-assist`)
- **ID:** `3c65cfc5-df59-4fb6-8414-3c16e59ea654`
- **Purpose:** Compares Jira stories against GitHub implementation to find gaps
- **Toolkits:** Jira, Confluence, Git, GitHub, Codebase Tools
- **Example:**
  ```powershell
  gap-assist "Analyze gaps for TP-5"
  ```

### 6. **BA Assistant** (`story-assist`)
- **ID:** `14b47b4d-1875-4e9d-89ab-28ee0a059515`
- **Purpose:** Generates User Stories with Gherkin scenarios
- **Toolkits:** Jira, Confluence, Git
- **Example:**
  ```powershell
  story-assist "Generate user story for task management feature"
  ```

### 7. **Documentation Agent** (`doc-assist`) ✨ NEW
- **ID:** `6f44351c-dcb2-4922-8165-e37fc4494fd9`
- **Purpose:** Maintains Confluence documentation and README files from Jira stories
- **Toolkits:** Jira, Confluence, Git
- **Workflow:** Draft-first with human approval before publishing
- **Example:**
  ```powershell
  doc-assist "Create Confluence documentation page for TP-6"
  doc-assist "Update README.md with new setup steps"
  ```

### 8. **Quality Agent** (`qa-assist`) ✨ NEW
- **ID:** `c9e893ef-54f7-4cf2-9d3b-2580b082679b`
- **Purpose:** Executes QA activities and creates test cases using quality-assurance-skill
- **Toolkits:** Jira, Confluence, GitHub
- **Skills:** quality-assurance-skill
- **Example:**
  ```powershell
  qa-assist "Generate functional, negative, and boundary test cases for login feature"
  qa-assist "Create test plan for TP-7"
  ```

### 9. **Code Reviewer** (`review-assist`) ✨ NEW
- **ID:** `80bacddd-4e80-49b3-ab13-25b357e017ef`
- **Purpose:** Reviews code changes against HLD/LLD design documents
- **Toolkits:** Confluence, GitHub, Codebase Tools, AgentWorkspace
- **Output:** Generates code-review.md with traceability map
- **Example:**
  ```powershell
  review-assist "Review PR #2 against HLD/LLD for TP-1"
  review-assist "Validate UI implementation matches design specs"
  ```

## Common Workflows

### Complete SDLC Flow
```powershell
# 1. Create user story
story-assist "Generate story for user authentication"

# 2. Analyze gaps
gap-assist "Analyze gaps for TP-10"

# 3. Draft sub-task
ba-assist "Draft sub-task from gaps for TP-10"

# 4. Create implementation plan
plan-assist "Create implementation plan for TP-10"

# 5. Create HLD/LLD
design-assist "Generate HLD and LLD for TP-10"

# 6. Implement
dev-assist "Implement story TP-10"

# 7. Review code
review-assist "Review TP-10 implementation against design"

# 8. Create tests
qa-assist "Generate test cases for TP-10"

# 9. Document
doc-assist "Create documentation page for TP-10"
```

## Advanced Usage

### Interactive Mode
```powershell
# Start interactive chat session (no message parameter)
dev-assist
```

### With Conversation History
```powershell
# Maintains context across calls
dev-assist "Continue work on TP-11" --load-history
```

### With File Uploads
```powershell
# Attach files to the conversation
doc-assist "Review this content" -f requirements.md
```

### Specific Conversation
```powershell
# Continue a specific conversation
dev-assist "Update status" --conversation-id conv-abc123
```

## Direct CLI Commands

If you prefer not to use shortcuts:

```powershell
# List all assistants
codemie sdk assistants list

# Get assistant details
codemie sdk assistants get <assistant-id>

# Chat with assistant
codemie sdk assistants chat <assistant-id> "Your message here"

# View conversations
codemie sdk assistants conversations <assistant-id> --limit 10
```

## Tips

1. **Load shortcuts** at the start of each session: `. .\assistant-shortcuts.ps1`
2. **Use `Show-MyAssistants`** to see all available commands
3. **Chain assistants** for complete workflows (e.g., plan → design → implement → review → test)
4. **Use `--load-history`** to maintain context across multiple calls
5. **New assistants** (doc-assist, qa-assist, review-assist) follow human-in-the-loop workflows

## Troubleshooting

```powershell
# Check if shortcuts are loaded
Get-Command dev-assist

# Reload shortcuts
. .\assistant-shortcuts.ps1

# Test connection
codemie sdk assistants list

# View assistant details
codemie sdk assistants get <assistant-id> --json
```
