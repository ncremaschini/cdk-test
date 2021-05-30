#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { CdkWorkshopStack } from "../lib/cdk-workshop-stack";
import { PipelineStack } from "../lib/pipeline-stack";

if (!process.env.GITHUB_TOKEN) {
  console.log("No Github Token present");
}

const app = new cdk.App();
new CdkWorkshopStack(app, "CdkWorkshopStack");

new PipelineStack(app, "CdkPipelineStack", {
  githubToken: process.env.GITHUB_TOKEN!,
});
