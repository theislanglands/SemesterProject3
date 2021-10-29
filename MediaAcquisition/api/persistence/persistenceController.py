import ftplib
from ftplib import FTP

# ftp config
host = 'ftp.foreignlands.dk'
domain = 'foreignlands.dk'
root = 'MediaAcquisition'
username = 'foreignlands.dk'
port = 21
pw = 'MediaAcquisition09!'

#
ftp = FTP(host)  # connect to host, default port (21)
ftp.login(username, pw)
# print(ftp.getwelcome())  # check connection & print welcome
ftp.cwd(root)  # change working directory to root
# ftp.dir()  # show contents of working directory


def storeAudio(localFilePath, fileNameOnServer):
    file = None
    try:
        file = open(localFilePath, "rb")  # open file to send
        ftp.storbinary('STOR ' + '/' + root + '/' + fileNameOnServer, file)  # send the file
        return True

    except ftplib.all_errors as e:
        print('Ftp fail -> ', e)
        return False

    finally:
        file.close()


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


def downloadAudio(id, path): #not used, but maybe later!
    filename = id + '.mp3'
    ftp.retrbinary("RETR " + filename + ", open(filename, 'wb').write)")  # henter fil ned ad ftp


def delete_audio(id):
    filename = id + '.mp3'
    status = ftp.delete(filename)
    print(status)

    # returns status of delete operation
    if status.find('250') != -1:
        return True
    else:
        return False