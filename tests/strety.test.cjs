const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NodeHelpers, traverseNodeParameters, generateZodSchema } = require('n8n-workflow');

const ID = '11111111-1111-4111-8111-111111111111';
const PERSON = '22222222-2222-4222-8222-222222222222';
const VALUE = '33333333-3333-4333-8333-333333333333';
const SPACE = '44444444-4444-4444-8444-444444444444';
const locator = (value = ID) => ({ mode: 'id', value });
const resource = (type, attributes = {}, id = ID) => ({ data: { type, id, attributes } });
function setup(
	parameters,
	responder = () => resource('example'),
	items = [{}],
	continueOnFail = false,
) {
	// Each test gets its own process-local limiter without sleeping through network budgets.
	delete require.cache[require.resolve('../dist/nodes/Strety/Strety.node.js')];
	const node = new (require('../dist/nodes/Strety/Strety.node.js').Strety)();
	const calls = [];
	const context = {
		getInputData: () => items.map((json) => ({ json })),
		getNode: () => ({
			name: 'Strety',
			type: 'strety',
			typeVersion: 1,
			parameters,
			position: [0, 0],
		}),
		getNodeParameter: (name, i, fallback) =>
			Object.hasOwn(parameters, name) ? parameters[name] : fallback,
		continueOnFail: () => continueOnFail,
		helpers: {
			httpRequestWithAuthentication: async (credential, options) => {
				assert.equal(credential, 'stretyOAuth2Api');
				calls.push(structuredClone(options));
				return responder(options, calls.length);
			},
			returnJsonArray: (value) =>
				(Array.isArray(value) ? value : [value]).map((json) => ({ json })),
			constructExecutionMetaData: (data, { itemData }) =>
				data.map((item) => ({ ...item, pairedItem: itemData })),
		},
	};
	return { node, context, calls, execute: () => node.execute.call(context) };
}

for (const kind of ['doc', 'docFolder']) {
	const folder = kind === 'docFolder';
	const endpoint = folder ? '/api/v1/docs/folders' : '/api/v1/docs';
	const type = folder ? 'doc_folder' : 'doc';
	const idKey = folder ? 'folderId' : 'docId';
	for (const operation of ['getAll', 'get', 'create', 'update', 'delete']) {
		test(`${kind} ${operation} uses the current route and JSON:API contract`, async () => {
			const params = {
				resource: kind,
				operation,
				[idKey]: locator(),
				returnAll: false,
				limit: 5,
				title: 'Onboarding',
				spaceId: locator(SPACE),
				spaceType: 'team',
				docType: 'document',
				additionalFields: folder
					? { parent_id: locator(VALUE) }
					: { owner_id: locator(PERSON), folder_id: locator(VALUE) },
				updateFields: { title: 'Updated' },
			};
			const run = setup(params, (options) =>
				options.returnFullResponse
					? { headers: { etag: '"v1"' } }
					: operation === 'getAll'
						? { data: [resource(type).data] }
						: operation === 'delete'
							? undefined
							: resource(type),
			);
			const [[item]] = await run.execute();
			const request = run.calls.at(-1);
			assert.equal(
				request.url,
				`https://2.strety.com${endpoint}${['get', 'update', 'delete'].includes(operation) ? `/${ID}` : ''}`,
			);
			assert.equal(
				request.method,
				{ getAll: 'GET', get: 'GET', create: 'POST', update: 'PATCH', delete: 'DELETE' }[operation],
			);
			if (operation === 'create') {
				assert.deepEqual(request.body, {
					data: {
						type,
						attributes: {
							...(folder
								? { parent_id: VALUE }
								: { owner_id: PERSON, folder_id: VALUE, type: 'document' }),
							title: 'Onboarding',
							space_id: SPACE,
							space_type: 'team',
						},
					},
				});
			}
			if (operation === 'update') {
				assert.equal(run.calls[0].method, 'GET');
				assert.equal(request.headers['If-Match'], '"v1"');
				assert.deepEqual(request.body, { data: { type, attributes: { title: 'Updated' } } });
			}
			assert.deepEqual(item.pairedItem, { item: 0 });
		});
	}
}

