import type { INodeProperties } from 'n8n-workflow';

export const playbookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['playbook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a playbook',
				action: 'Create a playbook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a playbook',
				action: 'Delete a playbook',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a playbook',
				action: 'Get a playbook',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many playbooks',
				action: 'Get many playbooks',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a playbook',
				action: 'Update a playbook',
			},
		],
		default: 'getAll',
	},
];

export const playbookFields: INodeProperties[] = [
	// ----------------------------------
	//         playbook: get, update, delete
	// ----------------------------------
	{
		displayName: 'Playbook ID',
		name: 'playbookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the playbook',
	},

	// ----------------------------------
	//         playbook: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter playbooks created on or after this date',
			},
			{
				displayName: 'Folder ID',
				name: 'folder_id',
				type: 'string',
				default: '',
				description: 'Filter by the playbook folder UUID',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of UUIDs to retrieve specific resources',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'string',
				default: '',
				description: 'Filter by the person who owns the playbook',
			},
			{
				displayName: 'Updated After',
				name: 'updated_after',
				type: 'dateTime',
				default: '',
				description: 'Filter playbooks updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         playbook: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['create'],
			},
		},
		description: 'The title of the playbook',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['create'],
			},
		},
		description: 'The UUID of the owning resource (organization, project, team, or person)',
	},
	{
		displayName: 'Space Type',
		name: 'spaceType',
		type: 'options',
		required: true,
		default: 'team',
		options: [
			{ name: 'Organization', value: 'organization' },
			{ name: 'Person', value: 'person' },
			{ name: 'Project', value: 'project' },
			{ name: 'Team', value: 'team' },
		],
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['create'],
			},
		},
		description: 'The type of the owning resource',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
				description: 'The HTML content of the playbook (for document type)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the playbook',
			},
			{
				displayName: 'Playbook Type',
				name: 'type',
				type: 'options',
				default: 'document',
				options: [
					{ name: 'Document', value: 'document' },
					{ name: 'Link', value: 'link' },
					{ name: 'Upload', value: 'upload' },
				],
				description: 'The type of playbook (document requires content, link requires URL)',
			},
			{
				displayName: 'Service',
				name: 'service',
				type: 'options',
				default: 'strety',
				options: [
					{ name: 'Dropbox', value: 'dropbox' },
					{ name: 'Google Drive', value: 'google_drive' },
					{ name: 'OneDrive', value: 'one_drive' },
					{ name: 'Other', value: 'other' },
					{ name: 'SharePoint', value: 'sharepoint' },
					{ name: 'Strety', value: 'strety' },
				],
				description: 'The service associated with the playbook',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'draft',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Draft', value: 'draft' },
				],
				description: 'The status of the playbook',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL of the playbook (for link type)',
			},
		],
	},

	// ----------------------------------
	//         playbook: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['playbook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
				description: 'The HTML content of the playbook (for document type)',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the playbook',
			},
			{
				displayName: 'Service',
				name: 'service',
				type: 'options',
				default: 'strety',
				options: [
					{ name: 'Dropbox', value: 'dropbox' },
					{ name: 'Google Drive', value: 'google_drive' },
					{ name: 'OneDrive', value: 'one_drive' },
					{ name: 'Other', value: 'other' },
					{ name: 'SharePoint', value: 'sharepoint' },
					{ name: 'Strety', value: 'strety' },
				],
				description: 'The service associated with the playbook',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'draft',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Draft', value: 'draft' },
				],
				description: 'The status of the playbook',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the playbook',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'The URL of the playbook (for link type)',
			},
		],
	},
];
