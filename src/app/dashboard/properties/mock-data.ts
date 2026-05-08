export type PropertyType = 'house' | 'flat' | 'apartment' | 'studio' | 'hmo'
export type PropertyStatus = 'occupied' | 'vacant' | 'under-offer'
export type ComplianceStatus = 'valid' | 'expiring-soon' | 'expired' | 'required' | 'not-applicable'

export interface ComplianceItem {
  status: ComplianceStatus
  required: boolean
  issueDate?: string
  expiryDate?: string
  certificateNumber?: string
  issuedBy?: string
  notes?: string
  documentUrl?: string
}

export interface GasSafetyCertificate extends ComplianceItem {
  gasAppliancesChecked?: string[]
}

export interface EICR extends ComplianceItem {
  overallCondition?: 'satisfactory' | 'unsatisfactory' | 'requires-improvement'
  nextInspectionDue?: string
}

export interface EPC extends ComplianceItem {
  currentRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  potentialRating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  minRating: 'E' | 'D' | 'C'
}

export interface SmokeAlarms extends ComplianceItem {
  locations?: string[]
  lastTestedDate?: string
}

export interface COAlarms extends ComplianceItem {
  locations?: string[]
  lastTestedDate?: string
}

export interface DepositProtection extends ComplianceItem {
  scheme?: 'DPS' | 'MyDeposits' | 'TDS'
  depositAmount?: number
  protectionDate?: string
  certificateNumber?: string
}

export interface RightToRent extends ComplianceItem {
  checkDate?: string
  documentsChecked?: string[]
  checkedBy?: string
}

export interface HMOLicense extends ComplianceItem {
  licenseType?: 'mandatory' | 'additional' | 'selective'
  maxOccupants?: number
  conditions?: string[]
}

// Renters' Rights Act 2025 Compliance Items

export interface RRAInformationSheet extends ComplianceItem {
  deliveryStatus: 'delivered' | 'pending' | 'not-applicable'
  deliveryDate?: string
  deliveryMethod?: 'email' | 'hand-delivered' | 'post' | 'portal'
  recipientName?: string
  deadline: string // 31 May 2026 for existing tenancies
}

export interface PetRequest {
  id: string
  requestDate: string
  petType: string
  petDetails: string
  responseDeadline: string // 28-42 days from request
  status: 'pending' | 'approved' | 'denied'
  responseDate?: string
  denialReason?: string
  conditions?: string[]
  daysRemaining?: number
}

export interface PetRequestTracking extends ComplianceItem {
  requests: PetRequest[]
  petsAllowed: boolean
  hasActiveRequests: boolean
}

export interface AwaitingGroundsNotice extends ComplianceItem {
  groundsDisclosed: boolean
  disclosureDate?: string
  disclosedGrounds?: string[] // e.g., ['Ground 1B', 'Ground 2ZA']
  noticeProvided?: boolean
  noticeProvidedDate?: string
  documentUrl?: string
}

export interface OmbudsmanMembership extends ComplianceItem {
  schemeName?: 'Property Ombudsman' | 'Property Redress Scheme' | 'Other'
  membershipNumber?: string
  renewalDate?: string
  autoRenewal?: boolean
}

export interface WrittenStatementOfTerms extends ComplianceItem {
  tenancyType: 'written' | 'verbal'
  statementProvided?: boolean
  provisionDate?: string
  deadline?: string // For verbal tenancies: 31 May 2026
  mainTerms?: string[]
}

export interface Property {
  id: string
  address: string
  postcode: string
  type: PropertyType
  bedrooms: number
  propertyReference?: string
  status: PropertyStatus
  currentTenancy?: {
    tenantName: string
    startDate: string
    endDate: string
    monthlyRent: number
    depositAmount: number
  }
  compliance: {
    gasSafetyCertificate: GasSafetyCertificate
    eicr: EICR
    epc: EPC
    smokeAlarms: SmokeAlarms
    coAlarms: COAlarms
    depositProtection: DepositProtection
    rightToRent: RightToRent
    legionellaAssessment: ComplianceItem
    buildingInsurance: ComplianceItem
    landlordInsurance: ComplianceItem
    prsDatabase: ComplianceItem
    hmoLicense?: HMOLicense
    // Renters' Rights Act 2025 Compliance
    rraInformationSheet: RRAInformationSheet
    petRequestTracking: PetRequestTracking
    awaitingGroundsNotice: AwaitingGroundsNotice
    ombudsmanMembership: OmbudsmanMembership
    writtenStatementOfTerms: WrittenStatementOfTerms
  }
}

