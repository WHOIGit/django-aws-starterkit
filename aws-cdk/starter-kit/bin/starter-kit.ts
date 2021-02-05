#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { StarterKitStack } from '../lib/starter-kit-stack';

const app = new cdk.App();
new StarterKitStack(app, 'StarterKitStack');
