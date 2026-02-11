import type { INodeProperties } from 'n8n-workflow';

export const metricCheckInOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a metric check-in',
				action: 'Create a metric check-in',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a metric check-in',
				action: 'Delete a metric check-in',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a metric check-in',
				action: 'Get a metric check-in',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many metric check-ins',
				action: 'Get many metric check-ins',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a metric check-in',
				action: 'Update a metric check-in',
			},
		],
		default: 'getAll',
	},
];

export const metricCheckInFields: INodeProperties[] = [
	// ----------------------------------
	//         metricCheckIn: all operations need metricId
	// ----------------------------------
	{
		displayName: 'Metric ID',
		name: 'metricId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
				operation: ['getAll', 'get', 'create', 'update', 'delete'],
			},
		},
		description: 'The UUID of the parent metric',
	},

	// ----------------------------------
	//         metricCheckIn: get, update, delete
	// ----------------------------------
	{
		displayName: 'Check-In ID',
		name: 'checkInId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the check-in',
	},

	// ----------------------------------
	//         metricCheckIn: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
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
				resource: ['metricCheckIn'],
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
				resource: ['metricCheckIn'],
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
	//         metricCheckIn: create
	// ----------------------------------
	{
		displayName: 'Value',
		name: 'value',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
				operation: ['create'],
			},
		},
		description: 'The recorded value for this check-in',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
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
				displayName: 'ISO Week',
				name: 'iso_week',
				type: 'number',
				default: 0,
				description: 'The ISO week number (1-53). Required for weekly metrics.',
			},
			{
				displayName: 'ISO Week Year',
				name: 'iso_week_year',
				type: 'number',
				default: 0,
				description: 'The ISO week-numbering year. Required for weekly metrics.',
			},
			{
				displayName: 'Month',
				name: 'month',
				type: 'number',
				default: 0,
				description: 'The month number (1-12). Required for monthly metrics.',
			},
			{
				displayName: 'Quarter',
				name: 'quarter',
				type: 'number',
				default: 0,
				description: 'The quarter number (1-4). Required for quarterly metrics.',
			},
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				default: 0,
				description: 'The four-digit year. Required for monthly, quarterly, and annual metrics.',
			},
		],
	},

	// ----------------------------------
	//         metricCheckIn: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['metricCheckIn'],
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
				displayName: 'Value',
				name: 'value',
				type: 'number',
				default: 0,
				description: 'The recorded value for this check-in',
			},
		],
	},
];
