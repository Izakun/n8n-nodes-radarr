import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RadarrApi implements ICredentialType {
	name = 'radarrApi';

	displayName = 'Radarr API';

	icon = 'file:radarrApi.svg' as const;

	documentationUrl = 'https://radarr.video/docs/api/';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'http://radarr:7878',
			required: true,
			description: 'Base URL of the Radarr instance (e.g. http://radarr:7878). No trailing slash.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Radarr API key (Settings → General → Security → API Key)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v3/system/status',
		},
	};
}
