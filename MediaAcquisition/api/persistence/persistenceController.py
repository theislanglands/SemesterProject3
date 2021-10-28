import ftplib
from ftplib import FTP
import requests

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
#ftp.dir()  # show contents of working directory

def storeAudio(localFilePath, fileNameOnServer):
    try:
        file = open(localFilePath, "rb")  # open file to send
        ftp.storbinary('STOR ' + '/' + root + '/' + fileNameOnServer, file)  # send the file
        return True

    except ftplib.all_errors as e:
        print('Ftp fail -> ', e)
        return False

def check_id(youtube_id):
    pass
    # done with try-catch i yt downloader

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

def delete_audio(id):
    filename = id + '.mp3'
    print(filename)
    text = ftp.delete(filename)
    print(text)
    # returns status of delete
    if text.find('250') != -1:
        return True
    else:
        print("Delete unsuccesful")
        return False


