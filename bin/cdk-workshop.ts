#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { CdkWorkshopStack } from "../lib/cdk-workshop-stack";
import { PipelineStack } from "../lib/pipeline-stack";

const app = new cdk.App();

new PipelineStack(app, "CdkPipelineStack", {
    connection_arn: process.env.CONNECTION_ARN!,
});
