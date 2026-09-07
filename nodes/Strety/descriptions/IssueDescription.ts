import type { INodeProperties } from 'n8n-workflow';
import { idField } from './AdditionalResources';

export const issueOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['issue'],
			},
		},
		options: [
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive a issue',
				action: 'Archive a issue',
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				description: 'Unarchive a issue',
				action: 'Unarchive a issue',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create an issue',
				action: 'Create an issue',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an issue',
				action: 'Delete an issue',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an issue',
				action: 'Get an issue',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many issues',
				action: 'Get many issues',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an issue',
				action: 'Update an issue',
			},
		],
		default: 'getAll',
	},
];

export const issueFields: INodeProperties[] = [
	// ----------------------------------
	//         issue: get, update, delete
	// ----------------------------------
	{
		...idField('issueId', 'Issue ID', 'searchIssues'),
		required: true,
		displayOptions: {
			show: {
				resource: ['issue'],
				operation: ['get', 'update', 'delete', 'archive', 'unarchive'],
			},
		},
		description: 'The UUID of the issue',
	},

	// ----------------------------------
	//         issue: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['issue'],
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
				resource: ['issue'],
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
				resource: ['issue'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Resolved',
				name: 'resolved',
				type: 'boolean',
				default: false,
				description:
					'Whether to return resolved records; false returns records that are not resolved',
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
				displayName: 'Created After',
				name: 'created_after',
				type: 'dateTime',
				default: '',
				description: 'Filter issues created on or after this date',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of UUIDs to retrieve specific resources',
			},
			{
				displayName: 'Issue Type',
				name: 'issue_type',
				type: 'options',
				default: 'short_term',
				options: [
					{ name: 'Long Term', value: 'long_term' },
					{ name: 'Parking Lot', value: 'parking_lot' },
					{ name: 'Short Term', value: 'short_term' },
				],
				description: 'Filter by issue type',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'string',
				default: '',
				description: 'Filter by the person who owns the issue',
			},
			{
				displayName: 'Updated After',
				name: 'updated_after',
				type: 'dateTime',
				default: '',
				description: 'Filter issues updated on or after this date',
			},
		],
	},

	// ----------------------------------
	//         issue: create
	// ----------------------------------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['issue'],
				operation: ['create'],
			},
		},
		description: 'The title of the issue',
	},
	{
		displayName: 'Space ID',
		name: 'spaceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['issue'],
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
				resource: ['issue'],
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
				resource: ['issue'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the issue',
			},
			{
				displayName: 'Issue Type',
				name: 'issue_type',
				type: 'options',
				default: 'short_term',
				options: [
					{ name: 'Long Term', value: 'long_term' },
					{ name: 'Parking Lot', value: 'parking_lot' },
					{ name: 'Short Term', value: 'short_term' },
				],
				description: 'The type of the issue',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person who owns the issue',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				default: 'none',
				options: [
					{ name: 'High', value: 'high' },
					{ name: 'Highest', value: 'highest' },
					{ name: 'Low', value: 'low' },
					{ name: 'Lowest', value: 'lowest' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'None', value: 'none' },
				],
				description: 'Priority level for the issue',
			},
			{
				displayName: 'Resolved At',
				name: 'resolved_at',
				type: 'dateTime',
				default: '',
				description: 'When the issue was resolved',
			},
		],
	},

	// ----------------------------------
	//         issue: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['issue'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Detailed description of the issue',
			},
			{
				displayName: 'Issue Type',
				name: 'issue_type',
				type: 'options',
				default: 'short_term',
				options: [
					{ name: 'Long Term', value: 'long_term' },
					{ name: 'Parking Lot', value: 'parking_lot' },
					{ name: 'Short Term', value: 'short_term' },
				],
				description: 'The type of the issue',
			},
			{
				displayName: 'Owner ID',
				name: 'owner_id',
				type: 'string',
				default: '',
				description: 'The UUID of the person who owns the issue',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'options',
				default: 'none',
				options: [
					{ name: 'High', value: 'high' },
					{ name: 'Highest', value: 'highest' },
					{ name: 'Low', value: 'low' },
					{ name: 'Lowest', value: 'lowest' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'None', value: 'none' },
				],
				description: 'Priority level for the issue',
			},
			{
				displayName: 'Resolved At',
				name: 'resolved_at',
				type: 'dateTime',
				default: '',
				description: 'When the issue was resolved',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the issue',
			},
		],
	},
];
