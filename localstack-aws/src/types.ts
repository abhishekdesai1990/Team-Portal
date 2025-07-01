export type BabyCertificateDetail = {
  applicationId: string;
  certificateReference: string;
  applicantParentId: string;
  secondParentId: string;
  babyName?: string;
  babySex?: "Male" | "Female";
  babyNo: string;
  lossPlaceName?: string;
  lossCountry: string;
  lossDateDay?: number | null;
  lossDateMonth?: number | null;
  lossDateYear?: number | null;
  printDateOfLoss: boolean;
};

export type ApplicationRequest = {
  applicationReference: string;
  multilossIdentifier: string;
  applicantName: string;
  secondParentName: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  addressLine4?: string;
  addressLine5?: string;
  postcode: string;
  applicationType: string;
  sendOnSecondParentReject: boolean;
  userTrackingId?: string;
  babyCertificateDetails: BabyCertificateDetail[];
  createdDateTime: string | Date;
  createdBy: string;
  version: number;
};

export type FirstParentRequest = {
  parentReferenceNumber: number;
  parentReferenceType: number;
  parentReferenceNumberIssuingCountry: string;
  parentGivenName: string;
  parentFamilyName: string;
  parentRelationship: string;
  parentDateOfBirth: string;
  parentEmailAddress?: string;
};

export type SecondParentRequest = {
  parentRelationship: string;
  parentDateOfBirth: Date;
  parentEmailAddress: string;
};
