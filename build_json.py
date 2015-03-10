from sys import argv
from getpass import getpass
import psycopg2
import psycopg2.extras
from datetime import datetime
import json

# connect to the database, prompt if not provided
try:
	db = argv[1]
except IndexError:
	db = raw_input("Enter db name:")

try:
	user = argv[2]
except IndexError:
	user = raw_input("Enter db user:")

try:
	password = argv[3]
except IndexError:
	password = getpass("Enter db password:")

conn_string = "dbname=%(db)s user=%(user)s password=%(password)s" % {"db": db, "user": user, "password": password}


output =  {
	  'last_updated': str(datetime.now())
	, 'parties': []
}

# add an array of parties to top level of the output
with psycopg2.connect(conn_string) as conn:
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
		cur.execute('''SELECT id, LOWER(name) as name
						FROM legislative.legislative_parties;''')

		for party in cur.fetchall():
			output['parties'].append(party)

# add a top-level node for each stage
with psycopg2.connect(conn_string) as conn:
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
		cur.execute('''SELECT 
							  id
							, display_name as name
							, SUBSTRING(LOWER(display_name) from 0 for 4) as abbrv
							, position
						FROM bills.os_action_types
						WHERE display_name IS NOT NULL
						ORDER BY position;''')

		for stage in cur.fetchall():
			# for the total number of bills at this stage
			out_stage = {
				  'position': stage['position']
				, 'name': stage['name']
				, 'num_bills': 0
			}

			# for each party, add a key to hold the number of bills sponsored by that party at that stage
			for party in output['parties']:

				out_stage['num_' + party['name'] + '_spon'] = 0

			output[stage.id] = out_stage

		cur.execute(open('sql/select_legislators.sql', 'r').read())

		# for each legislator, add an array of sessions
		for leg in cur.fetchall():

			leg["sessions"] = []

			cur.execute(open('sql/select_sessions.sql', 'r').read(), (leg['id'], ))

			# append the sessions of each legislator
			for ses in cur.fetchall():

				# for each session, get the number of bills sponsored by that legislator that made it to that stage
				for stage in output['stages']:

					cur.execute(open('sql/count_spon_bills.sql', 'r').read(), {
						  'legislator_id': leg['id']
						, 'session_id': ses['session_id']
						, 'stage_id': stage['id']
						, 'sponsor_type_id': 15 # "primary" sponsor_type
					})

					ses['num_' + stage['name'][:3] + '_spon'] = cur.fetchone()['count']

				# for each session, get the number of bills co-sponsored by that legislator that made it to that stage
					cur.execute(open('sql/count_spon_bills.sql', 'r').read(), {
						  'legislator_id': leg['id']
						, 'session_id': ses['session_id']
						, 'stage_id': stage['id']
						, 'sponsor_type_id': 16 # "co-sponsor" sponsor_type
					})

					ses['num_' + stage['name'][:3] + '_cospon'] = cur.fetchone()['count']

				leg['sessions'].append(ses)

				leg['spon_total']

			output['legislators'].append(leg)

for stage in output['stages']:

	output['stages']['legislators'] = []

	for legislator in output['stages']:

		out_leg = {
			  'id': legislator['id']
			, 'spon_total': 0
			, 'stage_total': 0
		}

		for session in legislator["sessions"]:

			out_leg['spon_total'] += session.num_int_spon
			if stage["abbrv"] == '1st':
				out_leg['stage_total'] += session.num_1st_spon
			elif stage["abbrv"] == '2nd':
				out_leg['stage_total'] += session.num_2nd_spon
			elif stage["abbrv"] == 'ref':
				out_leg['stage_total'] += session.num_ref_spon
			elif stage["abbrv"] == '3rd':
				out_leg['stage_total'] += session.num_3rd_spon
			elif stage["abbrv"] == 'pas':
				out_leg['stage_total'] += session.num_pas_spon
			elif stage["abbrv"] == 'sig':
				out_leg['stage_total'] += session.num_sig_spon

		output['stage']['legislators'].append(out_leg)

# write to json_file
jsonFile = open('js/data2.json', 'w')
jsonFile.write(json.dumps(output))
jsonFile.close()





