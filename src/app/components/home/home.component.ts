import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, lastValueFrom, tap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { OpenAiService } from 'src/app/services/openai.service';
import { PlaylistsService } from 'src/app/services/playlists.service';
import { TracksService } from 'src/app/services/tracks.service';
import { UsersService } from 'src/app/services/users.service';
import { parameters } from './parameters';

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
  parameters = parameters;
  loadingSearch = false;
  generatingPlaylist = false;
  creatingPlaylist = false;
  generatedPlaylistTitle = "";
  generatedPlaylistDescription = "";
  @ViewChild('playlistTitle') playlistTitle!: ElementRef<HTMLInputElement>;
  @ViewChild('playlistDescription') playlistDescription!: ElementRef<HTMLInputElement>;

  constructor(
    private userService: UsersService,
    private tracksService: TracksService,
    private playlistsService: PlaylistsService,
    private authService: AuthService,
    private openAiService: OpenAiService
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

  async generatePlaylist() {
    this.generatingPlaylist = true;
    const seed_tracks = this.selectedTracks.map(track => track.id).join(',');
    const res = await lastValueFrom(
      this.tracksService.getRecommendations(seed_tracks, this.playlistLength, this.parameters)
    );
    await this.setTitleAndDescription(res.tracks);
    this.playlist = res.tracks;
    this.generatingPlaylist = false;
    // this.scrollToBottom();
  }

  createPlaylist(title: string, description: string) {
    this.creatingPlaylist = true;
    this.playlistsService.createPlaylist(this.user.id, title, description, true).subscribe(playlist => {
      this.playlistsService.editPlaylistDescription(playlist.id, description).subscribe(() => {
        const uris = this.playlist.map(track => track.uri);
        this.createdPlaylists.push(playlist);
        this.playlistsService.addTracks(playlist.id, uris).subscribe(() => {
          this.creatingPlaylist = false;
          // this.scrollToBottom();
        });
      });
    })
  }

  async setTitleAndDescription(playlist: any[]) {
    let titleMessage = "Generate a title (1-5 words) for the playlist. Use a casual writing style and tone, and write in lowercase. Avoid slang. Use self-deprecating humor, sass, and vagueness. Don't use the word vibe.\n\n";
    let descMessage = "Generate a description (< 10 words) for the playlist. Use a casual writing style and tone, and write in lowercase. Avoid slang. Use self-deprecating humor, sass, and vagueness. Don't use the word vibe.\n\n";
    let data = {
      inspiration: this.selectedTracks.map(track => `'${track.name}' by ${track.artists[0].name}`),
      playlist: playlist.map(track => `${track.name} by ${track.artists[0].name}`),
      parameters: this.parameters.filter(p => p.on).map(({description, step, displayName, on, ...rest}) => rest)
    }
    titleMessage += JSON.stringify(data);
    descMessage += JSON.stringify(data);
    const title = await this.openAiService.completion(titleMessage);
    const desc = await this.openAiService.completion(descMessage);
    this.generatedPlaylistTitle = title!.trim().replaceAll('"', '');
    this.generatedPlaylistDescription = desc!.trim().replaceAll('"', '');
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

  resizeTextareas() {
    this.playlistTitle.nativeElement.style.height = "1px";
    this.playlistTitle.nativeElement.style.height = (this.playlistTitle.nativeElement.scrollHeight) + "px";
    this.playlistDescription.nativeElement.style.height = "1px";
    this.playlistDescription.nativeElement.style.height = (this.playlistDescription.nativeElement.scrollHeight) + "px";
  }
}
