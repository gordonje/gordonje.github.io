SELECT
	  %(stage_abbrv)s as stage
	, legislator_appointments.legislator_id
	, districts.name::INT as district
	, legislative_parties.name as party
	, os_name as os_chamber
	, chambers.title as title
	, chambers.abbr_title as abbr_title
	, sessions.id as session_id
	, sessions.display_name as session
	, sessions.name::INT as session_year 
	, COALESCE(introd_spon.bill_count, 0) as introd_spon_count
	, COALESCE(introd_cospon.bill_count, 0) as introd_cospon_count
	, COALESCE(stage_spon.bill_count, 0) as stage_spon_count
	, COALESCE(stage_cospon.bill_count, 0) as stage_cospon_count
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
LEFT JOIN (
	SELECT 
		  legislator_id
		, session_id
		, COUNT(*) bill_count
	FROM bills.bills
	JOIN bills.bill_sponsors
	ON bills.id = bill_sponsors.bill_id
	WHERE bill_sponsors.sponsor_type_id = 15 -- "primary" sponsor_type_id
	GROUP BY 1, 2 
) AS introd_spon
ON legislator_appointments.legislator_id = introd_spon.legislator_id
AND sessions.id = introd_spon.session_id
LEFT JOIN (
	SELECT 
		  legislator_id
		, session_id
		, COUNT(*) bill_count
	FROM bills.bills
	JOIN bills.bill_sponsors
	ON bills.id = bill_sponsors.bill_id
	WHERE bill_sponsors.sponsor_type_id = 16 -- "co-sponsor" sponsor_type_id
	GROUP BY 1, 2 
) AS introd_cospon
ON legislator_appointments.legislator_id = introd_cospon.legislator_id
AND sessions.id = introd_cospon.session_id
LEFT JOIN (
	SELECT 
		  legislator_id
		, session_id
		, COUNT(*) bill_count
	FROM bills.bills
	JOIN bills.bill_sponsors
	ON bills.id = bill_sponsors.bill_id
	WHERE bill_sponsors.sponsor_type_id = 15 -- "primary" sponsor_type_id
	AND bills.id IN (
		SELECT bill_id
		FROM bills.bill_actions
		JOIN bills.action_types
		ON bill_actions.id = action_types.action_id
		WHERE action_types.os_action_type_id = %(stage_id)s
	)
	GROUP BY 1, 2 
) AS stage_spon
ON legislator_appointments.legislator_id = stage_spon.legislator_id
AND sessions.id = stage_spon.session_id
LEFT JOIN (
	SELECT 
		  legislator_id
		, session_id
		, COUNT(*) bill_count
	FROM bills.bills
	JOIN bills.bill_sponsors
	ON bills.id = bill_sponsors.bill_id
	WHERE bill_sponsors.sponsor_type_id = 16 -- "co-sponsor" sponsor_type_id
	AND bills.id IN (
		SELECT bill_id
		FROM bills.bill_actions
		JOIN bills.action_types
		ON bill_actions.id = action_types.action_id
		WHERE action_types.os_action_type_id = %(stage_id)s
	)
	GROUP BY 1, 2 
) AS stage_cospon
ON legislator_appointments.legislator_id = stage_cospon.legislator_id
AND sessions.id = stage_cospon.session_id
ORDER BY legislator_id, sessions.name::INT;