import { Stack as CdkStack, StackProps, Tags } from 'aws-cdk-lib';
import { App } from './app';

export class Stack extends CdkStack {
  constructor(app: App, id: string, props: StackProps) {
    const stackId = app.logicalPrefixedName(id);
    super(app, id, { stackName: stackId, ...props });
    Tags.of(this).add('deployment-qualifier', app.qualifier);
    // Tags.of(this).add('map-tag', 'd-server-01msucjq84ch7');
  }
}
