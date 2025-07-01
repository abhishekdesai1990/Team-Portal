#!/bin/bash
REGION=eu-west-2

# Create SQS Queue
awslocal sqs create-queue \
  --queue-name team-portal-queue.fifo \
  --region ${REGION} \
  --attributes FifoQueue=true,ContentBasedDeduplication=true,VisibilityTimeout=1800

# Create Lambda function code
aws --endpoint-url=http://localhost:4566 lambda delete-function \
  --function-name team-portal-lambda-queue-processor \

aws --endpoint-url=http://localhost:4566 lambda create-function \
  --region ${REGION} \
  --function-name team-portal-lambda-queue-processor \
  --runtime nodejs18.x \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --handler dist/src/index.handler \
  --environment file://env.json \
  --zip-file fileb://team-portal-lambda-queue-processor.zip

aws --endpoint-url=http://localhost:4566 lambda create-event-source-mapping \
  --region ${REGION} \
  --function-name team-portal-lambda-queue-processor \
  --event-source-arn arn:aws:sqs:${REGION}:000000000000:team-portal-queue.fifo