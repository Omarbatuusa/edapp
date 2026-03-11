import { FinAccountType, FinAccountSubType } from '../entities';

export interface DefaultAccountSeed {
    code: string;
    name: string;
    account_type: FinAccountType;
    sub_type: FinAccountSubType;
    is_header: boolean;
    is_system: boolean;
    parent_code?: string;
    sort_order: number;
}

export const DEFAULT_CHART_OF_ACCOUNTS: DefaultAccountSeed[] = [
    // ═══ ASSETS ═══
    { code: '1000', name: 'Assets', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.OTHER_ASSET, is_header: true, is_system: true, sort_order: 100 },

    // Current Assets
    { code: '1100', name: 'Current Assets', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.CURRENT_ASSET, is_header: true, is_system: false, parent_code: '1000', sort_order: 110 },
    { code: '1110', name: 'Bank — Primary', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.BANK, is_header: false, is_system: true, parent_code: '1100', sort_order: 111 },
    { code: '1120', name: 'Bank — Savings', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.BANK, is_header: false, is_system: false, parent_code: '1100', sort_order: 112 },
    { code: '1130', name: 'Cash on Hand', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.CASH, is_header: false, is_system: false, parent_code: '1100', sort_order: 113 },
    { code: '1140', name: 'Petty Cash', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.CASH, is_header: false, is_system: false, parent_code: '1100', sort_order: 114 },
    { code: '1150', name: 'Accounts Receivable — Fees', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.ACCOUNTS_RECEIVABLE, is_header: false, is_system: true, parent_code: '1100', sort_order: 115 },
    { code: '1160', name: 'Accounts Receivable — Other', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.ACCOUNTS_RECEIVABLE, is_header: false, is_system: false, parent_code: '1100', sort_order: 116 },
    { code: '1170', name: 'Prepaid Expenses', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.PREPAID, is_header: false, is_system: false, parent_code: '1100', sort_order: 117 },
    { code: '1180', name: 'Payment Gateway Clearing', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.CURRENT_ASSET, is_header: false, is_system: true, parent_code: '1100', sort_order: 118 },

    // Fixed Assets
    { code: '1500', name: 'Fixed Assets', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.FIXED_ASSET, is_header: true, is_system: false, parent_code: '1000', sort_order: 150 },
    { code: '1510', name: 'Land & Buildings', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.FIXED_ASSET, is_header: false, is_system: false, parent_code: '1500', sort_order: 151 },
    { code: '1520', name: 'Furniture & Equipment', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.FIXED_ASSET, is_header: false, is_system: false, parent_code: '1500', sort_order: 152 },
    { code: '1530', name: 'Vehicles', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.FIXED_ASSET, is_header: false, is_system: false, parent_code: '1500', sort_order: 153 },
    { code: '1540', name: 'IT Equipment', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.FIXED_ASSET, is_header: false, is_system: false, parent_code: '1500', sort_order: 154 },
    { code: '1590', name: 'Accumulated Depreciation', account_type: FinAccountType.ASSET, sub_type: FinAccountSubType.ACCUMULATED_DEPRECIATION, is_header: false, is_system: true, parent_code: '1500', sort_order: 159 },

    // ═══ LIABILITIES ═══
    { code: '2000', name: 'Liabilities', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.OTHER_LIABILITY, is_header: true, is_system: true, sort_order: 200 },

    { code: '2100', name: 'Current Liabilities', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.CURRENT_LIABILITY, is_header: true, is_system: false, parent_code: '2000', sort_order: 210 },
    { code: '2110', name: 'Accounts Payable', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.ACCOUNTS_PAYABLE, is_header: false, is_system: true, parent_code: '2100', sort_order: 211 },
    { code: '2120', name: 'VAT Payable', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.TAX_PAYABLE, is_header: false, is_system: true, parent_code: '2100', sort_order: 212 },
    { code: '2130', name: 'Accrued Expenses', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.ACCRUED, is_header: false, is_system: false, parent_code: '2100', sort_order: 213 },
    { code: '2140', name: 'Deposits Held', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.CURRENT_LIABILITY, is_header: false, is_system: false, parent_code: '2100', sort_order: 214 },
    { code: '2150', name: 'Deferred Revenue — Fees Paid in Advance', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.DEFERRED_REVENUE, is_header: false, is_system: true, parent_code: '2100', sort_order: 215 },
    { code: '2160', name: 'Salaries Payable', account_type: FinAccountType.LIABILITY, sub_type: FinAccountSubType.ACCRUED, is_header: false, is_system: false, parent_code: '2100', sort_order: 216 },

    // ═══ EQUITY ═══
    { code: '3000', name: 'Equity', account_type: FinAccountType.EQUITY, sub_type: FinAccountSubType.OTHER_EQUITY, is_header: true, is_system: true, sort_order: 300 },
    { code: '3100', name: 'Retained Earnings', account_type: FinAccountType.EQUITY, sub_type: FinAccountSubType.RETAINED_EARNINGS, is_header: false, is_system: true, parent_code: '3000', sort_order: 310 },
    { code: '3200', name: 'Opening Balance Equity', account_type: FinAccountType.EQUITY, sub_type: FinAccountSubType.OPENING_BALANCE, is_header: false, is_system: true, parent_code: '3000', sort_order: 320 },

    // ═══ REVENUE ═══
    { code: '4000', name: 'Revenue', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: true, is_system: true, sort_order: 400 },

    { code: '4100', name: 'Tuition Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: true, parent_code: '4000', sort_order: 410 },
    { code: '4110', name: 'Registration Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 411 },
    { code: '4120', name: 'Application Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 412 },
    { code: '4200', name: 'Transport Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 420 },
    { code: '4210', name: 'Hostel / Boarding Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 421 },
    { code: '4220', name: 'Aftercare Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 422 },
    { code: '4230', name: 'Meal / Tuckshop Revenue', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 423 },
    { code: '4300', name: 'Uniform Sales', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 430 },
    { code: '4310', name: 'Book & Stationery Sales', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 431 },
    { code: '4400', name: 'Activity & Extra-Mural Fees', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 440 },
    { code: '4410', name: 'Exam / Assessment Levies', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OPERATING_REVENUE, is_header: false, is_system: false, parent_code: '4000', sort_order: 441 },
    { code: '4500', name: 'Donations & Grants', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OTHER_INCOME, is_header: false, is_system: false, parent_code: '4000', sort_order: 450 },
    { code: '4600', name: 'Interest Income', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OTHER_INCOME, is_header: false, is_system: false, parent_code: '4000', sort_order: 460 },
    { code: '4700', name: 'Rental Income', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OTHER_INCOME, is_header: false, is_system: false, parent_code: '4000', sort_order: 470 },
    { code: '4900', name: 'Other Income', account_type: FinAccountType.REVENUE, sub_type: FinAccountSubType.OTHER_INCOME, is_header: false, is_system: false, parent_code: '4000', sort_order: 490 },

    // ═══ EXPENSES ═══
    { code: '5000', name: 'Expenses', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: true, is_system: true, sort_order: 500 },

    { code: '5100', name: 'Salaries & Wages', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 510 },
    { code: '5110', name: 'Employee Benefits', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 511 },
    { code: '5200', name: 'Teaching Materials & Supplies', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 520 },
    { code: '5210', name: 'Textbooks & Library', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 521 },
    { code: '5220', name: 'Stationery & Printing', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 522 },
    { code: '5300', name: 'Utilities (Water, Electricity, Gas)', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 530 },
    { code: '5310', name: 'Telephone & Internet', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 531 },
    { code: '5400', name: 'Maintenance & Repairs', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 540 },
    { code: '5410', name: 'Cleaning', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 541 },
    { code: '5420', name: 'Security', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 542 },
    { code: '5500', name: 'Transport & Fuel', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 550 },
    { code: '5510', name: 'Catering & Meals', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 551 },
    { code: '5600', name: 'Sports & Recreation', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 560 },
    { code: '5610', name: 'Events & Functions', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 561 },
    { code: '5700', name: 'IT & Software', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 570 },
    { code: '5710', name: 'Lab Supplies', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 571 },
    { code: '5800', name: 'Insurance', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.ADMINISTRATIVE, is_header: false, is_system: false, parent_code: '5000', sort_order: 580 },
    { code: '5810', name: 'Marketing & Advertising', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.ADMINISTRATIVE, is_header: false, is_system: false, parent_code: '5000', sort_order: 581 },
    { code: '5820', name: 'Professional & Legal Fees', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.ADMINISTRATIVE, is_header: false, is_system: false, parent_code: '5000', sort_order: 582 },
    { code: '5830', name: 'Bank Charges & Payment Processing', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.ADMINISTRATIVE, is_header: false, is_system: false, parent_code: '5000', sort_order: 583 },
    { code: '5840', name: 'Audit Fees', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.ADMINISTRATIVE, is_header: false, is_system: false, parent_code: '5000', sort_order: 584 },
    { code: '5900', name: 'Depreciation', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OPERATING_EXPENSE, is_header: false, is_system: true, parent_code: '5000', sort_order: 590 },
    { code: '5990', name: 'Other Expenses', account_type: FinAccountType.EXPENSE, sub_type: FinAccountSubType.OTHER_EXPENSE, is_header: false, is_system: false, parent_code: '5000', sort_order: 599 },
];

export const DEFAULT_TAX_RATES = [
    { code: 'VAT15', label: 'VAT 15%', rate: 15.00, is_default: true },
    { code: 'VAT0', label: 'Zero Rated (0%)', rate: 0.00, is_default: false },
    { code: 'EXEMPT', label: 'VAT Exempt', rate: 0.00, is_default: false },
];
