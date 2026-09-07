import type { INodeProperties } from 'n8n-workflow';

export function idField(
	name: string,
	displayName: string,
	searchListMethod?: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'id', value: '' },
		modes: [
			...(searchListMethod
				? [
						{
							displayName: 'From List',
							name: 'list',
							type: 'list' as const,
							typeOptions: { searchListMethod, searchable: true },
						},
					]
				: []),
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
			},
		],
		description: `The UUID for ${displayName.toLowerCase()}`,
	};
}

const textField = (name: string, displayName: string, description = ''): INodeProperties => ({
	displayName,
	name,
	type: 'string',
	default: '',
	description,
});
const choice = (
	name: string,
	displayName: string,
	values: string[],
	defaultValue = values[0],
): INodeProperties => ({
	displayName,
	name,
	type: 'options',
	default: defaultValue,
	options: values.map((value) => ({
		name: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
		value,
	})),
});
const bool = (name: string, displayName: string, description: string): INodeProperties => ({
	displayName,
	name,
	type: 'boolean',
	default: false,
	description,
});
const show = (resource: string, operation: string[]) => ({
	show: { resource: [resource], operation },
});
const collection = (
	resource: string,
	operation: string[],
	name: string,
	displayName: string,
	options: INodeProperties[],
): INodeProperties => ({
	displayName,
	name,
	type: 'collection',
	default: {},
	placeholder: `Add ${displayName === 'Filters' ? 'Filter' : 'Field'}`,
	displayOptions: show(resource, operation),
	options,
});
const commonFilters = (): INodeProperties[] => [
	{ ...textField('created_after', 'Created After'), type: 'dateTime' },
	{ ...textField('updated_after', 'Updated After'), type: 'dateTime' },
	textField('ids', 'IDs', 'Comma-separated UUIDs to retrieve'),
];
const operationNames: Record<string, string> = {
	getAll: 'Get Many',
	get: 'Get',
	create: 'Create',
	update: 'Update',
	delete: 'Delete',
};
function operations(resource: string, label: string, writable = true): INodeProperties {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		default: 'getAll',
		options: (writable ? ['create', 'delete', 'get', 'getAll', 'update'] : ['get', 'getAll']).map(
			(value) => ({
				name: operationNames[value],
				value,
				description: `${operationNames[value]} ${label.toLowerCase()}`,
				action: `${operationNames[value]} ${label.toLowerCase()}`,
			}),
		),
	};
}
function listAndId(
	resource: string,
	label: string,
	name: string,
	searchMethod: string,
	filters: INodeProperties[],
	writable = true,
): INodeProperties[] {
	return [
		{
			...idField(name, `${label} ID`, searchMethod),
			required: true,
			displayOptions: show(resource, writable ? ['get', 'update', 'delete'] : ['get']),
		},
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			displayOptions: show(resource, ['getAll']),
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: { minValue: 1, maxValue: 100 },
			displayOptions: { show: { resource: [resource], operation: ['getAll'], returnAll: [false] } },
			description: 'Max number of results to return',
		},
		collection(resource, ['getAll'], 'filters', 'Filters', [...commonFilters(), ...filters]),
	];
}
const spaceType = () =>
	choice('spaceType', 'Space Type', ['organization', 'person', 'project', 'team'], 'team');
const spaceCreate = (resource: string): INodeProperties[] => [
	{
		...idField('spaceId', 'Space ID'),
		required: true,
		displayOptions: show(resource, ['create']),
		description: 'UUID of the organization, person, project, or team owning this space',
	},
	{ ...spaceType(), required: true, displayOptions: show(resource, ['create']) },
];
const titleCreate = (resource: string): INodeProperties => ({
	...textField('title', 'Title'),
	required: true,
	displayOptions: show(resource, ['create']),
});
const docFields = (): INodeProperties[] => [
	textField('description', 'Description', 'Plain text or HTML description'),
	textField('content', 'Content', 'HTML content for a document'),
	textField('url', 'URL', 'URL for a link document'),
	choice('status', 'Status', ['active', 'draft'], 'draft'),
	idField('folder_id', 'Folder ID', 'searchDocFolders'),
	idField('owner_id', 'Owner ID', 'searchPeople'),
];

