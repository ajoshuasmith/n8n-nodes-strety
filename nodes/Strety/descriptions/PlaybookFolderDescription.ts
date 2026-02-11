import type { INodeProperties } from 'n8n-workflow';

export const playbookFolderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['playbookFolder'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a playbook folder',
				action: 'Create a playbook folder',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a playbook folder',
				action: 'Delete a playbook folder',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a playbook folder',
				action: 'Get a playbook folder',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many playbook folders',
				action: 'Get many playbook folders',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a playbook folder',
				action: 'Update a playbook folder',
			},
		],
		default: 'getAll',
	},
];

export const playbookFolderFields: INodeProperties[] = [
	// ----------------------------------
	//         playbookFolder: get, update, delete
	// ----------------------------------
	{
		displayName: 'Folder ID',
		name: 'folderId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['playbookFolder'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the playbook folder',
	},

	// ----------------------------------
	//         playbookFolder: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['playbookFolder'],
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
				resource: ['playbookFolder'],
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
				resource: ['playbookFolder'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter folders created on or after this date',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of UUIDs to retrieve specific resources',
			},
			{
				displayName: 'Updated After',
				name: 'updated_after',
				type: 'dateTime',
				default: '',
				description: 'Filter folders updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         playbookFolder: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['playbookFolder'],
				operation: ['create'],
			},
		},
		description: 'The title of the playbook folder',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['playbookFolder'],
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
				resource: ['playbookFolder'],
				operation: ['create'],
			},
		},
		description: 'The type of the owning resource',
	},

	// ----------------------------------
	//         playbookFolder: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['playbookFolder'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Space ID',
				name: 'space_id',
				type: 'string',
				default: '',
				description: 'The UUID of the owning resource',
			},
			{
				displayName: 'Space Type',
				name: 'space_type',
				type: 'options',
				default: 'team',
				options: [
					{ name: 'Organization', value: 'organization' },
					{ name: 'Person', value: 'person' },
					{ name: 'Project', value: 'project' },
					{ name: 'Team', value: 'team' },
				],
				description: 'The type of the owning resource',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the playbook folder',
			},
		],
	},
];
