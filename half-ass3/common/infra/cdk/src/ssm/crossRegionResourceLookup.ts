import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

interface CrossRegionResourceLookupProps {
  readonly name: string;
  readonly region: string;
}

export class CrossRegionResourceLookup extends AwsCustomResource {
  constructor(scope: Construct, id: string, props: CrossRegionResourceLookupProps) {
    const { name, region } = props;

    super(scope, id, {
      onUpdate: {
        action: 'getParameter',
        service: 'SSM',
        parameters: {
          Name: name
        },
        region,
        physicalResourceId: PhysicalResourceId.of(id)
      },
      installLatestAwsSdk: true,
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: AwsCustomResourcePolicy.ANY_RESOURCE
      })
    });
  }

  public getParameterValue(): string {
    return this.getResponseFieldReference('Parameter.Value').toString();
  }
}
