import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
} from "drizzle-orm"
import {
  boolean,
  decimal,
  pgTableCreator,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

const pgTable = pgTableCreator((name) => `saaskart_${name}`)

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),

  isAdmin: boolean("is_admin").notNull().default(false),
  name: text("name"),
  phoneNumber: text("phone_number"),

  linkedinLink: text("linkedin_link"),
  profileImage: text("profile_image"),

  passwordHash: text("password_hash").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type User = InferSelectModel<typeof users>
export type UserInsert = InferInsertModel<typeof users>

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  description: text("description"),
  yearOfIncorporation: smallint("year_of_incorporation"),
  claimed_status: text("claimed_status"),
  banner_image: text("banner_image"),

  logo: text("logo"),
  domain: text("domain"),

  socialsId: uuid("socials_id"),

  country: text("country"),
  state: text("state"),
  city: text("city"),
  street: text("street"),
  postal: text("postal"),

  metricsId: uuid("metrics_id").notNull(),

  sources: text("sources").array(),

  updatedAt: timestamp("updated_at"),
})

export type Company = InferSelectModel<typeof companies>
export type CompanyInsert = InferInsertModel<typeof companies>

export const company_pricing = pgTable("company_pricing", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),

  name: text("name"),

  pricing: text("pricing"),
  description: text("description"),
  details: text("details").array(),

  hasOffer: boolean("hasOffer").default(false),
  offerTitle: text("offerTitle"),
  offerDiscriptoin: text("offerDiscriptoin"),
  offerLink: text("offerLink"),
  offerCoupon: text("offerCoupon"),
})

export const companies_socials = pgTable("companies_socials", {
  companyId: uuid("company_id").primaryKey(),

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
  companyId: uuid("company_id").primaryKey(),

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
  companyId: uuid("company_id").notNull(),

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
  companyId: uuid("company_id").notNull(),

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
    companyId: uuid("company_id").notNull(),
    competitorId: uuid("competitor_id").notNull(),
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

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: text("name").notNull(),
  slug: text("slug").notNull(),

  parent_category: text("parent_category"),
  category_title: text("category_title"),
  category_header: text("category_header"),
  category_footer: text("category_footer"),
})

export type Category = InferSelectModel<typeof categories>
export type CategoryInsert = InferInsertModel<typeof categories>

export const compinesToCategories = pgTable(
  "compines-to-categories",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.categoryId, t.companyId] }),
  }),
)

export type CompinesToCategory = InferSelectModel<typeof compinesToCategories>
export type CompinesToCategoryInsert = InferInsertModel<
  typeof compinesToCategories
>

export const compinesToCategoriesRelations = relations(
  compinesToCategories,
  ({ one }) => ({
    category: one(categories, {
      fields: [compinesToCategories.categoryId],
      references: [categories.id],
    }),
    company: one(companies, {
      fields: [compinesToCategories.companyId],
      references: [companies.id],
    }),
  }),
)

export const companiesRelations = relations(companies, ({ one, many }) => ({
  socials: one(companies_socials, {
    fields: [companies.socialsId],
    references: [companies_socials.companyId],
  }),
  metrics: one(companies_metrics, {
    fields: [companies.metricsId],
    references: [companies_metrics.companyId],
  }),
  metricsHistory: many(companies_metrics_history),
  fundingHistory: many(companies_funding_history),
  pricings: many(company_pricing),
  compinesToCategories: many(compinesToCategories),
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

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  compinesToCategories: many(compinesToCategories),
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

export const companiesPricingRelations = relations(
  company_pricing,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [company_pricing.companyId],
      references: [companies.id],
    }),
  }),
)
