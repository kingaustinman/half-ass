import { Cors, CorsOptions } from 'aws-cdk-lib/aws-apigateway';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { IHostedZone, RecordSet, RecordTarget, RecordType } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import {
  AddRoutesOptions,
  CorsHttpMethod,
  CorsPreflightOptions,
  DomainName,
  HttpApi,
  HttpMethod,
  IHttpApi,
  IHttpRouteAuthorizer
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpJwtAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { App } from '../core';

export interface IHttpApiLambdaRouteProps {
  /**
   * The path at which all of these routes are configured.
   */
  readonly path: string;

  /**
   * The HTTP methods to be configured.
   *
   * @default HttpMethod.ANY
   */
  readonly methods?: HttpMethod[];

  /**
   * Authorizer to be associated to these routes.
   *
   * Use NoneAuthorizer to remove the default authorizer for the api
   *
   * @default - uses the default authorizer if one is specified on the HttpApi
   */
  readonly authorizer?: IHttpRouteAuthorizer;
  /**
   * The list of OIDC scopes to include in the authorization.
   *
   * These scopes will override the default authorization scopes on the gateway.
   * Set to [] to remove default scopes
   *
   * @default - uses defaultAuthorizationScopes if configured on the API, otherwise none.
   */
  readonly authorizationScopes?: string[];
}

export interface IHttpApiLambdaProps {
  /**
   * The name used to prefix all the resources created by this construct.
   * You could use logicalPrefixedName() to prefix all resources with proper naming convention.
   */
  readonly prefixName?: string;

  /**
   * Hosted zone of the current AWS account. If omitted the API will not be setup with a domain.
   */
  readonly hostedZone?: IHostedZone;

  /**
   * Domain prefix name used to generate the full domain name for the API. If omitted the API will not be setup with a domain.
   */
  readonly domainNamePrefix?: string;

  /**
   * The certificate to attach to the domain name. If zoneName and subDomain are passed, this parameter is required.
   */
  readonly apiCertificate?: ICertificate;

  /**
   * The lambda function representing the integration fo this API.
   */
  readonly apiLambda: IFunction;

  /**
   * If specified, it will create a default authorizer to be assigned to all the routes passed in the props of this construct.
   */
  readonly defaultAuthorizer?: {
    readonly name?: string;
    readonly jwtAudience: string[];
    readonly jwtIssuer: string;
  };

  /**
   * The routes to add to this API.
   */
  readonly routes: IHttpApiLambdaRouteProps[] | AddRoutesOptions[];

  /**
   * Specifies a CORS configuration for this API.
   */
  readonly corsPreflight?: CorsPreflightOptions;
}

export const defaultCorsSettings: CorsOptions = {
  allowOrigins: Cors.ALL_ORIGINS,
  allowMethods: Cors.ALL_METHODS,
  allowCredentials: false,
  allowHeaders: [
    'Content-Type',
    'X-Amz-Date',
    'Authorization',
    'X-Api-Key',
    'X-Amz-Security-Token',
    'X-Amz-User-Agent',
    'x-trace-id'
  ]
};

export const defaultCorsSettingsV2: CorsPreflightOptions = {
  ...defaultCorsSettings,
  allowMethods: [CorsHttpMethod.ANY],
  allowHeaders: defaultCorsSettings.allowHeaders
};

const isAddRoutesOption = (route: IHttpApiLambdaRouteProps | AddRoutesOptions): route is AddRoutesOptions => {
  return (route as AddRoutesOptions).integration !== undefined;
};

/**
 * @summary The HttpApiLambda class
 */
export class HttpApiLambda extends Construct {
  /**
   * @summary The http API object created by this construct
   */
  public readonly httpApi: IHttpApi;

  /**
   * @summary Constructs a new instance of the HttpApiLambda class
   * @param {Construct} scope - represents the scope for all the resources
   * @param {string} id - this is a a scope-unique id.
   * @param {IHttpApiLambdaProps} props - user provided props for the construct
   * @access public
   */
  constructor(scope: Construct, id: string, props: IHttpApiLambdaProps) {
    super(scope, id);

    const prefixName = props.prefixName || (scope.node.root as App).logicalPrefixedName(id);

    let customDomain: DomainName | undefined;

    if (props.hostedZone && props.domainNamePrefix && props.apiCertificate) {
      const fullDomainName = `${props.domainNamePrefix}.${props.hostedZone.zoneName}`;

      customDomain = new DomainName(this, 'api-gw-domain-name', {
        domainName: fullDomainName,
        certificate: props.apiCertificate
      });

      new RecordSet(this, 'A', {
        zone: props.hostedZone,
        recordType: RecordType.A,
        recordName: props.domainNamePrefix,
        target: RecordTarget.fromAlias(
          new ApiGatewayv2DomainProperties(customDomain.regionalDomainName, customDomain.regionalHostedZoneId)
        )
      });

      new RecordSet(this, 'AAAA', {
        zone: props.hostedZone,
        recordType: RecordType.AAAA,
        recordName: props.domainNamePrefix,
        target: RecordTarget.fromAlias(
          new ApiGatewayv2DomainProperties(customDomain.regionalDomainName, customDomain.regionalHostedZoneId)
        )
      });
    }

    let authorizer: HttpJwtAuthorizer | undefined;
    if (props.defaultAuthorizer) {
      authorizer = new HttpJwtAuthorizer('http-jwt-authorizer', props.defaultAuthorizer.jwtIssuer, {
        jwtAudience: props.defaultAuthorizer.jwtAudience,
        authorizerName: `${prefixName}-${
          props.defaultAuthorizer.name ? props.defaultAuthorizer.name : 'default'
        }-authorizer`
      });
    }

    const httpApi = new HttpApi(this, 'httpApiLambda-api', {
      apiName: prefixName,
      defaultAuthorizer: authorizer,
      corsPreflight: {
        ...defaultCorsSettingsV2,
        ...props.corsPreflight
      },
      ...(customDomain && {
        defaultDomainMapping: {
          domainName: customDomain
        }
      })
    });

    this.httpApi = httpApi;

    props.routes.forEach((route, index) => {
      if (isAddRoutesOption(route)) {
        httpApi.addRoutes(route);
      } else {
        httpApi.addRoutes({
          integration: new HttpLambdaIntegration(`lambda-integration-${index}`, props.apiLambda),
          path: route.path,
          authorizer: route.authorizer,
          authorizationScopes: route.authorizationScopes,
          methods: route.methods
        });
      }
    });
  }
}
