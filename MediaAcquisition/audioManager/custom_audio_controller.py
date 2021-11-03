import os

from api.metadata import Metadata
from api.persistence.persistenceController import PersistanceController


class CustomAudio:
    persistence = PersistanceController()

    def store_mp3(self, filename):
        try:
            # store in filesystem on server
            local_path = os.getcwd() + '/temp/'
            filename = 'CU_' + filename + '.mp3'
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
