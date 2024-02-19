import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, Subscription, debounceTime, lastValueFrom, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PlaylistsService } from 'src/app/services/playlists.service';
import { TracksService } from 'src/app/services/tracks.service';
import { UsersService } from 'src/app/services/users.service';
import { parameters } from './parameters';
import { CohereService } from 'src/app/services/cohere.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // Subscriptions
  userSubscription: Subscription = new Subscription;
  searchSubscription: Subscription = new Subscription;

  // Arrays
  searchResults: any[] = [];
  selectedTracks: any[] = [];
  playlist: any[] = [];
  createdPlaylists: any[] = [];

  // Playlist parameters
  playlistLength = 20;
  parameters = parameters;

  // Loading spinners
  loadingSearch = false;
  generatingPlaylist = false;
  creatingPlaylist = false;

  // Misc
  user: any;
  searchControl = new FormControl();
  generatedPlaylistTitle = "";
  generatedPlaylistDescription = "";
  @ViewChild('playlistTitle') playlistTitle!: ElementRef<HTMLInputElement>;
  @ViewChild('playlistDescription') playlistDescription!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UsersService,
    private tracksService: TracksService,
    private playlistsService: PlaylistsService,
    private authService: AuthService,
    private cohereService: CohereService
  ) { }

  ngOnInit() {
    this.userSubscription = this.userService.getCurrentUser().subscribe({
      next: v => this.user = v,
      error: e => this.logout()
    });
    this.searchSubscription = this.searchControl.valueChanges.pipe(
      debounceTime(500),
      tap(value => this.searchTracks(value))
   ).subscribe();
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
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

  async generatePlaylist() {
    this.generatingPlaylist = true;
    const seed_tracks = this.selectedTracks.map(track => track.id).join(',');
    const res = await lastValueFrom(
      this.tracksService.getRecommendations(seed_tracks, Math.min(Math.max(this.playlistLength, 1), 100), this.parameters)
    );
    await this.setTitleAndDescription(res.tracks);
    this.playlist = res.tracks;
    this.generatingPlaylist = false;
  }

  createPlaylist(title: string, description: string) {
    this.creatingPlaylist = true;
    this.playlistsService.createPlaylist(this.user.id, title, description, true).subscribe(playlist => {
        const uris = this.playlist.map(track => track.uri);
        this.createdPlaylists.push(playlist);
        this.playlistsService.addTracks(playlist.id, uris).subscribe(() => {
            this.creatingPlaylist = false;
        });
        this.playlistsService.editPlaylistDescription(playlist.id, description).subscribe();
    })
  }

  async setTitleAndDescription(playlist: any[]) {
    let playlistInfo = await this.cohereService.generatePlaylistInfo(this.playlist, this.selectedTracks, this.parameters);

    this.generatedPlaylistTitle = playlistInfo.title;
    this.generatedPlaylistDescription = playlistInfo.description;

    await setTimeout(() => {
      this.resizeTextareas();
    }, 50);
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

  setLoadingSearch() {
    this.loadingSearch = true;
  }

  round(i: number) {
    return Math.round(i);
  }

  resizeTextareas() {
    this.playlistTitle.nativeElement.style.height = "1px";
    this.playlistTitle.nativeElement.style.height = (this.playlistTitle.nativeElement.scrollHeight) + "px";
    this.playlistDescription.nativeElement.style.height = "1px";
    this.playlistDescription.nativeElement.style.height = (this.playlistDescription.nativeElement.scrollHeight) + "px";
  }
}
