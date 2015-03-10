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
	, 'stages': []
	, 'legislators': []
}

# add an array of parties to top level of the output
with psycopg2.connect(conn_string) as conn:
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
		cur.execute('''SELECT id, LOWER(name) as name
						FROM legislative.legislative_parties;''')

		for party in cur.fetchall():
			output['parties'].append(party)

# add an array of stages to top level of the output
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
			stage['num_bills'] = 0

			# for each party, add a key to hold the number of bills sponsored by that party at that stage
			for party in output['parties']:

				stage['num_' + party['name'] + '_spon'] = 0

			output['stages'].append(stage)

# add an array of legislators
with psycopg2.connect(conn_string) as conn:
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
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

					cur.execute(open('sql/count_spon_bills.sql', 'r').read(), {
						  'legislator_id': leg['id']
						, 'session_id': ses['session_id']
						, 'stage_id': stage['id']
						, 'sponsor_type_id': 16 # "co-sponsor" sponsor_type
					})

					ses['num_' + stage['name'][:3] + '_cospon'] = cur.fetchone()['count']

				# for each session, get the number of bills co-sponsored by that legislator that made it to that stage

				leg['sessions'].append(ses)

			output['legislators'].append(leg)


# write to json_file
jsonFile = open('js/data.json', 'w')
jsonFile.write(json.dumps(output))
jsonFile.close()





