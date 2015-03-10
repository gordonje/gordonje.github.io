SELECT
	  districts.name::INT as district
	, legislative_parties.name as party
	, os_name as os_chamber
	, chambers.title as title
	, chambers.abbr_title as abbr_title
	, sessions.id as session_id
	, sessions.display_name as session
	, sessions.name::INT as session_year 
FROM legislative.legislator_appointments
JOIN legislative.districts
ON districts.id = district_id
JOIN legislative.legislative_terms
ON legislative_terms.id = term_id
JOIN legislative.legislative_parties
ON legislative_parties.id = party_id
JOIN legislative.chambers
ON chambers.id = chamber_id
JOIN legislative.sessions
ON legislative_terms.id = sessions.term_id
WHERE legislator_id = %s;