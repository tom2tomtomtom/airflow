# Three-Layer Context System

> Version: 2.0.0
> Last Updated: 2025-07-26
> System: Enhanced Agent OS with XML-structured workflows

## Overview

This project implements an enhanced three-layer context system for maximum development efficiency and consistency across all AI-assisted development workflows.

## Layer Architecture

### **Layer 1: Global Standards** (`~/.agent-os/standards/`)

Universal development principles that apply to all projects:

- **Tech Stack Defaults**: @~/.agent-os/standards/tech-stack.md
- **Code Style Rules**: @~/.agent-os/standards/code-style.md
- **Best Practices**: @~/.agent-os/standards/best-practices.md

### **Layer 2: Project Context** (`.agent-os/product/`)

AIRWAVE-specific configuration and decisions:

- **Mission & Vision**: @.agent-os/product/mission.md
- **Technical Architecture**: @.agent-os/product/tech-stack.md
- **Development Roadmap**: @.agent-os/product/roadmap.md
- **Decision History**: @.agent-os/product/decisions.md
- **Context System**: @.agent-os/product/context-system.md

### **Layer 3: Active Specifications** (`.agent-os/specs/`)

Feature-specific implementation details:

- **Active Specs**: @.agent-os/specs/
- **Spec Creation**: Use `@~/.agent-os/instructions/create-spec.md`
- **Task Execution**: Use `@~/.agent-os/instructions/execute-tasks.md`

## Enhanced Features

### **XML-Structured Workflows**

All Agent OS instructions now use XML blocks for:

- `<step_metadata>` - Clear step tracking
- `<analysis_areas>` - Structured analysis categories
- `<error_scenarios>` - Comprehensive error handling
- `<validation_checklists>` - Quality assurance

### **Cross-Reference System**

Use `@` prefix for all file references:

- `@~/.agent-os/` - Global Agent OS files
- `@.agent-os/` - Project-specific Agent OS files
- `@src/` - Source code references
- `@tests/` - Test file references

### **Workflow Composition**

Instructions can now compose and reference each other:

```markdown
Execute: @~/.agent-os/instructions/create-spec.md
Context: @.agent-os/product/mission.md
Standards: @~/.agent-os/standards/code-style.md
```

## Current AIRWAVE Context

### **Development Status**

- **Health Score**: 42/100 → Target: 80+
- **Phase**: Phase 1 (Code Quality & Performance)
- **Critical Blockers**: 3 high-priority issues blocking production

### **Priority Context Stack**

1. **Standards Layer**: Ruby on Rails tech stack preferences overridden by Next.js reality
2. **Project Layer**: AIRWAVE-specific AI video marketing platform requirements
3. **Specs Layer**: Current Phase 1 technical debt reduction specifications

### **Context Inheritance Rules**

- Project files in `.agent-os/product/` **OVERRIDE** global standards when conflicts arise
- Spec files in `.agent-os/specs/` **EXTEND** project context with specific implementation details
- User instructions **OVERRIDE** all documented context when explicitly provided

## Usage Instructions

### **For New Features**

```bash
# 1. Create spec using enhanced workflow
@~/.agent-os/instructions/create-spec.md

# 2. Context automatically loaded:
#    - Global standards applied
#    - Project mission/tech-stack referenced
#    - Current roadmap phase considered
```

### **For Code Changes**

```bash
# 1. Execute tasks with full context
@~/.agent-os/instructions/execute-tasks.md

# 2. All three layers inform implementation:
#    - Code style from global standards
#    - Architecture patterns from project context
#    - Specific requirements from active specs
```

### **Context Validation**

Before any major development work:

1. ✅ Verify global standards are current
2. ✅ Confirm project context reflects reality
3. ✅ Ensure active specs align with current roadmap
4. ✅ Check for context conflicts requiring resolution

## Quality Assurance

### **Context Consistency Checks**

- [ ] Global standards match actual team preferences
- [ ] Project tech stack reflects current implementation
- [ ] Roadmap status reflects actual development progress
- [ ] Decision log captures important architectural choices

### **Enhanced Error Handling**

- **Context Conflicts**: Clear resolution hierarchy documented
- **Missing Context**: Graceful degradation with warnings
- **Invalid References**: Automatic validation of `@` references
- **Workflow Failures**: Structured error scenarios with recovery paths

## Benefits

### **For Developers**

- **Consistent Experience**: Same workflow patterns across all features
- **Reduced Context Switching**: All relevant information automatically loaded
- **Quality Assurance**: Built-in validation and error handling
- **Historical Context**: Decision rationale preserved and accessible

### **For AI Assistants**

- **Comprehensive Context**: Three-layer system provides complete picture
- **Structured Workflows**: XML blocks enable reliable parsing and execution
- **Error Recovery**: Clear fallback patterns for edge cases
- **Reference Resolution**: `@` prefix system ensures accurate file access

---

_This enhanced context system enables sophisticated AI-assisted development while maintaining human oversight and project-specific customization._
