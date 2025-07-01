import { Pool } from "pg";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import {
  transactionProcessIncompleteApplication,
  isNotificationBlocked,
  getSecret,
} from "../../clients/postgres-client";
import {
  ApplicationRequest,
  FirstParentRequest,
  SecondParentRequest,
} from "../../types";

jest.mock("pg", () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ opted_out: true }] }),
      release: jest.fn(),
    }),
    query: jest.fn().mockResolvedValue({ rowCount: 1, rows: [{ opted_out: true }] }),
  };
  return { Pool: jest.fn(() => mockClient) };
});

jest.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockImplementation((command) =>
      command instanceof GetSecretValueCommand
        ? Promise.resolve({ SecretString: "mocked_secret" })
        : Promise.reject(new Error("Invalid command"))
    ),
  })),
  GetSecretValueCommand: jest.fn(),
}));

// Suppress console logs in tests
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
console.info = jest.fn();
console.debug = jest.fn();

process.env.DB_USERNAME = "testuser";
process.env.DB_PASSWORD_SECRET_NAME = "testpassword";
process.env.DB_URL = "localhost";
process.env.DB_NAME = "testdb";
process.env.DB_PORT = "5432";
process.env.DB_SSL = "false";

const applicationRequest: ApplicationRequest = {
  applicationReference: "ref123",
  multilossIdentifier: "multi123",
  applicantName: "John Doe",
  secondParentName: "Jane Doe",
  addressLine1: "123 Main St",
  addressLine2: "Apt 4B",
  addressLine3: "",
  addressLine4: "",
  addressLine5: "",
  postcode: "12345",
  applicationType: "new",
  sendOnSecondParentReject: false,
  userTrackingId: "track123",
  createdDateTime: new Date(),
  createdBy: "citizen",
  version: 1,
  babyCertificateDetails: [
    {
      applicationId: "app123",
      certificateReference: "ref123",
      applicantParentId: "parent1",
      secondParentId: "parent2",
      babyName: "",
      babySex: "Male",
      babyNo: "",
      lossPlaceName: "",
      lossCountry: "",
      lossDateDay: null,
      lossDateMonth: null,
      lossDateYear: null,
      printDateOfLoss: false,
    },
  ],
};

const firstParentRequest: FirstParentRequest = {
  parentReferenceNumber: 123,
  parentReferenceType: 1,
  parentReferenceNumberIssuingCountry: "GB",
  parentGivenName: "",
  parentFamilyName: "",
  parentRelationship: "",
  parentDateOfBirth: "",
  parentEmailAddress: "",
};

const secondParentRequest: SecondParentRequest = {
  parentRelationship: "Mother",
  parentDateOfBirth: new Date("1992-01-01"),
  parentEmailAddress: "",
};

describe("Secret Manager", () => {
  test("should retrieve secrets successfully", async () => {
    await expect(getSecret("test-secret")).resolves.toBe("mocked_secret");
  });

  test("should throw an error if secret name is missing", async () => {
    await expect(getSecret(null)).rejects.toThrow("Secret name is not defined");
  });
});

describe("Transaction Processing", () => {
  let mockClient: any;

  beforeEach(async () => {
    process.env.DB_PASSWORD_SECRET_NAME = "test-secret";
    mockClient = await new Pool().connect();
  });

  test("should successfully process an incomplete application transaction", async () => {
    mockClient.query.mockResolvedValueOnce({});
    
    await expect(
      transactionProcessIncompleteApplication(applicationRequest, firstParentRequest, secondParentRequest)
    ).resolves.not.toThrow();

    expect(mockClient.query).toHaveBeenCalledTimes(5); // BEGIN, 3 inserts, COMMIT
    expect(console.log).toHaveBeenCalled();
  });

  test("should rollback transaction on failure", async () => {
    mockClient.query.mockRejectedValueOnce(new Error("DB error"));

    await expect(
      transactionProcessIncompleteApplication(applicationRequest, firstParentRequest, secondParentRequest)
    ).rejects.toThrow("DB error");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(console.error).toHaveBeenCalled();
  });
});

describe("Notification Blocking", () => {
  let mockPool: any;
  const request = {
    firstParentReferenceNumber: "123",
    secondParentEmailAddress: "test@example.com",
  };

  beforeEach(() => {
    mockPool = new Pool();
  });

  test("should return true if notification is blocked", async () => {
    mockPool.query.mockResolvedValueOnce({ rowCount: 1, rows: [{ opted_out: true }] });

    await expect(isNotificationBlocked(request)).resolves.toBe(true);
    expect(console.log).toHaveBeenCalled();
  });

  test("should return false if notification is not blocked", async () => {
    mockPool.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    await expect(isNotificationBlocked(request)).resolves.toBe(false);
  });

  test("should throw an error on database failure", async () => {
    mockPool.query.mockRejectedValueOnce(new Error("DB error"));

    await expect(isNotificationBlocked(request)).rejects.toThrow("failed to check notification status");
    expect(console.error).toHaveBeenCalled();
  });
});
