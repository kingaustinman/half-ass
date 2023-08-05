#!/usr/bin/env node
import { App } from '@half-ass/common-infra-cdk';
import { IProp, props } from './props';
import { ApiStack } from '../src';

const app = new App(props);
const deploymentEnvProps: IProp = props[app.deploymentEnvironment];

new ApiStack(app, 'apiStack', deploymentEnvProps);
