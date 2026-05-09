/*
  # Tattoo Studio Booking System

  1. New Tables
    - `bookings`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `surname` (text, required)
      - `phone` (text, required)
      - `description` (text, appointment notes)
      - `booking_date` (date, required)
      - `booking_time` (text, required, e.g. "14:00")
      - `status` (text, default 'pending')
      - `created_at` (timestamptz, auto)

  2. Security
    - RLS enabled on bookings table
    - Anon INSERT: validates name, surname, phone length + date is today or future + status must be 'pending'
    - Anon SELECT: only future bookings (today onwards) — for availability checking without exposing historical data
    - Authenticated SELECT: all bookings (admin access)
    - Authenticated UPDATE: change status within allowed values (admin only)
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  surname text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  description text DEFAULT '',
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (
    length(trim(name)) >= 2
    AND length(trim(surname)) >= 2
    AND length(trim(phone)) >= 7
    AND booking_date >= current_date
    AND status = 'pending'
  );

CREATE POLICY "Public can check future availability"
  ON bookings FOR SELECT
  TO anon
  USING (booking_date >= current_date);

CREATE POLICY "Admin can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status IN ('pending', 'confirmed', 'cancelled')
  );
