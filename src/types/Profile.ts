// ─────────────────────────────────────────────────────────
// Profile Type
//
// ✏️ HOW TO USE:
//   This type maps to a "Profiles" table in Supabase.
//   When starting a new project, update the fields below
//   to match the columns in your own "Profiles" table.
//
// ✏️ Minimum recommended Supabase table schema (SQL):
//   CREATE TABLE "Profiles" (
//     user_id    UUID PRIMARY KEY REFERENCES auth.users(id),
//     first_name TEXT NOT NULL,
//     last_name  TEXT NOT NULL,
//     email      TEXT NOT NULL,
//     role       TEXT NOT NULL DEFAULT 'user',
//     created_at TIMESTAMPTZ DEFAULT now(),
//     is_deleted BOOLEAN DEFAULT false
//   );
// ─────────────────────────────────────────────────────────

export interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  // ✏️ You can extend this with more roles (e.g. 'admin' | 'editor' | 'viewer')
  role: string;
  created_at: string;
  is_deleted: boolean;
}
