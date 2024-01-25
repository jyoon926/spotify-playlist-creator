import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PlaylistsService } from 'src/app/services/playlists.service';
import { TracksService } from 'src/app/services/tracks.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  searchResults: any[] = [];
  user: any;
  selectedTracks: any[] = [];
  playlist: any[] = [];
  myControl = new FormControl();
  createdPlaylists: any[] = [];
  playlistLength = 10;
  parameters = [
    {
      displayName: 'Acousticness',
      name: 'target_acousticness',
      description: 'A confidence measure from 0 to 1 of whether the track is acoustic.',
      min: 0,
      max: 1,
      value: 0.5,
      unit: '%',
      step: 0.01,
      on: false
    },
    {
      displayName: 'Danceability',
      name: 'target_danceability',
      description: 'Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity.',
      min: 0,
      max: 1,
      value: 0.5,
      unit: '%',
      step: 0.01,
      on: false
    },
    {
      displayName: 'Energy',
      name: 'target_energy',
      description: 'Energy is a measure from 0 to 1 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.',
      min: 0,
      max: 1,
      value: 0.5,
      unit: '%',
      step: 0.01,
      on: false
    },
    {
      displayName: 'Instrumentalness',
      name: 'target_instrumentalness',
      description: 'A confidence measure from 0 to 1 of whether a track contains no vocals.',
      min: 0,
      max: 1,
      value: 0.5,
      unit: '%',
      step: 0.01,
      on: false
    },
    {
      displayName: 'Liveness',
      name: 'target_liveness',
      description: 'Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live.',
      min: 0,
      max: 1,
      value: 0.5,
      unit: '%',
      step: 0.01,
      on: false
    },
    {
      displayName: 'Popularity',
      name: 'target_popularity',
      description: 'A measure of how popular a track is from 0 to 100.',
      min: 0,
      max: 100,
      value: 50,
      unit: '%',
      step: 1,
      on: false
    },
    {
      displayName: 'Tempo',
      name: 'target_tempo',
      description: 'The overall estimated tempo of a track in beats per minute (BPM).',
      min: 0,
      max: 200,
      value: 100,
      unit: ' bpm',
      step: 1,
      on: false
    },
    {
      displayName: 'Valence',
      name: 'target_valence',
      description: 'A measure from 0 to 1 describing the musical positiveness conveyed by a track.',
      min: 0,
      max: 1,
      value: 0.5,
      unit: '%',
      step: 0.01,
      on: false
    }
  ];
  loadingSearch = false;
  generatingPlaylist = false;
  creatingPlaylist = false;
  generatedPlaylistDescription: string = "";

  constructor(
    private userService: UsersService,
    private tracksService: TracksService,
    private playlistsService: PlaylistsService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.user = await this.userService.getCurrentUser().catch(e => {
      this.logout();
    });
    this.myControl.valueChanges.pipe(
      debounceTime(500),
      tap(value => this.searchTracks(value))
   ).subscribe();
  }

  logout() {
    this.authService.logout();
  }

  searchTracks(term: string) {
    this.loadingSearch = false;
    if (!term) {
      this.searchResults = [];
    } else {
      this.tracksService.searchTracks(term).subscribe(res => {
        this.searchResults = res.tracks.items;
      });
    }
  }

  selectTrack(track: any) {
    if (!this.selectedTracks.includes(track) && this.selectedTracks.length < 5)
    this.selectedTracks.push(track);
  }

  deselectTrack(track: any) {
    if (this.selectedTracks.includes(track))
      this.selectedTracks.splice(this.selectedTracks.indexOf(track), 1);
  }

  removeTrack(track: any) {
    if (this.playlist.includes(track))
      this.playlist.splice(this.playlist.indexOf(track), 1);
  }

  generatePlaylist() {
    this.generatingPlaylist = true;
    const seed_tracks = this.selectedTracks.map(track => track.id).join(',');
    this.tracksService.getRecommendations(seed_tracks, this.playlistLength, this.parameters).subscribe(res => {
      this.playlist = res.tracks;
      this.scrollToBottom();
      this.generatingPlaylist = false;
      this.setDescription();
    })
  }

  createPlaylist(title: string, description: string) {
    this.creatingPlaylist = true;
    this.playlistsService.createPlaylist(this.user.id, title, "", true).subscribe(playlist => {
      this.playlistsService.editPlaylistDescription(playlist.id, description).subscribe(() => {
        const uris = this.playlist.map(track => track.uri);
        this.createdPlaylists.push(playlist);
        this.playlistsService.addTracks(playlist.id, uris).subscribe(() => {
          this.creatingPlaylist = false;
          this.scrollToBottom();
        });
      });
    })
  }

  setDescription() {
    this.generatedPlaylistDescription = 'A playlist inspired by ';
    const selectedTrackNames = this.selectedTracks.map(track => `'${track.name}' by ${track.artists[0].name}`);
    if (selectedTrackNames.length == 1)
      this.generatedPlaylistDescription += selectedTrackNames[0];
    else if (selectedTrackNames.length == 2)
      this.generatedPlaylistDescription += selectedTrackNames.join(' and ');
    else
      this.generatedPlaylistDescription += selectedTrackNames.slice(0, selectedTrackNames.length - 1).join(', ') + ' and ' + selectedTrackNames[selectedTrackNames.length - 1];
    this.generatedPlaylistDescription += '.';
  }

  toggleParameter(i: number) {
    this.parameters[i].on = !this.parameters[i].on;
  }

  updateParameter(event: any, i: number) {
    if (this.parameters[i].on)
      event.stopPropagation();
    else
      this.parameters[i].on = true;
    this.parameters[i].value = event.target.value;
  }

  changeLength(event: any) {
    this.playlistLength = event.target.value;
  }

  setLoading() {
    this.loadingSearch = true;
  }

  round(i: number) {
    return Math.round(i);
  }

  scrollToBottom(): void {
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  }
}
