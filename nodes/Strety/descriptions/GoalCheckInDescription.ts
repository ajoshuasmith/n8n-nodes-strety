import type { INodeProperties } from 'n8n-workflow';

export const goalCheckInOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a goal check-in',
				action: 'Create a goal check-in',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a goal check-in',
				action: 'Delete a goal check-in',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a goal check-in',
				action: 'Get a goal check-in',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many goal check-ins',
				action: 'Get many goal check-ins',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a goal check-in',
				action: 'Update a goal check-in',
			},
		],
		default: 'getAll',
	},
];

export const goalCheckInFields: INodeProperties[] = [
	// ----------------------------------
	//         goalCheckIn: all operations need goalId
	// ----------------------------------
	{
		displayName: 'Goal ID',
		name: 'goalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
				operation: ['getAll', 'get', 'create', 'update', 'delete'],
			},
		},
		description: 'The UUID of the parent goal',
	},

	// ----------------------------------
	//         goalCheckIn: get, update, delete
	// ----------------------------------
	{
		displayName: 'Check-In ID',
		name: 'checkInId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the check-in',
	},

	// ----------------------------------
	//         goalCheckIn: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
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
				resource: ['goalCheckIn'],
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
				resource: ['goalCheckIn'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter check-ins created on or after this date',
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
				description: 'Filter check-ins updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         goalCheckIn: create
	// ----------------------------------
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'on_track',
		options: [
			{ name: 'At Risk', value: 'at_risk' },
			{ name: 'Cancelled', value: 'cancelled' },
			{ name: 'Completed', value: 'completed' },
			{ name: 'Missed', value: 'missed' },
			{ name: 'Off Track', value: 'off_track' },
			{ name: 'On Track', value: 'on_track' },
		],
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
				operation: ['create'],
			},
		},
		description: 'The status of the goal at the time of this check-in',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: '',
				description: 'Context for the check-in, can be plain text or HTML',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				description: 'The recorded value for this check-in (decimal as string)',
			},
		],
	},

	// ----------------------------------
	//         goalCheckIn: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['goalCheckIn'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Context',
				name: 'context',
				type: 'string',
				default: '',
				description: 'Context for the check-in, can be plain text or HTML',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'on_track',
				options: [
					{ name: 'At Risk', value: 'at_risk' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Missed', value: 'missed' },
					{ name: 'Off Track', value: 'off_track' },
					{ name: 'On Track', value: 'on_track' },
				],
				description: 'The status of the goal at the time of this check-in',
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				default: '',
				description: 'The recorded value for this check-in (decimal as string)',
			},
		],
	},
];
