/*
  # Aggiunge policy INSERT per utenti authenticated su bookings

  ## Problema
  La policy INSERT esistente copre solo il ruolo `anon`.
  Se l'utente visita la pagina di prenotazione mentre è ancora
  loggato come admin (sessione authenticated attiva), Supabase
  usa il ruolo `authenticated` che non ha alcuna policy INSERT,
  causando "new row violates row-level security policy".

  ## Modifiche
  - Aggiunge policy INSERT per `authenticated` con la stessa
    regola semplice: status deve essere 'pending'
*/

CREATE POLICY "Authenticated can create a booking"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (status = 'pending');
