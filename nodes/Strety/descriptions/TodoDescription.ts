import type { INodeProperties } from 'n8n-workflow';

export const todoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['todo'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a todo',
				action: 'Create a todo',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a todo',
				action: 'Delete a todo',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a todo',
				action: 'Get a todo',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many todos',
				action: 'Get many todos',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a todo',
				action: 'Update a todo',
			},
		],
		default: 'getAll',
	},
];

export const todoFields: INodeProperties[] = [
	// ----------------------------------
	//         todo: get, update, delete
	// ----------------------------------
	{
		displayName: 'Todo ID',
		name: 'todoId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['todo'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the todo',
	},

	// ----------------------------------
	//         todo: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['todo'],
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
				resource: ['todo'],
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
				resource: ['todo'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'Filter by the person assigned to the todo',
			},
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter todos created on or after this date',
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
				description: 'Filter todos updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         todo: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['todo'],
				operation: ['create'],
			},
		},
		description: 'A brief description of the task to be completed',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['todo'],
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
				resource: ['todo'],
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
				resource: ['todo'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person assigned to the todo',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the todo, can be plain text or HTML',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'The agreed-upon due date for the todo',
			},
		],
	},

	// ----------------------------------
	//         todo: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['todo'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person assigned to the todo',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the todo, can be plain text or HTML',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'The agreed-upon due date for the todo',
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
				description: 'A brief description of the task to be completed',
			},
		],
	},
];
