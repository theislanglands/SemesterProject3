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
# print(ftp.getwelcome())  # check connection
ftp.cwd(root)  # change workingdirectory
#ftp.dir()  # show contents of folder


def storeAudio(localFilePath, fileNameOnServer):
    try:
        file = open(localFilePath, "rb")  # open file to send
        ftp.storbinary('STOR ' + '/' + root + '/' + fileNameOnServer, file)  # send the file
        return True

    except ftplib.all_errors as e:
        print('Ftp fail -> ', e)
        return False

def check_id(youtube_id):
    # check with youtube API if a video ecist with that id
   pass

def checkIfExist(id):
    filename = id + '.mp3'  # adds mp3 to id
    for fn in ftp.nlst():  # looping through all filenames on server
        if fn == filename:
            return True
    return False

def getAudio(id):
    returnURL = 'http://' + domain + '/' + root + '/' + id + '.mp3'
    return returnURL


def downloadAudio(id, path):
    filename = id + '.mp3'
    ftp.retrbinary("RETR " + filename + ", open(filename, 'wb').write)")  # henter fil ned ad ftp


#Test
#filepath = '/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/media-acquisition/MediaAcquisition/api/persistence/test-upload.txt'
# storeAudio(filepath, 'test-upload.txt')

#print(getAudio("all_my_love"))

print(checkIfExist("all_my_love"))


