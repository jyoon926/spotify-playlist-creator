export const parameters = [
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
]