import { App as CdkApp, AppProps as CdkAppProps } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { DeploymentEnvironmentType } from '../deploymentEnvType';
import { CrossRegionResourceLookup } from '../ssm';

const deploymentQualifier: DeploymentEnvironmentType | string = process.env.CDK_DEPLOYMENT_QUALIFIER as string;
if (!deploymentQualifier || deploymentQualifier.trim().length === 0) {
  throw Error('Environment variable CDK_DEPLOYMENT_QUALIFIER must be specified (your initials | dev | qa | stg | prd');
}

/**
 * `AppProps` enforces consistent naming conventions of AWS-deployed resources.
 */
export interface IAppProps extends CdkAppProps {
  /**
   * Project name (e.g. core, perform, payfac, analytics), serves as a part of identifier. Should be shorter than 10 characters.
   */
  readonly project: string;
  /**
   * Short, unique name of the application, serves as a part of identifier. Should be shorter than 10 characters.
   */
  readonly applicationShortName: string;
}

export class App extends CdkApp {
  readonly project: string;

  readonly qualifier: string;

  readonly logicalResourceName: string;

  readonly isLocal: boolean;

  readonly isDev: boolean;

  readonly isQa: boolean;

  readonly isStg: boolean;

  readonly isPrd: boolean;

  readonly deploymentEnvironment: DeploymentEnvironmentType;

  constructor(props: IAppProps) {
    super(props);

    this.project = props.project;
    this.qualifier = deploymentQualifier;
    this.logicalResourceName = `${this.project}-${this.qualifier}-${props.applicationShortName}`;

    this.isDev = deploymentQualifier === DeploymentEnvironmentType.dev;
    this.isQa = deploymentQualifier === DeploymentEnvironmentType.qa;
    this.isStg = deploymentQualifier === DeploymentEnvironmentType.stg;
    this.isPrd = deploymentQualifier === DeploymentEnvironmentType.prd;
    this.isLocal = !this.isDev && !this.isQa && !this.isStg && !this.isPrd;

    this.deploymentEnvironment = this.isLocal
      ? DeploymentEnvironmentType.local
      : (deploymentQualifier as DeploymentEnvironmentType);
  }

  public logicalPrefixedName(name: string): string {
    return `${this.logicalResourceName}-${name}`;
  }

  /**
   * Stores the identifier/name inside SSM to be looked up from a different CDK app
   * @param scope scope of this resource
   * @param id CDK identifier of this resourcex
   * @param props props include resource short name, value and optional description
   */
  public storeResourceForLookup(
    scope: Construct,
    id: string,
    props: { name: string; value: string; description?: string }
  ) {
    new StringParameter(scope, id, {
      parameterName: this.formatResourceName(props.name),
      stringValue: props.value,
      description: props.description
    });
  }

  /**
   * Retrieves the value of requested resource that will be looked up in another region of the same account.
   * @param scope scope of this resource
   * @param id CDK identifier of the custom resource that will look up the value
   * @param name parameter name for lookup (this is just the simple name.the stage qualifiers will be appended internally)
   * @param region target region where the resource is located
   * @param overrideQualifier you can use this value to override the environment part of the resource name
   * @returns
   */
  public lookupCrossRegionResource(
    scope: Construct,
    id: string,
    name: string,
    region: string,
    overrideQualifier?: string
  ) {
    const resourceLookup = new CrossRegionResourceLookup(scope, id, {
      name: this.formatResourceName(name, overrideQualifier),
      region
    });

    return resourceLookup.getParameterValue();
  }

  /**
   * Retrieves the value of requested resource (usually exposed from different CDK app as a shared resource)
   * @param scope scope of this resource
   * @param name parameter name for lookup (this is just the simple name.the stage qualifiers will be appended internally)
   * @param method if lookup then the value gets looked up during synthesis, if value then its going to provide a TOKEN to be resolved during deployment.
   * Some resources require the token (e.g. S3) and some require the name to not have any tokens (VPC lookup)
   * @param overrideQualifier you can use this value to override the environment part of the resource name
   * @returns
   */
  public lookupResource(
    scope: Construct,
    name: string,
    method: 'lookup' | 'value' = 'lookup',
    overrideQualifier?: string
  ): string {
    return method === 'lookup'
      ? StringParameter.valueFromLookup(scope, this.formatResourceName(name, overrideQualifier))
      : StringParameter.valueForStringParameter(scope, this.formatResourceName(name, overrideQualifier));
  }

  private formatResourceName(name: string, overrideQualifier?: string): string {
    const qualifier = overrideQualifier ?? this.qualifier;
    return `/kor/${qualifier}/shared/${name}`;
  }
}
