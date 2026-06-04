# JQL Reference

Quick reference guide for Jira Query Language (JQL) with common patterns and examples.

## Basic Syntax

```jql
field operator value
field operator value AND field operator value
field operator value OR field operator value
```

## Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equals | `status = "In Progress"` |
| `!=` | Not equals | `status != Done` |
| `>` | Greater than | `priority > Medium` |
| `>=` | Greater or equal | `created >= -7d` |
| `<` | Less than | `duedate < now()` |
| `<=` | Less or equal | `updated <= -2w` |
| `IN` | In list | `status IN ("To Do", "In Progress")` |
| `NOT IN` | Not in list | `type NOT IN (Epic, Story)` |
| `~` | Contains | `summary ~ "login"` |
| `!~` | Not contains | `summary !~ "test"` |
| `IS` | Is (null check) | `assignee IS EMPTY` |
| `IS NOT` | Is not (null check) | `assignee IS NOT EMPTY` |

## Fields Reference

### Core Fields

| Field | Description | Example Value |
|-------|-------------|---------------|
| `project` | Project key | `ABC`, `XYZ` |
| `status` | Issue status | `"In Progress"`, `Done` |
| `type` / `issuetype` | Issue type | `Story`, `Bug`, `Task`, `Epic` |
| `priority` | Priority level | `High`, `Medium`, `Low` |
| `assignee` | Assigned user | `"john.doe"`, `currentUser()` |
| `reporter` | Reporter | `"jane.smith"` |
| `creator` | Creator | `"admin"` |
| `summary` | Issue summary | Contains text |
| `description` | Issue description | Contains text |
| `labels` | Labels | `urgent`, `production` |
| `component` | Component | `"Frontend"`, `"API"` |
| `created` | Creation date | `2026-04-01`, `-7d` |
| `updated` | Update date | `2026-04-15`, `-2w` |
| `duedate` | Due date | `2026-05-01`, `now()` |
| `resolved` | Resolution date | `>= -30d` |
| `sprint` | Sprint | `"Sprint 25"`, `openSprints()` |

## Common Patterns

### By Project

```jql
# Single project
project = ABC

# Multiple projects
project IN (ABC, XYZ, DEF)

# Exclude project
project != TEST
```

### By Status

```jql
# Specific status
status = "In Progress"

# Multiple statuses
status IN ("To Do", "In Progress", "In Review")

# Not done
status != Done

# Not in closed states
status NOT IN (Done, Cancelled, Rejected)
```

### By Assignee

```jql
# Assigned to current user
assignee = currentUser()

# Assigned to specific user
assignee = "john.doe@example.com"

# Unassigned
assignee IS EMPTY

# Assigned (to anyone)
assignee IS NOT EMPTY

# Assigned to team members
assignee IN ("john.doe", "jane.smith", "bob.jones")
```

### By Type

```jql
# Specific type
type = Story

# Multiple types
type IN (Story, Task)

# Exclude type
type != Epic

# Only bugs
issuetype = Bug
```

### By Priority

```jql
# Exact priority
priority = High

# Multiple priorities
priority IN (High, Highest)

# High or higher
priority >= High

# Not low priority
priority != Low
```

### By Dates

```jql
# Created in last 7 days
created >= -7d

# Updated in last 2 weeks
updated >= -2w

# Updated in last month
updated >= -30d

# Due today or overdue
duedate <= now()

# Due in next 7 days
duedate >= now() AND duedate <= 7d

# Created between dates
created >= "2026-04-01" AND created <= "2026-04-15"

# Resolved this month
resolved >= startOfMonth()
```

### By Sprint

```jql
# Current sprint(s)
sprint in openSprints()

# Specific sprint
sprint = "Sprint 25"

# Future sprints
sprint in futureSprints()

# Not in any sprint
sprint IS EMPTY
```

### By Text Content

```jql
# Summary contains
summary ~ "login"

# Summary contains (case-insensitive)
summary ~ "authentication"

# Description contains
description ~ "database"

# Either field contains
summary ~ "API" OR description ~ "API"

# Summary does not contain
summary !~ "test"
```

### By Labels