for (const kind of ['playbook', 'playbookFolder']) {
	for (const operation of ['getAll', 'get', 'create', 'update', 'delete']) {
		test(`saved ${kind} ${operation} migrates routes while preserving legacy output`, async () => {
			const folder = kind === 'playbookFolder';
			const type = folder ? 'doc_folder' : 'doc';
			const response = resource(type, { title: 'Existing', locked: false });
			response.data.relationships = { folder: { data: { type: 'doc_folder', id: VALUE } } };
			const run = setup(
				{
					resource: kind,
					operation,
					playbookId: ID,
					folderId: ID,
					title: 'Existing',
					spaceId: SPACE,
					spaceType: 'organization',
					additionalFields: { type: 'document' },
					updateFields: { title: 'Changed' },
					returnAll: true,
				},
				(options) =>
					options.returnFullResponse
						? { headers: { etag: '"legacy"' } }
						: operation === 'getAll'
							? { data: [response.data] }
							: operation === 'delete'
								? undefined
								: response,
			);
			const [[item]] = await run.execute();
			for (const request of run.calls)
				assert.ok(
					request.url.startsWith(`https://2.strety.com/api/v1/docs${folder ? '/folders' : ''}`),
				);
			if (['create', 'update'].includes(operation))
				assert.equal(run.calls.at(-1).body.data.type, type);
			if (operation !== 'delete') {
				assert.equal(item.json.type, folder ? 'playbook_folder' : 'playbook');
				assert.equal(item.json.folder_type, 'playbook_folder');
				assert.equal(item.json.locked, false);
			}
		});
	}
}

test('document format attribute remains the flattened type for saved workflows', async () => {
	const run = setup({ resource: 'playbook', operation: 'get', playbookId: ID }, () =>
		resource('doc', { type: 'document' }),
	);
	assert.equal((await run.execute())[0][0].json.type, 'document');
});

test('Docs renewal can be disabled and a new revision requested', async () => {
	const run = setup(
		{
			resource: 'doc',
			operation: 'update',
			docId: locator(),
			updateFields: { renewal_interval: 'none', new_revision: true },
		},
		(options) =>
			options.returnFullResponse ? { headers: { etag: '"revision"' } } : resource('doc'),
	);
	await run.execute();
	assert.deepEqual(run.calls[1].body.data.attributes, {
		renewal_scheduler: { interval: null },
		new_revision: true,
	});
});

test('Docs reject an invalid renewal day before any write', async () => {
	const run = setup({
		resource: 'doc',
		operation: 'update',
		docId: locator(),
		updateFields: { renewal_day_of_month: 0 },
	});
	await assert.rejects(run.execute(), /Renewal day/);
	assert.equal(run.calls.length, 0);
});

for (const kind of ['goal', 'headline', 'issue']) {
	for (const operation of ['archive', 'unarchive']) {
		test(`${kind} ${operation} is available with its ID and returns the updated record`, async () => {
			const parameters = { resource: kind, operation, [`${kind}Id`]: locator() };
			const run = setup(parameters, () =>
				resource(kind, { archived_at: operation === 'archive' ? '2026-09-07T12:00:00Z' : null }),
			);
			const [[item]] = await run.execute();
			assert.equal(run.calls[0].url, `https://2.strety.com/api/v1/${kind}s/${ID}/archive`);
			assert.equal(run.calls[0].method, operation === 'archive' ? 'POST' : 'DELETE');
			assert.equal(run.calls[0].body, undefined);
			assert.ok(Object.hasOwn(item.json, 'archived_at'));
			const field = run.node.description.properties.find(
				(p) => p.name === `${kind}Id` && p.displayOptions?.show?.resource?.includes(kind),
			);
			assert.ok(
				NodeHelpers.displayParameter(parameters, field, { typeVersion: 1 }, run.node.description),
			);
		});
	}
}

test('goal status uses array query syntax and archive filtering preserves old ID filtering', async () => {
	const run = setup(
		{
			resource: 'goal',
			operation: 'getAll',
			returnAll: false,
			limit: 5,
			filters: { status: ['at_risk', 'off_track'], archive_status: 'any', ids: `${ID}, ${VALUE}` },
		},
		() => ({ data: [] }),
	);
	await run.execute();
	assert.equal(run.calls[0].arrayFormat, 'repeat');
	assert.deepEqual(run.calls[0].qs, {
		'page[size]': 5,
		'page[number]': 1,
		'filter[status][]': ['at_risk', 'off_track'],
		'filter[archive_status]': 'any',
		'filter[ids][]': [ID, VALUE],
	});
});

