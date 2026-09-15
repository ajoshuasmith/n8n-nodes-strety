# Changelog

## 0.2.1 — 2026-09-15

- Validate metric check-in periods against the parent metric frequency before POST, including ISO week/year boundaries and finite numeric values.
- Preserve flattened JSON:API included records in an additive `included` output array on Get/Get Many; list items carry the included records from their response page.
- Propagate filter and include-expression errors instead of silently broadening requests.
- Supply the default document type for legacy Playbook Create.
- Convert date-time inputs for calendar-date attributes while preserving the selected local date.
- Retry explicit HTTP 429 rejections up to three times, honoring Retry-After values up to 120 seconds. Other failures are not replayed.

## 0.2.0 — 2026-09-07

- Add Doc and Doc Folder operations using the current endpoints and JSON:API types.
- Migrate saved Playbook and Playbook Folder workflows internally while preserving parameters and legacy output conventions ahead of the February 19, 2027 endpoint removal.
- Add goal, headline, and issue Archive/Unarchive operations and archive-state filters.
- Add daily metric frequency and date-based daily check-ins.
- Add Shoutout CRUD, Review list/get, and People Get Current Person.
- Add goal status, resolved issue, completed meeting/todo, and people name/email/deactivation filters.
- Add resource pickers for the new resources and archive actions.
- Enable the existing Strety node for n8n AI Agent tool use and document practical tool sets.
- Recheck rate-limit slots after waiting to prevent concurrent tool calls from exceeding the process-local budget.
- Add API contract and native AI tool-wrapper smoke tests.