export const additionalResourceProperties: INodeProperties[] = [
	operations('doc', 'Doc'),
	...listAndId('doc', 'Doc', 'docId', 'searchDocs', [
		idField('owner_id', 'Owner ID', 'searchPeople'),
		idField('folder_id', 'Folder ID', 'searchDocFolders'),
	]),
	titleCreate('doc'),
	...spaceCreate('doc'),
	{
		...choice('docType', 'Doc Type', ['document', 'link', 'upload']),
		required: true,
		displayOptions: show('doc', ['create']),
	},
	collection('doc', ['create'], 'additionalFields', 'Additional Fields', [
		...docFields(),
		choice(
			'service',
			'Service',
			['dropbox', 'google_drive', 'one_drive', 'other', 'sharepoint', 'strety'],
			'other',
		),
	]),
	collection('doc', ['update'], 'updateFields', 'Update Fields', [
		textField('title', 'Title'),
		...docFields(),
		idField('space_id', 'Space ID'),
		choice('space_type', 'Space Type', ['organization', 'person', 'project', 'team'], 'team'),
		{
			displayName: 'Renewal Interval',
			name: 'renewal_interval',
			type: 'options',
			default: 3,
			options: [
				{ name: 'No Renewal', value: 'none' },
				{ name: '3 Months', value: 3 },
				{ name: '6 Months', value: 6 },
				{ name: '12 Months', value: 12 },
			],
			description: 'Choose No Renewal to remove the renewal schedule',
		},
		{
			displayName: 'Renewal Day of Month',
			name: 'renewal_day_of_month',
			type: 'number',
			default: 1,
			description: '1–28, or -1 for the last day of the month',
		},
		bool('new_revision', 'New Revision', 'Whether to create a new revision of the doc'),
	]),
	operations('docFolder', 'Doc Folder'),
	...listAndId('docFolder', 'Doc Folder', 'folderId', 'searchDocFolders', []),
	titleCreate('docFolder'),
	...spaceCreate('docFolder'),
	collection('docFolder', ['create'], 'additionalFields', 'Additional Fields', [
		textField('description', 'Description'),
		idField('parent_id', 'Parent Folder ID', 'searchDocFolders'),
	]),
	collection('docFolder', ['update'], 'updateFields', 'Update Fields', [
		textField('title', 'Title'),
		textField('description', 'Description'),
		idField('parent_id', 'Parent Folder ID', 'searchDocFolders'),
	]),

	operations('review', 'Review', false),
	...listAndId(
		'review',
		'Review',
		'reviewId',
		'searchReviews',
		[
			idField('reviewee_id', 'Reviewee ID', 'searchPeople'),
			idField('manager_reviewer_id', 'Manager Reviewer ID', 'searchPeople'),
			choice('status', 'Status', ['draft', 'in_progress', 'completed'], 'completed'),
		],
		false,
	),
	{
		displayName:
			'Lists contain summaries. Get requires review-space access; draft reviews return 404. Answers are available only for completed reviews and never include peer feedback.',
		name: 'reviewNotice',
		type: 'notice',
		default: '',
		displayOptions: { show: { resource: ['review'] } },
	},

	operations('shoutout', 'Shoutout'),
	...listAndId('shoutout', 'Shoutout', 'shoutoutId', 'searchShoutouts', [
		idField('creator_id', 'Creator ID', 'searchPeople'),
		idField('recipient_id', 'Recipient ID', 'searchPeople'),
		idField('core_value_id', 'Core Value ID'),
	]),
	...spaceCreate('shoutout'),
	{
		...textField(
			'recipientIds',
			'Recipient IDs',
			'Comma-separated person UUIDs. At least one is required.',
		),
		required: true,
		displayOptions: show('shoutout', ['create']),
	},
	{
		...textField(
			'coreValueIds',
			'Core Value IDs',
			'Comma-separated core value UUIDs from a Strety vision. At least one is required.',
		),
		required: true,
		displayOptions: show('shoutout', ['create']),
	},
	collection('shoutout', ['create'], 'additionalFields', 'Additional Fields', [
		textField('content', 'Content', 'Recognition message in plain text or HTML'),
		bool('company_shoutout', 'Company Shoutout', 'Whether to share the shoutout company-wide'),
		{
			...idField('creator_id', 'Creator ID', 'searchPeople'),
			description:
				'Attribute to this person; requires admin or account-owner access. Omit to use the authenticated person.',
		},
	]),
	collection('shoutout', ['update'], 'updateFields', 'Update Fields', [
		textField('content', 'Content', 'Recognition message in plain text or HTML'),
		textField(
			'recipient_ids',
			'Recipient IDs',
			'Comma-separated person UUIDs. If supplied, must contain at least one.',
		),
		textField(
			'core_value_ids',
			'Core Value IDs',
			'Comma-separated core value UUIDs. If supplied, must contain at least one.',
		),
		bool('company_shoutout', 'Company Shoutout', 'Whether to share the shoutout company-wide'),
	]),
];
