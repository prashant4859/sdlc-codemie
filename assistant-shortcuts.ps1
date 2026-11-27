# CodeMie Assistant Shortcuts
# Source this file: . .\assistant-shortcuts.ps1

# Developer Assistant - Implements Jira stories from Implementation Plans
function Start-DeveloperAssistant {
    param([string]$Message = "")
    $assistantId = "35b11d1e-c70d-4076-9d41-7dd99b4f3cb1"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Developer Assistant (Implementation Engineer)..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name dev-assist -Value Start-DeveloperAssistant

# Design Architect - Creates HLD/LLD from Implementation Plans
function Start-DesignAssistant {
    param([string]$Message = "")
    $assistantId = "14f1e7c4-a940-4ca8-aed8-d5ec156a4ad7"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Design Architect Assistant..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name design-assist -Value Start-DesignAssistant

# Implementation Planning Agent
function Start-PlanningAssistant {
    param([string]$Message = "")
    $assistantId = "77f64e75-bf5b-4c33-8195-79e17bd9ab58"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Implementation Planning Assistant..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name plan-assist -Value Start-PlanningAssistant

# BA Story Drafter
function Start-BAAssistant {
    param([string]$Message = "")
    $assistantId = "51953f43-337a-43dd-9166-1497f5a12e08"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting BA Story Drafter Assistant..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name ba-assist -Value Start-BAAssistant

# Requirement Gap Analyst
function Start-GapAnalystAssistant {
    param([string]$Message = "")
    $assistantId = "3c65cfc5-df59-4fb6-8414-3c16e59ea654"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Requirement Gap Analyst Assistant..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name gap-assist -Value Start-GapAnalystAssistant

# BA Assistant (User Story Generator)
function Start-UserStoryAssistant {
    param([string]$Message = "")
    $assistantId = "14b47b4d-1875-4e9d-89ab-28ee0a059515"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting BA Assistant (User Story Generator)..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name story-assist -Value Start-UserStoryAssistant

# Documentation Agent - Maintains Confluence and project documentation
function Start-DocumentationAssistant {
    param([string]$Message = "")
    $assistantId = "6f44351c-dcb2-4922-8165-e37fc4494fd9"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Documentation Agent..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name doc-assist -Value Start-DocumentationAssistant

# Quality Agent - Executes QA activities and test creation
function Start-QualityAssistant {
    param([string]$Message = "")
    $assistantId = "c9e893ef-54f7-4cf2-9d3b-2580b082679b"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Quality Agent (QA)..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name qa-assist -Value Start-QualityAssistant

# Code Reviewer Assistant - Reviews code against HLD/LLD
function Start-CodeReviewerAssistant {
    param([string]$Message = "")
    $assistantId = "80bacddd-4e80-49b3-ab13-25b357e017ef"

    if ($Message) {
        codemie sdk assistants chat $assistantId $Message --load-history
    } else {
        Write-Host "Starting Code Reviewer Assistant..." -ForegroundColor Green
        Write-Host "Assistant ID: $assistantId" -ForegroundColor Gray
        codemie sdk assistants chat $assistantId
    }
}
Set-Alias -Name review-assist -Value Start-CodeReviewerAssistant

# List all assistants
function Show-MyAssistants {
    Write-Host "`nYour CodeMie Assistants:" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "1. dev-assist      - Developer Assistant (Implementation Engineer)"
    Write-Host "2. design-assist   - Design Architect (HLD/LLD Creator)"
    Write-Host "3. plan-assist     - Implementation Planning Agent"
    Write-Host "4. ba-assist       - BA Story Drafter"
    Write-Host "5. gap-assist      - Requirement Gap Analyst"
    Write-Host "6. story-assist    - BA Assistant (User Story Generator)"
    Write-Host "7. doc-assist      - Documentation Agent (Confluence/README)"
    Write-Host "8. qa-assist       - Quality Agent (Test Creation)"
    Write-Host "9. review-assist   - Code Reviewer (Design-Driven Review)"
    Write-Host ""
    Write-Host "Usage Examples:" -ForegroundColor Yellow
    Write-Host '  dev-assist "Implement story TP-123"'
    Write-Host '  plan-assist "Create implementation plan for TP-456"'
    Write-Host '  doc-assist "Draft Confluence page for TP-789"'
    Write-Host '  qa-assist "Generate test cases for the login feature"'
    Write-Host '  review-assist "Review PR against HLD/LLD"'
    Write-Host ""
}

Write-Host "CodeMie Assistant Shortcuts Loaded! Type 'Show-MyAssistants' to see all commands." -ForegroundColor Green
