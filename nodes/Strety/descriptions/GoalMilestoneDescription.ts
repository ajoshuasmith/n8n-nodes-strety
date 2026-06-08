import type { INodeProperties } from 'n8n-workflow';

export const goalMilestoneOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a goal milestone',
				action: 'Create a goal milestone',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a goal milestone',
				action: 'Delete a goal milestone',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a goal milestone',
				action: 'Get a goal milestone',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many goal milestones',
				action: 'Get many goal milestones',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a goal milestone',
				action: 'Update a goal milestone',
			},
		],
		default: 'getAll',
	},
];

export const goalMilestoneFields: INodeProperties[] = [
	{
		displayName: 'Goal ID',
		name: 'goalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
				operation: ['getAll', 'get', 'create', 'update', 'delete'],
			},
		},
		description: 'The UUID of the parent goal',
	},
	{
		displayName: 'Milestone ID',
		name: 'milestoneId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'The UUID of the milestone',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
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
				resource: ['goalMilestone'],
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
				resource: ['goalMilestone'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter milestones created on or after this date',
			},
			{
				displayName: 'Updated After',
				name: 'updated_after',
				type: 'dateTime',
				default: '',
				description: 'Filter milestones updated on or after this date',
			},
		],
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
				operation: ['create'],
			},
		},
		description: 'The title of the milestone',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'UUID of the person assigned to the milestone',
			},
			{
				displayName: 'Completed At',
				name: 'completed_at',
				type: 'dateTime',
				default: '',
				description: 'When the milestone was completed',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the milestone, plain text or HTML',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'The date the milestone is due',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['goalMilestone'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assignee ID',
				name: 'assignee_id',
				type: 'string',
				default: '',
				description: 'UUID of the person assigned to the milestone',
			},
			{
				displayName: 'Completed At',
				name: 'completed_at',
				type: 'dateTime',
				default: '',
				description: 'When the milestone was completed',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the milestone, plain text or HTML',
			},
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'The date the milestone is due',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the milestone',
			},
		],
	},
];
