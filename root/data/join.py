import pandas as pd 

sfyt = pd.read_csv("Spotify_Youtube.csv")
sf_tracks = pd.read_csv("Spotify_tracks_dataset.csv")

sfyt["track_id"] = sfyt.Uri.str.split(":").str[2]
sf_tracks = sf_tracks[['track_id','track_genre']]
sfyt = pd.merge(sfyt, sf_tracks, on="track_id", how="inner")
sfyt.dropna(inplace=True)
sfyt["popularity"] = sfyt["Views"]+sfyt["Stream"]+sfyt["Likes"]+sfyt["Comments"]
sfyt.to_csv("dataset.csv")
