import type { INodeProperties } from 'n8n-workflow';

export const peopleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['people'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many people',
				action: 'Get many people',
			},
		],
		default: 'getAll',
	},
];

export const peopleFields: INodeProperties[] = [
	// ----------------------------------
	//         people: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['people'],
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
				resource: ['people'],
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
				resource: ['people'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter people created on or after this date',
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
				description: 'Filter people updated on or after this date',
			},
		],
	},
];
