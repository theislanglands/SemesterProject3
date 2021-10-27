from django.test import TestCase
from models import metadata

# Create your tests here.

testcase = metadata('audioid_test', 'nametest', 'artist/creatortest')

testcase.save()

print(testcase.__str__())






