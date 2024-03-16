import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
} from "drizzle-orm"
import {
  boolean,
  decimal,
  jsonb,
  pgTableCreator,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

const pgTable = pgTableCreator((name) => `saasdata_${name}`)

export const lifetimeRedeemCodes = pgTable("lifetime_redeem_codes", {
  code: uuid("code").primaryKey().defaultRandom(),
  usedBy: uuid("used_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type LifetimeRedeemCode = InferSelectModel<typeof lifetimeRedeemCodes>
export type LifetimeRedeemCodeInsert = InferInsertModel<
  typeof lifetimeRedeemCodes
>

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),

  isLifetime: boolean("is_lifetime").notNull().default(false),
  subscriptionId: text("subscription_id"),
  customerId: text("customer_id"),
  variantId: text("variant_id"),
  currentPeriodEnd: text("current_period_end"),

  otp: text("otp"),
  otpSentAt: timestamp("otp_sent_at"),

  cancelled: boolean("cancelled").notNull().default(false),
  expired: boolean("expired").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type User = InferSelectModel<typeof users>
export type UserInsert = InferInsertModel<typeof users>

export const companies = pgTable("companies", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  description: text("description"),
  yearOfIncorporation: smallint("year_of_incorporation"),
  claimed_status: text("claimed_status"),
  banner_image: text("banner_image"),

  logo: text("logo"),
  domain: text("domain").notNull(),

  socialsId: text("socials_id"),
  industryId: text("industry_id"),

  country: text("country"),
  state: text("state"),
  city: text("city"),
  street: text("street"),
  postal: text("postal"),

  metricsId: text("metrics_id").notNull(),

  sources: text("sources").array(),

  updatedAt: timestamp("updated_at"),

  public: boolean("public").notNull().default(false),
})

export type Company = InferSelectModel<typeof companies>
export type CompanyInsert = InferInsertModel<typeof companies>

export const company_pricing = pgTable("company_pricing", {
  companyId: text("company_id").primaryKey(),

  name: text("name"),
  pricing_user: text("pricing_user"),
  
  pricing: text("pricing"),
  description: text("description"),
  details: text("details").array(),
})

export const companies_socials = pgTable("companies_socials", {
  companyId: text("company_id").primaryKey(),

  website: text("website"),
  linkedIn: text("linkedIn"),
  crunchbase: text("crunchbase"),
  twitter: text("twitter"),
  youtube: text("youtube"),
  facebook: text("facebook"),
})

export type CompanySocials = InferSelectModel<typeof companies_socials>
export type CompanySocialsInsert = InferInsertModel<typeof companies_socials>

export const companies_metrics = pgTable("companies_metrics", {
  companyId: text("company_id").primaryKey(),

  funding: decimal("funding").notNull(),
  valuation: decimal("valuation").notNull(),
  revenue: decimal("revenue"),
  teamSize: decimal("team_size"),
  acv: decimal("acv"),
  arpu: decimal("arpu"),
  mrr: decimal("mrr"),
  paybackPeriodMonths: decimal("payback_period_months"),
  revenuePerEmployee: decimal("revenue_per_employee"),
  customersCount: decimal("customers_count"),
  teamEngineers: decimal("team_engineers"),
  teamMarketing: decimal("team_marketing"),
  teamSales: decimal("team_sales"),
  nrr: decimal("nrr"),
  grossChurn: decimal("gross_churn"),
  expansionRevenue: decimal("expansion_revenue"),
  cac: decimal("cac"),
  dbc: decimal("dbc"),
  pastReps: decimal("past_reps"),
  profitable: decimal("profitable"),
  ltvMonths: decimal("ltv_months"),
  ltvDollars: decimal("ltv_dollars"),

  capturedAt: timestamp("captured_at"),
})

export type CompanyMetrics = InferSelectModel<typeof companies_metrics>
export type CompanyMetricsInsert = InferInsertModel<typeof companies_metrics>

export const companies_metrics_history = pgTable("companies_metrics_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: text("company_id").notNull(),

  name: text("name").notNull(),
  value: decimal("value").notNull(),

  capturedAt: timestamp("captured_at").notNull(),
})

export type CompanyMetricsHistory = InferSelectModel<
  typeof companies_metrics_history
>
export type CompanyMetricsHistoryInsert = InferInsertModel<
  typeof companies_metrics_history
>

export const companies_funding_history = pgTable("companies_funding_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: text("company_id").notNull(),

  funding: decimal("funding"),
  valuation: decimal("valuation"),
  description: text("description"),

  capturedAt: timestamp("captured_at").notNull(),
})

