from sys import argv
from getpass import getpass
import psycopg2
import psycopg2.extras
from datetime import datetime

class Legislator:
	def __init__(self, **kwargs):
		self.id = get('id')
		self.name_first = get('name_first')
		self.name_middle = get('name_middle')
		self.name_last = get('name_last')
		self.name_suffix = get('name_suffix')
		self.nickname = get('nickname')
		self.photo_url = get('photo_url')
		self.current_chamber = get('current_chamber')
		self.current_title = get('current_title')
		self.current_abbr_title = get('current_abbr_title')
		self.current_district = get('current_district')
		self.current_party = get('current_party')

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
	  'last_updated': datetime.now()
	, 'stages': []
	, 'legislators': []
}

with psycopg2.connect(conn_string) as conn:
	with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
		cur.execute(open('sql/select_legislators.sql', 'r').read())

		for i in cur.fetchall():

			leg = Legislator(i)

			print leg.id

			cur.execute('''SELECT
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
						WHERE legislator_id = %s;''', 
						(legislator['id']))

			legislator['sessions'].a





