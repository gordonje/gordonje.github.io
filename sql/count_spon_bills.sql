
SELECT COUNT(*)
FROM bills.bills
JOIN bills.bill_sponsors
ON bills.id = bill_sponsors.bill_id
WHERE bill_sponsors.legislator_id = %(legislator_id)s 
AND bills.session_id = %(session_id)s
AND bill_sponsors.sponsor_type_id = %(sponsor_type_id)s
AND bills.id IN (
        SELECT bill_id
        FROM bills.bill_actions
        JOIN bills.action_types
        ON bill_actions.id = action_types.action_id
        WHERE action_types.os_action_type_id = %(stage_id)s
);



