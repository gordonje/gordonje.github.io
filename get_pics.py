import csv
import requests
from time import sleep

with requests.Session() as session:

	with open('data/leg_performance.csv', 'rU') as in_file:
		
		reader = csv.DictReader(in_file)

		for row in reader:

			response = session.get(row['photo_url'])

			with open('imgs/{name_last}_{name_first}_{legislator_id}.jpg'.format(**row), 'wb') as pic_file:

				pic_file.write(response.content)

			sleep(2)

print 'fin.'

