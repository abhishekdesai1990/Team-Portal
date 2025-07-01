#!/bin/bash

# Setup SES in LocalStack
ENDPOINT="http://localhost:4566"
REGION="eu-west-2"

echo "Setting up SES in LocalStack..."

# Verify email addresses for LocalStack SES
aws --endpoint-url=$ENDPOINT ses verify-email-identity --email-address noreply@teamportal.com --region $REGION
aws --endpoint-url=$ENDPOINT ses verify-email-identity --email-address admin@teamportal.com --region $REGION

echo "SES setup complete!"