for (const [kind, field] of [
	['issue', 'resolved'],
	['meeting', 'completed'],
	['todo', 'completed'],
	['people', 'deactivated'],
]) {
	for (const value of [false, true])
		test(`${kind} ${field}=${value} is not lost`, async () => {
			const run = setup(
				{ resource: kind, operation: 'getAll', returnAll: true, filters: { [field]: value } },
				() => ({ data: [] }),
			);
			await run.execute();
			assert.equal(run.calls[0].qs[`filter[${field}]`], value);
		});
}

test('people lookup supports name/email and current identity passes through role and seats', async () => {
	const run = setup(
		{
			resource: 'people',
			operation: 'getAll',
			returnAll: true,
			filters: { name: 'Alex', email: '@example.test' },
		},
		() => ({ data: [] }),
	);
	await run.execute();
	assert.equal(run.calls[0].qs['filter[name]'], 'Alex');
	assert.equal(run.calls[0].qs['filter[email]'], '@example.test');
	const current = setup({ resource: 'people', operation: 'getCurrent' }, () =>
		resource('person', { role: 'member', seats: [{ id: VALUE, name: 'Support' }] }),
	);
	const [[item]] = await current.execute();
	assert.equal(current.calls[0].url, 'https://2.strety.com/api/v1/me');
	assert.equal(item.json.role, 'member');
	assert.deepEqual(item.json.seats, [{ id: VALUE, name: 'Support' }]);
});

for (const operation of ['create', 'update', 'getAll'])
	test(`metrics support daily frequency in ${operation}`, async () => {
		const run = setup(
			{
				resource: 'metric',
				operation,
				metricId: ID,
				title: 'Calls',
				spaceId: SPACE,
				spaceType: 'team',
				additionalFields: { checkin_frequency: 'daily' },
				updateFields: { checkin_frequency: 'daily' },
				filters: { checkin_frequency: 'daily' },
				returnAll: true,
			},
			(options) =>
				options.returnFullResponse
					? { headers: { etag: '"metric"' } }
					: operation === 'getAll'
						? { data: [] }
						: resource('metric'),
		);
		await run.execute();
		const request = run.calls.at(-1);
		assert.equal(
			operation === 'getAll'
				? request.qs['filter[checkin_frequency]']
				: request.body.data.attributes.checkin_frequency,
			'daily',
		);
	});

test('daily check-in sends an ISO calendar date and preserves a zero value', async () => {
	const run = setup(
		{
			resource: 'metricCheckIn',
			operation: 'create',
			metricId: ID,
			value: 0,
			additionalFields: { date: '2026-09-07' },
		},
		() => resource('metric_check_in'),
	);
	await run.execute();
	assert.deepEqual(run.calls[0].body, {
		data: { type: 'metric_check_in', attributes: { value: 0, date: '2026-09-07' } },
	});
});
for (const date of ['2026-02-30', 'yesterday', '2026-09-07T00:00:00Z', ''])
	test(`invalid daily date ${JSON.stringify(date)} fails before sending`, async () => {
		const run = setup({
			resource: 'metricCheckIn',
			operation: 'create',
			metricId: ID,
			value: 0,
			additionalFields: { date },
		});
		await assert.rejects(run.execute(), /valid calendar date/);
		assert.equal(run.calls.length, 0);
	});

test('existing weekly check-in payload is unchanged', async () => {
	const run = setup(
		{
			resource: 'metricCheckIn',
			operation: 'create',
			metricId: ID,
			value: 10,
			additionalFields: { iso_week: 37, iso_week_year: 2026 },
		},
		() => resource('metric_check_in'),
	);
	await run.execute();
	assert.deepEqual(run.calls[0].body.data.attributes, {
		value: 10,
		iso_week: 37,
		iso_week_year: 2026,
	});
});