// Helper function to calculate days until expiry
export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Helper function to determine status based on expiry date
export function getStatusFromExpiry(expiryDate?: string): ComplianceStatus {
  if (!expiryDate) return 'required'

  const days = getDaysUntilExpiry(expiryDate)

  if (days < 0) return 'expired'
  if (days <= 60) return 'expiring-soon'
  return 'valid'
}

// Helper function to calculate days remaining for pet request deadline
export function getPetRequestDaysRemaining(responseDeadline: string): number {
  return getDaysUntilExpiry(responseDeadline)
}

// Helper function to determine pet request urgency status
export function getPetRequestStatus(responseDeadline: string, currentStatus: PetRequest['status']): ComplianceStatus {
  if (currentStatus !== 'pending') return 'valid'

  const daysRemaining = getPetRequestDaysRemaining(responseDeadline)

  if (daysRemaining < 0) return 'expired' // Overdue response
  if (daysRemaining <= 7) return 'expiring-soon' // Urgent
  return 'valid' // On track
}

// Mock data with example properties
export const properties: Property[] = [
  {
    id: 'prop-001',
    address: '45 Baker Street',
    postcode: 'NW1 6XE',
    type: 'flat',
    bedrooms: 2,
    propertyReference: 'BAK-045',
    status: 'occupied',
    currentTenancy: {
      tenantName: 'John Smith',
      startDate: '2024-01-15',
      endDate: '2026-01-14',
      monthlyRent: 1850,
      depositAmount: 2135,
    },
    compliance: {
      gasSafetyCertificate: {
        status: 'valid',
        required: true,
        issueDate: '2025-11-10',
        expiryDate: '2026-11-10',
        certificateNumber: 'GAS-2025-11234',
        issuedBy: 'Gas Safe Register',
        gasAppliancesChecked: ['Boiler', 'Gas Hob'],
      },
      eicr: {
        status: 'expiring-soon',
        required: true,
        issueDate: '2021-03-20',
        expiryDate: '2026-03-20',
        certificateNumber: 'EICR-2021-5678',
        issuedBy: 'ABC Electrical Ltd',
        overallCondition: 'satisfactory',
        nextInspectionDue: '2026-03-20',
      },
      epc: {
        status: 'valid',
        required: true,
        issueDate: '2023-06-15',
        expiryDate: '2033-06-15',
        certificateNumber: 'EPC-2023-9012',
        currentRating: 'C',
        potentialRating: 'B',
        minRating: 'E',
      },
      smokeAlarms: {
        status: 'valid',
        required: true,
        lastTestedDate: '2026-01-15',
        locations: ['Hallway', 'Living Room', 'Each Bedroom'],
      },
      coAlarms: {
        status: 'valid',
        required: true,
        lastTestedDate: '2026-01-15',
        locations: ['Kitchen', 'Living Room'],
      },
      depositProtection: {
        status: 'valid',
        required: true,
        scheme: 'DPS',
        depositAmount: 2135,
        protectionDate: '2024-01-20',
        certificateNumber: 'DPS-123456',
      },
      rightToRent: {
        status: 'valid',
        required: true,
        checkDate: '2024-01-10',
        documentsChecked: ['UK Passport', 'Proof of Address'],
        checkedBy: 'Agency Staff',
      },
      legionellaAssessment: {
        status: 'valid',
        required: true,
        issueDate: '2024-01-05',
        expiryDate: '2026-01-05',
        notes: 'Low risk. Regular flushing recommended for unused taps.',
      },
      buildingInsurance: {
        status: 'valid',
        required: true,
        issueDate: '2025-04-01',
        expiryDate: '2026-04-01',
        issuedBy: 'ABC Insurance Ltd',
        notes: 'Full building cover including flood risk',
      },
      landlordInsurance: {
        status: 'valid',
        required: true,
        issueDate: '2025-04-01',
        expiryDate: '2026-04-01',
        issuedBy: 'ABC Insurance Ltd',
        notes: 'Includes rent guarantee and legal cover',
      },
      prsDatabase: {
        status: 'required',
        required: true,
        notes: 'PRS Database registration opens Q3 2026',
      },
      // RRA Compliance
      rraInformationSheet: {
        status: 'valid',
        required: true,
        deliveryStatus: 'delivered',
        deliveryDate: '2026-04-15',
        deliveryMethod: 'email',
        recipientName: 'John Smith',
        deadline: '2026-05-31',
        notes: 'RRA Information Sheet delivered via email with read receipt',
      },
      petRequestTracking: {
        status: 'valid',
        required: true,
        requests: [
          {
            id: 'pet-001',
            requestDate: '2026-03-10',
            petType: 'Cat',
            petDetails: 'Indoor cat, neutered, fully vaccinated',
            responseDeadline: '2026-04-21', // 42 days
            status: 'approved',
            responseDate: '2026-03-18',
            conditions: ['Professional carpet cleaning at end of tenancy', 'Additional £200 deposit'],
          },
        ],
        petsAllowed: true,
        hasActiveRequests: false,
      },
      awaitingGroundsNotice: {
        status: 'valid',
        required: true,
        groundsDisclosed: true,
        disclosureDate: '2024-01-10',
        disclosedGrounds: ['Ground 1B', 'Ground 6A'],
        noticeProvided: true,
        noticeProvidedDate: '2024-01-10',
        notes: 'Awaiting grounds disclosed in tenancy agreement',
      },
      ombudsmanMembership: {
        status: 'valid',
        required: true,
        schemeName: 'Property Ombudsman',
        membershipNumber: 'PO-123456',
        issueDate: '2025-04-01',
        expiryDate: '2026-04-01',
        renewalDate: '2026-04-01',
        autoRenewal: true,
        notes: 'Annual membership with auto-renewal enabled',
      },
      writtenStatementOfTerms: {
        status: 'valid',
        required: true,
        tenancyType: 'written',
        statementProvided: true,
        provisionDate: '2024-01-10',
        notes: 'Full written tenancy agreement signed by all parties',
      },
    },
  },
  {
    id: 'prop-002',
    address: '12 Victoria Gardens',
    postcode: 'SW1V 2ED',
    type: 'house',
    bedrooms: 3,
    propertyReference: 'VIC-012',
    status: 'vacant',
    compliance: {
      gasSafetyCertificate: {
        status: 'expired',
        required: true,
        issueDate: '2024-03-15',
        expiryDate: '2025-03-15',
        certificateNumber: 'GAS-2024-33445',
        notes: 'URGENT: Certificate expired. Cannot let until renewed.',
      },
      eicr: {
        status: 'valid',
        required: true,
        issueDate: '2023-08-10',
        expiryDate: '2028-08-10',
        certificateNumber: 'EICR-2023-7890',
        overallCondition: 'satisfactory',
      },
      epc: {
        status: 'valid',
        required: true,
        issueDate: '2022-11-20',
        expiryDate: '2032-11-20',
        certificateNumber: 'EPC-2022-4567',
        currentRating: 'D',
        potentialRating: 'C',
        minRating: 'E',
      },
      smokeAlarms: {
        status: 'valid',
        required: true,
        locations: ['Ground Floor Hallway', 'First Floor Landing', 'Each Bedroom'],
      },
      coAlarms: {
        status: 'valid',
        required: true,
        locations: ['Kitchen', 'Living Room', 'Master Bedroom'],
      },
      depositProtection: {
        status: 'not-applicable',
        required: false,
        notes: 'No current tenancy',
      },
      rightToRent: {
        status: 'not-applicable',
        required: false,
        notes: 'Will be required upon new tenancy',
      },
      legionellaAssessment: {
        status: 'valid',
        required: true,
        issueDate: '2024-06-10',
        expiryDate: '2026-06-10',
      },
      buildingInsurance: {
        status: 'valid',
        required: true,
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
      },
      landlordInsurance: {
        status: 'valid',
        required: true,
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
      },
      prsDatabase: {
        status: 'required',
        required: true,
        notes: 'Registration required before next let',
      },
      // RRA Compliance
      rraInformationSheet: {
        status: 'not-applicable',
        required: false,
        deliveryStatus: 'not-applicable',
        deadline: '2026-05-31',
        notes: 'Not applicable - property currently vacant',
      },
      petRequestTracking: {
        status: 'not-applicable',
        required: false,
        requests: [],
        petsAllowed: true,
        hasActiveRequests: false,
        notes: 'No active tenancy, no pet requests',
      },
      awaitingGroundsNotice: {
        status: 'not-applicable',
        required: false,
        groundsDisclosed: false,
        notes: 'Will be required for next tenancy agreement',
      },
      ombudsmanMembership: {
        status: 'valid',
        required: true,
        schemeName: 'Property Redress Scheme',
        membershipNumber: 'PRS-789012',
        issueDate: '2025-01-01',
        expiryDate: '2026-01-01',
        renewalDate: '2026-01-01',
        autoRenewal: true,
        notes: 'Annual membership covers all properties in portfolio',
      },
      writtenStatementOfTerms: {
        status: 'not-applicable',
        required: false,
        tenancyType: 'written',
        notes: 'Will be provided with new tenancy agreement',
      },
    },
  },
]
