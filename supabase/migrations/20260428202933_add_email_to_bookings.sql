/*
  # Aggiungi colonna email alla tabella bookings

  1. Modifiche
    - `bookings`: aggiunta colonna `email` (text, nullable) per memorizzare
      l'indirizzo email del cliente inserito in fase di prenotazione.

  2. Note
    - La colonna è nullable per non rompere le prenotazioni esistenti.
    - Nessuna modifica alle policy RLS esistenti necessaria.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN email text DEFAULT '';
  END IF;
END $$;
