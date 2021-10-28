import ftplib
from ftplib import FTP

# ftp config
host = 'ftp.foreignlands.dk'
domain = 'foreignlands.dk'
root = 'MediaAcquisition'
username = 'foreignlands.dk'
port = 21
pw = 'MediaAcquisition09!'

ftp = FTP(host)  # connect to host, default port (21)
ftp.login(username, pw)
print(ftp.getwelcome())  # check connection
ftp.cwd(root)  # change workingdirectory
ftp.dir()  # show contents of folder
id = "all_my_love"


def storeAudio(localFilePath, fileNameOnServer):
    try:
        file = open(localFilePath, "rb")  # open file to send
        ftp.storbinary('STOR ' + '/' + root + '/' + fileNameOnServer, file)  # send the file
        return True

    except ftplib.all_errors as e:
        print('Ftp fail -> ', e)
        return False

def check_id(YoutubeID):
    pass


def checkIfExist(id):
    pass


def getAudio(id):
    returnURL = 'http://' + domain + '/' + root + '/' + id + '.mp3'
    return returnURL


def downloadAudio(id, path):
    filename = id + '.mp3'
    ftp.retrbinary("RETR " + filename + ", open(filename, 'wb').write)")  # henter fil ned ad ftp


filepath = '/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/media-acquisition/MediaAcquisition/api/persistence/test-upload.txt'
# storeAudio(filepath, 'test-upload.txt')

print(getAudio("all_my_love"))
