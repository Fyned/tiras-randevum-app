import { supabase } from '@/lib/supabaseClient';

/**
 * Generates a random alphanumeric code part.
 * @returns {string} A 4-character uppercase alphanumeric string.
 */
function generateCodePart() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let part = '';
  for (let i = 0; i < 4; i++) {
    part += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return part;
}

/**
 * Generates a unique barber code in the format "TR-XXXX-XXXX".
 * It checks the 'barbers' table in Supabase to ensure the code is unique.
 * Retries up to 10 times if a collision is found.
 * @returns {Promise<string>} A promise that resolves to a unique barber code.
 * @throws {Error} If a unique code cannot be generated after 10 attempts or if a Supabase error occurs.
 */
export async function generateUniqueBarberCode() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = `TR-${generateCodePart()}-${generateCodePart()}`;
    
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('public_code')
        .eq('public_code', code)
        .single();

      // If no data is found, the code is unique.
      // Supabase with .single() returns data: null and no error if no row is found.
      if (!data) {
        return code;
      }
      // If data is found, the code is a duplicate, so we loop again.

    } catch (error) {
      // Some Supabase client versions might throw an error when .single() finds no rows.
      // We check for the specific "No rows found" error code.
      if (error.code === 'PGRST116') {
        return code; // This means the code is unique.
      }
      // For any other database error, we should stop and report it.
      console.error("Supabase error while checking code uniqueness:", error);
      throw new Error(`Veritabanı hatası: ${error.message}`);
    }

    attempts++;
  }

  throw new Error(`Benzersiz berber kodu ${maxAttempts} denemeden sonra üretilemedi. Lütfen tekrar deneyin.`);
}