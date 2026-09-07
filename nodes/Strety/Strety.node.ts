import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import { goalOperations, goalFields } from './descriptions/GoalDescription';
import { goalCheckInOperations, goalCheckInFields } from './descriptions/GoalCheckInDescription';
import {
	goalMilestoneOperations,
	goalMilestoneFields,
} from './descriptions/GoalMilestoneDescription';
import { headlineOperations, headlineFields } from './descriptions/HeadlineDescription';
import { issueOperations, issueFields } from './descriptions/IssueDescription';
import { meetingOperations, meetingFields } from './descriptions/MeetingDescription';
import { messageOperations, messageFields } from './descriptions/MessageDescription';
import { metricOperations, metricFields } from './descriptions/MetricDescription';
import {
	metricCheckInOperations,
	metricCheckInFields,
} from './descriptions/MetricCheckInDescription';
import { peopleOperations, peopleFields } from './descriptions/PeopleDescription';
import { playbookOperations, playbookFields } from './descriptions/PlaybookDescription';
import {
	playbookFolderOperations,
	playbookFolderFields,
} from './descriptions/PlaybookFolderDescription';
import { projectOperations, projectFields } from './descriptions/ProjectDescription';
import { roleOperations, roleFields } from './descriptions/RoleDescription';
import { rolesChartOperations, rolesChartFields } from './descriptions/RolesChartDescription';
import { teamOperations, teamFields } from './descriptions/TeamDescription';
import { todoOperations, todoFields } from './descriptions/TodoDescription';
import { visionOperations, visionFields } from './descriptions/VisionDescription';

import { additionalResourceProperties } from './descriptions/AdditionalResources';

const BASE_URL = 'https://2.strety.com';

/**
 * Sliding-window rate limiter for the Strety API.
 *
 * The API enforces a hard limit of 10 requests per 10-second window.
 * We stay one request below the ceiling (9 req / 10 s) to provide a
 * safety margin for timing jitter.  When the window is full, the next
 * call sleeps until the oldest tracked request expires, plus a small
 * buffer, before continuing.
 */
const requestTimestamps: number[] = [];
const RATE_LIMIT_MAX = 9;
const RATE_LIMIT_WINDOW_MS = 10_000;

// Use globalThis.setTimeout so the timer works in every n8n execution
// environment without depending on @types/node at compile time.
const sleep = (ms: number): Promise<void> =>
	new Promise<void>((resolve) => {
		(globalThis as unknown as { setTimeout: (cb: () => void, ms: number) => void }).setTimeout(
			resolve,
			ms,
		);
	});

async function enforceRateLimit(): Promise<void> {
	// Recheck after sleeping: several AI tools/workflows may be waiting for a slot.
	while (true) {
		const now = Date.now();
		while (requestTimestamps.length && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
			requestTimestamps.shift();
		}
		if (requestTimestamps.length < RATE_LIMIT_MAX) {
			requestTimestamps.push(now);
			return;
		}
		await sleep(Math.max(1, requestTimestamps[0] + RATE_LIMIT_WINDOW_MS - now + 100));
	}
}

// ─── Node Definition ──────────────────────────────────────────────────────────

