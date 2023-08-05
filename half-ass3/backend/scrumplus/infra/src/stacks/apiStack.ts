import { CfnOutput, StackProps } from 'aws-cdk-lib';
import { HttpMethod } from 'aws-cdk-lib/aws-events';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App, HttpApiLambda, NodejsFunction, Stack } from '@half-ass/common-infra-cdk';

export interface IApiStackProps extends StackProps {}

export class ApiStack extends Stack {
  constructor(app: App, id: string, props: IApiStackProps) {
    super(app, id, props);
    const apiFunctionName = 'scrumpl-handler';
    const apiFunction = new NodejsFunction(this, apiFunctionName, {
      entry: '../node/src/handlers/handler.ts',
      environment: {}
    });

    // const Integration = new HttpLambdaIntegration('Integration', apiFunction);
    const apiLambdaName = 'api';
    new HttpApiLambda(this, apiLambdaName, {
      prefixName: app.logicalPrefixedName(apiLambdaName),
      apiLambda: apiFunction,
      routes: [
        {
          path: '/',
          methods: [HttpMethod.GET]
        },
        {
          path: '/abc',
          methods: [HttpMethod.GET]
        },
        {
          path: '/abc/{orderNumber}',
          methods: [HttpMethod.GET]
        }
      ]
    });

    // const httpApi = new apigwv2.HttpApi(this, 'api');
    // httpApi.addRoutes({
    //   path: '/',
    //   methods: [apigwv2.HttpMethod.GET],
    //   integration: Integration
    // });
    // httpApi.addRoutes({
    //   path: '/abc',
    //   methods: [apigwv2.HttpMethod.GET],
    //   integration: Integration
    // });
    // httpApi.addRoutes({
    //   path: '/abc/{orderNumber}',
    //   methods: [apigwv2.HttpMethod.GET],
    //   integration: Integration
    // });

    // new CfnOutput(this, 'ApiURL', { value: httpApi.url as string });
    // new CfnOutput(this, 'ApiEndpoint', { value: httpApi.apiEndpoint });

    // const readFunction = new NodejsFunction(this, 'ReadNotesFn', {
    //   architecture: Architecture.ARM_64,
    //   entry: `${__dirname}/fns/readFunction.ts`,
    //   logRetention: RetentionDays.ONE_WEEK
    // });

    // const writeFunction = new NodejsFunction(this, 'WriteNoteFn', {
    //   architecture: Architecture.ARM_64,
    //   entry: `${__dirname}/fns/writeFunction.ts`,
    //   logRetention: RetentionDays.ONE_WEEK
    // });

    // const api = new HttpApi(this, 'NotesApi', {
    //   corsPreflight: {
    //     allowHeaders: ['Content-Type'],
    //     allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
    //     allowOrigins: ['*']
    //   }
    // });

    // const readIntegration = new HttpLambdaIntegration('ReadIntegration', readFunction);

    // const writeIntegration = new HttpLambdaIntegration('WriteIntegration', writeFunction);

    // api.addRoutes({
    //   integration: readIntegration,
    //   methods: [HttpMethod.GET],
    //   path: '/notes'
    // });

    // api.addRoutes({
    //   integration: writeIntegration,
    //   methods: [HttpMethod.POST],
    //   path: '/notes'
    // });

    // new apigatewayv2_alpha.HttpRoute(this, 'MyHttpRoute', {
    //   httpApi: this.httpApi,
    //   integration: this.httpRouteIntegration,
    //   routeKey: this.httpRouteKey,
    //   authorizationScopes: ['authorizationScopes'],
    //   authorizer: this.httpRouteAuthorizer
    // });
  }
}
