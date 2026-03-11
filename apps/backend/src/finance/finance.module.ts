import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    // Phase 1
    FinTenantSettings, FinAccount, FinFiscalYear, FinFiscalPeriod,
    FinJournal, FinJournalLine, FinLedgerBalance,
    FinCostCentre, FinTaxRate, FinApproval,
    // Phase 2
    FinFamilyAccount, FinPayer, FinFeeStructure, FinFeeItem,
    FinDiscountRule, FinLearnerBursary, FinInvoice, FinInvoiceLine,
    FinReceipt, FinCreditNote, FinPaymentPlan, FinPaymentPlanSchedule, FinHold,
    // Phase 3
    FinPaymentProviderConfig, FinPayment, FinPaymentEvent,
    FinSavedPaymentMethod, FinBankAccount, FinBankTransaction, FinReconciliation,
    // Phase 4
    FinVendor, FinPurchaseOrder, FinPurchaseOrderLine,
    FinVendorBill, FinVendorPayment,
    FinBudget, FinBudgetLine, FinAsset,
    FinPettyCashFund, FinPettyCashTransaction,
    // Phase 5
    FinFund, FinWallet, FinWalletTransaction,
    // Phase 6
    FinZohoConfig, FinZohoMapping, FinZohoSyncLog,
} from './entities';
import { FinSettingsController } from './controllers/fin-settings.controller';
import { FinAccountsController } from './controllers/fin-accounts.controller';
import { FinJournalsController } from './controllers/fin-journals.controller';
import { FinPeriodsController } from './controllers/fin-periods.controller';
import { FinReportsController } from './controllers/fin-reports.controller';
import { FinBillingController } from './controllers/fin-billing.controller';
import { FinVendorsController } from './controllers/fin-vendors.controller';
import { FinAssetsController } from './controllers/fin-assets.controller';
import { FinWalletsController } from './controllers/fin-wallets.controller';
import { LedgerService } from './services/ledger.service';
import { PeriodService } from './services/period.service';
import { NumberingService } from './services/numbering.service';

const ALL_ENTITIES = [
    // Phase 1
    FinTenantSettings, FinAccount, FinFiscalYear, FinFiscalPeriod,
    FinJournal, FinJournalLine, FinLedgerBalance,
    FinCostCentre, FinTaxRate, FinApproval,
    // Phase 2
    FinFamilyAccount, FinPayer, FinFeeStructure, FinFeeItem,
    FinDiscountRule, FinLearnerBursary, FinInvoice, FinInvoiceLine,
    FinReceipt, FinCreditNote, FinPaymentPlan, FinPaymentPlanSchedule, FinHold,
    // Phase 3
    FinPaymentProviderConfig, FinPayment, FinPaymentEvent,
    FinSavedPaymentMethod, FinBankAccount, FinBankTransaction, FinReconciliation,
    // Phase 4
    FinVendor, FinPurchaseOrder, FinPurchaseOrderLine,
    FinVendorBill, FinVendorPayment,
    FinBudget, FinBudgetLine, FinAsset,
    FinPettyCashFund, FinPettyCashTransaction,
    // Phase 5
    FinFund, FinWallet, FinWalletTransaction,
    // Phase 6
    FinZohoConfig, FinZohoMapping, FinZohoSyncLog,
];

@Module({
    imports: [
        TypeOrmModule.forFeature(ALL_ENTITIES),
    ],
    controllers: [
        FinSettingsController,
        FinAccountsController,
        FinJournalsController,
        FinPeriodsController,
        FinReportsController,
        FinBillingController,
        FinVendorsController,
        FinAssetsController,
        FinWalletsController,
    ],
    providers: [
        LedgerService,
        PeriodService,
        NumberingService,
    ],
    exports: [
        LedgerService,
        PeriodService,
        NumberingService,
    ],
})
export class FinanceModule {}
