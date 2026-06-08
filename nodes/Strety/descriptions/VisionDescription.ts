import type { INodeProperties } from 'n8n-workflow';

export const visionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vision'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a vision',
				action: 'Get a vision',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many visions',
				action: 'Get many visions',
			},
		],
		default: 'getAll',
	},
];

export const visionFields: INodeProperties[] = [
	{
		displayName: 'Vision ID',
		name: 'visionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['vision'],
				operation: ['get'],
			},
		},
		description: 'The UUID of the vision',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['vision'],
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
				resource: ['vision'],
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
				resource: ['vision'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter visions created on or after this date',
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
				description: 'Filter visions updated on or after this date',
			},
		],
	},
];
