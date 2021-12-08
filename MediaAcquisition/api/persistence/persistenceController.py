import ftplib
from ftplib import FTP

class PersistanceController:

    def __init__(self):
        # connection to ftp server
        self.host = 'ftp.foreignlands.dk'
        self.domain = 'foreignlands.dk'
        self.root = 'MediaAcquisition'
        self.audioroot = 'audio'
        self.artworkroot = 'artwork'
        self.username = 'foreignlands.dk'
        self.port = 21
        self.pw = 'MediaAcquisition09!'

        # ftp config
        self.ftp = FTP(self.host)  # connect to host, default port (21)
        self.ftp.login(self.username, self.pw)
        self.ftp.cwd(self.root)  # change working directory to root

    def storeAudio(self, localFilePath, fileNameOnServer):

        file = None
        try:
            file = open(localFilePath, "rb")  # open file to send
            self.ftp.storbinary('STOR ' + '/' + self.root + '/' + self.audioroot + '/' + fileNameOnServer, file)  # send the file
            return True

        except ftplib.all_errors as e:
            print('Ftp fail -> ', e)
            return False

        finally:
            file.close()

    def storeArtwork(self, localFilePath, fileNameOnServer):
        self.ftp.cwd('/' + self.root + '/' + self.artworkroot)
        file = None
        try:
            file = open(localFilePath, "rb")  # open file to send
            self.ftp.storbinary('STOR ' + '/' + self.root + '/' + self.artworkroot + '/' + fileNameOnServer,
                                file)  # send the file
            return True

        except ftplib.all_errors as e:
            print('Ftp fail -> ', e)
            return False

        finally:
            file.close()

    def checkIfExist(self, id):
        self.ftp.cwd('/' + self.root + '/' + self.audioroot)  # change working directory to root
        filename = id + '.mp3'  # adds mp3 to id
        for fn in self.ftp.nlst():  # looping through all filenames on server
            if fn == filename:
                return True
        return False

    def getAudio(self, id):
        if (self.checkIfExist(id)):
            return 'http://' + self.domain + '/' + self.root + '/' + self.audioroot + '/' + id + '.mp3'
        else:
            return None

    def delete_audio(self, id):
        filename = id + '.mp3'
        self.ftp.cwd('/' + self.root + '/' + self.audioroot)
        status = self.ftp.delete(filename)
        print(status)

        # returns status of delete operation
        if status.find('250') != -1:
            return True
        else:
            return False