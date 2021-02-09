# django-aws-starterkit
Django app and AWS CDK code to deploy a containerized Django app in AWS.

The `django-app` directory contains a base Django project with the
production version set up to run in AWS as an ECS container. This app will work out of the box with the included CDK code.

The `aws-cdk` directory contains the CDK code to deploy a Django Docker image in Fargate. You can swap this Docker image to a different Django set up, just
modify the environmental variables to suit your preferences.