for (const operation of ['getAll', 'get', 'create', 'update', 'delete'])
	test(`shoutout ${operation} follows the API contract`, async () => {
		const run = setup(
			{
				resource: 'shoutout',
				operation,
				shoutoutId: locator(),
				spaceId: locator(SPACE),
				spaceType: 'organization',
				recipientIds: `${PERSON}, ${ID}`,
				coreValueIds: VALUE,
				additionalFields: {
					content: 'Thank you',
					company_shoutout: false,
					creator_id: locator(PERSON),
				},
				updateFields: { recipient_ids: PERSON, core_value_ids: VALUE, content: 'Updated' },
				returnAll: true,
				filters: {
					recipient_id: locator(PERSON),
					core_value_id: locator(VALUE),
					creator_id: locator(ID),
				},
			},
			(options) =>
				options.returnFullResponse
					? { headers: { etag: '"shoutout"' } }
					: operation === 'getAll'
						? { data: [] }
						: operation === 'delete'
							? undefined
							: resource('shoutout'),
		);
		await run.execute();
		const request = run.calls.at(-1);
		assert.equal(
			request.method,
			{ getAll: 'GET', get: 'GET', create: 'POST', update: 'PATCH', delete: 'DELETE' }[operation],
		);
		assert.equal(
			request.url,
			`https://2.strety.com/api/v1/shoutouts${['get', 'update', 'delete'].includes(operation) ? `/${ID}` : ''}`,
		);
		if (operation === 'create')
			assert.deepEqual(request.body.data, {
				type: 'shoutout',
				attributes: {
					content: 'Thank you',
					company_shoutout: false,
					creator_id: PERSON,
					recipient_ids: [PERSON, ID],
					core_value_ids: [VALUE],
					space_id: SPACE,
					space_type: 'organization',
				},
			});
		if (operation === 'update') {
			assert.equal(request.headers['If-Match'], '"shoutout"');
			assert.deepEqual(request.body.data.attributes, {
				recipient_ids: [PERSON],
				core_value_ids: [VALUE],
				content: 'Updated',
			});
		}
		if (operation === 'getAll') assert.equal(request.qs['filter[recipient_id]'], PERSON);
	});
for (const field of ['recipient_ids', 'core_value_ids'])
	test(`empty shoutout ${field} cannot clear required recognition`, async () => {
		const run = setup({
			resource: 'shoutout',
			operation: 'update',
			shoutoutId: locator(),
			updateFields: { [field]: '' },
		});
		await assert.rejects(run.execute(), /at least one valid Strety UUID/);
		assert.equal(run.calls.length, 0);
	});

test('review summaries paginate completely and support reviewer/status filters', async () => {
	const run = setup(
		{
			resource: 'review',
			operation: 'getAll',
			returnAll: true,
			filters: {
				reviewee_id: locator(PERSON),
				manager_reviewer_id: locator(ID),
				status: 'in_progress',
			},
		},
		(options) => ({
			data: Array.from(
				{ length: options.qs['page[number]'] === 1 ? 20 : 3 },
				(_, i) =>
					resource('review', { name: `Review ${i}` }, `${options.qs['page[number]']}-${i}`).data,
			),
			meta: { total_count: 23 },
		}),
	);
	const [items] = await run.execute();
	assert.equal(items.length, 23);
	assert.equal(run.calls.length, 2);
	assert.equal(run.calls[1].qs['page[number]'], 2);
	assert.equal(run.calls[0].qs['filter[reviewee_id]'], PERSON);
	assert.equal(run.calls[0].qs['filter[manager_reviewer_id]'], ID);
	assert.equal(run.calls[0].qs['filter[status]'], 'in_progress');
});

test('full review answers are returned without discarding nested sections', async () => {
	const sections = [
		{ title: 'Delivery', questions: [{ position: 1, answers: [{ values: { manager: 'Good' } }] }] },
	];
	const run = setup({ resource: 'review', operation: 'get', reviewId: locator() }, () =>
		resource('review', { status: 'completed', sections }),
	);
	assert.deepEqual((await run.execute())[0][0].json.sections, sections);
	assert.equal(run.calls[0].url, `https://2.strety.com/api/v1/reviews/${ID}`);
});

test('review access errors are surfaced and continueOnFail retains item pairing', async () => {
	const params = { resource: 'review', operation: 'get', reviewId: locator() };
	const fail = () => {
		throw new Error('403 review-space access required');
	};
	await assert.rejects(setup(params, fail).execute(), /403/);
	const run = setup(params, fail, [{}, {}], true);
	const [items] = await run.execute();
	assert.equal(items.length, 2);
	assert.match(items[1].json.error, /403/);
	assert.deepEqual(items[1].pairedItem, { item: 1 });
});