```jql
# Has specific label
labels = urgent

# Has any of these labels
labels IN (urgent, critical, production)

# Has multiple labels (AND)
labels = urgent AND labels = backend

# Does not have label
labels != test
```

### By Component

```jql
# Specific component
component = Frontend

# Multiple components
component IN (Frontend, API)

# No component
component IS EMPTY
```

## Advanced Patterns

### Complex Combinations

```jql
# My open high-priority bugs
assignee = currentUser() 
AND type = Bug 
AND priority = High 
AND status != Done

# Unassigned stories in current sprint
type = Story 
AND sprint in openSprints() 
AND assignee IS EMPTY

# Overdue issues not done
duedate < now() 
AND status NOT IN (Done, Cancelled)

# Recent bugs in production
type = Bug 
AND labels = production 
AND created >= -7d
```

### Using Functions

```jql
# Current user's issues
assignee = currentUser()

# Issues updated by current user
updated > startOfDay() BY currentUser()

# Issues in active sprints
sprint in openSprints()

# Issues with future sprints
sprint in futureSprints()

# Start of week/month/year
created >= startOfWeek()
created >= startOfMonth()
created >= startOfYear()

# End of week/month/year
duedate <= endOfWeek()
duedate <= endOfMonth()
```

### Ordering Results

```jql
# Order by priority (high to low)
project = ABC ORDER BY priority DESC

# Order by created date (newest first)
project = ABC ORDER BY created DESC

# Order by status, then priority
project = ABC ORDER BY status, priority DESC

# Order by rank (backlog order)
project = ABC ORDER BY rank
```

## Common Use Cases

### Sprint Planning

```jql
# Backlog items for next sprint
project = ABC 
AND type IN (Story, Task) 
AND status = "To Do" 
AND sprint IS EMPTY 
ORDER BY priority DESC

# Issues carried over from last sprint
sprint = "Sprint 24" 
AND status != Done
```

### Bug Triage

```jql
# New bugs to triage
type = Bug 
AND status = "To Do" 
AND priority IS EMPTY 
ORDER BY created DESC

# Critical bugs not resolved
type = Bug 
AND priority IN (Highest, High) 
AND status != Done 
ORDER BY created ASC
```

### Team Workload

```jql
# Team's current work
assignee IN ("john.doe", "jane.smith", "bob.jones") 
AND status IN ("In Progress", "In Review") 
ORDER BY assignee, priority DESC

# Unassigned work
project = ABC 
AND sprint in openSprints() 
AND assignee IS EMPTY 
ORDER BY priority DESC
```

### Reporting

```jql
# Completed this month
project = ABC 
AND status = Done 
AND resolved >= startOfMonth() 
ORDER BY resolved DESC

# Velocity tracking
project = ABC 
AND sprint = "Sprint 25" 
AND status = Done

# Tech debt items
labels = tech-debt 
AND status != Done 
ORDER BY priority DESC
```

## Tips & Tricks

### Quoting

```jql
# Multi-word values need quotes
status = "In Progress"  ✓
status = In Progress    ✗

# Field names usually don't need quotes
status = Done          ✓
"status" = Done        ✓ (also works)
```

### Date Formats

```jql
# Relative dates (recommended)
created >= -7d         ✓ (last 7 days)
updated >= -2w         ✓ (last 2 weeks)

# Absolute dates
created >= "2026-04-01"  ✓
created >= 2026-04-01    ✗ (needs quotes)
```

### Performance

```jql
# Fastest (indexed fields)
project = ABC          ✓
status = Done          ✓
type = Story           ✓

# Slower (text search)
summary ~ "login"      ⚠️
description ~ "bug"    ⚠️

# Add project filter for better performance
project = ABC AND summary ~ "login"  ✓
```

## Validation

Use the Jira UI to validate JQL:
1. Go to Jira → Issues → Search for Issues
2. Click "Advanced" search
3. Enter JQL query
4. Click "Search" to validate syntax

---

**References**:
- [Official Atlassian JQL Documentation](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [JQL Functions Reference](https://support.atlassian.com/jira-software-cloud/docs/jql-functions/)

**Version**: 1.0.0 | **Last Updated**: April 15, 2026
