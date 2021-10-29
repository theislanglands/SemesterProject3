import ftplib
from ftplib import FTP


class PersistanceController:

    def __init__(self):
        self.host = 'ftp.foreignlands.dk'
        self.domain = 'foreignlands.dk'
        self.root = 'MediaAcquisition'
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
            self.ftp.storbinary('STOR ' + '/' + self.root + '/' + fileNameOnServer, file)  # send the file
            return True

        except ftplib.all_errors as e:
            print('Ftp fail -> ', e)
            return False

        finally:
            file.close()


    def check_id(self, youtube_id):
        pass
        # done with try-catch i yt downloader


    def checkIfExist(self, id):
        filename = id + '.mp3'  # adds mp3 to id
        for fn in self.ftp.nlst():  # looping through all filenames on server
            if fn == filename:
                return True
        return False


    def getAudio(self, id):
        returnURL = 'http://' + self.domain + '/' + self.root + '/' + id + '.mp3'
        return returnURL


    def downloadAudio(self, id, path):  # not used, but maybe later!
        filename = id + '.mp3'
        self.ftp.retrbinary("RETR " + filename + ", open(filename, 'wb').write)")  # henter fil ned ad ftp


    def delete_audio(self, id):
        filename = id + '.mp3'
        status = self.ftp.delete(filename)
        print(status)

        # returns status of delete operation
        if status.find('250') != -1:
            return True
        else:
            return False