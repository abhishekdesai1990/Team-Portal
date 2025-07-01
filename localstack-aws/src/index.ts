import { SQSClient, DeleteMessageCommand, ReceiptHandleIsInvalid } from "@aws-sdk/client-sqs";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

import {
  FirstParentRequest,
  SecondParentRequest,
  ApplicationRequest,
} from "./types";

const TEAMPORTAL_QUEUE_URL =
  process.env.TEAMPORTAL_QUEUE_URL;
const TEAMPORTAL_QUEUE_ENDPOINT =
  process.env.TEAMPORTAL_QUEUE_ENDPOINT ?? undefined;

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@teamportal.com";
const TO_EMAIL = process.env.TO_EMAIL || "admin@teamportal.com";

const client = new SQSClient({
  region: "eu-west-2",
  endpoint: TEAMPORTAL_QUEUE_ENDPOINT,
});

const sesClient = new SESClient({
  region: "eu-west-2",
  endpoint: TEAMPORTAL_QUEUE_ENDPOINT, // LocalStack endpoint
});

export const handler = async (event) => {
  try {
    console.log("batch size: ", event.Records.length);
    for (const record of event.Records) {
      // Process the message and send email notification
      await processQueueRecord(record);
      
      // Delete the processed record from queue
      await deleteRecordFromQueue(client, record);
    }
  } catch (error) {
    console.error("error in lambda handler: ", error);
    throw error;
  }
};

async function processQueueRecord(record: any) {
  try {
    console.log("Processing SQS record:", record.messageId);
    
    // Parse the message body
    const messageBody = JSON.parse(record.body);
    console.log("Message content:", messageBody);
    
    // Send email notification
    await sendEmailNotification(messageBody, record.messageId);
    
  } catch (error) {
    console.error("Error processing queue record:", error);
    throw error;
  }
}

async function sendEmailNotification(messageBody: any, messageId: string) {
  try {
    const emailParams = {
      Destination: {
        ToAddresses: [TO_EMAIL],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `
              <h2>New Message Received in Team Portal Queue</h2>
              <p><strong>Message ID:</strong> ${messageId}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Message Content:</strong></p>
              <pre>${JSON.stringify(messageBody, null, 2)}</pre>
            `,
          },
          Text: {
            Charset: "UTF-8",
            Data: `
New Message Received in Team Portal Queue

Message ID: ${messageId}
Timestamp: ${new Date().toISOString()}
Message Content: ${JSON.stringify(messageBody, null, 2)}
            `,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `Team Portal - New Queue Message (${messageId})`,
        },
      },
      Source: FROM_EMAIL,
    };

    const command = new SendEmailCommand(emailParams);
    const response = await sesClient.send(command);
    
    console.log("Email sent successfully:", response.MessageId);
    return response;
    
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

async function deleteRecordFromQueue(
  client: SQSClient,
  record
) {
  try {
    const response = await client.send(
      new DeleteMessageCommand({
        QueueUrl: TEAMPORTAL_QUEUE_URL,
        ReceiptHandle: record.receiptHandle,
      }),
    );

    console.log("delete message request successful");
  } catch (error) {
    const errorMessage = error.message;
    const statusCode = error.response?.status;
    throw new Error(
      `could not delete message from queue. status code: ${statusCode}, error message: ${errorMessage}`,
    );
  }
}
