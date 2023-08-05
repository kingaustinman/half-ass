export enum DeploymentEnvironmentType {
  local = 'local',
  dev = 'dev',
  qa = 'qa',
  stg = 'stg',
  prd = 'prd'
}

export type DeploymentEnvironment = keyof typeof DeploymentEnvironmentType;
