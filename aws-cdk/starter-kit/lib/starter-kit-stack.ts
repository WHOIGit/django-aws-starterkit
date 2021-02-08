import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as s3 from '@aws-cdk/aws-s3';
import * as rds from '@aws-cdk/aws-rds';

import console = require('console');

// DB env variables from .env
const postgresUser = process.env.POSTGRES_USER as string;
// Need to convert password text to a AWS SecretValue
const postgresPassword = new cdk.SecretValue(process.env.POSTGRES_PASSWORD);
// Then create a "Credentials" object
const dbCredentials = rds.Credentials.fromPassword(postgresUser, postgresPassword);

export class StarterKitStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "StarterKitVpc", {
      maxAzs: 2, // Default is all AZs in region
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE,
        },
        {
          cidrMask: 24,
          name: 'Database',
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ]
    });

    // Create S3 bucket for static/media storage
    const bucket = new s3.Bucket(this, "StarterKitBucket", {
      bucketName: `${process.env.DJANGO_AWS_STORAGE_BUCKET_NAME}`,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create RDS Database
    const db = new rds.DatabaseInstance(this, 'StarterKitDB', {
        engine: rds.DatabaseInstanceEngine.POSTGRES,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.SMALL),
        credentials: dbCredentials,
        vpc: vpc,
        databaseName: process.env.POSTGRES_DB as string,
        vpcPlacement: {subnetType: ec2.SubnetType.ISOLATED},
        deletionProtection: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    db.connections.allowDefaultPortFromAnyIpv4('Open default port');

    // Create ECS cluster in VPC
    const cluster = new ecs.Cluster(this, "StarterKitCluster", {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "StarterKitService", {
      cluster: cluster, // Required
      cpu: 512, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("eandrewswhoi/django-aws-starterkit:v0.5"),
        containerPort: 8000,
        environment: {
          'POSTGRES_HOST': db.dbInstanceEndpointAddress,
          'POSTGRES_PORT': db.dbInstanceEndpointPort,
          'POSTGRES_DB': process.env.POSTGRES_DB as string,
          'POSTGRES_USER': process.env.POSTGRES_USER as string,
          'POSTGRES_PASSWORD': process.env.POSTGRES_PASSWORD as string,
          'DJANGO_SETTINGS_MODULE': `${process.env.DJANGO_SETTINGS_MODULE}`,
          'DJANGO_SECRET_KEY': `${process.env.DJANGO_SECRET_KEY}`,
          'DJANGO_ADMIN_URL': `${process.env.DJANGO_ADMIN_URL}`,
          'DJANGO_ALLOWED_HOSTS': `${process.env.DJANGO_ALLOWED_HOSTS}`,
          'DJANGO_AWS_ACCESS_KEY_ID': `${process.env.DJANGO_AWS_ACCESS_KEY_ID}`,
          'DJANGO_AWS_SECRET_ACCESS_KEY': `${process.env.DJANGO_AWS_SECRET_ACCESS_KEY}`,
          'DJANGO_AWS_STORAGE_BUCKET_NAME': bucket.bucketName,
          'REDIS_URL': `${process.env.REDIS_URL}`
        }
      },
      memoryLimitMiB: 2048, // Default is 512
      publicLoadBalancer: true // Default is false
    });

    new cdk.CfnOutput(this, 'LoadBalancerDNS', { value: fargateService.loadBalancer.loadBalancerDnsName });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName, });
    new cdk.CfnOutput(this, 'DB', { value: db.dbInstanceEndpointAddress, });
  }
}
