import { Account } from './accounts';
import { DeploymentEnvironmentType } from './deploymentEnvType';

const localAwsAccount: string = process.env.CDK_LOCAL_AWS_ACCOUNT as string;
const localAwsRegion: string = process.env.CDK_LOCAL_AWS_REGION as string;

export interface IBaseProp {
  env: {
    account: string;
    region: string;
  };
}

export type IBaseProps = Record<DeploymentEnvironmentType, IBaseProp>;

export const baseProps: IBaseProps = {
  local: {
    env: {
      account: localAwsAccount || Account.DEV,
      region: localAwsRegion || 'us-west-2'
    }
  },
  dev: {
    env: {
      account: Account.DEV,
      region: 'us-east-2'
    }
  },
  qa: {
    env: {
      account: Account.QA,
      region: 'us-east-2'
    }
  },
  stg: {
    env: {
      account: Account.STG,
      region: 'us-east-2'
    }
  },
  prd: {
    env: {
      account: Account.PRD,
      region: 'us-east-2'
    }
  }
};
