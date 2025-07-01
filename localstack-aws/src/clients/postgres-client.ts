import { Pool } from "pg";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  FirstParentRequest,
  SecondParentRequest,
  ApplicationRequest,
} from "../types";
import {
  ApplicationFields,
  ParentFields,
  IncompleteParentFields,
  DefaultValues,
} from "../fields";
import { XeroxStatus } from "../xerox-statuses";

const secretsManagerClient = new SecretsManagerClient({
  region: "eu-west-2",
  endpoint: process.env.SECRETS_MANAGER_ENDPOINT ?? undefined,
});

const getSecret = async (secretName) => {
  if (!secretName) throw new Error("Secret name is not defined");
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const secret = await secretsManagerClient.send(command);
  return secret.SecretString;
};

const createDbPool = async () => {
  const dbPassword = await getSecret(process.env.DB_PASSWORD_SECRET_NAME);
  let dbSSL;

  if (process.env.DB_SSL !== "false") {
    dbSSL = await getSecret(process.env.DB_SSL);
  }

  return new Pool({
    user: process.env.DB_USERNAME,
    password: dbPassword,
    host: process.env.DB_URL,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl:
      process.env.DB_SSL !== "false"
        ? {
            rejectUnauthorized: true,
            ca: dbSSL
              ? Buffer.from(dbSSL, "base64").toString("ascii")
              : undefined,
          }
        : false,
  });
};

const transactionProcessIncompleteApplication = async (
  applicationRequest: ApplicationRequest,
  firstParentRequest: FirstParentRequest,
  secondParentRequest: SecondParentRequest,
) => {
  const pool = await createDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (const babyCertificateDetail of applicationRequest.babyCertificateDetails) {
      const firstParentTableInsertQuery = {
        text:
          "INSERT INTO parent (" +
          ParentFields.join(", ") +
          ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (parent_id) DO NOTHING",
        values: [
          babyCertificateDetail.applicantParentId,
          firstParentRequest.parentReferenceNumber,
          firstParentRequest.parentReferenceType,
          firstParentRequest.parentReferenceNumberIssuingCountry,
          firstParentRequest.parentGivenName,
          firstParentRequest.parentFamilyName,
          firstParentRequest.parentRelationship,
          firstParentRequest.parentDateOfBirth,
          firstParentRequest.parentEmailAddress,
          applicationRequest.createdDateTime,
          applicationRequest.createdBy,
          babyCertificateDetail.applicationId,
          DefaultValues.firstParentNumber,
        ],
      };

      const secondParentTableInsertQuery = {
        text:
          "INSERT INTO parent (" +
          IncompleteParentFields.join(", ") +
          ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (parent_id) DO NOTHING",
        values: [
          babyCertificateDetail.secondParentId,
          DefaultValues.parentReferenceNumber,
          DefaultValues.parentReferenceType,
          DefaultValues.parentReferenceNumberIssuingCountry,
          secondParentRequest.parentRelationship,
          secondParentRequest.parentDateOfBirth,
          secondParentRequest.parentEmailAddress,
          applicationRequest.createdDateTime,
          applicationRequest.createdBy,
          babyCertificateDetail.applicationId,
          DefaultValues.secondParentNumber,
        ],
      };

      const applicationTableInsertQuery = {
        text:
          "INSERT INTO application (" +
          ApplicationFields.join(", ") +
          ") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)  ON CONFLICT (application_id) DO NOTHING",
        values: [
          babyCertificateDetail.applicationId,
          babyCertificateDetail.certificateReference,
          babyCertificateDetail.lossCountry,
          babyCertificateDetail.lossDateYear,
          babyCertificateDetail.lossDateMonth,
          babyCertificateDetail.lossDateDay,
          babyCertificateDetail.printDateOfLoss,
          babyCertificateDetail.lossPlaceName,
          babyCertificateDetail.babySex,
          babyCertificateDetail.babyName,
          applicationRequest.addressLine1,
          applicationRequest.addressLine2,
          applicationRequest.addressLine3,
          applicationRequest.addressLine4,
          applicationRequest.addressLine5,
          applicationRequest.postcode,
          applicationRequest.createdDateTime,
          applicationRequest.createdBy,
          applicationRequest.version,
          babyCertificateDetail.applicantParentId,
          babyCertificateDetail.secondParentId,
          XeroxStatus.INCOMPLETE,
          applicationRequest.sendOnSecondParentReject,
          applicationRequest.applicationReference,
          babyCertificateDetail.babyNo,
          applicationRequest.multilossIdentifier,
        ],
      };

      await client.query(firstParentTableInsertQuery);
      await client.query(secondParentTableInsertQuery);
      await client.query(applicationTableInsertQuery);

      console.log(`created row in parent table for first parent { parentId: ${babyCertificateDetail.applicantParentId} },
                   created row in parent table for second parent { parentId: ${babyCertificateDetail.secondParentId} },
                   created row in application table for application { applicationId: ${babyCertificateDetail.applicationId} }, 
                   { userTrackingId: ${applicationRequest.userTrackingId}, certificateReference: ${babyCertificateDetail.certificateReference}, applicationReference: ${applicationRequest.applicationReference} }`);
    }
    console.log(`transactionProcessIncompleteApplication ran successfully! 
      { userTrackingId: ${applicationRequest.userTrackingId}, applicationReference: ${applicationRequest.applicationReference} }`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`transactionProcessIncompleteApplication failed! 
      { userTrackingId: ${applicationRequest.userTrackingId}, applicationReference: ${applicationRequest.applicationReference} }`);
    throw new Error(
      `transactionProcessIncompleteApplication failed, rolling back:` +
        error.message,
    );
  } finally {
    client.release();
  }
};

const isNotificationBlocked = async (request) => {
  const pool = await createDbPool();

  try {
    const notificationMisuseQuery = {
      text: `
        SELECT * 
        FROM blc_notification_misuse 
        WHERE first_parent_identifier = $1 
        AND second_parent_email = $2
      `,
      values: [
        request.firstParentReferenceNumber,
        request.secondParentEmailAddress,
      ],
    };

    const notificationMisuseResult = await pool.query(notificationMisuseQuery);

    if (
      notificationMisuseResult.rowCount > 0 &&
      notificationMisuseResult.rows[0].opted_out
    ) {
      console.log(
        `notification is blocked { notificationBlockId: ${notificationMisuseResult.rows[0].notification_block_id} }`,
      );
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error querying notification misuse status:", error);
    throw new Error("failed to check notification status");
  }
};

export {
  transactionProcessIncompleteApplication,
  isNotificationBlocked,
  getSecret,
  createDbPool,
};
