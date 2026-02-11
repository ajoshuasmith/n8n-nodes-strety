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
- **Backlog** - Move a goal to the backlog
- **Remove From Backlog** - Remove a goal from the backlog

### Goal Check-In

- **Get Many** - Get check-ins for a goal
- **Get** - Get a single check-in
- **Create** - Create a check-in for a goal
- **Update** - Update a check-in
- **Delete** - Delete a check-in

### Headline

- **Get Many** - Get multiple headlines
- **Get** - Get a single headline
- **Create** - Create a new headline
- **Update** - Update a headline
- **Delete** - Delete a headline

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

- **Get Many** - Get all people in the organization

### Playbook

- **Get Many** - Get multiple playbooks
- **Get** - Get a single playbook
- **Create** - Create a new playbook
- **Update** - Update a playbook
- **Delete** - Delete a playbook

### Playbook Folder

- **Get Many** - Get multiple playbook folders
- **Get** - Get a single playbook folder
- **Create** - Create a new playbook folder
- **Update** - Update a playbook folder
- **Delete** - Delete a playbook folder

### Project

- **Get Many** - Get multiple projects
- **Get** - Get a single project

### Team

- **Get Many** - Get multiple teams
- **Get** - Get a single team

### Todo

- **Get Many** - Get multiple todos
- **Get** - Get a single todo
- **Create** - Create a new todo
- **Update** - Update a todo
- **Delete** - Delete a todo

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

- n8n version: 1.0+
- Node.js version: 18.10+

## Resources

- [Strety API Documentation](https://2.strety.com/api/docs/v1)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
