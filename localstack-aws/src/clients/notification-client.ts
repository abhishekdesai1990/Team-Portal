import { NotifyClient } from "notifications-node-client";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { getDateSevenDaysLaterWithTimeAdjustedToBatch } from "../utils";

const secretsManagerClient = new SecretsManagerClient({
  region: "eu-west-2",
  endpoint: process.env.SECRETS_MANAGER_ENDPOINT ?? undefined,
});
const GOV_NOTIFY_API_KEY_SECRET_NAME =
  process.env.GOV_NOTIFY_API_KEY_SECRET_NAME;
const GET_GOV_NOTIFY_API_KEY_COMMAND = new GetSecretValueCommand({
  SecretId: GOV_NOTIFY_API_KEY_SECRET_NAME,
});

const getGovNotifyApiKey = async () => {
  const GOV_NOTIFY_API_KEY_SECRET = await secretsManagerClient.send(
    GET_GOV_NOTIFY_API_KEY_COMMAND,
  );
  return GOV_NOTIFY_API_KEY_SECRET.SecretString;
};

const sendApplicantParentRequestPendingEmailMultiloss = async (
  email,
  applicantName,
  applicationReference,
  refNumbersCount,
  awaitingContent,
  userTrackingId,
) => {
  const GOV_NOTIFY_API_KEY = await getGovNotifyApiKey();
  const notifyClient = new NotifyClient(GOV_NOTIFY_API_KEY);
  const isMultiloss = refNumbersCount > 1;

  try {
    const response = await notifyClient.sendEmail(
      process.env.REQUEST_PENDING_EMAIL_TEMPLATE_ID,
      email,
      {
        personalisation: {
          first_parent_name: applicantName,
          awaiting_content: awaitingContent,
          certificate_word: isMultiloss ? "certificates" : "certificate",
        },
      },
    );
    console.log(`first parent request pending email was sent successfully: ${response.status} { applicationReference: ${applicationReference}, userTrackingId: ${userTrackingId} }`);
  } catch(error) {
    console.error(`sendApplicantParentRequestPendingEmailMultiloss failed! 
      { applicationReference: ${applicationReference}, userTrackingId: ${userTrackingId} }`);
    throw new Error(
      `sendApplicantParentRequestPendingEmailMultiloss failed` +
        error.message,
    );
  }
  
};

const sendOtherParentInviteEmailMultiloss = async (
  email,
  refNumbersCount,
  applicationReference,
  applicantName,
  secondParentURL,
  userTrackingId?
) => {
  const GOV_NOTIFY_API_KEY = await getGovNotifyApiKey();
  const notifyClient = new NotifyClient(GOV_NOTIFY_API_KEY);
  const isMultiloss = refNumbersCount > 1;

  try {
    const response = await notifyClient.sendEmail(
      process.env.INVITE_OTHER_PARENT_EMAIL_TEMPLATE_ID,
      email,
      {
        personalisation: {
          application_ref_number: applicationReference,
          first_parent_name: applicantName,
          other_parent_flow: secondParentURL,
          date_and_time_expiry: getDateSevenDaysLaterWithTimeAdjustedToBatch(),
          certificate_count_word: isMultiloss? refNumbersCount: "a",
          certificate_word: isMultiloss ? "certificates" : "certificate",
          give_word: isMultiloss ? "provide" : "give",
          is_multiloss: isMultiloss,
        },
      },
    );
  
    console.log(
      `second parent invite email was sent successfully: ${response.status} { applicationReference: ${applicationReference}, userTrackingId: ${userTrackingId} }`,
    );
  } catch (error) {
    console.error(`sendOtherParentInviteEmailMultiloss failed! 
      { applicationReference: ${applicationReference}, userTrackingId: ${userTrackingId} }`);
    throw new Error(
      `sendOtherParentInviteEmailMultiloss failed` +
        error.message,
    );
  }
};

export {
  sendApplicantParentRequestPendingEmailMultiloss,
  sendOtherParentInviteEmailMultiloss,
};
