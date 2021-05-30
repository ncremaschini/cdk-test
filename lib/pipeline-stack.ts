import * as cdk from "@aws-cdk/core";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import {
  ShellScriptAction,
  SimpleSynthAction,
  CdkPipeline,
} from "@aws-cdk/pipelines";
import { StackProps } from "@aws-cdk/core";
import { WorkshopPipelineStage } from "./pipeline-stage";
import * as ssm from "@aws-cdk/aws-ssm";

export interface PipelineStackProps extends StackProps {
  connection_arn: string;
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    if (!props.connection_arn) {
      console.log("No connection arn present. fetching from ssm");
      const connectionArn = ssm.StringParameter.valueForStringParameter(
        this,
        "connection_arn"
      );

      props.connection_arn = connectionArn;
    }

    // Defines the artifact representing the sourcecode
    const sourceArtifact = new codepipeline.Artifact();
    // Defines the artifact representing the cloud assembly
    // (cloudformation template + all other assets)
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CdkPipeline(this, "Pipeline", {
      pipelineName: "WorkshopPipeline",
      cloudAssemblyArtifact,

      // Generates the source artifact from the repo we created in the last step
      sourceAction: new codepipeline_actions.CodeStarConnectionsSourceAction({
        actionName: "Checkout",
        output: sourceArtifact,
        owner: "ncremaschini",
        repo: "cdk-test",
        branch: "main",
        connectionArn: props.connection_arn,
      }),

      // Builds our source code outlined above into a could assembly artifact
      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact, // Where to get source code to build
        cloudAssemblyArtifact, // Where to place built source
        buildCommand: "npm run build", // Language-specific build cmd
      }),
    });

    const deploy = new WorkshopPipelineStage(this, "Deploy");
    const deployStage = pipeline.addApplicationStage(deploy);

    deployStage.addActions(
      new ShellScriptAction({
        actionName: "TestViewerEndpoint",
        useOutputs: {
          ENDPOINT_URL: pipeline.stackOutput(deploy.hcViewerUrl),
        },
        commands: ["curl -Ssf $ENDPOINT_URL"],
      })
    );
    deployStage.addActions(
      new ShellScriptAction({
        actionName: "TestAPIGatewayEndpoint",
        useOutputs: {
          ENDPOINT_URL: pipeline.stackOutput(deploy.hcEndpoint),
        },
        commands: [
          "curl -Ssf $ENDPOINT_URL/",
          "curl -Ssf $ENDPOINT_URL/hello",
          "curl -Ssf $ENDPOINT_URL/test",
        ],
      })
    );
  }
}
