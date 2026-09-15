# n8n-nodes-strety

[![npm version](https://img.shields.io/npm/v/@joshuanode/n8n-nodes-strety.svg)](https://www.npmjs.com/package/@joshuanode/n8n-nodes-strety)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-community%20node-orange.svg)](https://n8n.io/)
[![GitHub](https://img.shields.io/badge/GitHub-repo-black.svg?logo=github)](https://github.com/ajoshuasmith/n8n-nodes-strety)

This is an n8n community node for integrating with the [Strety](https://strety.com/) strategic planning and EOS performance management platform.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

> Contributions are welcome! Please report any issues or submit pull requests on [GitHub](https://github.com/ajoshuasmith/n8n-nodes-strety).

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following resources and operations:

### Goal

- **Get Many** - Get multiple goals
- **Get** - Get a single goal
- **Create** - Create a new goal
- **Update** - Update a goal
- **Delete** - Delete a goal
- **Archive / Unarchive** - Change archive state without deleting the goal
- **Backlog** - Move a goal to the backlog
- **Remove From Backlog** - Remove a goal from the backlog

### Goal Check-In

- **Get Many** - Get check-ins for a goal
- **Get** - Get a single check-in
- **Create** - Create a check-in for a goal
- **Update** - Update a check-in
- **Delete** - Delete a check-in

### Goal Milestone

- **Get Many** - Get milestones for a goal
- **Get** - Get a single milestone
- **Create** - Create a milestone for a goal
- **Update** - Update a milestone
- **Delete** - Delete a milestone

### Headline

- **Get Many** - Get multiple headlines
- **Get** - Get a single headline
- **Create** - Create a new headline
- **Update** - Update a headline
- **Delete** - Delete a headline
- **Archive / Unarchive** - Change archive state without deleting the headline

### Issue

- **Get Many** - Get multiple issues
- **Get** - Get a single issue
- **Create** - Create a new issue
- **Update** - Update an issue
- **Delete** - Delete an issue

### Meeting

- **Get Many** - Get multiple meetings
- **Get** - Get a single meeting

### Message

- **Get Many** - Get multiple messages
- **Get** - Get a single message
- **Create** - Create a new message
- **Update** - Update a message
- **Delete** - Delete a message

### Metric

- **Get Many** - Get multiple metrics
- **Get** - Get a single metric
- **Create** - Create a new metric
- **Update** - Update a metric
- **Delete** - Delete a metric

### Metric Check-In

- **Get Many** - Get check-ins for a metric
- **Get** - Get a single check-in
- **Create** - Create a check-in for a metric
- **Update** - Update a check-in
- **Delete** - Delete a check-in

### People

- **Get Many** - Get people, with name, email, and deactivation filters
- **Get Current Person** - Identify the authenticated person and their role

### Doc

- **Get Many** - Get multiple docs
- **Get** - Get a single doc
- **Create** - Create a new doc
- **Update** - Update a doc
- **Delete** - Delete a doc

### Doc Folder

- **Get Many** - Get multiple doc folders
- **Get** - Get a single doc folder
- **Create** - Create a new doc folder
- **Update** - Update a doc folder
- **Delete** - Delete a doc folder

### Project

- **Get Many** - Get multiple projects
- **Get** - Get a single project
- **Create** - Create a new project

### Review

- **Get Many** - List review summaries, filtered by reviewee, manager reviewer, or status
- **Get** - Retrieve review details and available completed answers

Lists include draft reviews; Get returns 404 for drafts. Get requires access to the review's space even if HR Center access allows listing it. Answers are returned only after completion, and peer feedback is never included by this API.

### Shoutout

- **Get Many / Get** - Retrieve recognition, with creator, recipient, and core value filters
- **Create / Update / Delete** - Manage recognition messages

Create requires a space, one or more recipient UUIDs, and one or more core value UUIDs. Use comma-separated IDs. Core values can be found in **Vision → Get**. Creating on behalf of another person requires admin or account-owner access.

### Roles Chart

- **Get Many** - Get multiple roles charts
- **Get** - Get a single roles chart

### Role

- **Get Many** - Get roles for a roles chart
- **Get** - Get a single role

### Team

- **Get Many** - Get multiple teams
- **Get** - Get a single team

### Todo

- **Get Many** - Get multiple todos
- **Get** - Get a single todo
- **Create** - Create a new todo
- **Update** - Update a todo
- **Delete** - Delete a todo

### Vision

- **Get Many** - Get multiple visions
- **Get** - Get a single vision

## API updates and existing workflows

The implementation follows the [Strety v1 OpenAPI specification](https://2.strety.com/api/docs/v1/openapi.yaml), checked September 7, 2026.

- **Docs migration:** Strety will remove `/playbooks` and `/playbooks/folders` on February 19, 2027. Use **Doc** and **Doc Folder** for new workflows. Existing **Playbook (Legacy)** and **Playbook Folder (Legacy)** configurations automatically call `/docs` and `/docs/folders`, send the new resource types, and retain legacy response type names and saved parameters. The flattened document-format `type` attribute continues to behave as before.
- **Doc fields:** set document type and link service at creation. Update supports renewal schedules, **No Renewal**, and **New Revision**. Renewal day accepts 1–28 or -1 for the final day of the month. Doc Folder supports nesting through Parent Folder ID.
- **Daily scorecards:** select `daily` when creating/updating a metric; the organization must have daily scorecards enabled. For daily check-ins, add **Date** in `YYYY-MM-DD` format. Weekly, monthly, quarterly, and annual check-in fields remain available.
- **Archived records:** goals, headlines, and issues default to active records. Select **Archive Status → Any** or **Archived** to retrieve archived records, including when using Return All. Archive and Unarchive return the updated resource.
- **List filters:** goals support multiple statuses; issues support resolved/unresolved; meetings and todos support completed/incomplete. Boolean `false` filters are sent explicitly.

## AI Agent tools

The Strety node is marked `usableAsTool`, allowing n8n to expose each configured operation as an AI Agent tool. Attach Strety using the agent's **Tool** connector and select the resource and operation for that tool. The tool executes the same OAuth, pagination, ETag, and rate-limit code as a normal Strety node.

Useful tool sets:

| Use case | Configure these Strety operations |
| --- | --- |
| Goal tracking | Goal Get Many with status filters; Goal Get; Goal Check-In Get Many/Create; Goal Milestone Get Many |
| Scorecard assistant | Metric Get Many/Get; Metric Check-In Get Many/Create, including daily Date |
| Meeting preparation | Meeting Get Many/Get; Issue Get Many with Resolved=false; Todo Get Many with Completed=false; Headline Get Many |
| Docs lookup and maintenance | Doc Get Many/Get; Doc Folder Get Many; add Doc Create/Update when needed |
| Recognition | People Get Many; Vision Get; Shoutout Get Many/Create |
| Review summaries | Review Get Many/Get for records the credential can access |
| Archive housekeeping | Goal, Headline, or Issue Archive/Unarchive with a known UUID |
| Identity lookup | People Get Current Person |

Keep **Resource**, **Operation**, credentials, and the intended space fixed in the tool configuration. Let the model supply the specific inputs it needs using n8n's **Let AI specify** button or `$fromAI()` expressions. Add separate configured tools for separate operations. Use a bounded Limit for list tools unless the task requires every record. Strety list endpoints expose only their documented filters; a fixed Space ID on a create tool does not scope other list tools.

Examples, entered in the relevant parameter's expression editor:

```javascript
// Doc ID, using By ID mode:
{{ $fromAI('doc_id', 'An existing Strety doc UUID returned by the lookup tool', 'string') }}

// Daily metric check-in Date:
{{ $fromAI('date', 'Calendar date in YYYY-MM-DD format', 'string') }}

// Daily metric check-in Value:
{{ $fromAI('value', 'Measured numeric scorecard value', 'number') }}

// Shoutout Recipient IDs:
{{ $fromAI('recipient_ids', 'Comma-separated person UUIDs from the People lookup tool', 'string') }}
```

Only attach write/delete tools that the workflow should perform. n8n's human-review controls can be applied to consequential tool calls in the surrounding workflow. No separate AI API key is needed by Strety; the AI Agent supplies its own model connection. Installation and tool availability still depend on the host n8n version and community-package policy.

See [n8n's AI parameter documentation](https://github.com/n8n-io/n8n-docs/blob/main/docs/build/integrate-ai/ai-examples/use-ai-for-parameters.md) and [the native tool wrapper](https://github.com/n8n-io/n8n/blob/master/packages/core/src/execution-engine/node-execution-context/utils/create-node-as-tool.ts).

## Credentials

To use this node, you need to configure Strety OAuth2 API credentials:

1. Log into your Strety account at [2.strety.com](https://2.strety.com)
2. Navigate to your OAuth application settings
3. Create a new OAuth application
4. Set the redirect URI to: `https://<your-n8n-domain>/rest/oauth2-credential/callback`
5. Copy the Client ID and Client Secret

In n8n:

1. Go to **Credentials > Add Credential**
2. Select **Strety OAuth2 API**
3. Enter your Client ID and Client Secret
4. Click **Connect** to complete the OAuth2 authorization flow

## Features

- **Full CRUD support** - Create, read, update, and delete across all writable resources
- **JSON:API handling** - Automatically transforms Strety's JSON:API responses into flat, easy-to-use objects
- **ETag-based updates** - Automatically handles optimistic concurrency for update operations
- **Pagination support** - Use "Return All" to fetch all results or limit to a specific number
- **Filters** - Filter list operations by dates, assignees, types, and more
- **Built-in rate limiting** - Automatically throttles requests to stay within Strety's API limits (10 req/10s)
- **Expression support** - All fields support n8n expressions for dynamic values

## Compatibility

- Normal workflow nodes retain node type version 1.
- AI tools require an n8n version supporting community nodes as tools.
- Package engine: Node.js >=18.17.0; use a Node.js version supported by your n8n installation.

## Development and validation

```bash
npm ci
npm test
npm run lint
npm pack --dry-run
```

`npm test` builds the package and runs contract tests against mocked Strety responses. The suite covers the API migration, new operations, pagination, filters, error paths, item pairing, and concurrent throttling. The test runner uses Node.js 22+ mock timers; this does not change the package runtime engine declaration.

An optional integration smoke check uses the published `n8n-core` tool wrapper:

```bash
N8N_TOOL_WRAPPER_PATH=/absolute/path/to/create-node-as-tool.js node tests/ai-wrapper-smoke.cjs
```

The wrapper's own dependencies must be installed alongside it. Set `STRETY_PACKAGE_DIR` to an unpacked package to test its built artifact. This check constructs a native tool, validates `$fromAI()` inputs, invokes the Strety node, and verifies the result with mocked HTTP. It does not call a live model or mutate a Strety account.

## Resources

- [Strety API Documentation](https://2.strety.com/api/docs/v1)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)

### Check-in periods (0.2.1)

Metric Check-In Create reads the parent metric to validate its frequency before writing. In Additional Fields, provide Date (`YYYY-MM-DD`) for daily metrics; ISO Week and ISO Week Year for weekly metrics; Month and Year for monthly metrics; Quarter and Year for quarterly metrics; or Year for annual metrics. Historical periods and zero values are supported. Missing or invalid periods produce an actionable error without creating a check-in.

When Include Check-Ins is enabled, Get/Get Many retain the API's included resources as flattened records in `included`, alongside the existing relationship IDs. For lists, each item carries its response page's included records; match records by both `type` and `id`.

The local request limiter is process-scoped. Explicit HTTP 429 rejections receive up to three retries using Retry-After (maximum 120 seconds per retry); other errors are not automatically retried by the node.