test('lookup pages can be searched without silently stopping on no local matches', async () => {
	const run = setup({}, () => ({
		data: Array.from({ length: 20 }, () => resource('doc', { title: 'Unmatched' }).data),
	}));
	const page = await run.node.methods.listSearch.searchDocs.call(run.context, 'Onboarding');
	assert.deepEqual(page.results, []);
	assert.equal(page.paginationToken, '2');
	await run.node.methods.listSearch.searchDocs.call(
		run.context,
		'Onboarding',
		page.paginationToken,
	);
	assert.equal(run.calls[1].qs['page[number]'], 2);
});

test('people lookup uses the documented server-side name filter', async () => {
	const run = setup({}, () => ({ data: [resource('person', { name: 'Alex' }).data] }));
	const page = await run.node.methods.listSearch.searchPeople.call(run.context, 'Alex');
	assert.equal(run.calls[0].qs['filter[name]'], 'Alex');
	assert.deepEqual(page.results, [{ name: 'Alex', value: ID }]);
});

test('ETag failure prevents updates, and stale ETag errors are not blindly retried', async () => {
	const params = {
		resource: 'doc',
		operation: 'update',
		docId: locator(),
		updateFields: { title: 'Changed' },
	};
	const missing = setup(params, () => ({ headers: {} }));
	await assert.rejects(missing.execute(), /Could not retrieve ETag/);
	assert.equal(missing.calls.length, 1);
	const stale = setup(params, (options) => {
		if (options.returnFullResponse) return { headers: { etag: '"old"' } };
		throw new Error('412 Precondition Failed');
	});
	await assert.rejects(stale.execute(), /412/);
	assert.equal(stale.calls.length, 2);
});

test('resource locators reject path traversal and accept saved string UUIDs', async () => {
	const invalid = setup({ resource: 'doc', operation: 'get', docId: locator('../people') });
	await assert.rejects(invalid.execute(), /must be a Strety UUID/);
	assert.equal(invalid.calls.length, 0);
	const legacy = setup({ resource: 'goal', operation: 'get', goalId: ID }, () => resource('goal'));
	await legacy.execute();
	assert.equal(legacy.calls[0].url, `https://2.strety.com/api/v1/goals/${ID}`);
});

test('AI parameters inside ID locators and collections produce n8n tool schemas', () => {
	const params = {
		resource: 'doc',
		operation: 'update',
		docId: { mode: 'id', value: "={{ $fromAI('doc_id', 'Known Strety doc UUID', 'string') }}" },
		updateFields: { content: "={{ $fromAI('content', 'Revised document HTML', 'string') }}" },
	};
	const { node, context } = setup(params);
	assert.equal(node.description.usableAsTool, true);
	const args = [];
	traverseNodeParameters(params, args);
	assert.deepEqual(
		args.map((arg) => arg.key),
		['doc_id', 'content'],
	);
	for (const arg of args) assert.equal(generateZodSchema(arg).safeParse('value').success, true);
	const description = NodeHelpers.getToolDescriptionForNode(context.getNode(), node);
	assert.match(description.toLowerCase(), /doc|strety/);
});

test('concurrent AI tool executions recheck the shared rate limit after waking', async (t) => {
	t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
	const run = setup({ resource: 'people', operation: 'getCurrent' }, () => resource('person'));
	const executions = Array.from({ length: 20 }, () => run.execute());
	await new Promise((resolve) => setImmediate(resolve));
	assert.equal(run.calls.length, 9);
	t.mock.timers.tick(10_100);
	await new Promise((resolve) => setImmediate(resolve));
	assert.equal(run.calls.length, 18);
	t.mock.timers.tick(10_100);
	await Promise.all(executions);
	assert.equal(run.calls.length, 20);
});

test('archive resource pickers include archived records needed for Unarchive', async () => {
	const run = setup({}, () => ({ data: [] }));
	for (const method of ['searchGoals', 'searchHeadlines', 'searchIssues']) {
		await run.node.methods.listSearch[method].call(run.context);
		assert.equal(run.calls.at(-1).qs['filter[archive_status]'], 'any');
	}
});
