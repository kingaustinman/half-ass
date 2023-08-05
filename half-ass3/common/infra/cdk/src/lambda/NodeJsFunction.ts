import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction as CdkNodeJsFunction,
  NodejsFunctionProps as CdkNodeJsFunctionProps,
  SourceMapMode
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { App } from '../core';

export type NodejsFunctionProps = CdkNodeJsFunctionProps;

export class NodejsFunction extends CdkNodeJsFunction {
  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    const finalProps = {
      functionName: (scope.node.root as App).logicalPrefixedName(id),
      logRetention: 7,
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(30),
      bundling: {
        keepNames: true,
        minify: true,
        sourcemap: true,
        sourceMapMode: SourceMapMode.INLINE,
        sourcesContent: false
      },
      ...props,
      environment: {
        LOGGER_LEVEL: 'info',
        LOGGER_SERVICE: (scope.node.root as App).logicalPrefixedName(id),
        LOGGER_FORMAT: 'json',
        NODE_OPTIONS: '--enable-source-maps',
        ...(props.environment || {}),
        // Enable HTTP keep-alive. https://theburningmonk.com/2019/02/lambda-optimization-tip-enable-http-keep-alive/
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      }
    };
    super(scope, id, finalProps);
  }
}
