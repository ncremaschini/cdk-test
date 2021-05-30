import * as cdk from "@aws-cdk/core";
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { SimpleSynthAction, CdkPipeline } from "@aws-cdk/pipelines";
import { SecretValue, StackProps } from "@aws-cdk/core";

export interface PipelineStackProps extends StackProps {
  readonly connection_arn: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    // Defines the artifact representing the sourcecode
    const sourceArtifact = new codepipeline.Artifact();
    // Defines the artifact representing the cloud assembly
    // (cloudformation template + all other assets)
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    new CdkPipeline(this, "Pipeline", {
      pipelineName: "WorkshopPipeline",
      cloudAssemblyArtifact,

      // Generates the source artifact from the repo we created in the last step
      sourceAction: new codepipeline_actions.CodeStarConnectionsSourceAction({
        actionName: 'Checkout',
        output: sourceArtifact,
        owner: "ncremaschini",
        repo: "cdk-test",
        branch: "main",
        connectionArn: props.connection_arn
      }),

      // Builds our source code outlined above into a could assembly artifact
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact, // Where to get source code to build
        cloudAssemblyArtifact, // Where to place built source

        buildCommand: "npm run build", // Language-specific build cmd
      }),
    });
  }
}
