import type { INodeProperties } from 'n8n-workflow';

export const headlineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['headline'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a headline',
				action: 'Create a headline',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a headline',
				action: 'Delete a headline',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a headline',
				action: 'Get a headline',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many headlines',
				action: 'Get many headlines',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a headline',
				action: 'Update a headline',
			},
		],
		default: 'getAll',
	},
];

export const headlineFields: INodeProperties[] = [
	// ----------------------------------
	//         headline: get, update, delete
	// ----------------------------------
	{
		displayName: 'Headline ID',
		name: 'headlineId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['headline'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the headline',
	},

	// ----------------------------------
	//         headline: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['headline'],
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
				resource: ['headline'],
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
				resource: ['headline'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter headlines created on or after this date',
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
				description: 'Filter by the person who owns the headline',
			},
			{
				displayName: 'Updated After',
				name: 'updated_after',
				type: 'dateTime',
				default: '',
				description: 'Filter headlines updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         headline: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		typeOptions: {
			maxLength: 150,
		},
		displayOptions: {
			show: {
				resource: ['headline'],
				operation: ['create'],
			},
		},
		description: 'The title of the headline (max 150 characters)',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['headline'],
				operation: ['create'],
			},
		},
		description: 'The UUID of the owning resource (project, team, or person)',
	},
	{
		displayName: 'Space Type',
		name: 'spaceType',
		type: 'options',
		required: true,
		default: 'team',
		options: [
			{ name: 'Person', value: 'person' },
			{ name: 'Project', value: 'project' },
			{ name: 'Team', value: 'team' },
		],
		displayOptions: {
			show: {
				resource: ['headline'],
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
				resource: ['headline'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the headline',
			},
			{
				displayName: 'Discussed At',
				name: 'discussed_at',
				type: 'dateTime',
				default: '',
				description: 'When the headline was discussed',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person who owns the headline',
			},
		],
	},

	// ----------------------------------
	//         headline: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['headline'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the headline',
			},
			{
				displayName: 'Discussed At',
				name: 'discussed_at',
				type: 'dateTime',
				default: '',
				description: 'When the headline was discussed',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person who owns the headline',
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
				typeOptions: {
					maxLength: 150,
				},
				description: 'The title of the headline (max 150 characters)',
			},
		],
	},
];