export type CompanyFundingHistory = InferSelectModel<
  typeof companies_funding_history
>
export type CompanyFundingHistoryInsert = InferInsertModel<
  typeof companies_funding_history
>

export const competitors = pgTable(
  "competitors",
  {
    companyId: text("company_id").notNull(),
    competitorId: text("competitor_id").notNull(),
  },
  (table) => {
    return {
      pkWithCustomName: primaryKey({
        name: "id",
        columns: [table.companyId, table.competitorId],
      }),
    }
  },
)

export type Competitor = InferSelectModel<typeof competitors>
export type CompetitorInsert = InferInsertModel<typeof competitors>

export const industries = pgTable("industries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parent_industry: text("parent_industry"),
})

export type Industry = InferSelectModel<typeof industries>
export type IndustryInsert = InferInsertModel<typeof industries>

export const founders = pgTable("founders", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull(),

  name: text("name").notNull(),
  yob: smallint("year_of_birth"),
  biography: text("biography"),

  email: text("email"),
  personalEmail: text("personal_email"),
  linkedIn: text("linkedin"),

  title: text("title").notNull(),
  isCeo: boolean("is_ceo").notNull(),

  additionalInformation: jsonb("additional_information").$type<{
    sleepHours?: string | null

    favoriteCeo?: string | null
    favoriteBook?: string | null
    favoriteTool?: string | null

    adviceTo20Yo?: string | null

    married?: boolean | null
    kids?: string | null
  }>(),
})

export type Founder = InferSelectModel<typeof founders>
export type FounderInsert = InferInsertModel<typeof founders>

export const companiesRelations = relations(companies, ({ one, many }) => ({
  socials: one(companies_socials, {
    fields: [companies.socialsId],
    references: [companies_socials.companyId],
  }),
  industry: one(industries, {
    fields: [companies.industryId],
    references: [industries.id],
  }),
  metrics: one(companies_metrics, {
    fields: [companies.metricsId],
    references: [companies_metrics.companyId],
  }),
  metricsHistory: many(companies_metrics_history),
  fundingHistory: many(companies_funding_history),
  founders: many(founders),
  pricings: many(company_pricing)
}))

export const companiesSocialsRelations = relations(
  companies_socials,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [companies_socials.companyId],
      references: [companies.id],
    }),
  }),
)

export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  company: one(companies, {
    fields: [competitors.companyId],
    references: [companies.id],
  }),
  competitor: one(companies, {
    fields: [competitors.competitorId],
    references: [companies.id],
  }),
}))

export const industriesRelations = relations(industries, ({ one, many }) => ({
  companies: many(companies),
}))

export const companiesMetricsRelations = relations(
  companies_metrics,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [companies_metrics.companyId],
      references: [companies.id],
    }),
  }),
)

export const companiesMetricsHistoryRelations = relations(
  companies_metrics_history,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [companies_metrics_history.companyId],
      references: [companies.id],
    }),
  }),
)

export const companiesFundingHistoryRelations = relations(
  companies_funding_history,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [companies_funding_history.companyId],
      references: [companies.id],
    }),
  }),
)

export const foundersRelations = relations(founders, ({ one, many }) => ({
  company: one(companies, {
    fields: [founders.companyId],
    references: [companies.id],
  }),
}))
