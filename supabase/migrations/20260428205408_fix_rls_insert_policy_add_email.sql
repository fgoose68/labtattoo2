/*
  # Fix RLS INSERT policy for bookings table

  ## Problem
  The existing INSERT policy does not account for the new `email` column
  added in a previous migration. The WITH CHECK constraint was not updated,
  causing "new row violates row-level security policy" errors when clients
  submit a booking with an email address.

  ## Changes
  - Drop the old "Anyone can create a booking" INSERT policy
  - Re-create it with the same validation rules, now also allowing `email`
    to be an empty string or a basic valid format (no server-side regex
    needed — validation is done client-side; we just ensure status = pending)
*/

DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;

CREATE POLICY "Anyone can create a booking"
  ON bookings
  FOR INSERT
  TO anon
  WITH CHECK (
    length(trim(name))    >= 2 AND
    length(trim(surname)) >= 2 AND
    length(trim(phone))   >= 7 AND
    booking_date >= CURRENT_DATE AND
    status = 'pending'
  );
