from sys import argv
from getpass import getpass
import psycopg2
import psycopg2.extras
from datetime import datetime
import json

start_time = datetime.now()
print 'Started at {}'.format(start_time)

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
	, 'stages': {}
	, 'legislators': {}
	, 'sessions': []
}

with psycopg2.connect(conn_string) as conn:
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:

# populate the parties array in output
		
		print "...Getting parties..."

		cur.execute('''SELECT id, name
						FROM legislative.legislative_parties;''')

		for party in cur.fetchall():
			output['parties'].append(party)

# populate the legislators array in output

		print "...Getting distinct legislators..."

		cur.execute(open('sql/select_legislators.sql', 'r').read())

		for leg in cur.fetchall():
			output['legislators'][leg['id']] = leg

# populate the sessions array in output

		# print "...Getting distinct sessions..."

		# cur.execute('''SELECT id, name::INT as year, display_name as name
		# 		FROM legislative.sessions;''')

		# for ses in cur.fetchall():
		# 	output['sessions'].append(ses)

# get each stage

		cur.execute('''SELECT 
						    id
						  , display_name as name
						  , SUBSTRING(LOWER(display_name) from 0 for 4) as abbrv
						  , position
						FROM bills.os_action_types
						WHERE display_name IS NOT NULL
						ORDER BY position;''')

		for stage in cur.fetchall():

			print "...Getting session data for {0}...".format(stage['abbrv'])

			output['stages'][stage['abbrv']] = stage

			cur.execute(open('sql/select_stage_sessions.sql', 'r').read(), {'stage_abbrv': stage['abbrv'], 'stage_id': stage['id']})
			
			for session in cur.fetchall():

				output['sessions'].append(session)


# # write to json_file
jsonFile = open('js/data2.json', 'w')
jsonFile.write(json.dumps(output))
jsonFile.close()

print "fin."
print '(Runtime = {0})'.format(datetime.now() - start_time)			



