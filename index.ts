import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker_build from "@pulumi/docker-build"

const stackName = pulumi.getStack();
const lambdaLayerPath = "./dist"

const layerImage = new docker_build.Image(`${stackName}-docker-layer-image`, {
    push: false,
    labels: {
        string: "cc-docker-layer",
    },
    network: docker_build.NetworkMode.Host,
    context: {
        location: "./lambda",
    },
    dockerfile: {
        location: "./lambda/Dockerfile",
    },
    exports: [{
        local: {
            dest: lambdaLayerPath,
        },
    }],
});

const lambdaLayer = new aws.lambda.LayerVersion("cc-lambda-layer", {
    code: new pulumi.asset.FileArchive(lambdaLayerPath),
    layerName: `piers-test-layer`,
    compatibleRuntimes: ["nodejs20.x", "nodejs18.x"],
}, {dependsOn: [layerImage]});