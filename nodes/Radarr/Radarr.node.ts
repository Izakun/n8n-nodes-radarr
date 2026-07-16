import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

export class Radarr implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Radarr',
		name: 'radarr',
		icon: { light: 'file:radarr.svg', dark: 'file:radarr.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " : " + $parameter["resource"]}}',
		description: 'Manage your Radarr movie library through its v3 API',
		defaults: {
			name: 'Radarr',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'radarrApi',
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
					{ name: 'Calendar', value: 'calendar' },
					{ name: 'Command', value: 'command' },
					{ name: 'Movie', value: 'movie' },
					{ name: 'Queue', value: 'queue' },
					{ name: 'System', value: 'system' },
				],
				default: 'movie',
			},

			// Movie operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['movie'] } },
				options: [
					{ name: 'Add', value: 'add', action: 'Add a movie' },
					{ name: 'Delete', value: 'delete', action: 'Delete a movie' },
					{ name: 'Get', value: 'get', action: 'Get a movie' },
					{ name: 'Get Many', value: 'getMany', action: 'Get many movies' },
					{ name: 'Search', value: 'search', action: 'Look up a movie' },
				],
				default: 'getMany',
			},
			// Queue operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['queue'] } },
				options: [{ name: 'Get Many', value: 'getMany', action: 'Get the download queue' }],
				default: 'getMany',
			},
			// System operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['system'] } },
				options: [
					{ name: 'Get Health', value: 'getHealth', action: 'Get system health' },
					{ name: 'Get Status', value: 'getStatus', action: 'Get system status' },
				],
				default: 'getStatus',
			},
			// Command operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['command'] } },
				options: [{ name: 'Trigger', value: 'trigger', action: 'Trigger a command' }],
				default: 'trigger',
			},
			// Calendar operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['calendar'] } },
				options: [{ name: 'Get', value: 'get', action: 'Get the calendar' }],
				default: 'get',
			},

			// ---- Fields ----
			{
				displayName: 'Movie ID',
				name: 'movieId',
				type: 'number',
				default: 0,
				required: true,
				description: 'The Radarr internal movie ID',
				displayOptions: { show: { resource: ['movie'], operation: ['get', 'delete'] } },
			},
			{
				displayName: 'Search Term',
				name: 'term',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'Inception or tmdb:27205',
				description: 'Title (or "tmdb:ID" / "imdb:ID") to look up',
				displayOptions: { show: { resource: ['movie'], operation: ['search'] } },
			},
			{
				displayName: 'TMDB ID',
				name: 'tmdbId',
				type: 'number',
				default: 0,
				required: true,
				description: 'The TMDB ID of the movie to add',
				displayOptions: { show: { resource: ['movie'], operation: ['add'] } },
			},
			{
				displayName: 'Quality Profile ID',
				name: 'qualityProfileId',
				type: 'number',
				default: 1,
				required: true,
				description: 'The quality profile ID to assign to the movie',
				displayOptions: { show: { resource: ['movie'], operation: ['add'] } },
			},
			{
				displayName: 'Root Folder Path',
				name: 'rootFolderPath',
				type: 'string',
				default: '',
				required: true,
				placeholder: '/movies',
				displayOptions: { show: { resource: ['movie'], operation: ['add'] } },
			},
			{
				displayName: 'Options',
				name: 'addOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: { show: { resource: ['movie'], operation: ['add'] } },
				options: [
					{
						displayName: 'Monitored',
						name: 'monitored',
						type: 'boolean',
						default: true,
						description: 'Whether the movie should be monitored',
					},
					{
						displayName: 'Search on Add',
						name: 'searchForMovie',
						type: 'boolean',
						default: true,
						description: 'Whether to start searching for the movie right after adding it',
					},
					{
						displayName: 'Minimum Availability',
						name: 'minimumAvailability',
						type: 'options',
						options: [
							{ name: 'Announced', value: 'announced' },
							{ name: 'In Cinemas', value: 'inCinemas' },
							{ name: 'Released', value: 'released' },
						],
						default: 'released',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'deleteOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: { show: { resource: ['movie'], operation: ['delete'] } },
				options: [
					{
						displayName: 'Delete Files',
						name: 'deleteFiles',
						type: 'boolean',
						default: false,
						description: 'Whether to also delete the movie files from disk',
					},
					{
						displayName: 'Add Import Exclusion',
						name: 'addImportExclusion',
						type: 'boolean',
						default: false,
						description: 'Whether to prevent Radarr from re-adding the movie automatically',
					},
				],
			},
			{
				displayName: 'Command Name',
				name: 'commandName',
				type: 'string',
				default: 'RefreshMovie',
				required: true,
				placeholder: 'MoviesSearch, RefreshMovie, RssSync…',
				displayOptions: { show: { resource: ['command'], operation: ['trigger'] } },
			},
			{
				displayName: 'Movie IDs',
				name: 'movieIds',
				type: 'string',
				default: '',
				placeholder: '1,2,3',
				description: 'Comma-separated movie IDs the command applies to (if relevant)',
				displayOptions: { show: { resource: ['command'], operation: ['trigger'] } },
			},
			{
				displayName: 'Filters',
				name: 'calendarFilters',
				type: 'collection',
				placeholder: 'Add filter',
				default: {},
				displayOptions: { show: { resource: ['calendar'], operation: ['get'] } },
				options: [
					{
						displayName: 'Start Date',
						name: 'start',
						type: 'string',
						default: '',
						description: 'ISO date, e.g. 2026-01-01',
					},
					{
						displayName: 'End Date',
						name: 'end',
						type: 'string',
						default: '',
						description: 'ISO date, e.g. 2026-01-31',
					},
					{
						displayName: 'Include Unmonitored',
						name: 'unmonitored',
						type: 'boolean',
						default: false,
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const credentials = await this.getCredentials('radarrApi', i);
				const baseURL = (credentials.baseUrl as string).replace(/\/+$/, '');
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const request = async (
					method: IHttpRequestMethods,
					url: string,
					opts: { qs?: IDataObject; body?: IDataObject } = {},
				) => {
					const options: IHttpRequestOptions = {
						method,
						baseURL,
						url,
						json: true,
						qs: opts.qs,
						body: opts.body,
					};
					return this.helpers.httpRequestWithAuthentication.call(this, 'radarrApi', options);
				};

				let response: unknown;

				if (resource === 'system') {
					response = await request('GET', operation === 'getHealth' ? '/api/v3/health' : '/api/v3/system/status');
				} else if (resource === 'queue') {
					response = await request('GET', '/api/v3/queue');
				} else if (resource === 'calendar') {
					const filters = this.getNodeParameter('calendarFilters', i, {}) as IDataObject;
					response = await request('GET', '/api/v3/calendar', { qs: filters });
				} else if (resource === 'command') {
					const name = this.getNodeParameter('commandName', i) as string;
					const movieIdsRaw = this.getNodeParameter('movieIds', i, '') as string;
					const body: IDataObject = { name };
					if (movieIdsRaw.trim()) {
						body.movieIds = movieIdsRaw
							.split(',')
							.map((s) => Number(s.trim()))
							.filter((n) => !Number.isNaN(n));
					}
					response = await request('POST', '/api/v3/command', { body });
				} else if (resource === 'movie') {
					if (operation === 'getMany') {
						response = await request('GET', '/api/v3/movie');
					} else if (operation === 'get') {
						const movieId = this.getNodeParameter('movieId', i) as number;
						response = await request('GET', `/api/v3/movie/${movieId}`);
					} else if (operation === 'search') {
						const term = this.getNodeParameter('term', i) as string;
						response = await request('GET', '/api/v3/movie/lookup', { qs: { term } });
					} else if (operation === 'delete') {
						const movieId = this.getNodeParameter('movieId', i) as number;
						const del = this.getNodeParameter('deleteOptions', i, {}) as IDataObject;
						await request('DELETE', `/api/v3/movie/${movieId}`, {
							qs: {
								deleteFiles: del.deleteFiles ? 'true' : 'false',
								addImportExclusion: del.addImportExclusion ? 'true' : 'false',
							},
						});
						response = { success: true, movieId };
					} else {
						// add: look up the movie by TMDB id, then POST the enriched resource
						const tmdbId = this.getNodeParameter('tmdbId', i) as number;
						const qualityProfileId = this.getNodeParameter('qualityProfileId', i) as number;
						const rootFolderPath = this.getNodeParameter('rootFolderPath', i) as string;
						const addOptions = this.getNodeParameter('addOptions', i, {}) as IDataObject;

						const looked = (await request('GET', '/api/v3/movie/lookup/tmdb', {
							qs: { tmdbId },
						})) as IDataObject;

						const body: IDataObject = {
							...looked,
							qualityProfileId,
							rootFolderPath,
							monitored: addOptions.monitored ?? true,
							minimumAvailability: addOptions.minimumAvailability ?? 'released',
							addOptions: { searchForMovie: addOptions.searchForMovie ?? true },
						};
						response = await request('POST', '/api/v3/movie', { body });
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, {
						itemIndex: i,
					});
				}

				if (Array.isArray(response)) {
					for (const element of response) {
						returnData.push({ json: element as IDataObject, pairedItem: { item: i } });
					}
				} else {
					returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
