import type { INodeProperties } from 'n8n-workflow';
import { idField } from './AdditionalResources';

export const goalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['goal'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a goal',
				action: 'Archive a goal',
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				description: 'Unarchive a goal',
				action: 'Unarchive a goal',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a goal',
				action: 'Create a goal',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a goal',
				action: 'Delete a goal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a goal',
				action: 'Get a goal',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many goals',
				action: 'Get many goals',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a goal',
				action: 'Update a goal',
			},
			{
				name: 'Backlog',
				value: 'backlog',
				description: 'Move a goal to the backlog',
				action: 'Backlog a goal',
			},
			{
				name: 'Remove From Backlog',
				value: 'unbacklog',
				description: 'Remove a goal from the backlog',
				action: 'Remove a goal from backlog',
			},
		],
		default: 'getAll',
	},
];

export const goalFields: INodeProperties[] = [
	// ----------------------------------
	//         goal: get, delete, update, backlog, unbacklog
	// ----------------------------------
	{
		...idField('goalId', 'Goal ID', 'searchGoals'),
		required: true,
		displayOptions: {
			show: {
				resource: ['goal'],
				operation: ['get', 'delete', 'update', 'archive', 'unarchive', 'backlog', 'unbacklog'],
			},
		},
		description: 'The UUID of the goal',
	},

	// ----------------------------------
	//         goal: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['goal'],
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
				resource: ['goal'],
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
				resource: ['goal'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'multiOptions',
				default: [],
				options: [
					{ name: 'At Risk', value: 'at_risk' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Missed', value: 'missed' },
					{ name: 'Off Track', value: 'off_track' },
					{ name: 'On Track', value: 'on_track' },
				],
				description: 'Return goals matching any selected status',
			},
			{
				displayName: 'Archive Status',
				name: 'archive_status',
				type: 'options',
				default: 'active',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Archived', value: 'archived' },
					{ name: 'Any', value: 'any' },
				],
				description:
					'Include active records, archived records, or both. Omitted filters return only active records.',
			},
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'Filter by the person assigned to the goal',
			},
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter goals created on or after this date',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of UUIDs to retrieve specific resources',
			},
			{
				displayName: 'Parent ID',
				name: 'parent_id',
				type: 'string',
				default: '',
				description: 'Filter by parent goal UUID',
			},
			{
				displayName: 'Updated After',
				name: 'updated_after',
				type: 'dateTime',
				default: '',
				description: 'Filter goals updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         goal: get, getAll options
	// ----------------------------------
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['goal'],
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
	//         goal: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goal'],
				operation: ['create'],
			},
		},
		description: 'Descriptive title of the goal',
	},
	{
		displayName: 'Check-In Type',
		name: 'checkInType',
		type: 'options',
		required: true,
		default: 'with_no_target',
		options: [
			{ name: 'With No Target', value: 'with_no_target' },
			{ name: 'With Target', value: 'with_target' },
			{ name: 'With Project', value: 'with_project' },
		],
		displayOptions: {
			show: {
				resource: ['goal'],
				operation: ['create'],
			},
		},
		description: 'Type of check-in for this goal - determines how progress is tracked',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goal'],
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
				resource: ['goal'],
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
				resource: ['goal'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person who owns the goal',
			},
			{
				displayName: 'Company Goal',
				name: 'company_goal',
				type: 'boolean',
				default: false,
				description: 'Whether this goal applies company-wide',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: "Detailed description of the goal's purpose",
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'When the goal is due',
			},
			{
				displayName: 'Parent ID',
				name: 'parent_id',
				type: 'string',
				default: '',
				description: 'The UUID of the parent goal if this is a sub-goal',
			},
			{
				displayName: 'Project ID',
				name: 'project_id',
				type: 'string',
				default: '',
				description: 'The UUID of the project (only for check_in_type "with_project")',
			},
			{
				displayName: 'Start Date',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'When tracking begins',
			},
			{
				displayName: 'Start Value',
				name: 'start_value',
				type: 'string',
				default: '',
				description: 'Initial value at start (only for check_in_type "with_target")',
			},
			{
				displayName: 'Target Value',
				name: 'target_value',
				type: 'string',
				default: '',
				description: 'Target value to reach (only for check_in_type "with_target")',
			},
			{
				displayName: 'Value Format',
				name: 'value_format',
				type: 'options',
				default: 'number',
				options: [
					{ name: 'Currency', value: 'currency' },
					{ name: 'Number', value: 'number' },
					{ name: 'Percentage', value: 'percentage' },
				],
				description: 'How the goal value should be displayed (only for "with_target")',
			},
		],
	},

	// ----------------------------------
	//         goal: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['goal'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person who owns the goal',
			},
			{
				displayName: 'Check-In Type',
				name: 'check_in_type',
				type: 'options',
				default: 'with_no_target',
				options: [
					{ name: 'With No Target', value: 'with_no_target' },
					{ name: 'With Target', value: 'with_target' },
					{ name: 'With Project', value: 'with_project' },
				],
				description: 'Type of check-in for this goal',
			},
			{
				displayName: 'Company Goal',
				name: 'company_goal',
				type: 'boolean',
				default: false,
				description: 'Whether this goal applies company-wide',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: "Detailed description of the goal's purpose",
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'When the goal is due',
			},
			{
				displayName: 'Parent ID',
				name: 'parent_id',
				type: 'string',
				default: '',
				description: 'The UUID of the parent goal if this is a sub-goal',
			},
			{
				displayName: 'Project ID',
				name: 'project_id',
				type: 'string',
				default: '',
				description: 'The UUID of the project (only for check_in_type "with_project")',
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
				displayName: 'Start Date',
				name: 'start_date',
				type: 'dateTime',
				default: '',
				description: 'When tracking begins',
			},
			{
				displayName: 'Start Value',
				name: 'start_value',
				type: 'string',
				default: '',
				description: 'Initial value at start (only for check_in_type "with_target")',
			},
			{
				displayName: 'Target Value',
				name: 'target_value',
				type: 'string',
				default: '',
				description: 'Target value to reach (only for check_in_type "with_target")',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Descriptive title of the goal',
			},
			{
				displayName: 'Value Format',
				name: 'value_format',
				type: 'options',
				default: 'number',
				options: [
					{ name: 'Currency', value: 'currency' },
					{ name: 'Number', value: 'number' },
					{ name: 'Percentage', value: 'percentage' },
				],
				description: 'How the goal value should be displayed',
			},
		],
	},
];
