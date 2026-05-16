-- Add room/bed/bath fields and replace price_per_night with total_price

ALTER TABLE house_candidates
  DROP COLUMN price_per_night,
  ADD COLUMN total_price numeric,
  ADD COLUMN bedrooms integer,
  ADD COLUMN sleeping_areas integer,
  ADD COLUMN beds integer,
  ADD COLUMN bathrooms numeric;