export class Strety implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Strety',
		name: 'strety',
		icon: 'file:strety.png',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Strety strategic planning platform',
		defaults: {
			name: 'Strety',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'stretyOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Doc', value: 'doc' },
					{ name: 'Doc Folder', value: 'docFolder' },
					{ name: 'Goal', value: 'goal' },
					{ name: 'Goal Check-In', value: 'goalCheckIn' },
					{ name: 'Goal Milestone', value: 'goalMilestone' },
					{ name: 'Headline', value: 'headline' },
					{ name: 'Issue', value: 'issue' },
					{ name: 'Meeting', value: 'meeting' },
					{ name: 'Message', value: 'message' },
					{ name: 'Metric', value: 'metric' },
					{ name: 'Metric Check-In', value: 'metricCheckIn' },
					{ name: 'People', value: 'people' },
					{ name: 'Playbook (Legacy)', value: 'playbook' },
					{ name: 'Playbook Folder (Legacy)', value: 'playbookFolder' },
					{ name: 'Project', value: 'project' },
					{ name: 'Review', value: 'review' },
					{ name: 'Role', value: 'role' },
					{ name: 'Roles Chart', value: 'rolesChart' },
					{ name: 'Shoutout', value: 'shoutout' },
					{ name: 'Team', value: 'team' },
					{ name: 'Todo', value: 'todo' },
					{ name: 'Vision', value: 'vision' },
				],
				default: 'goal',
			},
			...additionalResourceProperties,
			...goalOperations,
			...goalFields,
			...goalCheckInOperations,
			...goalCheckInFields,
			...goalMilestoneOperations,
			...goalMilestoneFields,
			...headlineOperations,
			...headlineFields,
			...issueOperations,
			...issueFields,
			...meetingOperations,
			...meetingFields,
			...messageOperations,
			...messageFields,
			...metricOperations,
			...metricFields,
			...metricCheckInOperations,
			...metricCheckInFields,
			...peopleOperations,
			...peopleFields,
			...playbookOperations,
			...playbookFields,
			...playbookFolderOperations,
			...playbookFolderFields,
			...projectOperations,
			...projectFields,
			...roleOperations,
			...roleFields,
			...rolesChartOperations,
			...rolesChartFields,
			...teamOperations,
			...teamFields,
			...todoOperations,
			...todoFields,
			...visionOperations,
			...visionFields,
		],
	};

	methods = {
		listSearch: {
			searchGoals: makeListSearch('/api/v1/goals', undefined, { 'filter[archive_status]': 'any' }),
			searchHeadlines: makeListSearch('/api/v1/headlines', undefined, {
				'filter[archive_status]': 'any',
			}),
			searchIssues: makeListSearch('/api/v1/issues', undefined, {
				'filter[archive_status]': 'any',
			}),
			searchDocs: makeListSearch('/api/v1/docs'),
			searchDocFolders: makeListSearch('/api/v1/docs/folders'),
			searchPeople: makeListSearch('/api/v1/people', 'name'),
			searchReviews: makeListSearch('/api/v1/reviews'),
			searchShoutouts: makeListSearch('/api/v1/shoutouts'),
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (['doc', 'docFolder', 'review', 'shoutout'].includes(resource)) {
					responseData = await handleAdditionalResource.call(this, resource, operation, i);
				} else if (resource === 'goal') {
					responseData = await handleGoal.call(this, operation, i);
				} else if (resource === 'goalCheckIn') {
					responseData = await handleGoalCheckIn.call(this, operation, i);
				} else if (resource === 'goalMilestone') {
					responseData = await handleGoalMilestone.call(this, operation, i);
				} else if (resource === 'headline') {
					responseData = await handleHeadline.call(this, operation, i);
				} else if (resource === 'issue') {
					responseData = await handleIssue.call(this, operation, i);
				} else if (resource === 'meeting') {
					responseData = await handleMeeting.call(this, operation, i);
				} else if (resource === 'message') {
					responseData = await handleMessage.call(this, operation, i);
				} else if (resource === 'metric') {
					responseData = await handleMetric.call(this, operation, i);
				} else if (resource === 'metricCheckIn') {
					responseData = await handleMetricCheckIn.call(this, operation, i);
				} else if (resource === 'people') {
					responseData = await handlePeople.call(this, operation, i);
				} else if (resource === 'playbook') {
					responseData = await handlePlaybook.call(this, operation, i);
				} else if (resource === 'playbookFolder') {
					responseData = await handlePlaybookFolder.call(this, operation, i);
				} else if (resource === 'project') {
					responseData = await handleProject.call(this, operation, i);
				} else if (resource === 'role') {
					responseData = await handleRole.call(this, operation, i);
				} else if (resource === 'rolesChart') {
					responseData = await handleRolesChart.call(this, operation, i);
				} else if (resource === 'team') {
					responseData = await handleTeam.call(this, operation, i);
				} else if (resource === 'todo') {
					responseData = await handleTodo.call(this, operation, i);
				} else if (resource === 'vision') {
					responseData = await handleVision.call(this, operation, i);
				} else {
					throw new NodeApiError(this.getNode(), {
						message: `Unknown resource: ${resource}`,
					} as JsonObject);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function stretyApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
	extraHeaders?: IDataObject,
): Promise<IDataObject> {
	await enforceRateLimit();

	const options: IHttpRequestOptions = {
		method,
		url: `${BASE_URL}${docsEndpoint(endpoint)}`,
		headers: {
			Accept: 'application/vnd.api+json',
			'Content-Type': 'application/vnd.api+json',
			...extraHeaders,
		},
		qs,
		// Keys already contain [] for Strety arrays; avoid n8n adding a second index.
		arrayFormat: 'repeat',
		body: endpoint.startsWith('/api/v1/playbooks') ? migrateLegacyBody(body) : body,
		json: true,
	};

	if (!body || Object.keys(body).length === 0) {
		delete options.body;
	}

	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'stretyOAuth2Api',
		options,
	)) as IDataObject;
	return response && endpoint.startsWith('/api/v1/playbooks')
		? legacyDocResponse(response)
		: response;
}

