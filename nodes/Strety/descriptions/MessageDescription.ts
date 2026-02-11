import type { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a message',
				action: 'Create a message',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a message',
				action: 'Delete a message',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a message',
				action: 'Get a message',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many messages',
				action: 'Get many messages',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a message',
				action: 'Update a message',
			},
		],
		default: 'getAll',
	},
];

export const messageFields: INodeProperties[] = [
	// ----------------------------------
	//         message: get, update, delete
	// ----------------------------------
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the message',
	},

	// ----------------------------------
	//         message: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['message'],
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
				resource: ['message'],
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
				resource: ['message'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter messages created on or after this date',
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
				description: 'Filter messages updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         message: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['create'],
			},
		},
		description: 'The title of the message',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['message'],
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
				resource: ['message'],
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
				resource: ['message'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
				description: 'The content of the message',
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
				description: 'The status of the message',
			},
		],
	},

	// ----------------------------------
	//         message: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				default: '',
				description: 'The content of the message',
			},
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
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'draft',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Draft', value: 'draft' },
				],
				description: 'The status of the message',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the message',
			},
		],
	},
];
