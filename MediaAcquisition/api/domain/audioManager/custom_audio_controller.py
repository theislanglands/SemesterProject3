import os
import requests

from api.metadata import Metadata
from api.persistence.persistenceController import PersistanceController

class CustomAudio:
    persistence = PersistanceController()

    #TODO: muligt at refactor med youtube-store audio (hvis der bliver tid!)
    def store_mp3(self, filename):
        try:
            local_path = os.getcwd() + '/audioManager/temp/temp/'
            success = self.persistence.storeAudio(local_path + filename, filename)

            # handle response
            if success:
                try:
                    os.remove(local_path + filename)  # delete local tmp file
                except Exception as e:
                    print("error: local file not deleted\n" + str(e))
            else:
                return 'error 500: internal server error'
        except Exception:
            return None

    def storeArtwork(self, filename):

        try:
            # store in filesystem on server
            local_path = os.getcwd() + '/audioManager/temp/'
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

        if response.ok:
            return "metadata succesfully send!"
        else:
            return "error: " + response.reason

    def get_json(self, data, audio_id, duration, artwork_url, bitrate):
        meta = Metadata()
        return meta.parse_from_custom_audio_json(data, audio_id, duration, artwork_url, bitrate)