async function stretyApiRequestAllItems(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let page = 1;
	const pageSize = Math.min(limit ?? 20, 20);

	qs['page[size]'] = pageSize;

	do {
		qs['page[number]'] = page;
		const response = await stretyApiRequest.call(this, method, endpoint, undefined, qs);
		const data = response.data as IDataObject[];

		if (!data || data.length === 0) break;

		allItems.push(...data);

		if (limit && allItems.length >= limit) {
			return allItems.slice(0, limit);
		}

		const meta = response.meta as IDataObject | undefined;
		const totalCount = meta?.total_count as number | undefined;

		if (totalCount && allItems.length >= totalCount) break;
		if (data.length < pageSize) break;

		page++;
	} while (true);

	return allItems;
}

// ─── JSON:API Helpers ─────────────────────────────────────────────────────────

function flattenJsonApiResource(resource: IDataObject): IDataObject {
	const result: IDataObject = { id: resource.id, type: resource.type };

	const attributes = resource.attributes as IDataObject | undefined;
	if (attributes) {
		Object.assign(result, attributes);
	}

	const relationships = resource.relationships as IDataObject | undefined;
	if (relationships) {
		for (const [key, rel] of Object.entries(relationships)) {
			const relObj = rel as IDataObject;
			const data = relObj?.data as IDataObject | IDataObject[] | null;
			if (data) {
				if (Array.isArray(data)) {
					result[`${key}_ids`] = data.map((d) => d.id);
				} else {
					result[`${key}_id`] = data.id;
					result[`${key}_type`] = data.type;
				}
			}
		}
	}

	return result;
}

function flattenList(items: IDataObject[]): IDataObject[] {
	return items.map(flattenJsonApiResource);
}

function flattenSingle(response: IDataObject): IDataObject {
	return flattenJsonApiResource(response.data as IDataObject);
}

function buildJsonApiBody(type: string, attributes: IDataObject): IDataObject {
	return {
		data: {
			type,
			attributes,
		},
	};
}

// ─── CRUD Helpers ─────────────────────────────────────────────────────────────

