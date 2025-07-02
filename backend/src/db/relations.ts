import { relations } from "drizzle-orm/relations";
import { usersTable, accountsTable } from "./schema";

export const accountsRelations = relations(accountsTable, ({one}) => ({
	user: one(usersTable, {
		fields: [accountsTable.userId],
		references: [usersTable.id]
	}),
}));

export const usersRelations = relations(usersTable, ({many}) => ({
	accounts: many(accountsTable),
}));