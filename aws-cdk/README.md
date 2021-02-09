# CDK code for a Django app in Fargate

Deploys all AWS components needed for a containerized Django app running in
Fargate.

The `starter-kit` directory contains the code for an AWS CDK stack in Typescript.
This stack will deploy a Django application running in a Fargate container, fronted
by an Application Load Balancer to allow public access. This app
uses a RDS Postgres database in an isolated subnet for the backend DB. All static and media
files are stored in a S3 bucket.

You need to configure the environmental variables in a `.env` file to deploy this stack. Copy
the `.env.example`, rename it, and update the variables for your project. You should not
include the `.env` file your repo code.

Just change the `taskImageOptions.image` property in the `ApplicationLoadBalancedFargateService` component
to use a different Django image,  but you will need to adjust the environmental variables to fit your
needs.

Both AWS CLI and CDK need to be installed on your local machine.

For detailed instructions on getting started with AWS CDK:
[https://docs.aws.amazon.com/cdk/latest/guide/home.html](https://docs.aws.amazon.com/cdk/latest/guide/home.html)


## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
