import os
import requests

from api.metadata import Metadata
from api.persistence.persistenceController import PersistanceController

class CustomAudio:
    persistence = PersistanceController()

    #TODO: muligt at refactor med youtube-store audio (hvis der bliver tid!)
    def store_mp3(self, filename):
        try:
            # store in filesystem on server
            local_path = os.getcwd() + '/temp/'
            filename = filename + '.mp3'
            # print("fn: " + filename)
            # print("lp: " + local_path)
            success = self.persistence.storeAudio(local_path + filename, filename)

            # handle success response
            if success:
                try:
                    os.remove(local_path + filename)  # delete local
                except Exception as e:
                    print("error: local file not deleted\n" + str(e))
                    # TODO: THEN do what?
            else:
                return 'error 500: internal server error'
        except Exception:
            return None

    def storeArtwork(self, filename):

        try:
            # store in filesystem on server
            local_path = os.getcwd() + '/temp/'
            success = self.persistence.storeArtwork(local_path + filename, filename)

            # handle success response
            if success:
                try:
                    os.remove(local_path + filename)  # delete local
                except Exception as e:
                    print("error: local file not deleted\n" + str(e))
                    # TODO: THEN do what?
            else:
                return 'error 500: internal server error'
        except Exception:
            return None

    def post_metadata(self, metadata_json, endpoint_url):
        # send metadata_json via an HTTP request to selected endpoint

        response = requests.post(endpoint_url, json=metadata_json)
        print('response from server:',response.text)
        print(response.request)

        if response.ok:
            return "metadata succesfully send!"
        else:
            # TODO - what if send fails - delete audiofrom db?
            return "error: " + response.reason


if __name__ == '__main__':
    parser = CustomAudio()
    metadata_test = '{"name": "My Heart Will Go On", "artist": "Celine Dion", "is_collection": "true", "collection_name": "New York World Tour", "track_nr": "1", "total_track_count": "5", "release_year": "1992", "path_to_artwork": "https:/forbkbksdf"}'
    print(parser.post_metadata(metadata_test, 'https://foreignlands.dk'))
