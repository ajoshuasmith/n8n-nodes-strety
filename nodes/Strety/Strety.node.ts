import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { goalOperations, goalFields } from './descriptions/GoalDescription';
import { goalCheckInOperations, goalCheckInFields } from './descriptions/GoalCheckInDescription';
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
import { teamOperations, teamFields } from './descriptions/TeamDescription';
import { todoOperations, todoFields } from './descriptions/TodoDescription';

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
	const now = Date.now();

	while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
		requestTimestamps.shift();
	}

	if (requestTimestamps.length >= RATE_LIMIT_MAX) {
		const waitUntil = requestTimestamps[0] + RATE_LIMIT_WINDOW_MS;
		const waitMs = waitUntil - now + 100;
		if (waitMs > 0) {
			await sleep(waitMs);
		}
	}

	requestTimestamps.push(Date.now());
}

// ─── Node Definition ──────────────────────────────────────────────────────────

export class Strety implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Strety',
		name: 'strety',
		icon: 'file:strety.png',
		group: ['transform'],
		version: 1,
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
					{ name: 'Goal', value: 'goal' },
					{ name: 'Goal Check-In', value: 'goalCheckIn' },
					{ name: 'Headline', value: 'headline' },
					{ name: 'Issue', value: 'issue' },
					{ name: 'Meeting', value: 'meeting' },
					{ name: 'Message', value: 'message' },
					{ name: 'Metric', value: 'metric' },
					{ name: 'Metric Check-In', value: 'metricCheckIn' },
					{ name: 'People', value: 'people' },
					{ name: 'Playbook', value: 'playbook' },
					{ name: 'Playbook Folder', value: 'playbookFolder' },
					{ name: 'Project', value: 'project' },
					{ name: 'Team', value: 'team' },
					{ name: 'Todo', value: 'todo' },
				],
				default: 'goal',
			},
			...goalOperations,
			...goalFields,
			...goalCheckInOperations,
			...goalCheckInFields,
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
			...teamOperations,
			...teamFields,
			...todoOperations,
			...todoFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'goal') {
					responseData = await handleGoal.call(this, operation, i);
				} else if (resource === 'goalCheckIn') {
					responseData = await handleGoalCheckIn.call(this, operation, i);
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
				} else if (resource === 'team') {
					responseData = await handleTeam.call(this, operation, i);
				} else if (resource === 'todo') {
					responseData = await handleTodo.call(this, operation, i);
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
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	qs?: IDataObject,
	extraHeaders?: IDataObject,
): Promise<IDataObject> {
	await enforceRateLimit();

	const options: IRequestOptions = {
		method,
		uri: `${BASE_URL}${endpoint}`,
		headers: {
			Accept: 'application/vnd.api+json',
			'Content-Type': 'application/vnd.api+json',
			...extraHeaders,
		},
		qs,
		body,
		json: true,
	};

	if (!body || Object.keys(body).length === 0) {
		delete options.body;
	}

	return (await this.helpers.requestOAuth2.call(
		this,
		'stretyOAuth2Api',
		options,
		{ tokenType: 'Bearer' },
	)) as IDataObject;
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

async function getEtag(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<string> {
	await enforceRateLimit();

	const options: IRequestOptions = {
		method: 'GET',
		uri: `${BASE_URL}${endpoint}`,
		headers: {
			Accept: 'application/vnd.api+json',
		},
		json: true,
		resolveWithFullResponse: true,
	};

	const response = (await this.helpers.requestOAuth2.call(
		this,
		'stretyOAuth2Api',
		options,
		{ tokenType: 'Bearer' },
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
	if (filters.created_after) {
		qs['filter[created_after]'] = filters.created_after;
	}
	if (filters.updated_after) {
		qs['filter[updated_after]'] = filters.updated_after;
	}
	if (filters.assignee_id) {
		qs['filter[assignee_id]'] = filters.assignee_id;
	}
	if (filters.owner_id) {
		qs['filter[owner_id]'] = filters.owner_id;
	}
	if (filters.parent_id) {
		qs['filter[parent_id]'] = filters.parent_id;
	}
	if (filters.issue_type) {
		qs['filter[issue_type]'] = filters.issue_type;
	}
	if (filters.checkin_frequency) {
		qs['filter[checkin_frequency]'] = filters.checkin_frequency;
	}
	if (filters.archived !== undefined && filters.archived !== '') {
		qs['filter[archived]'] = filters.archived;
	}
	if (filters.folder_id) {
		qs['filter[folder_id]'] = filters.folder_id;
	}
	if (filters.ids) {
		const idList = (filters.ids as string)
			.split(',')
			.map((id: string) => id.trim())
			.filter(Boolean);
		idList.forEach((id, index) => {
			qs[`filter[ids][${index}]`] = id;
		});
	}
}

function addIncludeOptions(
	ctx: IExecuteFunctions,
	qs: IDataObject,
	i: number,
): void {
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

async function handleGet(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<IDataObject> {
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

async function handleDelete(
	this: IExecuteFunctions,
	endpoint: string,
): Promise<IDataObject> {
	await stretyApiRequest.call(this, 'DELETE', endpoint);
	return { success: true };
}

// ─── Resource Handlers ────────────────────────────────────────────────────────

async function handleGoal(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAllWithIncludes.call(this, '/api/v1/goals', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('goalId', i) as string;
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
		const id = this.getNodeParameter('goalId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/goals/${id}`, 'goal', updateFields);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('goalId', i) as string;
		return handleDelete.call(this, `/api/v1/goals/${id}`);
	}

	if (operation === 'backlog') {
		const id = this.getNodeParameter('goalId', i) as string;
		const response = await stretyApiRequest.call(this, 'POST', `/api/v1/goals/${id}/backlog`);
		return flattenSingle(response);
	}

	if (operation === 'unbacklog') {
		const id = this.getNodeParameter('goalId', i) as string;
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
	const goalId = this.getNodeParameter('goalId', i) as string;

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

async function handleHeadline(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/headlines', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('headlineId', i) as string;
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
		const id = this.getNodeParameter('headlineId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/headlines/${id}`, 'headline', updateFields);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('headlineId', i) as string;
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
	if (operation === 'getAll') {
		return handleGetAll.call(this, '/api/v1/issues', i);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('issueId', i) as string;
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
		const id = this.getNodeParameter('issueId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		return handleUpdate.call(this, `/api/v1/issues/${id}`, 'issue', updateFields);
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('issueId', i) as string;
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
	const interval = attributes.renewal_interval as number | undefined;
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
		return handleCreate.call(
			this,
			'/api/v1/playbooks/folders',
			'playbook_folder',
			attributes,
		);
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
