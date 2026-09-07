// Optional integration check against the published n8n-core tool wrapper.
// N8N_TOOL_WRAPPER_PATH points to create-node-as-tool.js with its runtime dependencies installed.
// STRETY_PACKAGE_DIR can point to an unpacked npm artifact to verify its actual entry point.
const assert = require('node:assert/strict');
const path = require('node:path');
const { createNodeAsTool } = require(process.env.N8N_TOOL_WRAPPER_PATH);
const { Strety } = require(
	path.join(
		process.env.STRETY_PACKAGE_DIR || path.resolve(__dirname, '..'),
		'dist/nodes/Strety/Strety.node.js',
	),
);
const ID = '11111111-1111-4111-8111-111111111111';
const nodeType = new Strety();
const node = {
	name: 'Update Strety Doc',
	type: '@joshuanode/n8n-nodes-strety.stretyTool',
	typeVersion: 1,
	position: [0, 0],
	parameters: {
		resource: 'doc',
		operation: 'update',
		docId: {
			mode: 'id',
			value: "={{ $fromAI('doc_id', 'An existing Strety doc UUID', 'string') }}",
		},
		updateFields: { content: "={{ $fromAI('content', 'Updated HTML content', 'string') }}" },
	},
};
const calls = [];
const { response: tool } = createNodeAsTool({
	node,
	nodeType,
	handleToolInvocation: async (args) => {
		const parameters = {
			...node.parameters,
			docId: { mode: 'id', value: args.doc_id },
			updateFields: { content: args.content },
		};
		const output = await nodeType.execute.call({
			getInputData: () => [{ json: {} }],
			getNode: () => node,
			getNodeParameter: (key, i, fallback) => parameters[key] ?? fallback,
			continueOnFail: () => false,
			helpers: {
				httpRequestWithAuthentication: async (credential, options) => {
					assert.equal(credential, 'stretyOAuth2Api');
					calls.push(options);
					return options.returnFullResponse
						? { headers: { etag: '"test"' } }
						: {
								data: {
									id: ID,
									type: 'doc',
									attributes: { content: options.body.data.attributes.content },
								},
							};
				},
				returnJsonArray: (value) =>
					(Array.isArray(value) ? value : [value]).map((json) => ({ json })),
				constructExecutionMetaData: (data, { itemData }) =>
					data.map((item) => ({ ...item, pairedItem: itemData })),
			},
		});
		return JSON.stringify(output[0].map((item) => item.json));
	},
});
(async () => {
	assert.equal(nodeType.description.usableAsTool, true);
	assert.deepEqual(Object.keys(tool.schema.shape), ['doc_id', 'content']);
	assert.ok(
		!tool.schema.safeParse({ doc_id: ID }).success,
		'content must be required by the AI tool schema',
	);
	const result = await tool.invoke({
		doc_id: ID,
		content: '<p>Updated through an n8n AI tool</p>',
	});
	assert.equal(calls.length, 2);
	assert.equal(calls[1].method, 'PATCH');
	assert.equal(calls[1].url, `https://2.strety.com/api/v1/docs/${ID}`);
	assert.equal(calls[1].headers['If-Match'], '"test"');
	assert.equal(JSON.parse(result)[0].content, '<p>Updated through an n8n AI tool</p>');
	console.log(
		'PASS: published n8n-core wrapper constructs and invokes the Strety tool, validates AI arguments, and returns its result',
	);
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