async function getEtag(this: IExecuteFunctions, endpoint: string): Promise<string> {
	await enforceRateLimit();

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${BASE_URL}${docsEndpoint(endpoint)}`,
		headers: {
			Accept: 'application/vnd.api+json',
		},
		json: true,
		returnFullResponse: true,
	};

	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'stretyOAuth2Api',
		options,
	)) as IDataObject;

	const headers = response.headers as IDataObject;
	const etag = headers?.etag as string;

	if (!etag) {
		throw new NodeApiError(this.getNode(), {
			message: 'Could not retrieve ETag for resource update',
		} as JsonObject);
	}

	return etag;
}

function addFiltersToQs(qs: IDataObject, filters: IDataObject): void {
	for (const [key, raw] of Object.entries(filters)) {
		const value = locatorValue(raw);
		if (value === undefined || value === null || value === '') continue;
		if (key === 'ids' || Array.isArray(value)) {
			const values = Array.isArray(value)
				? value
				: String(value)
						.split(',')
						.map((id) => id.trim())
						.filter(Boolean);
			// Empty brackets match Strety's documented array parameters.
			if (values.length) qs[`filter[${key}][]`] = values;
		} else {
			qs[`filter[${key}]`] = value;
		}
	}
}

function addIncludeOptions(ctx: IExecuteFunctions, qs: IDataObject, i: number): void {
	try {
		const options = ctx.getNodeParameter('options', i, {}) as IDataObject;
		if (options.include) {
			qs['include'] = 'latest_check_ins';
			if (options.limit_check_ins) {
				qs['limit_check_ins'] = options.limit_check_ins;
			}
		}
	} catch {
		// Parameter not available for this resource configuration
	}
}

async function handleGetAll(
	this: IExecuteFunctions,
	endpoint: string,
	i: number,
	filtersParam = 'filters',
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const qs: IDataObject = {};

	try {
		const filters = this.getNodeParameter(filtersParam, i, {}) as IDataObject;
		addFiltersToQs(qs, filters);
	} catch {
		// No filters parameter defined for this resource
	}

	let items: IDataObject[];
	if (returnAll) {
		items = await stretyApiRequestAllItems.call(this, 'GET', endpoint, qs);
	} else {
		const limit = this.getNodeParameter('limit', i) as number;
		items = await stretyApiRequestAllItems.call(this, 'GET', endpoint, qs, limit);
	}

	return flattenList(items);
}

/**
 * Variant of handleGetAll that also appends `include` query-string options
 * (used by goals and metrics to embed latest check-in data).
 */
async function handleGetAllWithIncludes(
	this: IExecuteFunctions,
	endpoint: string,
	i: number,
): Promise<IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const qs: IDataObject = {};

	try {
		const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
		addFiltersToQs(qs, filters);
	} catch {
		// No filters parameter defined for this resource
	}

	addIncludeOptions(this, qs, i);

	let items: IDataObject[];
	if (returnAll) {
		items = await stretyApiRequestAllItems.call(this, 'GET', endpoint, qs);
	} else {
		const limit = this.getNodeParameter('limit', i) as number;
		items = await stretyApiRequestAllItems.call(this, 'GET', endpoint, qs, limit);
	}

	return flattenList(items);
}

/**
 * Variant of handleGet that also appends `include` query-string options
 * (used by goals and metrics to embed latest check-in data).
 */
async function handleGetWithIncludes(
	this: IExecuteFunctions,
	endpoint: string,
	i: number,
): Promise<IDataObject> {
	const qs: IDataObject = {};
	addIncludeOptions(this, qs, i);
	const response = await stretyApiRequest.call(this, 'GET', endpoint, undefined, qs);
	return flattenSingle(response);
}

async function handleGet(this: IExecuteFunctions, endpoint: string): Promise<IDataObject> {
	const response = await stretyApiRequest.call(this, 'GET', endpoint);
	return flattenSingle(response);
}

async function handleCreate(
	this: IExecuteFunctions,
	endpoint: string,
	type: string,
	attributes: IDataObject,
): Promise<IDataObject> {
	const body = buildJsonApiBody(type, attributes);
	const response = await stretyApiRequest.call(this, 'POST', endpoint, body);
	return flattenSingle(response);
}

async function handleUpdate(
	this: IExecuteFunctions,
	endpoint: string,
	type: string,
	attributes: IDataObject,
): Promise<IDataObject> {
	const etag = await getEtag.call(this, endpoint);
	const body = buildJsonApiBody(type, attributes);
	const response = await stretyApiRequest.call(this, 'PATCH', endpoint, body, undefined, {
		'If-Match': etag,
	});
	return flattenSingle(response);
}

async function handleDelete(this: IExecuteFunctions, endpoint: string): Promise<IDataObject> {
	await stretyApiRequest.call(this, 'DELETE', endpoint);
	return { success: true };
}

// ─── Resource Handlers ────────────────────────────────────────────────────────

async function handleGoal(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'archive' || operation === 'unarchive') {
		const id = readId.call(this, 'goalId', i);
		const response = await stretyApiRequest.call(
			this,
			operation === 'archive' ? 'POST' : 'DELETE',
			`/api/v1/goals/${id}/archive`,
		);
		return flattenSingle(response);
	}

	if (operation === 'getAll') {
		return handleGetAllWithIncludes.call(this, '/api/v1/goals', i);
	}

	if (operation === 'get') {
		const id = readId.call(this, 'goalId', i);
		return handleGetWithIncludes.call(this, `/api/v1/goals/${id}`, i);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const checkInType = this.getNodeParameter('checkInType', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

		const attributes: IDataObject = {
			title,
			check_in_type: checkInType,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};

		return handleCreate.call(this, '/api/v1/goals', 'goal', attributes);
	}

	if (operation === 'update') {
		const id = readId.call(this, 'goalId', i);
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/goals/${id}`, 'goal', updateFields);
	}

	if (operation === 'delete') {
		const id = readId.call(this, 'goalId', i);
		return handleDelete.call(this, `/api/v1/goals/${id}`);
	}

	if (operation === 'backlog') {
		const id = readId.call(this, 'goalId', i);
		const response = await stretyApiRequest.call(this, 'POST', `/api/v1/goals/${id}/backlog`);
		return flattenSingle(response);
	}

	if (operation === 'unbacklog') {
		const id = readId.call(this, 'goalId', i);
		const response = await stretyApiRequest.call(this, 'DELETE', `/api/v1/goals/${id}/backlog`);
		return flattenSingle(response);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleGoalCheckIn(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const goalId = readId.call(this, 'goalId', i);

	if (operation === 'getAll') {
		return handleGetAll.call(this, `/api/v1/goals/${goalId}/check_ins`, i);
	}

	if (operation === 'get') {
		const checkInId = this.getNodeParameter('checkInId', i) as string;
		return handleGet.call(this, `/api/v1/goals/${goalId}/check_ins/${checkInId}`);
	}

	if (operation === 'create') {
		const status = this.getNodeParameter('status', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = { status, ...additionalFields };
		return handleCreate.call(
			this,
			`/api/v1/goals/${goalId}/check_ins`,
			'goal_check_in',
			attributes,
		);
	}

	if (operation === 'update') {
		const checkInId = this.getNodeParameter('checkInId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(
			this,
			`/api/v1/goals/${goalId}/check_ins/${checkInId}`,
			'goal_check_in',
			updateFields,
		);
	}

	if (operation === 'delete') {
		const checkInId = this.getNodeParameter('checkInId', i) as string;
		return handleDelete.call(this, `/api/v1/goals/${goalId}/check_ins/${checkInId}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleGoalMilestone(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const goalId = readId.call(this, 'goalId', i);

	if (operation === 'getAll') {
		return handleGetAll.call(this, `/api/v1/goals/${goalId}/milestones`, i);
	}

	if (operation === 'get') {
		const milestoneId = this.getNodeParameter('milestoneId', i) as string;
		return handleGet.call(this, `/api/v1/goals/${goalId}/milestones/${milestoneId}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = { title, ...additionalFields };
		return handleCreate.call(
			this,
			`/api/v1/goals/${goalId}/milestones`,
			'goal_milestone',
			attributes,
		);
	}

	if (operation === 'update') {
		const milestoneId = this.getNodeParameter('milestoneId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(
			this,
			`/api/v1/goals/${goalId}/milestones/${milestoneId}`,
			'goal_milestone',
			updateFields,
		);
	}

	if (operation === 'delete') {
		const milestoneId = this.getNodeParameter('milestoneId', i) as string;
		return handleDelete.call(this, `/api/v1/goals/${goalId}/milestones/${milestoneId}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleHeadline(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'archive' || operation === 'unarchive') {
		const id = readId.call(this, 'headlineId', i);
		const response = await stretyApiRequest.call(
			this,
			operation === 'archive' ? 'POST' : 'DELETE',
			`/api/v1/headlines/${id}/archive`,
		);
		return flattenSingle(response);
	}

	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/headlines', i);
	}

	if (operation === 'get') {
		const id = readId.call(this, 'headlineId', i);
		return handleGet.call(this, `/api/v1/headlines/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		return handleCreate.call(this, '/api/v1/headlines', 'headline', attributes);
	}

	if (operation === 'update') {
		const id = readId.call(this, 'headlineId', i);
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/headlines/${id}`, 'headline', updateFields);
	}

	if (operation === 'delete') {
		const id = readId.call(this, 'headlineId', i);
		return handleDelete.call(this, `/api/v1/headlines/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleIssue(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'archive' || operation === 'unarchive') {
		const id = readId.call(this, 'issueId', i);
		const response = await stretyApiRequest.call(
			this,
			operation === 'archive' ? 'POST' : 'DELETE',
			`/api/v1/issues/${id}/archive`,
		);
		return flattenSingle(response);
	}

	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/issues', i);
	}

	if (operation === 'get') {
		const id = readId.call(this, 'issueId', i);
		return handleGet.call(this, `/api/v1/issues/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		return handleCreate.call(this, '/api/v1/issues', 'issue', attributes);
	}

	if (operation === 'update') {
		const id = readId.call(this, 'issueId', i);
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/issues/${id}`, 'issue', updateFields);
	}

	if (operation === 'delete') {
		const id = readId.call(this, 'issueId', i);
		return handleDelete.call(this, `/api/v1/issues/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleMeeting(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/meetings', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('meetingId', i) as string;
		return handleGet.call(this, `/api/v1/meetings/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleMessage(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/messages', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('messageId', i) as string;
		return handleGet.call(this, `/api/v1/messages/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		return handleCreate.call(this, '/api/v1/messages', 'message', attributes);
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('messageId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/messages/${id}`, 'message', updateFields);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('messageId', i) as string;
		return handleDelete.call(this, `/api/v1/messages/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleMetric(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAllWithIncludes.call(this, '/api/v1/metrics', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('metricId', i) as string;
		return handleGetWithIncludes.call(this, `/api/v1/metrics/${id}`, i);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		return handleCreate.call(this, '/api/v1/metrics', 'metric', attributes);
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('metricId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/metrics/${id}`, 'metric', updateFields);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('metricId', i) as string;
		return handleDelete.call(this, `/api/v1/metrics/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleMetricCheckIn(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const metricId = this.getNodeParameter('metricId', i) as string;

	if (operation === 'getAll') {
		return handleGetAll.call(this, `/api/v1/metrics/${metricId}/check_ins`, i);
	}

	if (operation === 'get') {
		const checkInId = this.getNodeParameter('checkInId', i) as string;
		return handleGet.call(this, `/api/v1/metrics/${metricId}/check_ins/${checkInId}`);
	}

	if (operation === 'create') {
		const value = this.getNodeParameter('value', i) as number;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		validateDailyDate.call(this, additionalFields.date);
		const attributes: IDataObject = { value, ...additionalFields };
		return handleCreate.call(
			this,
			`/api/v1/metrics/${metricId}/check_ins`,
			'metric_check_in',
			attributes,
		);
	}

	if (operation === 'update') {
		const checkInId = this.getNodeParameter('checkInId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(
			this,
			`/api/v1/metrics/${metricId}/check_ins/${checkInId}`,
			'metric_check_in',
			updateFields,
		);
	}

	if (operation === 'delete') {
		const checkInId = this.getNodeParameter('checkInId', i) as string;
		return handleDelete.call(this, `/api/v1/metrics/${metricId}/check_ins/${checkInId}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handlePeople(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getCurrent') return handleGet.call(this, '/api/v1/me');

	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/people', i);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

/**
 * Compose the nested `renewal_scheduler` object from the two flat UI
 * fields (`renewal_interval`, `renewal_day_of_month`) the node exposes,
 * since fixedCollections are awkward for a single-object field. Mutates
 * `attributes` in place.
 */
function composeRenewalScheduler(attributes: IDataObject): void {
	const interval = attributes.renewal_interval as number | null | undefined;
	const dayOfMonth = attributes.renewal_day_of_month as number | undefined;

	if (interval !== undefined || dayOfMonth !== undefined) {
		const scheduler: IDataObject = {};
		if (interval !== undefined) scheduler.interval = interval;
		if (dayOfMonth !== undefined) scheduler.day_of_month = dayOfMonth;
		attributes.renewal_scheduler = scheduler;
	}

	delete attributes.renewal_interval;
	delete attributes.renewal_day_of_month;
}

async function handlePlaybook(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/playbooks', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('playbookId', i) as string;
		return handleGet.call(this, `/api/v1/playbooks/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		composeRenewalScheduler(attributes);
		return handleCreate.call(this, '/api/v1/playbooks', 'playbook', attributes);
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('playbookId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		const attributes: IDataObject = { ...updateFields };
		composeRenewalScheduler(attributes);
		return handleUpdate.call(this, `/api/v1/playbooks/${id}`, 'playbook', attributes);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('playbookId', i) as string;
		return handleDelete.call(this, `/api/v1/playbooks/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handlePlaybookFolder(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/playbooks/folders', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('folderId', i) as string;
		return handleGet.call(this, `/api/v1/playbooks/folders/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		return handleCreate.call(this, '/api/v1/playbooks/folders', 'playbook_folder', attributes);
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('folderId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(
			this,
			`/api/v1/playbooks/folders/${id}`,
			'playbook_folder',
			updateFields,
		);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('folderId', i) as string;
		return handleDelete.call(this, `/api/v1/playbooks/folders/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleProject(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/projects', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('projectId', i) as string;
		return handleGet.call(this, `/api/v1/projects/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = { title, ...additionalFields };
		return handleCreate.call(this, '/api/v1/projects', 'project', attributes);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleRolesChart(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/roles_charts', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('rolesChartId', i) as string;
		return handleGet.call(this, `/api/v1/roles_charts/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleRole(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const rolesChartId = this.getNodeParameter('rolesChartId', i) as string;

	if (operation === 'getAll') {
		return handleGetAll.call(this, `/api/v1/roles_charts/${rolesChartId}/roles`, i);
	}

	if (operation === 'get') {
		const roleId = this.getNodeParameter('roleId', i) as string;
		return handleGet.call(this, `/api/v1/roles_charts/${rolesChartId}/roles/${roleId}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleTeam(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/teams', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('teamId', i) as string;
		return handleGet.call(this, `/api/v1/teams/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleTodo(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/todos', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('todoId', i) as string;
		return handleGet.call(this, `/api/v1/todos/${id}`);
	}

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const spaceId = this.getNodeParameter('spaceId', i) as string;
		const spaceType = this.getNodeParameter('spaceType', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
		const attributes: IDataObject = {
			title,
			space_id: spaceId,
			space_type: spaceType,
			...additionalFields,
		};
		return handleCreate.call(this, '/api/v1/todos', 'todo', attributes);
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('todoId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/todos/${id}`, 'todo', updateFields);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('todoId', i) as string;
		return handleDelete.call(this, `/api/v1/todos/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

async function handleVision(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/visions', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('visionId', i) as string;
		return handleGet.call(this, `/api/v1/visions/${id}`);
	}

	throw new NodeApiError(this.getNode(), {
		message: `Unknown operation: ${operation}`,
	} as JsonObject);
}

// The legacy resource names and saved parameters remain valid after the API sunset.
function docsEndpoint(endpoint: string): string {
	return endpoint.replace(/^\/api\/v1\/playbooks(?=\/|$)/, '/api/v1/docs');
}

function migrateLegacyBody(body?: IDataObject): IDataObject | undefined {
	if (!body?.data) return body;
	const data = body.data as IDataObject;
	return {
		...body,
		data: { ...data, type: data.type === 'playbook_folder' ? 'doc_folder' : 'doc' },
	};
}

function legacyDocResponse(response: IDataObject): IDataObject {
	const convert = (resource: IDataObject): IDataObject => {
		const type =
			resource.type === 'doc'
				? 'playbook'
				: resource.type === 'doc_folder'
					? 'playbook_folder'
					: resource.type;
		const result: IDataObject = { ...resource, type };
		if (resource.relationships) {
			result.relationships = Object.fromEntries(
				Object.entries(resource.relationships as IDataObject).map(([key, value]) => {
					const relation = value as IDataObject;
					return [
						key,
						{
							...relation,
							data: Array.isArray(relation.data)
								? relation.data.map((item) => convert(item as IDataObject))
								: relation.data
									? convert(relation.data as IDataObject)
									: relation.data,
						},
					];
				}),
			);
		}
		return result;
	};
	return {
		...response,
		...(response.data
			? {
					data: Array.isArray(response.data)
						? response.data.map((item) => convert(item as IDataObject))
						: convert(response.data as IDataObject),
				}
			: {}),
		...(Array.isArray(response.included)
			? { included: response.included.map((item) => convert(item as IDataObject)) }
			: {}),
	};
}

function locatorValue(value: IDataObject[string]): IDataObject[string] {
	if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
		return (value as IDataObject).value;
	}
	return value;
}

function readId(this: IExecuteFunctions, name: string, i: number): string {
	const value = locatorValue(this.getNodeParameter(name, i) as IDataObject[string]);
	if (
		typeof value !== 'string' ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
	) {
		throw new NodeOperationError(this.getNode(), `${name} must be a Strety UUID`, { itemIndex: i });
	}
	return value;
}

function attributesFromFields(fields: IDataObject): IDataObject {
	return Object.fromEntries(
		Object.entries(fields).map(([key, value]) => [key, locatorValue(value)]),
	);
}

function idArray(this: IExecuteFunctions, value: IDataObject[string], label: string): string[] {
	const values = Array.isArray(value)
		? value
		: typeof value === 'string'
			? value
					.split(',')
					.map((id) => id.trim())
					.filter(Boolean)
			: [];
	if (
		!values.length ||
		values.some(
			(id) =>
				typeof id !== 'string' ||
				!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id),
		)
	) {
		throw new NodeOperationError(
			this.getNode(),
			`${label} must contain at least one valid Strety UUID`,
		);
	}
	return values as string[];
}

function validateDailyDate(this: IExecuteFunctions, value: IDataObject[string]): void {
	if (value === undefined) return;
	if (
		typeof value !== 'string' ||
		!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
		Number.isNaN(Date.parse(value)) ||
		new Date(value).toISOString().slice(0, 10) !== value
	) {
		throw new NodeOperationError(
			this.getNode(),
			'Date must be a valid calendar date in YYYY-MM-DD format',
		);
	}
}

function makeListSearch(endpoint: string, serverFilter?: string, fixedQuery: IDataObject = {}) {
	return async function (
		this: ILoadOptionsFunctions,
		filter = '',
		paginationToken?: string,
	): Promise<INodeListSearchResult> {
		const page = Number(paginationToken ?? 1);
		if (!Number.isInteger(page) || page < 1)
			throw new NodeOperationError(this.getNode(), 'Invalid list page');
		const qs: IDataObject = { ...fixedQuery, 'page[size]': 20, 'page[number]': page };
		if (filter && serverFilter) qs[`filter[${serverFilter}]`] = filter;
		const response = await stretyApiRequest.call(this, 'GET', endpoint, undefined, qs);
		const data = (response.data ?? []) as IDataObject[];
		const results = data
			.map((item) => {
				const attributes = item.attributes as IDataObject | undefined;
				return {
					name: String(attributes?.title ?? attributes?.name ?? attributes?.content ?? item.id),
					value: String(item.id),
				};
			})
			.filter(
				(item) =>
					!filter ||
					serverFilter ||
					item.name.toLowerCase().includes(filter.toLowerCase()) ||
					item.value.includes(filter),
			);
		const total = (response.meta as IDataObject | undefined)?.total_count;
		const nextPage =
			data.length === 20 && !(typeof total === 'number' && page * 20 >= total)
				? String(page + 1)
				: undefined;
		return { results, paginationToken: nextPage };
	};
}

async function handleAdditionalResource(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const config: Record<string, { endpoint: string; type: string; id: string }> = {
		doc: { endpoint: '/api/v1/docs', type: 'doc', id: 'docId' },
		docFolder: { endpoint: '/api/v1/docs/folders', type: 'doc_folder', id: 'folderId' },
		review: { endpoint: '/api/v1/reviews', type: 'review', id: 'reviewId' },
		shoutout: { endpoint: '/api/v1/shoutouts', type: 'shoutout', id: 'shoutoutId' },
	};
	const { endpoint, type, id: idParam } = config[resource];
	if (operation === 'getAll') return handleGetAll.call(this, endpoint, i);
	if (operation === 'get')
		return handleGet.call(this, `${endpoint}/${readId.call(this, idParam, i)}`);
	if (resource === 'review')
		throw new NodeOperationError(this.getNode(), 'Reviews support only Get and Get Many');
	if (operation === 'delete')
		return handleDelete.call(this, `${endpoint}/${readId.call(this, idParam, i)}`);
	if (operation !== 'create' && operation !== 'update')
		throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);

	const attributes = attributesFromFields(
		this.getNodeParameter(
			operation === 'create' ? 'additionalFields' : 'updateFields',
			i,
			{},
		) as IDataObject,
	);
	if (operation === 'create') {
		attributes.space_id = readId.call(this, 'spaceId', i);
		attributes.space_type = this.getNodeParameter('spaceType', i) as string;
		if (resource === 'shoutout') {
			attributes.recipient_ids = idArray.call(
				this,
				this.getNodeParameter('recipientIds', i) as string,
				'Recipient IDs',
			);
			attributes.core_value_ids = idArray.call(
				this,
				this.getNodeParameter('coreValueIds', i) as string,
				'Core Value IDs',
			);
		} else {
			attributes.title = this.getNodeParameter('title', i) as string;
			if (resource === 'doc') attributes.type = this.getNodeParameter('docType', i) as string;
		}
	} else if (resource === 'shoutout') {
		for (const key of ['recipient_ids', 'core_value_ids']) {
			if (attributes[key] !== undefined) attributes[key] = idArray.call(this, attributes[key], key);
		}
	} else if (resource === 'doc') {
		if (attributes.renewal_interval === 'none') attributes.renewal_interval = null;
		const day = attributes.renewal_day_of_month;
		if (
			day !== undefined &&
			attributes.renewal_interval !== null &&
			(typeof day !== 'number' || !Number.isInteger(day) || (day !== -1 && (day < 1 || day > 28)))
		) {
			throw new NodeOperationError(
				this.getNode(),
				'Renewal day must be 1–28 or -1 for the last day of the month',
			);
		}
		composeRenewalScheduler(attributes);
	}
	return operation === 'create'
		? handleCreate.call(this, endpoint, type, attributes)
		: handleUpdate.call(this, `${endpoint}/${readId.call(this, idParam, i)}`, type, attributes);
}
