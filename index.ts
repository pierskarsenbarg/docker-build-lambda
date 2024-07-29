import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as docker_build from "@pulumi/docker-build"

const lambdaLayerPath = "./dist"

const buildLambdaCode = new docker_build.Image(`docker-build-lambda-code`, {
    push: false,
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
    labels: {
        "created": new Date().getTime().toString()
    }
});

const role = new aws.iam.Role("lambdarole", {
    assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(aws.iam.Principals.LambdaPrincipal),
    managedPolicyArns: [aws.iam.ManagedPolicies.AWSLambdaBasicExecutionRole]
});

const fn = new aws.lambda.Function("fn", {
    role: role.arn,
    code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive("./dist")
    }),
    handler: "index.handler",
    runtime: aws.lambda.Runtime.NodeJS20dX
}, {dependsOn: [buildLambdaCode]})