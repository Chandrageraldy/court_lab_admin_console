// ─────────────────────────────────────────────────────────
// Example Service Hook Template
//
// ✏️ HOW TO CREATE A NEW SERVICE HOOK:
//
//   1. Copy this file and rename it (e.g. useProductService.ts)
//   2. Replace "ExampleItem" with your entity name
//   3. Replace "ExampleItems" with your Supabase table name
//   4. Update the fields in the ExampleItem type (or better:
//      create a dedicated type file in src/types/)
//   5. Import and use the hook in your page component
//
// ✏️ PATTERN USED IN THIS PROJECT:
//   - Each entity gets its own hook file: useXxxService.ts
//   - Hooks call supabase directly (no separate service layer)
//   - All hooks return an object with named async functions
//   - Errors are caught and logged; the function returns null
//
// ✏️ USAGE IN A PAGE:
//   const { getAll, create, update, remove } = useExampleService();
//
//   useEffect(() => {
//     setIsLoading(true);
//     getAll().then((data) => {
//       if (data) setItems(data);
//       setIsLoading(false);
//     });
//   }, []);
// ─────────────────────────────────────────────────────────

import { supabase } from '../services/supabase';

// ✏️ Replace this inline type with an import from src/types/
interface ExampleItem {
  id: string;
  name: string;
  created_at: string;
  is_deleted: boolean;
}

export const useExampleService = () => {
  // ─── READ ──────────────────────────────────────────────
  const getAll = async (): Promise<ExampleItem[] | null> => {
    try {
      const { data, error } = await supabase
        .from('ExampleItems')        // ✏️ Your Supabase table name
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) { console.error('getAll error:', error); return null; }
      return data as ExampleItem[];
    } catch (err) {
      console.error('getAll error:', err);
      return null;
    }
  };

  // ─── CREATE ────────────────────────────────────────────
  const create = async (payload: Omit<ExampleItem, 'id' | 'created_at' | 'is_deleted'>): Promise<ExampleItem | null> => {
    try {
      const { data, error } = await supabase
        .from('ExampleItems')
        .insert([payload])
        .select()
        .single();

      if (error) { console.error('create error:', error); return null; }
      return data as ExampleItem;
    } catch (err) {
      console.error('create error:', err);
      return null;
    }
  };

  // ─── UPDATE ────────────────────────────────────────────
  const update = async (id: string, payload: Partial<ExampleItem>): Promise<ExampleItem | null> => {
    try {
      const { data, error } = await supabase
        .from('ExampleItems')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) { console.error('update error:', error); return null; }
      return data as ExampleItem;
    } catch (err) {
      console.error('update error:', err);
      return null;
    }
  };

  // ─── SOFT DELETE ───────────────────────────────────────
  // Sets is_deleted = true instead of a real DELETE
  // ✏️ If you prefer hard delete, use .delete() instead of .update()
  const remove = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ExampleItems')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) { console.error('remove error:', error); return false; }
      return true;
    } catch (err) {
      console.error('remove error:', err);
      return false;
    }
  };

  return { getAll, create, update, remove };
};
