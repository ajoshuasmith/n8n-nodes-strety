import type { INodeProperties } from 'n8n-workflow';

export const metricOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['metric'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a metric',
				action: 'Create a metric',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a metric',
				action: 'Delete a metric',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a metric',
				action: 'Get a metric',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many metrics',
				action: 'Get many metrics',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a metric',
				action: 'Update a metric',
			},
		],
		default: 'getAll',
	},
];

export const metricFields: INodeProperties[] = [
	{
		displayName:
			'Daily frequency requires daily scorecards enabled in Strety. Daily check-ins require a date.',
		name: 'dailyNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['metric'], operation: ['create', 'update'] } },
	},
	// ----------------------------------
	//         metric: get, update, delete
	// ----------------------------------
	{
		displayName: 'Metric ID',
		name: 'metricId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['metric'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the metric',
	},

	// ----------------------------------
	//         metric: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['metric'],
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
				resource: ['metric'],
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
				resource: ['metric'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'Filter by the person assigned to the metric',
			},
			{
				displayName: 'Check-In Frequency',
				name: 'checkin_frequency',
				type: 'options',
				default: 'weekly',
				options: [
					{ name: 'Annual', value: 'annual' },
					{ name: 'Monthly', value: 'monthly' },
					{ name: 'Quarterly', value: 'quarterly' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
				],
				description: 'Filter by check-in frequency',
			},
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter metrics created on or after this date',
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
				description: 'Filter metrics updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         metric: get, getAll options
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['metric'],
				operation: ['get', 'getAll'],
			},
		},
		options: [
			{
				displayName: 'Include Check-Ins',
				name: 'include',
				type: 'boolean',
				default: false,
				description: 'Whether to include the latest check-ins in the response',
			},
			{
				displayName: 'Limit Check-Ins',
				name: 'limit_check_ins',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
					maxValue: 5,
				},
				description:
					'Max number of recent check-ins to include (1-5). Only used when Include Check-Ins is enabled.',
			},
		],
	},

	// ----------------------------------
	//         metric: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['metric'],
				operation: ['create'],
			},
		},
		description: 'The title of the metric',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['metric'],
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
				resource: ['metric'],
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
				resource: ['metric'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person assigned to the metric',
			},
			{
				displayName: 'Check-In Frequency',
				name: 'checkin_frequency',
				type: 'options',
				default: 'weekly',
				options: [
					{ name: 'Annual', value: 'annual' },
					{ name: 'Monthly', value: 'monthly' },
					{ name: 'Quarterly', value: 'quarterly' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
				],
				description: 'How often check-ins are expected',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the metric',
			},
			{
				displayName: 'Number Format',
				name: 'number_format',
				type: 'options',
				default: 'number',
				options: [
					{ name: 'Boolean', value: 'boolean' },
					{ name: 'Currency', value: 'currency' },
					{ name: 'Number', value: 'number' },
					{ name: 'Percentage', value: 'percentage' },
					{ name: 'Time', value: 'time' },
				],
				description: 'How the metric value should be displayed',
			},
			{
				displayName: 'Target Max Value',
				name: 'target_max_value',
				type: 'number',
				default: 0,
				description: 'The maximum target value (for "between" target type)',
			},
			{
				displayName: 'Target Min Value',
				name: 'target_min_value',
				type: 'number',
				default: 0,
				description: 'The minimum target value (for "between" target type)',
			},
			{
				displayName: 'Target Type',
				name: 'target_type',
				type: 'options',
				default: 'gte',
				options: [
					{ name: 'Between', value: 'between' },
					{ name: 'Equal To', value: 'eq' },
					{ name: 'Greater Than', value: 'gt' },
					{ name: 'Greater Than or Equal', value: 'gte' },
					{ name: 'Less Than', value: 'lt' },
					{ name: 'Less Than or Equal', value: 'lte' },
				],
				description: 'The comparison type for the target',
			},
			{
				displayName: 'Target Value',
				name: 'target_value',
				type: 'number',
				default: 0,
				description: 'The target value for the metric',
			},
		],
	},

	// ----------------------------------
	//         metric: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['metric'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person assigned to the metric',
			},
			{
				displayName: 'Cascade Target',
				name: 'cascade_target',
				type: 'boolean',
				default: false,
				description: 'Whether to cascade target changes to related resources',
			},
			{
				displayName: 'Check-In Frequency',
				name: 'checkin_frequency',
				type: 'options',
				default: 'weekly',
				options: [
					{ name: 'Annual', value: 'annual' },
					{ name: 'Monthly', value: 'monthly' },
					{ name: 'Quarterly', value: 'quarterly' },
					{ name: 'Daily', value: 'daily' },
					{ name: 'Weekly', value: 'weekly' },
				],
				description: 'How often check-ins are expected',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the metric',
			},
			{
				displayName: 'Number Format',
				name: 'number_format',
				type: 'options',
				default: 'number',
				options: [
					{ name: 'Boolean', value: 'boolean' },
					{ name: 'Currency', value: 'currency' },
					{ name: 'Number', value: 'number' },
					{ name: 'Percentage', value: 'percentage' },
					{ name: 'Time', value: 'time' },
				],
				description: 'How the metric value should be displayed',
			},
			{
				displayName: 'Target Max Value',
				name: 'target_max_value',
				type: 'number',
				default: 0,
				description: 'The maximum target value (for "between" target type)',
			},
			{
				displayName: 'Target Min Value',
				name: 'target_min_value',
				type: 'number',
				default: 0,
				description: 'The minimum target value (for "between" target type)',
			},
			{
				displayName: 'Target Type',
				name: 'target_type',
				type: 'options',
				default: 'gte',
				options: [
					{ name: 'Between', value: 'between' },
					{ name: 'Equal To', value: 'eq' },
					{ name: 'Greater Than', value: 'gt' },
					{ name: 'Greater Than or Equal', value: 'gte' },
					{ name: 'Less Than', value: 'lt' },
					{ name: 'Less Than or Equal', value: 'lte' },
				],
				description: 'The comparison type for the target',
			},
			{
				displayName: 'Target Value',
				name: 'target_value',
				type: 'number',
				default: 0,
				description: 'The target value for the metric',
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
				description: 'The title of the metric',
			},
		],
	},
];
