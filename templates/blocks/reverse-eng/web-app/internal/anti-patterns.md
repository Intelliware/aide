---
slug: anti-patterns
title: "Anti-Patterns"
applies-to: [re-web-app-internal]
requires-decision-from: [code-reader]
optional: false
order-hint: 300
---

## 20. Anti-Patterns

### 20.1 Common Mistakes to Avoid

**Anti-Pattern 1: Storing Large Objects in Redux**
- **Problem:** Every state change triggers a re-render of every connected component
- **Solution:** Normalize state, store only IDs in lists, use selectors to join
- **Example:**
  ```typescript
  // WRONG
  const state = { tickets: { 'id1': { id, title, description, ... 100 fields } } };

  // RIGHT
  const state = {
    tickets: { byId: { 'id1': { id, title } }, allIds: ['id1'] },
    ticketDetails: { 'id1': { full 100-field object } },
  };
  ```

**Anti-Pattern 2: Calling API on Every Render**
- **Problem:** Infinite requests, server overload
- **Solution:** Use `useEffect` with dependency array, cache results
- **Example:**
  ```typescript
  // WRONG
  const tickets = await ticketService.getTickets(); // Called every render!

  // RIGHT
  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);
  ```

**Anti-Pattern 3: Not Handling Loading/Error States**
- **Problem:** Users see outdated data while loading, don't know if it failed
- **Solution:** Always show loading spinner and error message
- **Example:**
  ```typescript
  // WRONG
  const TicketList = () => <div>{tickets.map(...)}</div>;

  // RIGHT
  const TicketList = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    return <div>{tickets.map(...)}</div>;
  };
  ```

**Anti-Pattern 4: Coupling Components to Routing**
- **Problem:** Hard to test, hard to reuse, hard to nest
- **Solution:** Pass data as props, keep routing separate
- **Example:**
  ```typescript
  // WRONG
  const TicketDetail = () => {
    const { id } = useParams();
    const ticket = useSelector(selectTicket(id)); // Couples component to routing
  };

  // RIGHT
  const TicketDetail: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    return <div>{ticket.title}</div>;
  };
  ```

**Anti-Pattern 5: Inline Styles or Hardcoded Values**
- **Problem:** Hard to maintain, inconsistent design, hard to change theme
- **Solution:** Always use design tokens
- **Example:**
  ```typescript
  // WRONG
  <div style={{ color: '#007bff', padding: '16px' }}>

  // RIGHT
  <div className={styles.container}>
  // In CSS Module: color: $color-primary; padding: $spacing-md;
  ```

---

# Part 8 — Reference
