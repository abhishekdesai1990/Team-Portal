const mockTransactionProcessIncompleteApplication = jest.fn();
const mockIsNotificationBlocked = jest.fn();
const mockSendApplicantParentRequestPendingEmailMultiloss = jest.fn();
const mockSendOtherParentInviteEmailMultiloss = jest.fn();

console.log = jest.fn();
console.error = jest.fn();

import { mockClient } from "aws-sdk-client-mock";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { handler } from "../index";

jest.mock("../clients/postgres-client", () => ({
  transactionProcessIncompleteApplication:
    mockTransactionProcessIncompleteApplication,
  isNotificationBlocked: mockIsNotificationBlocked,
}));

jest.mock("../clients/notification-client", () => ({
  sendApplicantParentRequestPendingEmailMultiloss:
    mockSendApplicantParentRequestPendingEmailMultiloss,
  sendOtherParentInviteEmailMultiloss: mockSendOtherParentInviteEmailMultiloss,
}));

const sqsMock = mockClient(SQSClient);

const applicationRequest = {
  applicationReference: "APP123",
  applicantName: "John Doe",
  userTrackingId: "USER123",
  babyCertificateDetails: [{ certificateReference: "518092DF585" }],
};
const firstParentRequest = {
  parentReferenceNumber: "PARENT1",
  parentEmailAddress: "parent1@email.com",
};
const secondParentRequest = {
  parentEmailAddress: "parent2@email.com",
};

const baseEvent = (includeEmail = true) => ({
  Records: [
    {
      body: JSON.stringify({
        applicationRequest,
        parentRequest: includeEmail ? firstParentRequest : {},
        secondParentRequest,
      }),
      receiptHandle: "mock-receipt-handle",
      messageId: "message123",
    },
  ],
});

beforeEach(() => {
  jest.clearAllMocks();
  sqsMock.reset();
});

test("should process message successfully", async () => {
  mockTransactionProcessIncompleteApplication.mockResolvedValue({});
  mockSendApplicantParentRequestPendingEmailMultiloss.mockResolvedValue({});
  mockSendOtherParentInviteEmailMultiloss.mockResolvedValue({});
  mockIsNotificationBlocked.mockResolvedValue(false);
  sqsMock
    .on(DeleteMessageCommand)
    .resolves({ $metadata: { httpStatusCode: 200 } });

  await expect(handler(baseEvent(true))).resolves.not.toThrow();

  expect(mockTransactionProcessIncompleteApplication).toHaveBeenCalled();
  expect(mockSendApplicantParentRequestPendingEmailMultiloss).toHaveBeenCalled();
  expect(mockSendOtherParentInviteEmailMultiloss).toHaveBeenCalled();
});

test("should throw error when applicationRequest is missing", async () => {
  const event = { Records: [{ body: "{}" }] };
  await expect(handler(event)).rejects.toThrow(
    "incomplete-application request failed. status code: 400, error message: applicationRequest is undefined"
  );
});

test("should throw error when parentRequest is missing", async () => {
  const event = {
    Records: [{ body: JSON.stringify({ applicationRequest }) }],
  };
  await expect(handler(event)).rejects.toThrow(
    "incomplete-application request failed. status code: 400, error message: parentRequest is undefined"
  );
});

test("should throw error when secondParentRequest is missing", async () => {
  const event = {
    Records: [
      {
        body: JSON.stringify({
          applicationRequest,
          parentRequest: firstParentRequest,
        }),
      },
    ],
  };
  await expect(handler(event)).rejects.toThrow(
    "incomplete-application request failed. status code: 400, error message: secondParentRequest is undefined"
  );
});

test("should log when first parent email is missing and not send email", async () => {
  const consoleSpy = jest.spyOn(console, "log");
  mockTransactionProcessIncompleteApplication.mockResolvedValue({});
  mockIsNotificationBlocked.mockResolvedValue(true);
  sqsMock
    .on(DeleteMessageCommand)
    .resolves({ $metadata: { httpStatusCode: 200 } });

  await handler(baseEvent(false));

  expect(mockSendApplicantParentRequestPendingEmailMultiloss).not.toHaveBeenCalled();
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining("first parent email not present for notification")
  );
});

test("should throw error if SQS delete fails", async () => {
  mockTransactionProcessIncompleteApplication.mockResolvedValue({});
  mockSendApplicantParentRequestPendingEmailMultiloss.mockResolvedValue({});
  mockSendOtherParentInviteEmailMultiloss.mockResolvedValue({});
  mockIsNotificationBlocked.mockResolvedValue(false);

  sqsMock.on(DeleteMessageCommand).rejects(new Error("SQS delete failed"));

  await expect(handler(baseEvent(true))).rejects.toThrow("SQS delete failed");
});
