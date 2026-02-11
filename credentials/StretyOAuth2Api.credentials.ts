import type {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IAuthenticateGeneric,
} from 'n8n-workflow';

export class StretyOAuth2Api implements ICredentialType {
	name = 'stretyOAuth2Api';
	displayName = 'Strety OAuth2 API';
	documentationUrl = 'https://2.strety.com/api/docs/v1';
	extends = ['oAuth2Api'];

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://2.strety.com/api/v1/oauth/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://2.strety.com/api/v1/oauth/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'read write',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Accept: 'application/vnd.api+json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://2.strety.com',
			url: '/api/v1/people',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json',
			},
		},
	};
}
