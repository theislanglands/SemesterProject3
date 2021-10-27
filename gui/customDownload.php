<html>

    <head>
        <link rel="stylesheet" href="css/style.css">
    </head>


    <body>

        <div>
            <form action="upload.php" method="">
                <input type="text" name="name" placeholder="Song Name">
                <input type="text" name="artist" placeholder="Artist Name">
                <input type="number" name="year" placeholder="Release Year">
                <input type="text" name="collection" placeholder="Collection">
                <input type="number" name="track_nr" placeholder="Track Number">
                <input type="number" name="total_track_count" placeholder="Total Track Count">
                <input type="file" name="art" accept="image/jpeg, image/png">
                <input type="file" name="audio">

                <input type="submit">
            </form>
        </div>

    </body>
</html>