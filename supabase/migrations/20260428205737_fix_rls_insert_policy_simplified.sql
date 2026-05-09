/*
  # Semplifica la policy RLS per INSERT su bookings

  ## Problema
  La policy WITH CHECK precedente era troppo restrittiva e causava errori
  per utenti anonimi anche con dati validi. La validazione dei campi
  (lunghezza nome, telefono, ecc.) è già gestita lato client e non serve
  duplicarla in RLS — RLS deve solo controllare i vincoli di sicurezza.

  ## Modifiche
  - Drop della policy INSERT esistente
  - Nuova policy semplificata: chiunque (anon) può inserire purché
    status = 'pending' (impedisce inserimenti con stato già confermato/annullato)
*/

DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;

CREATE POLICY "Anyone can create a booking"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (status = 'pending');
