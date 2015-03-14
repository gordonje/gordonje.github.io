SELECT 
        legislators.id
      , name_first
      , name_middle
      , name_last
      , name_suffix
      , nickname
      , photo_url
      , legislators.is_active
      , last_appoint.session_count
      , chambers.name AS last_chamber
      , title AS last_title
      , abbr_title AS last_abbr_title
      , districts.name::INT AS last_district
      , legislative_parties.name AS last_party
FROM legislative.legislators
JOIN (
      SELECT 
              legislator_id
            , MAX(id) as last_appoint_id
            , COUNT(*) AS session_count
      FROM legislative.legislator_appointments
      GROUP BY 1
) AS last_appoint
ON legislators.id = last_appoint.legislator_id
JOIN legislative.legislator_appointments
ON legislator_appointments.id = last_appoint_id
-- AND term_id = 3 -- the current legislative term
JOIN legislative.districts
ON districts.id = district_id
JOIN legislative.legislative_terms
ON legislative_terms.id = term_id
JOIN legislative.legislative_parties 
ON legislator_appointments.party_id = legislative_parties.id
JOIN legislative.chambers
ON chambers.id = chamber_id;