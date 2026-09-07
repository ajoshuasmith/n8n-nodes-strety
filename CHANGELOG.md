# Changelog

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
