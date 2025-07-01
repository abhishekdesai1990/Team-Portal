import expect from "expect";
import {
  sendApplicantParentRequestPendingEmailMultiloss,
  sendOtherParentInviteEmailMultiloss,
} from "../../clients/notification-client";
import { NotifyClient } from "notifications-node-client";
const {
  SecretsManagerClient,
  GetSecretValueCommand,
  UpdateSecretCommand,
} = require("@aws-sdk/client-secrets-manager");

jest.mock("@aws-sdk/client-secrets-manager");

console.log = jest.fn();

jest.mock("../../utils", () => ({
  getDateSevenDaysLaterWithTimeAdjustedToBatch: jest.fn(
    () => "2025-03-17 10:00:00",
  ),
}));

jest.mock("notifications-node-client", () => {
  const mockNotifyClient = {
    sendEmail: jest.fn(),
    sendSms: jest.fn(),
  };
  return { NotifyClient: jest.fn(() => mockNotifyClient) };
});

beforeEach(() => {
  SecretsManagerClient.prototype.send.mockResolvedValue({
    SecretString: "MockSecret",
  });
  GetSecretValueCommand.mockImplementation(() => ({}));
  UpdateSecretCommand.mockImplementation(() => ({}));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("GovNotify Email Notifications", () => {
  let mockSendEmail;

  beforeEach(() => {
    mockSendEmail = jest.fn().mockResolvedValue({ status: "success" });
    NotifyClient.mockImplementation(() => ({ sendEmail: mockSendEmail }));
  });

  test("should send first parent request pending email with plural count", async () => {
    process.env.REQUEST_PENDING_EMAIL_TEMPLATE_ID = "template-id-1";

    await sendApplicantParentRequestPendingEmailMultiloss(
      "parent@example.com",
      "John Doe",
      "APP-123",
      3,
      "waiting for docs",
      "trac123"
    );

    expect(mockSendEmail).toHaveBeenCalledWith("template-id-1", "parent@example.com", {
      personalisation: {
        first_parent_name: "John Doe",
        awaiting_content: "waiting for docs",
        certificate_word: "certificates",
      },
    });
  });

  test("should send first parent request pending email with 0 ref count", async () => {
    process.env.REQUEST_PENDING_EMAIL_TEMPLATE_ID = "template-id-1";

    await sendApplicantParentRequestPendingEmailMultiloss(
      "parent@example.com",
      "John Doe",
      "APP-000",
      0,
      "none",
      "zero-track"
    );

    expect(mockSendEmail).toHaveBeenCalledWith("template-id-1", "parent@example.com", {
      personalisation: {
        first_parent_name: "John Doe",
        awaiting_content: "none",
        certificate_word: "certificate",
      },
    });
  });

  test("should send other parent invite email for singular certificate", async () => {
    process.env.INVITE_OTHER_PARENT_EMAIL_TEMPLATE_ID = "template-id-2";

    await sendOtherParentInviteEmailMultiloss(
      "otherparent@example.com",
      1,
      "APP-456",
      "Jane Doe",
      "https://some-url.com",
      "track456"
    );

    expect(mockSendEmail).toHaveBeenCalledWith("template-id-2", "otherparent@example.com", {
      personalisation: {
        application_ref_number: "APP-456",
        first_parent_name: "Jane Doe",
        other_parent_flow: "https://some-url.com",
        date_and_time_expiry: "2025-03-17 10:00:00",
        certificate_count_word: "a",
        certificate_word: "certificate",
        give_word: "give",
        is_multiloss: false,
      },
    });
  });

  test("should send other parent invite email for plural certificates", async () => {
    process.env.INVITE_OTHER_PARENT_EMAIL_TEMPLATE_ID = "template-id-2";

    await sendOtherParentInviteEmailMultiloss(
      "otherparent@example.com",
      2,
      "APP-456",
      "Jane Doe",
      "https://some-url.com"
    );

    expect(mockSendEmail).toHaveBeenCalledWith("template-id-2", "otherparent@example.com", {
      personalisation: {
        application_ref_number: "APP-456",
        first_parent_name: "Jane Doe",
        other_parent_flow: "https://some-url.com",
        date_and_time_expiry: "2025-03-17 10:00:00",
        certificate_count_word: 2,
        certificate_word: "certificates",
        give_word: "provide",
        is_multiloss: true,
      },
    });
  });

  test("should send invite for large number of certificates", async () => {
    process.env.INVITE_OTHER_PARENT_EMAIL_TEMPLATE_ID = "template-id-2";

    await sendOtherParentInviteEmailMultiloss(
      "otherparent@example.com",
      100,
      "APP-999",
      "Alice",
      "https://link.com",
      "track100"
    );

    expect(mockSendEmail).toHaveBeenCalledWith("template-id-2", "otherparent@example.com", {
      personalisation: {
        application_ref_number: "APP-999",
        first_parent_name: "Alice",
        other_parent_flow: "https://link.com",
        date_and_time_expiry: "2025-03-17 10:00:00",
        certificate_count_word: 100,
        certificate_word: "certificates",
        give_word: "provide",
        is_multiloss: true,
      },
    });
  });

  test("should handle missing optional userTrackingId", async () => {
    process.env.INVITE_OTHER_PARENT_EMAIL_TEMPLATE_ID = "template-id-2";

    await sendOtherParentInviteEmailMultiloss(
      "noid@example.com",
      1,
      "APP-777",
      "NoID",
      "https://someurl.com"
    );

    expect(mockSendEmail).toHaveBeenCalledWith("template-id-2", "noid@example.com", expect.objectContaining({
      personalisation: expect.objectContaining({
        application_ref_number: "APP-777",
        first_parent_name: "NoID",
      }),
    }));
  });

  test("should throw error if NotifyClient.sendEmail fails", async () => {
    process.env.REQUEST_PENDING_EMAIL_TEMPLATE_ID = "template-id-error";
    const errorMessage = "Simulated failure";

    mockSendEmail.mockRejectedValue(new Error(errorMessage));

    await expect(
      sendApplicantParentRequestPendingEmailMultiloss(
        "fail@example.com",
        "FailingUser",
        "FAIL-001",
        2,
        "fail-content",
        "failTrack"
      )
    ).rejects.toThrow(`sendApplicantParentRequestPendingEmailMultiloss failed${errorMessage}`);
  });
});
