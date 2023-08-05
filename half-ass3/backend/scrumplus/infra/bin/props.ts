import { DeploymentEnvironmentType, IAppProps, IBaseProp, baseProps } from '@half-ass/common-infra-cdk';

const appProps: IAppProps = {
  project: 'halfass',
  applicationShortName: 'scrumplapi'
};

export interface IProp extends IBaseProp {}

type IProps = IAppProps & Record<DeploymentEnvironmentType, IProp>;

export const props: IProps = {
  ...appProps,
  ...baseProps
};
