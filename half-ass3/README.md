# Half-Ass monorepo

## Dependencies

* [Node.js](https://nodejs.org/) version >= 18

    Using Node Version Manager [NVM](https://github.com/nvm-sh/nvm) is recommended.

* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)


## Environment

1. Set your environment variable `CDK_DEPLOYMENT_QUALIFIER` to your initials (ex. `atd`).
This is used in naming conventions of deployed AWS resources.

2. The pre-defined deployment environments are `local`, `dev`, `qa`, `stg`, and `prd`. Local is typically developer local development, which get deployed to the `dev` environment, which has a pre-defined AWS account. To override the account and/or region when using `local`, set the environment variable `CDK_LOCAL_AWS_ACCOUNT` and/or `CDK_LOCAL_AWS_REGION` to the AWS account/region you want to deploy to.

3. Make sure you have permissions via AWS CLI to the target AWS account.


## Commands

* `npm i` - Install dependencies, recursively

* `npm install <package> -w <submodule_dir...>` - Install package into submodule as a dependency
* `npm uninstall <package> -w <submodule_dir...>` - Unnstall package into submodule as a dependency
* `npm install --save-dev <package> -w <submodule_dir...>` - Install package into submodule as a dev dependency
* `npm uninstall --save-dev <package> -w <submodule_dir...>` - Unnstall package into submodule as a dev dependency

* `npm run clean` - Clean up generated files except for node_modules and cdk.out, which take time to recreate.
* `npm run pristine` - Clean everything to set it back to a clean checkout.

### CDK (from an `infra` directory)

* `npm run cdk:synth`

* `npm run cdk:diff`

* `npm run cdk:deploy`

* `npm run cdk:destroy`

* `npm run cdk [arguments...]`


## Patterns

* Workspaces are specified in the root `package.json` under `workspaces`, in order of building, deploying, linting, etc.

* `common` is an area for common tools (eslint, typescript) configuration, CDK common libraries, Lambda/Node common libraries. When importing from other workspaces, in addition to adding it to the package.json, make sure to add the path to the tsconfig.json's references section (unless it's tooling).

* Where (account, region) CDK resources are deployed is an important concept. Look at the code (starting with `infra/bin/props.ts` and tracing it back to the code in the common area) to understand it. Also see how AWS accounts and regions are specified.

* CDK structures are typically extended (for reuse) in the common/infra/cdk area. One of the main reasons for this is so that naming of the resource is consistent, and easily identifiable who owns it in the AWS console. Having it in common also allows common sensible default we can specify.

* Common node libraries/structures/services/etc. are put in `common/node` for the same reasons as `infra/cdk`.

* Naming of CDK resources is an important concept. Look at the code to understand it.

* 2 concepts in Lambda's are important: 1. Middleware [Middy](https://middy.js.org) and 2. Routers. These are 2 separate concepts, where middleware is for interception of requests/responses to enhance/filter/etc. the messages, and routing is directing to multiple handlers.


## TODO

* There should only be 1 node_modules directory generated on `npm i`. If there's additional directories, there is dependencies on multiple versions of a package. Create some check target to make this check.

* Get rid of package `aws-lambda`?
