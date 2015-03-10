SELECT 
        legislators.id
      , name_first
      , name_middle
      , name_last
      , name_suffix
      , nickname
      , photo_url
      , chambers.name as current_chamber
      , title as current_title
      , abbr_title as current_abbr_title
      , districts.name::INT as current_district
      , legislative_parties.name as current_party
      , legislators.is_active
FROM legislative.legislators
JOIN legislative.legislator_appointments
ON legislators.id = legislator_id
AND term_id = 3 -- the current legislative term
JOIN legislative.districts
ON districts.id = district_id
JOIN legislative.legislative_terms
ON legislative_terms.id = term_id
JOIN legislative.legislative_parties 
ON legislator_appointments.party_id = legislative_parties.id
JOIN legislative.chambers
ON chambers.id = chamber_id;