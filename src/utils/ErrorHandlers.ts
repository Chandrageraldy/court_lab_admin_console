import type { PostgrestError } from "@supabase/supabase-js";

export function handleSupabaseError(error: PostgrestError): Error {
  let message = "Something went wrong. Please try again.";

  switch (error.code) {
    case "42501":
      message = "You do not have permission to perform this action.";
      break;
    default:
      if (error.message) message = error.message;
  }

  return new Error(message);
}
